import { CityData, ShipmentMode, TrackingItem, OrderRequest, PartnerLead, WebhookConfig } from '../types';

export const WA_NUMBER = '6285694310979';
export const WA_NUMBER_DISPLAY = '0856-9431-0979';
export const OFFICE_PHONE = '081389755106';
export const OFFICE_PHONE_DISPLAY = '0813-8975-5106';
export const MIN_BIAYA = 50000;
export const SAMPLE_RESIS = new Set(['LN25083001', 'LN25083002', 'LN25083003', 'LN25083004']);
export const DUMMY_RESI_LIST = ['LN25083001', 'LN25083002', 'LN25083003', 'LN25083004'];
export const DUMMY_ORDER_LIST = ['LN26090101', 'LN26090102'];
export const DUMMY_PARTNER_LIST = ['PTR260901', 'PTR260902', 'PTR260903'];

export const CITIES: Record<string, CityData> = {
  jakarta: { n: 'Jakarta', z: 'Jawa' },
  bandung: { n: 'Bandung', z: 'Jawa' },
  semarang: { n: 'Semarang', z: 'Jawa' },
  yogyakarta: { n: 'Yogyakarta', z: 'Jawa' },
  surabaya: { n: 'Surabaya', z: 'Jawa' },
  medan: { n: 'Medan', z: 'Sumatera' },
  padang: { n: 'Padang', z: 'Sumatera' },
  palembang: { n: 'Palembang', z: 'Sumatera' },
  pekanbaru: { n: 'Pekanbaru', z: 'Sumatera' },
  lampung: { n: 'Bandar Lampung', z: 'Sumatera' },
  pontianak: { n: 'Pontianak', z: 'Kalimantan' },
  banjarmasin: { n: 'Banjarmasin', z: 'Kalimantan' },
  balikpapan: { n: 'Balikpapan', z: 'Kalimantan' },
  samarinda: { n: 'Samarinda', z: 'Kalimantan' },
  makassar: { n: 'Makassar', z: 'Sulawesi' },
  manado: { n: 'Manado', z: 'Sulawesi' },
  denpasar: { n: 'Denpasar', z: 'Bali & NTB' },
  mataram: { n: 'Mataram', z: 'Bali & NTB' },
  jayapura: { n: 'Jayapura', z: 'Papua' },
  sorong: { n: 'Sorong', z: 'Papua' }
};

export const DEFAULT_RATES: Record<ShipmentMode, Record<string, number>> = {
  Darat: {
    same: 0,
    jawaSumatera: 0,
    jawaKalimantan: 0,
    jawaSulawesi: 0,
    jawaBali: 0,
    jawaPapua: 0,
    cross: 0
  },
  Laut: {
    same: 0,
    jawaSumatera: 0,
    jawaKalimantan: 0,
    jawaSulawesi: 0,
    jawaBali: 0,
    jawaPapua: 0,
    cross: 0
  },
  Udara: {
    same: 0,
    jawaSumatera: 0,
    jawaKalimantan: 0,
    jawaSulawesi: 0,
    jawaBali: 0,
    jawaPapua: 0,
    cross: 0
  }
};

export const DAYS: Record<ShipmentMode, Record<string, string>> = {
  Darat: {
    same: '1-2 hari',
    jawaSumatera: '3-5 hari',
    jawaKalimantan: '4-6 hari',
    jawaSulawesi: '5-8 hari',
    jawaBali: '2-3 hari',
    jawaPapua: '10-14 hari',
    cross: '5-9 hari'
  },
  Laut: {
    same: '2-3 hari',
    jawaSumatera: '4-7 hari',
    jawaKalimantan: '5-8 hari',
    jawaSulawesi: '7-10 hari',
    jawaBali: '3-4 hari',
    jawaPapua: '12-16 hari',
    cross: '7-12 hari'
  },
  Udara: {
    same: '1 hari',
    jawaSumatera: '1-2 hari',
    jawaKalimantan: '1-2 hari',
    jawaSulawesi: '2-3 hari',
    jawaBali: '1-2 hari',
    jawaPapua: '2-3 hari',
    cross: '2-3 hari'
  }
};

