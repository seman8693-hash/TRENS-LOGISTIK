import * as XLSX from 'xlsx';
import {
  Invoice,
  ReportFilters,
  ReportGroupRow,
  ReportPeriodPreset,
  ReportSummary,
  ShipmentMode,
  ShipmentStatus,
  TrackingItem
} from '../types';

/* ==========================================================================
 * Parsing tanggal fleksibel (mendukung "30 Agu 2026", ISO, dan "6/9/2026")
 * ========================================================================== */
const INDO_MONTHS: Record<string, number> = {
  jan: 0, january: 0, januari: 0,
  feb: 1, peb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agustus: 7, aug: 7, ags: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9, oct: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11
};

export const parseFlexibleDate = (raw?: string): number => {
  if (!raw) return 0;
  const value = String(raw).trim();

  // Format Indonesia: "30 Agu 2026" / "30 Agustus 2026 14:30"
  const indoMatch = value.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:\s+(\d{1,2})[.:](\d{2}))?/);
  if (indoMatch) {
    const day = Number(indoMatch[1]);
    const monthKey = indoMatch[2].toLowerCase();
    const year = Number(indoMatch[3]);
    const month = INDO_MONTHS[monthKey];
    if (month !== undefined) {
      const hour = indoMatch[4] ? Number(indoMatch[4]) : 0;
      const minute = indoMatch[5] ? Number(indoMatch[5]) : 0;
      return new Date(year, month, day, hour, minute).getTime();
    }
  }

  // Format Indonesia numerik: "6/9/2026, 11.30.41" => hari/bulan/tahun
  const slashMatch = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const day = Number(slashMatch[1]);
    const month = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    const timeMatch = value.match(/(\d{1,2})[.:](\d{2})[.:]?(\d{2})?/);
    const hour = timeMatch ? Number(timeMatch[1]) : 0;
    const minute = timeMatch ? Number(timeMatch[2]) : 0;
    return new Date(year, month - 1, day, hour, minute).getTime();
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const endOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

export interface DateRange {
  start: number;
  end: number;
}

export const resolveDateRange = (preset: ReportPeriodPreset, startDate?: string, endDate?: string): DateRange => {
  const today = new Date();
  switch (preset) {
    case 'hari-ini':
      return { start: startOfDay(today), end: endOfDay(today) };
    case '7-hari': {
      const from = new Date(today.getTime() - 6 * 86400000);
      return { start: startOfDay(from), end: endOfDay(today) };
    }
    case 'bulan-ini': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1);
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { start: startOfDay(from), end: endOfDay(to) };
    }
    case 'custom': {
      const start = startDate ? startOfDay(new Date(startDate)) : startOfDay(today);
      const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(today);
      return { start, end };
    }
    case '30-hari':
    default: {
      const from = new Date(today.getTime() - 29 * 86400000);
      return { start: startOfDay(from), end: endOfDay(today) };
    }
  }
};

export interface ReportShipmentRow {
  resi: string;
  tanggal: string;
  tanggalTs: number;
  rute: string;
  tujuan: string;
  moda: ShipmentMode;
  status: ShipmentStatus;
  berat: number;
  colly: number;
  pendapatan: number;
  pelanggan: string;
  invoiceTotal?: number;
  invoiceStatus?: string;
}

export const formatRupiah = (value: number): string =>
  'Rp ' + Math.round(value).toLocaleString('id-ID');

