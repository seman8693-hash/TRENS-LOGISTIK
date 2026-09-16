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
  senderCity?: string;
  senderAddress?: string;
  recipient?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientCity?: string;
  weight?: number;
  berat?: number;
  colly?: number;
  cost?: number;
  date?: string;
  notes?: string;
  photoUrl?: string;
  photoProof?: string;
  photoTimestamp?: string;
  vendor?: string;
  armada?: string;
  driver?: string;
  platNomor?: string;
  asalTruk?: string;
  etd?: string;
  eta?: string;
  panjang?: number;
  lebar?: number;
  tinggi?: number;
  hargaBarang?: number;
  biayaPacking?: number;
  asuransi?: number;
  ppn?: number;
  pph?: number;
  tarifKg?: number;
  ongkirPokok?: number;
  biayaTambahan?: number;
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
  layanan?: string;
  vendor?: string;
  minimalBerat?: number;
  isPricelistMatch?: boolean;
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
  paymentStatus?: 'LUNAS' | 'BELUM LUNAS' | 'DP / SEBAGIAN' | 'JATUH TEMPO' | 'BATAL' | 'CUSTOM';
  customStamp?: string;
  senderName?: string;
  senderAddress?: string;
  senderCity?: string;
  recipientAddress?: string;
  recipientCity?: string;
  itemDescription?: string;
  colly?: number;
  weight?: number;
  ongkirCargo?: number;
  biayaPacking?: number;
  asuransi?: number;
  ppnPercent?: number;
  pphPercent?: number;
  deliveryOrderNo?: string;
  driverName?: string;
  vehiclePlate?: string;
}

export interface PricelistRouteItem {
  id: string;
  kotaAsal: string;
  kotaTujuan: string;
  moda: ShipmentMode;
  layanan: string;
  vendor: string;
  tarifKg: number;
  modalKg?: number;
  marginPercent?: number;
  minimalBerat: number;
  leadTime: string;
}

export type DashboardTab = 'overview' | 'shipments' | 'orders' | 'partners' | 'rates' | 'integration' | 'admin' | 'invoices' | 'logs' | 'customers' | 'reports' | 'chat' | 'users';

/* ==========================================================================
 * Multi-user Admin & Role Based Access Control
 * ========================================================================== */
export type UserRole = 'owner' | 'admin' | 'operator' | 'viewer';

export interface AdminUser {
  id: string;
  username: string;
  nama: string;
  email?: string;
  role: UserRole;
  password: string;
  active: boolean;
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
}

/* ==========================================================================
 * Master Pelanggan (Customer Database)
 * ========================================================================== */
export type CustomerSegment = 'Retail' | 'B2B / Korporat' | 'Mitra Agen';

export interface Customer {
  id: string;
  nama: string;
  perusahaan?: string;
  telepon: string;
  email?: string;
  kota: string;
  alamat?: string;
  segmen: CustomerSegment;
  catatan?: string;
  createdAt: string;
  updatedAt?: string;
}

/** Customer row enriched with derived statistics from shipments/orders/invoices */
export interface CustomerWithStats extends Customer {
  totalShipments: number;
  totalSpend: number;
  totalWeight: number;
  lastShipmentDate?: string;
  bookingCount: number;
}

/* ==========================================================================
 * Pusat Chat / Customer Service
 * ========================================================================== */
export type ChatThreadStatus = 'Baru' | 'Aktif' | 'Selesai';

export interface ChatMessage {
  id: string;
  dari: 'customer' | 'admin';
  isi: string;
  waktu: string;
  pengirim?: string;
}

export interface ChatThread {
  id: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  resi?: string;
  orderId?: string;
  moda?: ShipmentMode;
  rute?: string;
  status: ChatThreadStatus;
  messages: ChatMessage[];
  unreadAdmin: number;
  createdAt: string;
  updatedAt: string;
}

/* ==========================================================================
 * Laporan & Keuangan
 * ========================================================================== */
export type ReportPeriodPreset = 'hari-ini' | '7-hari' | '30-hari' | 'bulan-ini' | 'custom';

export interface ReportFilters {
  preset: ReportPeriodPreset;
  startDate: string;
  endDate: string;
  moda: 'Semua' | ShipmentMode;
  status: 'Semua' | ShipmentStatus;
}

export interface ReportSummary {
  totalRevenue: number;
  totalShipments: number;
  totalWeight: number;
  totalColly: number;
  averagePerShipment: number;
  totalPpn: number;
  totalPph: number;
  invoicedTotal: number;
  paidTotal: number;
  unpaidTotal: number;
  outstandingTotal: number;
}

export interface ReportGroupRow {
  label: string;
  shipments: number;
  weight: number;
  revenue: number;
  share: number;
}

export type LogCategory = 'RESI' | 'ORDER' | 'INVOICE' | 'PARTNER' | 'AUTH' | 'SYSTEM' | 'OPERATIONAL';

export type LogLevel = 'info' | 'success' | 'warning' | 'danger';

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string format
  category: LogCategory;
  action: string;
  actor: string;
  title: string;
  description: string;
  targetId?: string; // e.g. No. Resi, Order ID, etc.
  details?: Record<string, any>;
  level: LogLevel;
}

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