export const INITIAL_SAMPLE_TRACKS: Record<string, TrackingItem> = {
  LN25083001: {
    nama: 'Paket Elektronik (Komputer & Sparepart)',
    rute: 'Jakarta → Medan',
    moda: 'Darat',
    status: 'Dalam Perjalanan',
    sender: 'PT Mega Komputindo',
    senderPhone: '081299887766',
    recipient: 'Budi Santoso',
    recipientPhone: '081344556677',
    recipientAddress: 'Jl. Gatot Subroto No. 45, Medan Petisah',
    weight: 18.5,
    cost: 110000,
    date: '30 Agu 2026',
    history: [
      { w: '30 Agu 09:10', k: 'Paket diterima di Gudang Jakarta Hub', s: 'done' },
      { w: '30 Agu 14:30', k: 'Paket dalam perjalanan darat menuju Pelabuhan Merak', s: 'done' },
      { w: '31 Agu 06:00', k: 'Menyeberang via Kapal RoRo ke Pelabuhan Bakauheni', s: 'current' },
      { w: '31 Agu 18:00', k: 'Estimasi tiba di Gudang Transit Bandar Lampung', s: '' },
      { w: '02 Sep 08:00', k: 'Pengantaran kurir ke alamat penerima (Medan)', s: '' }
    ]
  },
  LN25083002: {
    nama: 'Set Furniture Kayu Jati',
    rute: 'Surabaya → Balikpapan',
    moda: 'Laut',
    status: 'Tiba di Kota Tujuan',
    sender: 'UD Mebel Perkasa',
    senderPhone: '085711223344',
    recipient: 'Irfan Hakim',
    recipientPhone: '081299001122',
    recipientAddress: 'Jl. Jenderal Sudirman No. 88, Balikpapan',
    weight: 85,
    cost: 320000,
    date: '27 Agu 2026',
    history: [
      { w: '27 Agu 08:00', k: 'Paket diterima di Gudang Pelabuhan Tanjung Perak Surabaya', s: 'done' },
      { w: '28 Agu 20:00', k: 'Diberangkatkan via Kapal Kontainer KM Logistik 08', s: 'done' },
      { w: '30 Agu 10:00', k: 'Kapal bersandar & bongkar muat di Pelabuhan Semayang Balikpapan', s: 'done' },
      { w: '30 Agu 15:30', k: 'Paket tiba di Gudang Hub Balikpapan, proses sortir', s: 'current' },
      { w: '31 Agu 09:00', k: 'Jadwal kurir pengiriman antar ke alamat tujuan', s: '' }
    ]
  },
  LN25083003: {
    nama: 'Dokumen Bisnis & Sampel Medis',
    rute: 'Jakarta → Makassar',
    moda: 'Udara',
    status: 'Terkirim',
    sender: 'PT Bio Farma Prima',
    senderPhone: '081122334455',
    recipient: 'Dr. Andi Pratama',
    recipientPhone: '081388990011',
    recipientAddress: 'Jl. Sam Ratulangi No. 12, Makassar',
    weight: 3.2,
    cost: 75000,
    date: '28 Agu 2026',
    history: [
      { w: '28 Agu 09:00', k: 'Paket diterima di Drop Point Bandara Soekarno Hatta Cengkareng', s: 'done' },
      { w: '28 Agu 11:00', k: 'Diberangkatkan via Pesawat Kargo Udara FL-402', s: 'done' },
      { w: '28 Agu 13:00', k: 'Mendarat & diverifikasi di Bandara Sultan Hasanuddin Makassar', s: 'done' },
      { w: '28 Agu 16:00', k: 'Paket sukses diterima oleh penerima (Dr. Andi Pratama)', s: 'current' }
    ]
  },
  LN25083004: {
    nama: 'Suku Cadang Mesin Pabrik',
    rute: 'Bandung → Jayapura',
    moda: 'Laut',
    status: 'Diproses',
    sender: 'Bengkel Presisi Mandiri',
    senderPhone: '087811992233',
    recipient: 'Karya Tambang Papua',
    recipientPhone: '082199887766',
    recipientAddress: 'Jl. Raya Abepura, Jayapura',
    weight: 42,
    cost: 265000,
    date: '30 Agu 2026',
    history: [
      { w: '30 Agu 08:30', k: 'Data pesanan pengiriman dibuat & terverifikasi sistem', s: 'done' },
      { w: '31 Agu 07:00', k: 'Barang diterima di Gudang Transit Bandung', s: 'current' },
      { w: '01 Sep 10:00', k: 'Diberangkatkan menuju Pelabuhan Tanjung Priok', s: '' }
    ]
  }
};

export const INITIAL_REQUESTS: OrderRequest[] = [
  {
    id: 'LN26090101',
    resi: 'LN26090101',
    nama: 'Hendro Gunawan',
    hp: '081287654321',
    moda: 'Darat',
    rute: 'Jakarta → Surabaya',
    barang: 'Karton Pakaian Konveksi (5 Koli)',
    berat: 45,
    catatan: 'Tolong jemput di ruko Blok B5 jam 10 pagi',
    tanggal: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'Baru',
    estimasiBiaya: 112500,
    chat: [
      {
        dari: 'customer',
        waktu: '09:15',
        isi: 'Halo, saya ingin kirim Karton Pakaian Konveksi (45 kg) via Darat. Rute: Jakarta → Surabaya. Tolong jemput di ruko Blok B5 jam 10 pagi.'
      }
    ]
  },
  {
    id: 'LN26090102',
    resi: 'LN26090102',
    nama: 'Siti Rahmawati',
    hp: '085298765432',
    moda: 'Udara',
    rute: 'Bandung → Denpasar',
    barang: 'Handicraft & Tas Tenun',
    berat: 8,
    catatan: 'Barang butuh sampai besok sore untuk pameran',
    tanggal: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'Dikonfirmasi',
    estimasiBiaya: 112000,
    chat: [
      {
        dari: 'customer',
        waktu: 'Kemarin 16:40',
        isi: 'Halo TRENS-LOGISTIC, saya perlu kirim kerajinan tangan untuk pameran di Bali besok sore.'
      },
      {
        dari: 'admin',
        waktu: 'Kemarin 17:00',
        isi: 'Siap Kak Siti, pengiriman via Kargo Udara kami jadwalkan penerbangan pertama besok pagi.'
      }
    ]
  }
];

