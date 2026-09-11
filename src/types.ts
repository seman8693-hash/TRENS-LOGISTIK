export type ShipmentMode = 'Darat' | 'Laut' | 'Udara';

export type ShipmentStatus = 'Diproses' | 'Dalam Perjalanan' | 'Tiba di Kota Tujuan' | 'Terkirim' | 'Dibatalkan';

export interface TrackingCheckpoint {
  w: string;
  k: string;
  s: 'done' | 'current' | '';
}

export interface TrackingItem {
  no?: string;
  nama: string;
  rute: string;
  moda: ShipmentMode;
  status: ShipmentStatus;
  history: TrackingCheckpoint[];
  sender?: string;
  senderPhone?: string;
  recipient?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  weight?: number;
  cost?: number;
  date?: string;
  notes?: string;
  photoUrl?: string;
  photoProof?: string;
  photoTimestamp?: string;
}

export interface OrderRequest {
  id: string;
  resi: string;
  nama: string;
  hp: string;
  moda: ShipmentMode;
  rute: string;
  barang: string;
  berat: number;
  panjang?: number;
  lebar?: number;
  tinggi?: number;
  catatan: string;
  tanggal: string;
  status: 'Baru' | 'Dikonfirmasi' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  estimasiBiaya?: number;
  photoUrl?: string;
  chat?: {
    dari: 'customer' | 'admin';
    waktu: string;
    isi: string;
  }[];
}

export interface CityData {
  n: string;
  z: string;
}

export interface CalculationResult {
  beratAktual: number;
  volumetrik: number;
  chargeable: number;
  tarifKg: number;
  totalBiaya: number;
  waktu: string;
  kenaMin: boolean;
  asalNama: string;
  tujuanNama: string;
  moda: ShipmentMode;
}

export type AppViewMode = 'website' | 'dashboard';
export type DeviceMode = 'desktop' | 'laptop' | 'tablet' | 'mobile';
export type SplitLayout = 'split-horizontal' | 'split-vertical' | 'editor-only' | 'preview-only';

export interface PartnerLead {
  id: string;
  nama: string;
  perusahaan?: string;
  tipe: 'agen' | 'armada' | 'korporat' | 'kurir';
  noHp: string;
  kota: string;
  pesan?: string;
  tanggal: string;
  status: 'Menunggu' | 'Dihubungi' | 'Disetujui' | 'Ditolak';
}

export interface Invoice {
  id: string;
  customerName: string;
  customerPhone: string;
  resi: string;
  amount: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: 'Belum Dibayar' | 'Dibayar' | 'Jatuh Tempo';
}

export type DashboardTab = 'overview' | 'shipments' | 'orders' | 'partners' | 'rates' | 'integration' | 'admin' | 'invoices';

export interface WebhookConfig {
  url: string;
  secret: string;
  activeEvents: string[];
  lastTriggered?: string;
  lastStatus?: number;
}

export interface ApiLogItem {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  statusCode: number;
  ip: string;
  durationMs: number;
}

export interface HtmlTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  badge?: string;
  html: string;
}
