import * as XLSX from 'xlsx';
import {
  Customer,
  CustomerSegment,
  CustomerWithStats,
  Invoice,
  OrderRequest,
  TrackingItem
} from '../types';

export const CUSTOMER_STORAGE_KEY = 'trens_customers_v1';

export const CUSTOMER_SEGMENTS: CustomerSegment[] = ['Retail', 'B2B / Korporat', 'Mitra Agen'];

/**
 * Seed awal master pelanggan (hanya dipakai bila perangkat belum punya data sama sekali)
 */
export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-2026-001',
    nama: 'PT Nusantara Food Makmur',
    perusahaan: 'PT Nusantara Food Makmur',
    telepon: '081199887766',
    email: 'logistik@nusantarafood.co.id',
    kota: 'Jakarta Barat',
    alamat: 'Kawasan Pergudangan Cikupa Blok C7, Jakarta Barat',
    segmen: 'B2B / Korporat',
    catatan: 'Distribusi bahan makanan kering rutin 15-20 ton/bulan ke luar pulau.',
    createdAt: '2026-02-11T03:20:00.000Z'
  },
  {
    id: 'CUST-2026-002',
    nama: 'Hendro Gunawan',
    perusahaan: 'Konveksi Gunawan Jaya',
    telepon: '081287654321',
    email: 'hendro.gunawan@gmail.com',
    kota: 'Jakarta',
    alamat: 'Ruko Blok B5, Jalan Industri Raya, Jakarta',
    segmen: 'Retail',
    catatan: 'Pelanggan langganan kiriman karton pakaian via kargo darat.',
    createdAt: '2026-03-02T01:10:00.000Z'
  }
];

export const getStoredCustomers = (): Customer[] => {
  if (typeof window === 'undefined') return DEFAULT_CUSTOMERS;
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) {
      saveStoredCustomers(DEFAULT_CUSTOMERS);
      return DEFAULT_CUSTOMERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_CUSTOMERS;
    return parsed as Customer[];
  } catch {
    return DEFAULT_CUSTOMERS;
  }
};

export const saveStoredCustomers = (customers: Customer[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
    window.dispatchEvent(new CustomEvent('trens_customers_updated', { detail: customers }));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.warn('Failed to save customers to localStorage', err);
  }
};

export const generateCustomerId = (): string => {
  return `CUST-${Date.now().toString(36).toUpperCase()}`;
};

export const upsertCustomer = (customer: Customer): Customer[] => {
  const current = getStoredCustomers();
  const clean: Customer = {
    ...customer,
    updatedAt: new Date().toISOString()
  };
  const index = current.findIndex((c) => c.id === clean.id);
  const updated = index >= 0
    ? current.map((c, i) => (i === index ? { ...c, ...clean } : c))
    : [clean, ...current];
  saveStoredCustomers(updated);
  return updated;
};

export const deleteStoredCustomer = (id: string): Customer[] => {
  const updated = getStoredCustomers().filter((c) => c.id !== id);
  saveStoredCustomers(updated);
  return updated;
};

export const subscribeToCustomerUpdates = (callback: (customers: Customer[]) => void): (() => void) => {
  const handleCustom = (e: Event) => {
    const custom = e as CustomEvent<Customer[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredCustomers());
    }
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === CUSTOMER_STORAGE_KEY) callback(getStoredCustomers());
  };

  const initial = getStoredCustomers();
  callback(initial);

  window.addEventListener('trens_customers_updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('trens_customers_updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
};
/* ==========================================================================
 * Derivasi statistik pelanggan dari data resi / order / invoice
 * ========================================================================== */
const normalizePhone = (value?: string): string => (value || '').replace(/[^0-9]/g, '');
const normalizeName = (value?: string): string => (value || '').trim().toLowerCase();
const slugId = (value: string): string =>
  'AUTO-' + value.replace(/[^a-zA-Z0-9]/g, '').slice(-10).toUpperCase();

interface StatAccumulator {
  totalShipments: number;
  totalSpend: number;
  totalWeight: number;
  bookingCount: number;
  lastShipmentDate?: string;
}

const emptyStats = (): StatAccumulator => ({
  totalShipments: 0,
  totalSpend: 0,
  totalWeight: 0,
  bookingCount: 0
});