// Helper Functions
export const rupiah = (n: number): string => {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
};

export const zonePair = (z1: string, z2: string): string => {
  if (z1 === z2) return 'same';
  const norm = (z: string) => z.replace(/[^A-Za-z]/g, '').replace('NTB', '');
  if (z1 === 'Jawa' && z2 !== 'Jawa') return 'jawa' + norm(z2);
  if (z2 === 'Jawa' && z1 !== 'Jawa') return 'jawa' + norm(z1);
  return 'cross';
};

export const getStoredTracks = (): Record<string, TrackingItem> => {
  try {
    const raw = localStorage.getItem('ln_tracks_v2');
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return Object.fromEntries(Object.entries(parsed).filter(([resi]) => !SAMPLE_RESIS.has(resi))) as Record<string, TrackingItem>;
  } catch {
    return {};
  }
};

export const saveStoredTracks = (tracks: Record<string, TrackingItem>) => {
  try {
    localStorage.setItem('ln_tracks_v2', JSON.stringify(tracks));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trens_tracks_updated', { detail: tracks }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to save tracks to localStorage', err);
  }
};

export const getStoredRequests = (): OrderRequest[] => {
  try {
    const raw = localStorage.getItem('trens_requests_v2');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredRequests = (requests: OrderRequest[]) => {
  try {
    localStorage.setItem('trens_requests_v2', JSON.stringify(requests));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trens_requests_updated', { detail: requests }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to save requests to localStorage', err);
  }
};

export const INITIAL_PARTNERS: PartnerLead[] = [
  {
    id: 'PTR260901',
    nama: 'Bambang Sudiro',
    perusahaan: 'Toko Sentosa Jaya',
    tipe: 'agen',
    noHp: '081298765432',
    kota: 'Semarang, Jawa Tengah',
    pesan: 'Lokasi strategis di tepi jalan raya komersial, ruko 2 lantai.',
    tanggal: '2026-09-01T10:30:00.000Z',
    status: 'Menunggu'
  },
  {
    id: 'PTR260902',
    nama: 'Rahmat Hidayat',
    perusahaan: 'CV Berkah Angkutan',
    tipe: 'armada',
    noHp: '085211223344',
    kota: 'Surabaya, Jawa Timur',
    pesan: 'Memiliki 4 unit CDD Box dan 2 unit Fuso siap trayek Jawa-Bali.',
    tanggal: '2026-08-29T14:15:00.000Z',
    status: 'Disetujui'
  },
  {
    id: 'PTR260903',
    nama: 'Jessica Tanuwijaya',
    perusahaan: 'PT Nusantara Food Makmur',
    tipe: 'korporat',
    noHp: '081199887766',
    kota: 'Jakarta Barat',
    pesan: 'Kebutuhan distribusi bahan makanan kering rutin 15-20 ton/bulan ke luar pulau.',
    tanggal: '2026-08-31T09:00:00.000Z',
    status: 'Dihubungi'
  }
];

export const getStoredPartners = (): PartnerLead[] => {
  try {
    const raw = localStorage.getItem('trens_partners_v2');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredPartners = (partners: PartnerLead[]) => {
  try {
    localStorage.setItem('trens_partners_v2', JSON.stringify(partners));
  } catch (err) {
    console.error('Failed to save partners to localStorage', err);
  }
};

export const getStoredRates = (): Record<ShipmentMode, Record<string, number>> => {
  try {
    const raw = localStorage.getItem('trens_rates_v2');
    if (!raw) {
      localStorage.setItem('trens_rates_v2', JSON.stringify(DEFAULT_RATES));
      return DEFAULT_RATES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_RATES;
  }
};

export const saveStoredRates = (rates: Record<ShipmentMode, Record<string, number>>) => {
  try {
    localStorage.setItem('trens_rates_v2', JSON.stringify(rates));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trens_rates_updated', { detail: rates }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Failed to save rates to localStorage', err);
  }
};

export const INITIAL_WEBHOOK: WebhookConfig = {
  url: 'https://api.perusahaan-anda.com/webhooks/trens-logistics',
  secret: 'whsec_trens_98f4e198b201a44c',
  activeEvents: ['shipment.created', 'shipment.checkpoint_updated', 'shipment.delivered', 'pickup.requested']
};

export const getStoredWebhook = (): WebhookConfig => {
  try {
    const raw = localStorage.getItem('trens_webhook');
    if (!raw) {
      localStorage.setItem('trens_webhook', JSON.stringify(INITIAL_WEBHOOK));
      return INITIAL_WEBHOOK;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WEBHOOK;
  }
};

export const saveStoredWebhook = (cfg: WebhookConfig) => {
  try {
    localStorage.setItem('trens_webhook', JSON.stringify(cfg));
  } catch (err) {
    console.error('Failed to save webhook config', err);
  }
};