export const formatCompactRupiah = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (Math.abs(value) >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  if (Math.abs(value) >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return formatRupiah(value);
};

const destinationOf = (rute: string): string => {
  const parts = (rute || '').split('→');
  return parts.length > 1 ? parts[1].trim() : (rute || 'Tidak diketahui');
};

/**
 * Bangun baris laporan resi sesuai filter periode, moda, dan status
 */
export const buildReportRows = (
  tracks: Record<string, TrackingItem>,
  invoices: Invoice[],
  filters: ReportFilters
): ReportShipmentRow[] => {
  const range = resolveDateRange(filters.preset, filters.startDate, filters.endDate);

  const invoiceByResi = new Map<string, Invoice>();
  invoices.forEach((inv) => {
    if (inv.resi) invoiceByResi.set(inv.resi.toUpperCase(), inv);
  });

  return Object.entries(tracks)
    .map(([resi, item]) => {
      const ts = parseFlexibleDate(item.date);
      const invoice = invoiceByResi.get(resi.toUpperCase());
      const baseCost = Number(item.cost || 0);
      const fallbackCost = Number(item.ongkirPokok || 0) + Number(item.biayaTambahan || 0);
      const revenue = baseCost > 0 ? baseCost : fallbackCost > 0 ? fallbackCost : Number(invoice?.total || 0);
      return {
        resi,
        tanggal: item.date || '-',
        tanggalTs: ts,
        rute: item.rute || '-',
        tujuan: destinationOf(item.rute || ''),
        moda: item.moda,
        status: item.status,
        berat: Number(item.weight || item.berat || 0),
        colly: Number(item.colly || 1),
        pendapatan: revenue,
        pelanggan: item.sender || 'Pelanggan Tanpa Nama',
        invoiceTotal: invoice ? Number(invoice.total) : undefined,
        invoiceStatus: invoice ? invoice.status : undefined
      } as ReportShipmentRow;
    })
    .filter((row) => {
      const inRange = row.tanggalTs === 0 ? true : row.tanggalTs >= range.start && row.tanggalTs <= range.end;
      const matchModa = filters.moda === 'Semua' || row.moda === filters.moda;
      const matchStatus = filters.status === 'Semua' || row.status === filters.status;
      return inRange && matchModa && matchStatus;
    })
    .sort((a, b) => b.tanggalTs - a.tanggalTs);
};

export const isPaidInvoice = (inv: Invoice): boolean =>
  inv.paymentStatus === 'LUNAS' || inv.status === 'Dibayar';

export const isOverdueInvoice = (inv: Invoice): boolean =>
  inv.paymentStatus === 'JATUH TEMPO' || inv.status === 'Jatuh Tempo';

export const buildReportSummary = (rows: ReportShipmentRow[], invoices: Invoice[]): ReportSummary => {
  const totalRevenue = rows.reduce((sum, r) => sum + r.pendapatan, 0);
  const totalWeight = rows.reduce((sum, r) => sum + r.berat, 0);
  const totalColly = rows.reduce((sum, r) => sum + r.colly, 0);

  const invoicedTotal = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidTotal = invoices.filter(isPaidInvoice).reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const overdueTotal = invoices.filter(isOverdueInvoice).reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const unpaidTotal = invoicedTotal - paidTotal;

  return {
    totalRevenue,
    totalShipments: rows.length,
    totalWeight: Math.round(totalWeight * 10) / 10,
    totalColly,
    averagePerShipment: rows.length > 0 ? Math.round(totalRevenue / rows.length) : 0,
    totalPpn: Math.round(totalRevenue * 0.12),
    totalPph: Math.round(totalRevenue * 0.02),
    invoicedTotal,
    paidTotal,
    unpaidTotal,
    outstandingTotal: overdueTotal
  };
};

export const buildGroupRows = (
  rows: ReportShipmentRow[],
  keySelector: (row: ReportShipmentRow) => string
): ReportGroupRow[] => {
  const map = new Map<string, { shipments: number; weight: number; revenue: number }>();
  rows.forEach((row) => {
    const key = keySelector(row) || 'Tidak diketahui';
    const acc = map.get(key) || { shipments: 0, weight: 0, revenue: 0 };
    acc.shipments += 1;
    acc.weight += row.berat;
    acc.revenue += row.pendapatan;
    map.set(key, acc);
  });

  const totalRevenue = rows.reduce((sum, r) => sum + r.pendapatan, 0);
  return Array.from(map.entries())
    .map(([label, acc]) => ({
      label,
      shipments: acc.shipments,
      weight: Math.round(acc.weight * 10) / 10,
      revenue: acc.revenue,
      share: totalRevenue > 0 ? Math.round((acc.revenue / totalRevenue) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.revenue - a.revenue);
};

export interface ReportTrendPoint {
  label: string;
  revenue: number;
  shipments: number;
}

/**
 * Tren harian pendapatan & jumlah kiriman (dipakai untuk grafik batang sederhana)
 */
export const buildDailyTrend = (rows: ReportShipmentRow[], maxPoints: number = 14): ReportTrendPoint[] => {
  const map = new Map<string, { revenue: number; shipments: number; ts: number }>();

  rows.forEach((row) => {
    if (!row.tanggalTs) return;
    const date = new Date(row.tanggalTs);
    const ts = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const key = String(ts);
    const acc = map.get(key) || { revenue: 0, shipments: 0, ts };
    acc.revenue += row.pendapatan;
    acc.shipments += 1;
    map.set(key, acc);
  });

  return Array.from(map.values())
    .sort((a, b) => a.ts - b.ts)
    .slice(-maxPoints)
    .map((acc) => ({
      label: new Date(acc.ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      revenue: acc.revenue,
      shipments: acc.shipments
    }));
};

/**
 * Filter invoice berdasarkan periode laporan
 */
export const filterInvoicesByRange = (invoices: Invoice[], range: DateRange): Invoice[] => {
  return invoices.filter((inv) => {
    const ts = parseFlexibleDate(inv.issueDate);
    if (ts === 0) return true;
    return ts >= range.start && ts <= range.end;
  });
};

export const describeRange = (range: DateRange): string => {
  const format = (ts: number) =>
    new Date(ts).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${format(range.start)} s/d ${format(range.end)}`;
};

/**
 * Export laporan lengkap ke Excel multi-sheet
 */
export const exportReportToExcel = (payload: {
  summary: ReportSummary;
  modaRows: ReportGroupRow[];
  destinationRows: ReportGroupRow[];
  statusRows: ReportGroupRow[];
  rows: ReportShipmentRow[];
  periodLabel: string;
  filename?: string;
}): void => {
  const { summary, modaRows, destinationRows, statusRows, rows, periodLabel } = payload;
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ringkasan
  const summaryRows: (string | number)[][] = [
    ['LAPORAN KEUANGAN & OPERASIONAL - TRENS-LOGISTIC'],
    ['Periode', periodLabel],
    ['Dicetak pada', new Date().toLocaleString('id-ID')],
    [],
    ['INDIKATOR PENDAPATAN', 'NILAI (RP)'],
    ['Total Omset / Pendapatan', summary.totalRevenue],
    ['Rata-rata per Resi', summary.averagePerShipment],
    ['Estimasi PPN 12%', summary.totalPpn],
    ['Estimasi PPh 2%', summary.totalPph],
    [],
    ['INDIKATOR OPERASIONAL', 'JUMLAH'],
    ['Total Resi / Kiriman', summary.totalShipments],
    ['Total Berat (Kg)', summary.totalWeight],
    ['Total Koli', summary.totalColly],
    [],
    ['REKAP TAGIHAN INVOICE', 'NILAI (RP)'],
    ['Total Invoice Diterbitkan', summary.invoicedTotal],
    ['Sudah Dibayar', summary.paidTotal],
    ['Belum Dibayar', summary.unpaidTotal],
    ['Jatuh Tempo', summary.outstandingTotal]
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 34 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // Sheet 2: Per Moda
  const buildGroupSheet = (headerLabel: string, items: ReportGroupRow[]): XLSX.WorkSheet => {
    const header = [headerLabel, 'JUMLAH RESI', 'TOTAL BERAT (KG)', 'PENDAPATAN (RP)', 'KONTRIBUSI (%)'];
    const body = items.map((g) => [g.label, g.shipments, g.weight, g.revenue, g.share]);
    const total: (string | number)[] = [
      'TOTAL',
      items.reduce((s, g) => s + g.shipments, 0),
      Math.round(items.reduce((s, g) => s + g.weight, 0) * 10) / 10,
      items.reduce((s, g) => s + g.revenue, 0),
      100
    ];
    const ws = XLSX.utils.aoa_to_sheet([header, ...body, total]);
    ws['!cols'] = [{ wch: 28 }, { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 16 }];
    return ws;
  };

  XLSX.utils.book_append_sheet(wb, buildGroupSheet('MODA / JALUR', modaRows), 'Per Moda');
  XLSX.utils.book_append_sheet(wb, buildGroupSheet('KOTA TUJUAN', destinationRows), 'Per Kota Tujuan');
  XLSX.utils.book_append_sheet(wb, buildGroupSheet('STATUS KIRIMAN', statusRows), 'Per Status');

  // Sheet 5: Detail Resi
  const detailHeader = [
    'NO. RESI', 'TANGGAL', 'PELANGGAN / PENGIRIM', 'RUTE', 'TUJUAN', 'MODA',
    'STATUS', 'BERAT (KG)', 'KOLI', 'PENDAPATAN (RP)', 'STATUS INVOICE'
  ];
  const detailBody = rows.map((r) => [
    r.resi,
    r.tanggal,
    r.pelanggan,
    r.rute,
    r.tujuan,
    r.moda,
    r.status,
    r.berat,
    r.colly,
    r.pendapatan,
    r.invoiceStatus || 'Belum Difakturkan'
  ]);
  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailBody]);
  wsDetail['!cols'] = [
    { wch: 18 }, { wch: 18 }, { wch: 24 }, { wch: 26 }, { wch: 20 }, { wch: 12 },
    { wch: 22 }, { wch: 12 }, { wch: 8 }, { wch: 18 }, { wch: 20 }
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail Resi');

  XLSX.writeFile(wb, payload.filename || `laporan-trens-logistic-${Date.now()}.xlsx`);
};