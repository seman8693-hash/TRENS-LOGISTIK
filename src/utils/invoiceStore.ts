import { Invoice, TrackingItem, OrderRequest } from '../types';

export const INVOICE_STORAGE_KEY = 'trens-logistic-invoices-v3';

export const sanitizeInvoice = (inv: Invoice): Invoice => {
  return {
    ...inv,
    senderName: (inv.senderName && !inv.senderName.toLowerCase().includes('solution'))
      ? inv.senderName 
      : 'TRENS LOGISTIK WAREHOUSE',
    senderAddress: (inv.senderAddress && !inv.senderAddress.toLowerCase().includes('solution'))
      ? inv.senderAddress
      : inv.senderAddress || `Gudang Utama Trens Logistik (${inv.senderCity || 'Jakarta'})`,
    itemDescription: inv.itemDescription || 'Jasa Pengiriman Kargo Trens Logistik'
  };
};

export const DEFAULT_TRENS_INVOICES: Invoice[] = [
  {
    id: 'INV-3614',
    customerName: 'IWAN',
    customerPhone: '085694310979',
    resi: 'TL-2026-9912',
    amount: 3700,
    tax: 444,
    total: 4144,
    issueDate: '6/9/2026, 11.30.41',
    dueDate: '13/9/2026',
    status: 'Dibayar',
    senderName: 'TRENS LOGISTIK WAREHOUSE',
    senderAddress: 'Gudang Utama Trens Logistik B2B (Jakarta)',
    senderCity: 'Jakarta',
    recipientAddress: 'Alamat Terdaftar Klien Mitra (Surabaya)',
    recipientCity: 'Surabaya, Jawa Timur',
    itemDescription: 'UNDANGAN HC-9912 X1',
    colly: 1,
    weight: 1,
    ongkirCargo: 0,
    biayaPacking: 0,
    asuransi: 0,
    ppnPercent: 12,
    pphPercent: 0,
    deliveryOrderNo: 'DO-INV-3614'
  }
];

export const getStoredInvoices = (): Invoice[] => {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) {
      saveStoredInvoices(DEFAULT_TRENS_INVOICES);
      return DEFAULT_TRENS_INVOICES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(sanitizeInvoice);
    }
    return DEFAULT_TRENS_INVOICES;
  } catch {
    return DEFAULT_TRENS_INVOICES;
  }
};

export const saveStoredInvoices = (invoices: Invoice[]): void => {
  try {
    const sanitized = invoices.map(sanitizeInvoice);
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(sanitized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trens_invoice_updated', { detail: sanitized }));
    }
  } catch (err) {
    console.error('Failed to save invoices to storage', err);
  }
};

export const upsertInvoice = (invoice: Invoice): Invoice => {
  const current = getStoredInvoices();
  const clean = sanitizeInvoice(invoice);
  const index = current.findIndex(
    (inv) => inv.id === clean.id || (clean.resi && inv.resi && inv.resi.toUpperCase() === clean.resi.toUpperCase())
  );

  let updated: Invoice[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...clean };
  } else {
    updated = [clean, ...current];
  }

  saveStoredInvoices(updated);
  return clean;
};

export const createInvoiceFromTracking = (resi: string, item: TrackingItem): Invoice => {
  let asal = item.senderCity || '';
  let tujuan = item.recipientCity || '';
  if (!asal && item.rute) {
    const parts = item.rute.split(/→|-|ke/);
    if (parts.length >= 2) {
      asal = parts[0].trim();
      tujuan = parts[1].trim();
    }
  }

  const baseAmount = item.ongkirPokok || item.cost || 0;
  const invNumber = `INV-${resi.replace(/[^0-9]/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;
  
  // Check if invoice already exists
  const existing = getStoredInvoices().find(
    (inv) => (inv.resi && inv.resi.toUpperCase() === resi.toUpperCase()) || inv.id === invNumber
  );

  if (existing) {
    return existing;
  }

  const newInv: Invoice = {
    id: invNumber,
    customerName: item.recipient || item.nama || 'Customer Mitra Trens',
    customerPhone: item.recipientPhone || item.senderPhone || '085694310979',
    resi: resi,
    amount: baseAmount,
    tax: item.ppn || 0,
    total: item.cost || baseAmount,
    issueDate: item.date || new Date().toLocaleString('id-ID'),
    dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('id-ID'),
    status: item.status === 'Terkirim' ? 'Dibayar' : 'Belum Dibayar',
    senderName: item.sender || 'TRENS LOGISTIK WAREHOUSE',
    senderAddress: item.senderAddress || `Gudang Utama Trens Logistik (${asal || 'Jakarta'})`,
    senderCity: asal || 'Jakarta',
    recipientAddress: item.recipientAddress || `Alamat Klien Mitra (${tujuan || 'Surabaya'})`,
    recipientCity: tujuan || 'Surabaya',
    itemDescription: item.nama || 'Pengiriman Kargo Trens Logistik',
    colly: item.colly || 1,
    weight: item.berat || item.weight || 1,
    ongkirCargo: baseAmount,
    biayaPacking: item.biayaPacking || 0,
    asuransi: item.asuransi || 0,
    ppnPercent: item.ppn ? 12 : 0,
    pphPercent: item.pph ? 2 : 0,
    deliveryOrderNo: `DO-${invNumber}`
  };

  return upsertInvoice(newInv);
};

export const createInvoiceFromOrder = (order: OrderRequest): Invoice => {
  const invNumber = `INV-${order.id.replace(/[^0-9]/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

  const existing = getStoredInvoices().find(
    (inv) => inv.id === invNumber || (Boolean(inv.resi) && inv.resi === order.resi)
  );

  if (existing) {
    return existing;
  }

  let asal = 'Jakarta';
  let tujuan = 'Surabaya';
  if (order.rute) {
    const parts = order.rute.split(/→|-|ke/);
    if (parts.length >= 2) {
      asal = parts[0].trim();
      tujuan = parts[1].trim();
    }
  }

  const weight = order.berat || 1;
  const colly = 1;
  const cost = order.estimasiBiaya || Math.round(weight * 4500);

  const newInv: Invoice = {
    id: invNumber,
    customerName: order.nama || 'Customer Mitra',
    customerPhone: order.hp || '085694310979',
    resi: order.resi || `TL-${order.id}`,
    amount: cost,
    tax: Math.round(cost * 0.12),
    total: cost + Math.round(cost * 0.12),
    issueDate: order.tanggal || new Date().toLocaleString('id-ID'),
    dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('id-ID'),
    status: order.status === 'Selesai' ? 'Dibayar' : 'Belum Dibayar',
    senderName: 'TRENS LOGISTIK WAREHOUSE',
    senderAddress: `Gudang Utama Trens Logistik (${asal})`,
    senderCity: asal,
    recipientAddress: `Alamat Klien Mitra (${tujuan})`,
    recipientCity: tujuan,
    itemDescription: `${order.barang || 'Kargo Logistik'} (${weight} Kg)`,
    colly,
    weight,
    ongkirCargo: cost,
    biayaPacking: 0,
    asuransi: 0,
    ppnPercent: 12,
    pphPercent: 0,
    deliveryOrderNo: `DO-${invNumber}`
  };

  return upsertInvoice(newInv);
};

export const subscribeToInvoiceUpdates = (callback: (invoices: Invoice[]) => void): (() => void) => {
  const handleCustom = (e: Event) => {
    const custom = e as CustomEvent<Invoice[]>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getStoredInvoices());
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === INVOICE_STORAGE_KEY) {
      callback(getStoredInvoices());
    }
  };

  window.addEventListener('trens_invoice_updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('trens_invoice_updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
};