const parseShipmentDate = (raw?: string): number => {
  if (!raw) return 0;
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Gabungkan master pelanggan dengan pelanggan yang ditemukan otomatis dari
 * data resi, order pickup, dan invoice — lengkap dengan statistik turunan.
 */
export const buildCustomersWithStats = (
  masterCustomers: Customer[],
  tracks: Record<string, TrackingItem>,
  orders: OrderRequest[],
  invoices: Invoice[]
): CustomerWithStats[] => {
  const map = new Map<string, Customer>();
  const stats = new Map<string, StatAccumulator>();
  const keyOf = (nama?: string, telepon?: string): string => {
    const phone = normalizePhone(telepon);
    if (phone.length >= 8) return 'p:' + phone;
    return 'n:' + normalizeName(nama);
  };

  // 1. Master pelanggan selalu menjadi sumber utama
  masterCustomers.forEach((c) => {
    const key = keyOf(c.nama, c.telepon);
    map.set(key, c);
    if (!stats.has(key)) stats.set(key, emptyStats());
  });

  const ensureCustomer = (
    nama: string,
    telepon: string,
    kota: string,
    segmen: CustomerSegment,
    extra?: Partial<Customer>
  ): string => {
    const key = keyOf(nama, telepon);
    if (!map.has(key)) {
      map.set(key, {
        id: slugId(key || nama || 'customer'),
        nama: nama || 'Pelanggan Tanpa Nama',
        telepon: telepon || '-',
        kota: kota || 'Tidak diketahui',
        segmen,
        createdAt: new Date().toISOString(),
        ...extra
      });
      stats.set(key, emptyStats());
    }
    return key;
  };

  // 2. Invoice -> nilai tagihan per resi (fallback pendapatan bila resi tanpa biaya)
  const invoiceTotalByResi = new Map<string, number>();
  invoices.forEach((inv) => {
    const total = Number(inv.total) || 0;
    if (inv.resi) invoiceTotalByResi.set(inv.resi.toUpperCase(), total);
    ensureCustomer(
      inv.customerName,
      inv.customerPhone,
      inv.recipientCity || inv.senderCity || 'Tidak diketahui',
      inv.customerPhone && inv.customerName.length > 12 ? 'B2B / Korporat' : 'Retail'
    );
  });

  // 3. Shipment -> jumlah kiriman, berat, dan nilai transaksi
  Object.entries(tracks).forEach(([resi, item]) => {
    const key = ensureCustomer(
      item.sender || 'Pelanggan Tanpa Nama',
      item.senderPhone || '',
      item.senderCity || item.rute?.split('→')[0]?.trim() || 'Tidak diketahui',
      'Retail'
    );
    const acc = stats.get(key) || emptyStats();
    acc.totalShipments += 1;
    acc.totalWeight += Number(item.weight || item.berat || 0);
    const shipmentCost = Number(item.cost || 0);
    acc.totalSpend += shipmentCost > 0
      ? shipmentCost
      : invoiceTotalByResi.get(resi.toUpperCase()) || 0;
    const stamp = parseShipmentDate(item.date);
    if (stamp > 0 && (!acc.lastShipmentDate || parseShipmentDate(acc.lastShipmentDate) < stamp)) {
      acc.lastShipmentDate = item.date;
    }
    stats.set(key, acc);
  });

  // 4. Order pickup -> jumlah booking penjemputan
  orders.forEach((order) => {
    const key = ensureCustomer(
      order.nama,
      order.hp,
      order.rute?.split('→')[0]?.trim() || 'Tidak diketahui',
      'Retail'
    );
    const acc = stats.get(key) || emptyStats();
    acc.bookingCount += 1;
    stats.set(key, acc);
  });

  return Array.from(map.entries()).map(([key, customer]) => {
    const acc = stats.get(key) || emptyStats();
    return {
      ...customer,
      totalShipments: acc.totalShipments,
      totalSpend: acc.totalSpend,
      totalWeight: Math.round(acc.totalWeight * 10) / 10,
      bookingCount: acc.bookingCount,
      lastShipmentDate: acc.lastShipmentDate
    };
  });
};

export interface CustomerPortfolioSummary {
  totalCustomers: number;
  b2bCount: number;
  retailCount: number;
  partnerCount: number;
  activeCustomers: number;
  totalRevenue: number;
  totalShipments: number;
}

export const buildCustomerSummary = (rows: CustomerWithStats[]): CustomerPortfolioSummary => ({
  totalCustomers: rows.length,
  b2bCount: rows.filter((c) => c.segmen === 'B2B / Korporat').length,
  retailCount: rows.filter((c) => c.segmen === 'Retail').length,
  partnerCount: rows.filter((c) => c.segmen === 'Mitra Agen').length,
  activeCustomers: rows.filter((c) => c.totalShipments > 0 || c.bookingCount > 0).length,
  totalRevenue: rows.reduce((sum, c) => sum + c.totalSpend, 0),
  totalShipments: rows.reduce((sum, c) => sum + c.totalShipments, 0)
});

export const exportCustomersToExcel = (
  rows: CustomerWithStats[],
  filename = 'master-pelanggan-trens-logistic.xlsx'
): void => {
  const wb = XLSX.utils.book_new();

  const header = [
    'ID PELANGGAN',
    'NAMA PELANGGAN',
    'PERUSAHAAN',
    'TELEPON / WA',
    'EMAIL',
    'KOTA',
    'SEGMEN',
    'ALAMAT',
    'TOTAL KIRIMAN',
    'TOTAL BOOKING PICKUP',
    'TOTAL BERAT (KG)',
    'TOTAL NILAI TRANSAKSI (RP)',
    'KIRIMAN TERAKHIR',
    'CATATAN'
  ];

  const body = rows.map((c) => [
    c.id,
    c.nama,
    c.perusahaan || '-',
    c.telepon,
    c.email || '-',
    c.kota,
    c.segmen,
    c.alamat || '-',
    c.totalShipments,
    c.bookingCount,
    c.totalWeight,
    c.totalSpend,
    c.lastShipmentDate || '-',
    c.catatan || '-'
  ]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
  ws['!cols'] = [
    { wch: 16 }, { wch: 26 }, { wch: 24 }, { wch: 16 }, { wch: 28 }, { wch: 18 },
    { wch: 16 }, { wch: 34 }, { wch: 13 }, { wch: 20 }, { wch: 16 }, { wch: 26 },
    { wch: 18 }, { wch: 30 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Master Pelanggan');
  XLSX.writeFile(wb, filename);
};