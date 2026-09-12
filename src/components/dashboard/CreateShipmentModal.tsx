import React, { useState, useEffect } from 'react';
import { 
  X, Package, Truck, Ship, Plane, Calculator, Check, Sparkles, 
  AlertTriangle, User, Phone, MapPin, Calendar, Clock, Shield, 
  Search, Building2, RefreshCw, FileText, CheckCircle2, ChevronDown
} from 'lucide-react';
import { ShipmentMode, TrackingItem, ShipmentStatus, PricelistRouteItem } from '../../types';
import { CITIES, rupiah } from '../../data/logisticData';
import { getStoredPricelistRoutes, DEFAULT_PRICELIST_ROUTES } from '../../data/pricelistData';
import { PhotoUploadDropzone } from '../PhotoUploadDropzone';
import { createInvoiceFromTracking } from '../../utils/invoiceStore';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resi: string, item: TrackingItem) => void;
}

const CRM_CUSTOMERS = [
  {
    nama: 'PT. Maju Jaya / Bpk. Ahmad',
    hp: '08123456789',
    kota: 'Surabaya Kota',
    alamat: 'Jl. Raya Industri No. 12, Kel. Cikarang, Bekasi'
  },
  {
    nama: 'PT. Sinar Jaya Abadi (Ibu Ratna)',
    hp: '081399887766',
    kota: 'Semarang Kota',
    alamat: 'Kawasan Industri Candi Blok 5 No. 18, Krapyak, Semarang'
  },
  {
    nama: 'CV. Sentosa Makmur (Bpk. Denny)',
    hp: '081277665544',
    kota: 'Denpasar Bali',
    alamat: 'Jl. Teuku Umar No. 88, Pemecutan Klod, Denpasar Barat'
  },
  {
    nama: 'PT. Borneo Mega Mandiri (Bpk. Hendra)',
    hp: '085245678901',
    kota: 'Pontianak Kota',
    alamat: 'Jl. Gajah Mada No. 120, Benua Melayu Darat, Pontianak Selatan'
  },
  {
    nama: 'PT. Samudera Timur Perkasa (Ibu Maya)',
    hp: '082188990011',
    kota: 'Makassar Kota',
    alamat: 'Kawasan Pergudangan Pattene Blok C3 No. 7, Biringkanaya, Makassar'
  },
  {
    nama: 'PT. Sumber Rezeki Mandiri (Bpk. Joko)',
    hp: '081299001122',
    kota: 'Palembang Kota',
    alamat: 'Jl. Kolonel Atmo No. 45, 17 Ilir, Ilir Timur I, Palembang'
  },
  {
    nama: 'Gudang Logistik Medan (Bpk. Rian)',
    hp: '085277889900',
    kota: 'Medan Kota',
    alamat: 'Kawasan Industri Medan (KIM) 2 Blok D-14, Mabar, Medan Deli'
  }
];

const FLEET_TRUCKS = [
  { plat: 'B 1234 XYZ', tipe: 'CDD BOX (4T)', driver: 'Pak Budi S' },
  { plat: 'B 9876 KLM', tipe: 'FUSO BOX (8T)', driver: 'Pak Agus Salim' },
  { plat: 'B 5543 TRK', tipe: 'Tronton (20T)', driver: 'Pak Herman K' },
  { plat: 'B 2211 EKL', tipe: 'Truk Engkel', driver: 'Pak Slamet' },
  { plat: 'B 7788 PU', tipe: 'Pickup GranMax', driver: 'Pak Joko W' }
];

