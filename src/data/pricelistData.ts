import { PricelistRouteItem, ShipmentMode } from '../types';
import * as XLSX from 'xlsx';

export type { PricelistRouteItem };

export const DEFAULT_PRICELIST_ROUTES: PricelistRouteItem[] = [
  {
    id: 'rt-1',
    kotaAsal: 'tangerang',
    kotaTujuan: 'purwakarta',
    moda: 'Darat',
    layanan: 'Cargo Darat Super',
    vendor: 'trens-log',
    tarifKg: 1875,
    modalKg: 1500,
    marginPercent: 25,
    minimalBerat: 105,
    leadTime: '2-3 Hari Kerja'
  },
  {
    id: 'rt-2',
    kotaAsal: 'tangerang',
    kotaTujuan: 'Arut Selatan',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 12075,
    modalKg: 9500,
    marginPercent: 27,
    minimalBerat: 50,
    leadTime: '7-8 HARI'
  },
  {
    id: 'rt-3',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Ambon',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 15525,
    modalKg: 12000,
    marginPercent: 29,
    minimalBerat: 50,
    leadTime: '8-9 HARI'
  },
  {
    id: 'rt-4',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Balikpapan',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 12500,
    modalKg: 9800,
    marginPercent: 28,
    minimalBerat: 50,
    leadTime: '8-9 HARI'
  },
  {
    id: 'rt-5',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Banda Aceh',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 10235,
    modalKg: 8000,
    marginPercent: 28,
    minimalBerat: 50,
    leadTime: '4-5 HARI'
  },
  {
    id: 'rt-6',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Semarang Kota',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 5500,
    modalKg: 4000,
    marginPercent: 38,
    minimalBerat: 30,
    leadTime: '1-2 HARI'
  },
  {
    id: 'rt-7',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Palembang Kota',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 8500,
    modalKg: 6500,
    marginPercent: 31,
    minimalBerat: 50,
    leadTime: '2-3 HARI'
  },
  {
    id: 'rt-8',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Denpasar Bali',
    moda: 'Darat',
    layanan: 'Cargo Regular',
    vendor: 'trens-log',
    tarifKg: 11000,
    modalKg: 8500,
    marginPercent: 29,
    minimalBerat: 50,
    leadTime: '3-4 HARI'
  },
  {
    id: 'rt-9',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Pontianak Kota',
    moda: 'Laut',
    layanan: 'Cargo Kapal Cepat',
    vendor: 'trens-log',
    tarifKg: 13500,
    modalKg: 10000,
    marginPercent: 35,
    minimalBerat: 50,
    leadTime: '4-6 HARI'
  },
  {
    id: 'rt-10',
    kotaAsal: 'Surabaya Kota',
    kotaTujuan: 'Makassar Kota',
    moda: 'Laut',
    layanan: 'Cargo Kapal Ro-Ro',
    vendor: 'trens-log',
    tarifKg: 14000,
    modalKg: 11000,
    marginPercent: 27,
    minimalBerat: 50,
    leadTime: '3-5 HARI'
  },
  {
    id: 'rt-11',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Medan Kota',
    moda: 'Udara',
    layanan: 'Cargo Express Udara',
    vendor: 'trens-log',
    tarifKg: 28500,
    modalKg: 22000,
    marginPercent: 30,
    minimalBerat: 10,
    leadTime: '1-2 HARI'
  },
  {
    id: 'rt-12',
    kotaAsal: 'Jakarta Barat',
    kotaTujuan: 'Surabaya Kota',
    moda: 'Udara',
    layanan: 'Cargo Express Udara',
    vendor: 'trens-log',
    tarifKg: 22000,
    modalKg: 17000,
    marginPercent: 29,
    minimalBerat: 10,
    leadTime: '1 HARI'
  }
];

const PRICELIST_STORAGE_KEY = 'trens_pricelist_routes_v1';

export function getStoredPricelist(): PricelistRouteItem[] {
  try {
    const raw = localStorage.getItem(PRICELIST_STORAGE_KEY);
    let items = DEFAULT_PRICELIST_ROUTES;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    }
    // Automatically convert any legacy 'solap' or 'solap / trens' vendor to 'trens-log'
    let hasModified = false;
    const sanitized = items.map(item => {
      const currentVendor = (item.vendor || '').trim().toLowerCase();
      if (currentVendor === 'solap' || currentVendor === 'solap / trens' || currentVendor === 'trens') {
        hasModified = true;
        return { ...item, vendor: 'trens-log' };
      }
      return item;
    });

    if (hasModified) {
      saveStoredPricelist(sanitized);
    }
    return sanitized;
  } catch {
    return DEFAULT_PRICELIST_ROUTES;
  }
}

export const getStoredPricelistRoutes = getStoredPricelist;

export function saveStoredPricelist(items: PricelistRouteItem[]) {
  try {
    localStorage.setItem(PRICELIST_STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trens_pricelist_updated', { detail: items }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.warn('Failed to save pricelist to localStorage:', err);
  }
}

export function exportPricelistToExcel(items: PricelistRouteItem[], filename = 'pricelist-tarif-trens.xlsx') {
  const wb = XLSX.utils.book_new();

  const header = [
    'KOTA ASAL',
    'KOTA / KAB TUJUAN',
    'JALUR (Darat/Laut/Udara)',
    'LAYANAN',
    'VENDOR / KURIR',
    'TARIF ONGKIR / KG (RP)',
    'MODAL / KG (RP)',
    'MARGIN (%)',
    'MINIMAL BERAT (KG)',
    'LEAD TIME (ESTIMASI HARI)'
  ];

  const rows = items.map(item => [
    item.kotaAsal,
    item.kotaTujuan,
    item.moda,
    item.layanan,
    item.vendor,
    item.tarifKg,
    item.modalKg || 0,
    item.marginPercent || 0,
    item.minimalBerat,
    item.leadTime
  ]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Pricelist Rute');
  XLSX.writeFile(wb, filename);
}

export function downloadPricelistTemplate() {
  const wb = XLSX.utils.book_new();

  const header = [
    'KOTA ASAL',
    'KOTA / KAB TUJUAN',
    'JALUR (Darat/Laut/Udara)',
    'LAYANAN',
    'VENDOR / KURIR',
    'TARIF ONGKIR / KG (RP)',
    'MODAL / KG (RP)',
    'MINIMAL BERAT (KG)',
    'LEAD TIME'
  ];

  const exampleRows = [
    ['Tangerang', 'Purwakarta', 'Darat', 'Cargo Darat Super', 'trens-log', 1875, 1500, 105, '2-3 Hari Kerja'],
    ['Jakarta Barat', 'Semarang Kota', 'Darat', 'Cargo Regular', 'trens-log', 5500, 4000, 30, '1-2 HARI'],
    ['Surabaya', 'Makassar Kota', 'Laut', 'Cargo Kapal Ro-Ro', 'trens-log', 14000, 11000, 50, '3-5 HARI'],
    ['Jakarta', 'Medan Kota', 'Udara', 'Cargo Express Udara', 'trens-log', 28500, 22000, 10, '1-2 HARI']
  ];

  const ws = XLSX.utils.aoa_to_sheet([header, ...exampleRows]);
  ws['!cols'] = [
    { wch: 18 },
    { wch: 22 },
    { wch: 24 },
    { wch: 22 },
    { wch: 16 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Template Pricelist');
  XLSX.writeFile(wb, 'template-pricelist-tarif.xlsx');
}