const VENDOR_OPTIONS = [
  'Indah Logistik Cargo',
  'Kencana Cargo',
  'KMT Cargo',
  'JNE Trucking',
  'Baraka Express',
  'Armada Truk Dewa'
];

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const generateResi = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TRX-${rand}`;
  };

  // State initialization
  const [resi, setResi] = useState('TRX-1004');
  const [vendor, setVendor] = useState('Indah Logistik Cargo');
  
  // Sender
  const [senderName, setSenderName] = useState('Gudang Pusat');
  const [senderPhone, setSenderPhone] = useState('08111223344');
  const [senderCity, setSenderCity] = useState('Jakarta Barat');
  const [senderAddress, setSenderAddress] = useState('Jl. Daan Mogot Km. 11 No. 45, Komplek Pergudangan Era Prima Blok B-3, Kalideres, Jakarta Barat');
  const [namaBarang, setNamaBarang] = useState('Sepatu Safety King Steel Toe, Mesin Genset 5KVA');

  // Recipient
  const [recipientName, setRecipientName] = useState('PT. Maju Jaya / Bpk. Ahmad');
  const [recipientPhone, setRecipientPhone] = useState('08123456789');
  const [recipientCity, setRecipientCity] = useState('Surabaya Kota');
  const [recipientAddress, setRecipientAddress] = useState('Jl. Raya Industri No. 12, Kel. Cikarang, Bekasi');

  // Fleet operational
  const [asalTruk, setAsalTruk] = useState('Jakarta');
  const [platNomor, setPlatNomor] = useState('B 1234 XYZ');
  const [driverName, setDriverName] = useState('Pak Budi S');
  const [tipeArmada, setTipeArmada] = useState('CDD BOX (4T)');
  const [etd, setEtd] = useState('2026-07-25T08:00');
  const [eta, setEta] = useState('2026-07-28T14:00');

  // Weight, Volume & Pricing
  const [beratBarang, setBeratBarang] = useState<number>(5);
  const [colly, setColly] = useState<number>(1);
  const [tarifKg, setTarifKg] = useState<number>(15000);
  const [jenisPengiriman, setJenisPengiriman] = useState('Darat & Laut Cargo (P x L x T / 4000)');
  const [panjang, setPanjang] = useState<number>(30);
  const [lebar, setLebar] = useState<number>(20);
  const [tinggi, setTinggi] = useState<number>(25);

  const [biayaTambahan, setBiayaTambahan] = useState<number>(1000);
  const [biayaPacking, setBiayaPacking] = useState<number>(25000);
  const [asuransi, setAsuransi] = useState<number>(5000);
  const [usePpn, setUsePpn] = useState<boolean>(true);
  const [usePph, setUsePph] = useState<boolean>(false);
  const [hargaBarang, setHargaBarang] = useState<number>(1500000);

  // Status & Notes
  const [statusPengiriman, setStatusPengiriman] = useState<ShipmentStatus>('Diproses');
  const [catatan, setCatatan] = useState('Barang telah dipacking rapi & siap diberangkatkan ke kurir.');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // Routes for preset
  const [routes, setRoutes] = useState<PricelistRouteItem[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredPricelistRoutes();
      setRoutes(stored.length > 0 ? stored : DEFAULT_PRICELIST_ROUTES);
      if (!resi) {
        setResi(generateResi());
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Volume & Weight Calculation
  const isUdara = jenisPengiriman.includes('6000') || jenisPengiriman.toLowerCase().includes('udara');
  const divisor = isUdara ? 6000 : 4000;
  const volWeight = (panjang * lebar * tinggi) / divisor;
  const chargeableWeight = Math.max(beratBarang, Math.round(volWeight * 10) / 10);
  const totalOngkirPokok = Math.round(chargeableWeight * tarifKg);

  // Taxes
  const ppnNominal = usePpn ? Math.round(hargaBarang * 0.011) : 0;
  const pphNominal = usePph ? Math.round(totalOngkirPokok * 0.02) : 0;

  // Grand Total Calculation matching Image 3 breakdown
  // Total Bayar Tagihan Seluruh Pengiriman
  const grandTotal = hargaBarang + totalOngkirPokok + biayaPacking + asuransi + biayaTambahan + ppnNominal - pphNominal;

  // Handle Preset Route Selected
  const handleSelectRoutePreset = (routeId: string) => {
    setSelectedRouteId(routeId);
    const r = routes.find(item => item.id === routeId);
    if (r) {
      setSenderCity(r.kotaAsal);
      setRecipientCity(r.kotaTujuan);
      setTarifKg(r.tarifKg);
      if (r.vendor) setVendor(r.vendor);
      if (r.moda === 'Udara') {
        setJenisPengiriman('Udara Cargo (P x L x T / 6000)');
      } else {
        setJenisPengiriman('Darat & Laut Cargo (P x L x T / 4000)');
      }
    }
  };

  // Handle CRM Customer Selected
  const handleSelectCustomer = (indexStr: string) => {
    const idx = parseInt(indexStr, 10);
    if (!isNaN(idx) && CRM_CUSTOMERS[idx]) {
      const cust = CRM_CUSTOMERS[idx];
      setRecipientName(cust.nama);
      setRecipientPhone(cust.hp);
      setRecipientCity(cust.kota);
      setRecipientAddress(cust.alamat);
    }
  };

  // Handle Pick Truck
  const handlePickRandomTruck = () => {
    const randomTruck = FLEET_TRUCKS[Math.floor(Math.random() * FLEET_TRUCKS.length)];
    setPlatNomor(randomTruck.plat);
    setTipeArmada(randomTruck.tipe);
    setDriverName(randomTruck.driver);
  };

  // Handle Pick Driver
  const handlePickRandomDriver = () => {
    const drivers = ['Pak Budi S', 'Pak Agus Salim', 'Pak Herman K', 'Pak Slamet', 'Pak Joko W', 'Pak Rian S'];
    const pick = drivers[Math.floor(Math.random() * drivers.length)];
    setDriverName(pick);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim()) {
      alert('Mohon lengkapi Nama Barang / Rincian Paket');
      return;
    }

    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const moda: ShipmentMode = isUdara ? 'Udara' : (jenisPengiriman.toLowerCase().includes('laut') ? 'Laut' : 'Darat');

    const newItem: TrackingItem = {
      no: resi,
      nama: namaBarang,
      rute: `${senderCity} → ${recipientCity}`,
      moda,
      status: statusPengiriman,
      sender: senderName,
      senderPhone,
      senderCity,
      senderAddress,
      recipient: recipientName,
      recipientPhone,
      recipientAddress,
      recipientCity,
      weight: chargeableWeight,
      colly,
      cost: grandTotal,
      date: todayFormatted,
      notes: catatan,
      photoUrl,
      photoTimestamp: photoUrl ? `${todayFormatted} ${timeFormatted}` : undefined,
      vendor,
      armada: tipeArmada,
      driver: driverName,
      platNomor,
      asalTruk,
      etd,
      eta,
      panjang,
      lebar,
      tinggi,
      hargaBarang,
      biayaPacking,
      asuransi,
      ppn: ppnNominal,
      pph: pphNominal,
      tarifKg,
      ongkirPokok: totalOngkirPokok,
      biayaTambahan,
      history: [
        {
          w: `${todayFormatted} ${timeFormatted}`,
          k: `Resi ${resi} diterbitkan oleh ${vendor}. Barang diproses di Gudang ${senderCity}.`,
          s: 'current'
        }
      ]
    };

    // Auto-create & sync invoice across entire system
    try {
      createInvoiceFromTracking(resi, newItem);
    } catch (e) {
      console.warn('Could not auto-create invoice:', e);
    }

    onSave(resi, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-2 sm:p-4 md:py-6">
      <div className="bg-[#0B1536] text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-blue-800/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar */}
        <div className="bg-[#070F28] px-5 sm:px-7 py-4 border-b border-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/40 border border-blue-500/50 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
                <span>INPUT / PEMUATAN RESI PENGIRIMAN CARGO</span>
              </h3>
              <p className="text-xs text-blue-300">
                Formulir Penerbitan Surat Jalan, Alamat Shipper/Consignee, Detail Armada, dan Biaya Lengkap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          {/* 1. AMBIL PRESET TARIF DARI PRICELIST MASTER (OPSIONAL) */}
          <div className="bg-blue-950/90 border border-blue-600/60 rounded-2xl p-3.5 sm:p-4 shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs sm:text-sm font-black uppercase tracking-wide">
                <span>★</span>
                <span>AMBIL PRESET TARIF DARI PRICELIST MASTER (OPSIONAL)</span>
              </div>
              <span className="bg-blue-900 text-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-700">
                Cari Rute Terdaftar
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedRouteId}
                onChange={(e) => handleSelectRoutePreset(e.target.value)}
                className="w-full bg-[#050D24] border border-blue-500/70 hover:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs font-bold text-blue-100 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer transition-colors"
              >
                <option value="">... Pilih rute dari pricelist ...</option>
                {routes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.kotaAsal} → {rt.kotaTujuan} ({rt.moda}) - {rt.layanan || 'Reguler'} - Rp {rt.tarifKg.toLocaleString('id-ID')}/kg
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. NO RESI & VENDOR KONTROL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nomor Resi */}
            <div className="bg-[#050D24] p-3.5 rounded-2xl border border-blue-900">
              <label className="block text-[11px] font-black uppercase text-blue-300 mb-1.5">
                NO RESI/AWB / DO <span className="text-amber-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={resi}
                  onChange={(e) => setResi(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. TRX-1004"
                  className="w-full bg-[#081744] border border-blue-600 rounded-xl px-3 py-2 text-sm font-mono font-black text-amber-300 tracking-wider focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setResi(generateResi())}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 shadow-md transition-all cursor-pointer"
                  title="Generate Nomor Resi Otomatis"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>AUTO GEN</span>
                </button>
              </div>
            </div>

            {/* Vendor / Layanan */}
            <div className="bg-[#050D24] p-3.5 rounded-2xl border border-blue-900">
              <label className="block text-[11px] font-black uppercase text-blue-300 mb-1.5">
                NAMA / LAYANAN / VENDOR (KONTROL INPUT) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                required
                className="w-full bg-[#081744] border border-blue-600 rounded-xl px-3 py-1.5 text-xs font-bold text-white mb-2 focus:outline-none focus:border-amber-400"
                placeholder="e.g. Indah Logistik Cargo"
              />
              <div className="flex flex-wrap gap-1.5">
                {VENDOR_OPTIONS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVendor(v)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      vendor === v
                        ? 'bg-blue-600 text-white border border-blue-400 shadow-sm'
                        : 'bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. INFORMASI PENGIRIM (SHIPPER / ORIGIN) */}
          <div className="bg-[#051130] rounded-2xl p-4 border-2 border-emerald-500/60 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-black uppercase">
              <User className="w-4 h-4" />
              <span>INFORMASI PENGIRIM (SHIPPER / ORIGIN)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  NAMA PENGIRIM <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                  placeholder="Gudang Pusat"
                  className="w-full bg-[#071946] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  NO HP PENGIRIM <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  required
                  placeholder="08111223344"
                  className="w-full bg-[#071946] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  KOTA ASAL PENGIRIM <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  value={senderCity}
                  onChange={(e) => setSenderCity(e.target.value)}
                  required
                  placeholder="Jakarta Barat"
                  className="w-full bg-[#071946] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                DETAIL ALAMAT LENGKAP PENGIRIM / ALAMAT PENJEMPUTAN (ASAL PENGIRIMAN) <span className="text-emerald-400">*</span>
              </label>
              <textarea
                rows={2}
                value={senderAddress}
                onChange={(e) => setSenderAddress(e.target.value)}
                required
                placeholder="Jl. Daan Mogot Km. 11 No. 45, Komplek Pergudangan Era Prima Blok B-3, Kalideres, Jakarta Barat"
                className="w-full bg-[#071946] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                NAMA BARANG / RINCIAN PAKET PENGIRIMAN <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={namaBarang}
                onChange={(e) => setNamaBarang(e.target.value)}
                required
                placeholder="contoh: Sepatu Safety King Steel Toe, Mesin Genset 5KVA, spare part, dll"
                className="w-full bg-[#071946] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* 4. INFORMASI PENERIMA & ALAMAT TUJUAN (DESTINATION AREA) */}
          <div className="bg-[#051130] rounded-2xl p-4 border-2 border-blue-500/60 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs sm:text-sm font-black uppercase">
              <MapPin className="w-4 h-4" />
              <span>INFORMASI PENERIMA &amp; ALAMAT TUJUAN (DESTINATION AREA)</span>
            </div>

            {/* CRM Autofill Alert Banner */}
            <div className="bg-amber-400/10 border border-amber-400/50 rounded-xl p-2.5">
              <div className="flex items-center gap-2 text-amber-300 text-[11px] font-black uppercase mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>PILIH PELANGGAN DARI DAFTAR CUSTOMER (AUTOFILL ALAMAT &amp; TUJUAN)</span>
              </div>
              <select
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="w-full bg-[#050D24] border border-amber-400/60 rounded-xl px-3 py-2 text-xs font-bold text-amber-200 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="">... Pilih Dari Daftar Pelanggan (CRM) ...</option>
                {CRM_CUSTOMERS.map((cust, idx) => (
                  <option key={idx} value={idx}>
                    {cust.nama} - {cust.kota}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                NAMA PENERIMA / PERUSAHAAN (KONSINYI) PENERIMA <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                placeholder="contoh: PT. Maju Jaya / Bpk. Ahmad"
                className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  NO HP / WHATSAPP PENERIMA <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                  placeholder="08123456789"
                  className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  KOTA / DAERAH TUJUAN PENGIRIMAN <span className="text-blue-400">*</span>
                </label>
                <input
                  type="text"
                  value={recipientCity}
                  onChange={(e) => setRecipientCity(e.target.value)}
                  required
                  placeholder="Surabaya Kota"
                  className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                ALAMAT LENGKAP TUJUAN PENGIRIMAN <span className="text-blue-400">*</span>
              </label>
              <textarea
                rows={2}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                required
                placeholder="Jl. Raya Industri No. 12, Kel. Cikarang, Bekasi"
                className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* 5. DETAIL ARMADA OPERASIONAL (TRUK, KAPAL, DRIVER, DLL.) */}
          <div className="bg-[#051130] rounded-2xl p-4 border border-cyan-500/60 shadow-md space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs sm:text-sm font-black uppercase">
              <Truck className="w-4 h-4" />
              <span>DETAIL ARMADA OPERASIONAL (TRUK, KAPAL, DRIVER, DLL.)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  ASAL TRUK PEMBERANGKATAN
                </label>
                <input
                  type="text"
                  value={asalTruk}
                  onChange={(e) => setAsalTruk(e.target.value)}
                  placeholder="Jakarta"
                  className="w-full bg-[#071946] border border-cyan-600/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-300">
                    NOMOR KENDARAAN / PLAT
                  </label>
                  <button
                    type="button"
                    onClick={handlePickRandomTruck}
                    className="text-[9px] text-cyan-300 hover:text-cyan-100 font-bold underline cursor-pointer"
                  >
                    + AMBIL TRUK
                  </button>
                </div>
                <input
                  type="text"
                  value={platNomor}
                  onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                  placeholder="B 1234 XYZ"
                  className="w-full bg-[#071946] border border-cyan-600/50 rounded-xl px-3 py-2 text-xs font-mono font-bold text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-extrabold uppercase text-slate-300">
                    NAMA DRIVER
                  </label>
                  <button
                    type="button"
                    onClick={handlePickRandomDriver}
                    className="text-[9px] text-emerald-300 hover:text-emerald-100 font-bold underline cursor-pointer"
                  >
                    + AMBIL DRIVER
                  </button>
                </div>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="Pak Budi S"
                  className="w-full bg-[#071946] border border-cyan-600/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Quick Fleet Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {['CDD BOX (4T)', 'FUSO BOX (8T)', 'Tronton (20T)', 'Truk Engkel', 'Pickup GranMax'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipeArmada(t)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                    tipeArmada === t
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'bg-blue-950/70 text-cyan-200 border border-cyan-800 hover:bg-cyan-900/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* ETD & ETA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  ETD ESTIMATION TIME DEPARTURE / KEBERANGKATAN
                </label>
                <input
                  type="datetime-local"
                  value={etd}
                  onChange={(e) => setEtd(e.target.value)}
                  className="w-full bg-[#071946] border border-cyan-600/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  ETA ESTIMATION TIME ARRIVAL / ESTIMASI TIBA
                </label>
                <input
                  type="datetime-local"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="w-full bg-[#071946] border border-cyan-600/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 6. INPUT BERAT (KG) & VOLUME (M3) */}
          <div className="bg-[#051130] rounded-2xl p-4 border border-blue-500/70 shadow-md space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-blue-300 text-xs sm:text-sm font-black uppercase">
                <Calculator className="w-4 h-4" />
                <span>INPUT BERAT (KG) &amp; VOLUME (M3)</span>
              </div>
              <span className="bg-blue-900 border border-blue-500 text-blue-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                HITUNG OTOMATIS AKTIF
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  BERAT BARANG (KG) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={beratBarang}
                  onChange={(e) => setBeratBarang(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-mono font-black text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  JUMLAH BARANG / COLLY (KOLI) <span className="text-amber-400">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={colly}
                    onChange={(e) => setColly(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#071946] border border-blue-500/50 rounded-xl pl-3 pr-14 py-2 text-xs font-mono font-black text-amber-300 focus:outline-none focus:border-amber-400"
                    placeholder="1"
                  />
                  <span className="absolute right-2 bg-blue-900/90 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-lg border border-blue-700">
                    Koli
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                  TARIF ONGKIR / KG (RP) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  step="500"
                  min="0"
                  value={tarifKg}
                  onChange={(e) => setTarifKg(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-mono font-black text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                JENIS PENGIRIMAN / RUMUS VOLUME
              </label>
              <select
                value={jenisPengiriman}
                onChange={(e) => setJenisPengiriman(e.target.value)}
                className="w-full bg-[#071946] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-400 cursor-pointer"
              >
                <option value="Darat & Laut Cargo (P x L x T / 4000)">Darat &amp; Laut Cargo (P x L x T / 4000)</option>
                <option value="Udara Cargo (P x L x T / 6000)">Udara Cargo (P x L x T / 6000)</option>
                <option value="Kargo Kereta Api (P x L x T / 4000)">Kargo Kereta Api (P x L x T / 4000)</option>
              </select>
            </div>

            {/* Dimensi P x L x T */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-extrabold uppercase text-slate-300">
                  DIMENSI PAKET (PANJANG X LEBAR X TINGGI CM)
                </label>
                <span className="text-[10px] text-blue-300 font-bold">
                  Vol: {volWeight.toFixed(1)} Kg | Chargeable: {chargeableWeight} Kg
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="1"
                  value={panjang}
                  onChange={(e) => setPanjang(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="P"
                  className="bg-[#071946] border border-blue-500/50 rounded-xl px-2 py-1.5 text-center text-xs font-mono font-bold text-white"
                />
                <input
                  type="number"
                  min="1"
                  value={lebar}
                  onChange={(e) => setLebar(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="L"
                  className="bg-[#071946] border border-blue-500/50 rounded-xl px-2 py-1.5 text-center text-xs font-mono font-bold text-white"
                />
                <input
                  type="number"
                  min="1"
                  value={tinggi}
                  onChange={(e) => setTinggi(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="T"
                  className="bg-[#071946] border border-blue-500/50 rounded-xl px-2 py-1.5 text-center text-xs font-mono font-bold text-white"
                />
              </div>
            </div>

            {/* Row of Sub-Costs and Taxes matching Image 3 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
              {/* Total Ongkir Pokok */}
              <div className="bg-[#040C22] p-2.5 rounded-xl border border-amber-400">
                <label className="block text-[9px] font-black uppercase text-amber-300 leading-tight">
                  TOTAL ONGKIR POKOK (RP)
                </label>
                <div className="text-xs font-mono font-black text-amber-300 mt-1">
                  Rp {totalOngkirPokok.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Total Biaya Tambahan */}
              <div className="bg-[#040C22] p-2.5 rounded-xl border border-emerald-400">
                <label className="block text-[9px] font-black uppercase text-emerald-300 leading-tight">
                  TOTAL BIAYA TAMBAHAN (RP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={biayaTambahan}
                  onChange={(e) => setBiayaTambahan(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-xs font-mono font-black text-emerald-300 mt-0.5 focus:outline-none"
                />
              </div>

              {/* Biaya Packing */}
              <div className="bg-[#040C22] p-2.5 rounded-xl border border-orange-400">
                <label className="block text-[9px] font-black uppercase text-orange-300 leading-tight">
                  BIAYA PACKING (RP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={biayaPacking}
                  onChange={(e) => setBiayaPacking(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-xs font-mono font-black text-orange-300 mt-0.5 focus:outline-none"
                />
              </div>

              {/* Asuransi Kargo */}
              <div className="bg-[#040C22] p-2.5 rounded-xl border border-cyan-400">
                <label className="block text-[9px] font-black uppercase text-cyan-300 leading-tight">
                  ASURANSI KARGO (RP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={asuransi}
                  onChange={(e) => setAsuransi(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-xs font-mono font-black text-cyan-300 mt-0.5 focus:outline-none"
                />
              </div>

              {/* PPN 1.1% */}
              <div className="bg-[#040C22] p-2 rounded-xl border border-blue-400 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-blue-300">PPN 1.1%</span>
                  <input
                    type="checkbox"
                    checked={usePpn}
                    onChange={(e) => setUsePpn(e.target.checked)}
                    className="rounded accent-blue-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>
                <div className="text-[11px] font-mono font-bold text-blue-200 mt-1">
                  {usePpn ? `Rp ${ppnNominal.toLocaleString('id-ID')}` : 'Rp 0'}
                </div>
              </div>

              {/* PPH 23 2% */}
              <div className="bg-[#040C22] p-2 rounded-xl border border-purple-400 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-purple-300">PPH 23 2%</span>
                  <input
                    type="checkbox"
                    checked={usePph}
                    onChange={(e) => setUsePph(e.target.checked)}
                    className="rounded accent-purple-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>
                <div className="text-[11px] font-mono font-bold text-purple-200 mt-1">
                  {usePph ? `- Rp ${pphNominal.toLocaleString('id-ID')}` : 'Rp 0'}
                </div>
              </div>
            </div>
          </div>

          {/* 7. DARK NAVY BREAKDOWN SUMMARY BOX (EXACT MATCH IMAGE 3) */}
          <div className="bg-[#040C22] text-white rounded-2xl p-4 sm:p-5 border-2 border-blue-900 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
              <span className="font-bold text-slate-300">Tipe Layanan:</span>
              <span className="font-extrabold text-white tracking-wider">PENJUALAN / PENGIRIMAN</span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
              <span className="font-bold text-slate-300">Jumlah Barang / Colly:</span>
              <span className="font-mono font-extrabold text-amber-300">
                {colly} Koli (Colly)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">Harga Barang:</span>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={hargaBarang}
                  onChange={(e) => setHargaBarang(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-blue-950/80 border border-blue-800 rounded px-2 py-0.5 text-[11px] font-mono text-blue-200 w-28 text-right"
                  title="Nilai pertanggungan barang"
                />
              </div>
              <span className="font-mono font-extrabold text-slate-100">
                Rp {hargaBarang.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
              <span className="font-bold text-slate-300">Ongkir Kargo:</span>
              <span className="font-mono font-extrabold text-amber-300">
                Rp {totalOngkirPokok.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
              <span className="font-bold text-slate-300">Biaya Packing (Kayu/Karton):</span>
              <span className="font-mono font-extrabold text-orange-300">
                Rp {biayaPacking.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
              <span className="font-bold text-slate-300">Asuransi Pengiriman:</span>
              <span className="font-mono font-extrabold text-cyan-300">
                Rp {asuransi.toLocaleString('id-ID')}
              </span>
            </div>

            {usePpn && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
                <span className="font-bold text-slate-300">PPN (1.1%):</span>
                <span className="font-mono font-extrabold text-emerald-400">
                  + Rp {ppnNominal.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {usePph && (
              <div className="flex items-center justify-between text-xs py-1 border-b border-blue-950">
                <span className="font-bold text-slate-300">PPH 23 (2% Potongan):</span>
                <span className="font-mono font-extrabold text-purple-400">
                  - Rp {pphNominal.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {/* Total Grand Ending */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-black uppercase text-amber-400 tracking-wide">
                TOTAL BAYAR TAGIHAN SELURUH PENGIRIMAN
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono tracking-tight">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* 8. STATUS PENGIRIMAN & CATATAN RESI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                NOMOR RESI PENGIRIMAN
              </label>
              <input
                type="text"
                readOnly
                value={resi}
                className="w-full bg-[#050D24] border border-blue-800 rounded-xl px-3 py-2 text-xs font-mono font-black text-blue-200"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
                STATUS PENGIRIMAN
              </label>
              <select
                value={statusPengiriman}
                onChange={(e) => setStatusPengiriman(e.target.value as ShipmentStatus)}
                className="w-full bg-[#071946] border border-blue-600 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="Diproses">Diproses Gudang</option>
                <option value="Dalam Perjalanan">Dalam Perjalanan (In Transit)</option>
                <option value="Tiba di Kota Tujuan">Tiba di Kota Tujuan</option>
                <option value="Terkirim">Terkirim (Delivered)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-300 mb-1">
              CATATAN RESI / PENGIRIMAN
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Barang telah dipacking rapi & siap diberangkatkan ke kurir."
              className="w-full bg-[#071946] border border-blue-600 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Upload Foto Fisik Paket */}
          <div className="bg-[#050D24] p-3.5 rounded-2xl border border-blue-900">
            <PhotoUploadDropzone
              label="Foto Fisik Barang / Paket Kargo (Opsional)"
              subLabel="Unggah foto fisik barang sebagai bukti penerimaan gudang"
              currentPhotoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-blue-900/80 flex items-center justify-end gap-3 sticky bottom-0 bg-[#0B1536]/95 py-2 backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-extrabold text-blue-200 hover:text-white hover:bg-blue-900/60 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer border border-blue-400/40"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>SIMPAN &amp; TERBITKAN RESI</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
