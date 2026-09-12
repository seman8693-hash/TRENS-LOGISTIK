import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Truck, 
  Ship, 
  Plane, 
  Save, 
  RotateCcw, 
  Check, 
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  FileText,
  Edit2,
  Trash2,
  Package,
  Clock,
  MapPin,
  Tag,
  Sparkles,
  ShoppingBag,
  HelpCircle,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { ShipmentMode, PricelistRouteItem } from '../../types';
import { 
  getStoredPricelist, 
  saveStoredPricelist, 
  exportPricelistToExcel, 
  downloadPricelistTemplate,
  DEFAULT_PRICELIST_ROUTES 
} from '../../data/pricelistData';
import { PricelistRouteModal } from './PricelistRouteModal';
import { ImportPricelistExcelModal } from './ImportPricelistExcelModal';
import { rupiah, CITIES } from '../../data/logisticData';

interface DashboardRatesProps {
  rates: Record<ShipmentMode, Record<string, number>>;
  shipmentsCount?: number;
  onNavigateToShipments?: () => void;
  onSaveRates: (newRates: Record<ShipmentMode, Record<string, number>>) => void;
  onResetRates: () => void;
}

export const DashboardRates: React.FC<DashboardRatesProps> = ({
  rates,
  shipmentsCount = 4,
  onNavigateToShipments,
  onSaveRates,
  onResetRates
}) => {
  // Master state for Pricelist Routes
  const [routes, setRoutes] = useState<PricelistRouteItem[]>(() => getStoredPricelist());
  const [activeJalur, setActiveJalur] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<PricelistRouteItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Calculator State (matching Image 2)
  const [calcAsal, setCalcAsal] = useState('Jakarta');
  const [calcTujuan, setCalcTujuan] = useState('Surabaya, Jawa Timur');
  const [calcDivisor, setCalcDivisor] = useState<number>(4000); // 4000 for Darat/Laut, 6000 for Udara
  const [calcBeratAktual, setCalcBeratAktual] = useState<number>(5);
  const [calcPanjang, setCalcPanjang] = useState<number>(40);
  const [calcLebar, setCalcLebar] = useState<number>(30);
  const [calcTinggi, setCalcTinggi] = useState<number>(25);
  const [calcTarifKg, setCalcTarifKg] = useState<number>(12000);
  
  const [isItemIncluded, setIsItemIncluded] = useState<boolean>(true); // 'Pembelian + Kirim'
  const [calcHargaBarang, setCalcHargaBarang] = useState<number>(1500000);
  const [calcBiayaPacking, setCalcBiayaPacking] = useState<number>(25000);
  const [calcAsuransi, setCalcAsuransi] = useState<number>(5000);
  const [calcPpnPercent, setCalcPpnPercent] = useState<number>(12);
  const [calcPphPercent, setCalcPphPercent] = useState<number>(0);

  // Helper to show toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Unique list of origin and destination cities for auto-complete datalists
  const originCities = useMemo(() => {
    const list = ['Jakarta', 'Jakarta Barat', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Tangerang', 'Bekasi', 'Bogor', 'Depok', 'Bandung', 'Semarang', 'Surabaya'];
    routes.forEach(r => {
      if (r.kotaAsal && !list.includes(r.kotaAsal)) list.push(r.kotaAsal);
    });
    return list;
  }, [routes]);

  const destinationCities = useMemo(() => {
    const list: string[] = [];
    routes.forEach(r => {
      if (r.kotaTujuan && !list.includes(r.kotaTujuan)) list.push(r.kotaTujuan);
    });
    Object.values(CITIES).forEach(c => {
      if (!list.includes(c.n)) list.push(c.n);
    });
    return list;
  }, [routes]);

  // Handler for AUTO HARGA button
  const handleAutoHarga = () => {
    const qAsal = (calcAsal || '').trim().toLowerCase();
    const qTujuan = (calcTujuan || '').trim().toLowerCase();

    if (!qTujuan) {
      showToast('Ketik atau pilih Kota Tujuan terlebih dahulu.');
      return;
    }

    // 1. Try finding match by both origin and destination
    let match = routes.find(r => {
      const rAsal = r.kotaAsal.toLowerCase();
      const rTujuan = r.kotaTujuan.toLowerCase();
      const asalMatch = !qAsal || rAsal.includes(qAsal) || qAsal.includes(rAsal);
      const tujuanMatch = rTujuan.includes(qTujuan) || qTujuan.includes(rTujuan);
      return asalMatch && tujuanMatch;
    });

    // 2. If not found, try matching by destination only
    if (!match) {
      match = routes.find(r => {
        const rTujuan = r.kotaTujuan.toLowerCase();
        return rTujuan.includes(qTujuan) || qTujuan.includes(rTujuan);
      });
    }

    if (match) {
      setCalcTarifKg(match.tarifKg);
      setCalcAsal(match.kotaAsal);
      setCalcTujuan(match.kotaTujuan);
      if (match.moda === 'Udara') {
        setCalcDivisor(6000);
      } else {
        setCalcDivisor(4000);
      }
      showToast(`⚡ Auto Harga Berhasil: Rp ${match.tarifKg.toLocaleString('id-ID')}/kg (${match.kotaAsal} → ${match.kotaTujuan}, ${match.moda})`);
    } else {
      showToast(`⚠️ Rute khusus "${calcAsal} → ${calcTujuan}" belum ada di master pricelist. Gunakan tarif manual atau tambahkan rute.`);
    }
  };

  // Calculator Math
  const volumeM3 = ((calcPanjang * calcLebar * calcTinggi) / 1000000);
  const beratVolumetrik = (calcPanjang * calcLebar * calcTinggi) / calcDivisor;
  const beratCharge = Math.max(calcBeratAktual, Math.round(beratVolumetrik * 10) / 10);
  const totalOngkir = Math.round(beratCharge * calcTarifKg);
  
  const baseSubtotal = (isItemIncluded ? calcHargaBarang : 0) + totalOngkir + calcBiayaPacking + calcAsuransi;
  const nominalPpn = Math.round(baseSubtotal * (calcPpnPercent / 100));
  const nominalPph = Math.round(baseSubtotal * (calcPphPercent / 100));
  const grandTotal = baseSubtotal + nominalPpn - nominalPph;

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    return routes.filter((item) => {
      // Jalur filter
      if (activeJalur !== 'Semua' && item.moda !== activeJalur) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAsal = item.kotaAsal.toLowerCase().includes(q);
        const matchTujuan = item.kotaTujuan.toLowerCase().includes(q);
        const matchLayanan = item.layanan.toLowerCase().includes(q);
        const matchVendor = item.vendor.toLowerCase().includes(q);
        return matchAsal || matchTujuan || matchLayanan || matchVendor;
      }
      return true;
    });
  }, [routes, activeJalur, searchQuery]);

  // Counts by Jalur
  const countSemua = routes.length;
  const countDarat = routes.filter(r => r.moda === 'Darat').length;
  const countUdara = routes.filter(r => r.moda === 'Udara').length;
  const countLaut = routes.filter(r => r.moda === 'Laut').length;

  // Handlers for Route CRUD
  const handleSaveRoute = (item: PricelistRouteItem) => {
    let updated: PricelistRouteItem[];
    const exists = routes.find(r => r.id === item.id);
    if (exists) {
      updated = routes.map(r => r.id === item.id ? item : r);
      showToast(`Rute ke ${item.kotaTujuan} berhasil diperbarui!`);
    } else {
      updated = [item, ...routes];
      showToast(`Rute baru ke ${item.kotaTujuan} berhasil ditambahkan ke Pricelist!`);
    }
    setRoutes(updated);
    saveStoredPricelist(updated);
  };

  const handleDeleteRoute = (id: string, tujuan: string) => {
    if (confirm(`Hapus rute ke ${tujuan} dari pricelist?`)) {
      const updated = routes.filter(r => r.id !== id);
      setRoutes(updated);
      saveStoredPricelist(updated);
      showToast(`Rute ke ${tujuan} telah dihapus.`);
    }
  };

  const handleImportRoutes = (newItems: PricelistRouteItem[]) => {
    const merged = [...newItems, ...routes];
    setRoutes(merged);
    saveStoredPricelist(merged);
    showToast(`Berhasil mengimpor ${newItems.length} rute ke pricelist!`);
  };

  // Quick preset handler
  const handleApplyPreset = (asal: string, tujuan: string, tarif: number, moda: ShipmentMode = 'Darat') => {
    // Fill into calculator
    setCalcAsal(asal);
    setCalcTujuan(tujuan);
    setCalcTarifKg(tarif);
    if (moda === 'Udara') {
      setCalcDivisor(6000);
    } else {
      setCalcDivisor(4000);
    }

    // Check if in pricelist
    const found = routes.find(r => r.kotaTujuan.toLowerCase().includes(tujuan.toLowerCase()));
    if (!found) {
      const newPresetItem: PricelistRouteItem = {
        id: `preset-${Date.now()}`,
        kotaAsal: asal,
        kotaTujuan: tujuan,
        moda,
        layanan: 'Cargo Regular',
        vendor: 'trens-log',
        tarifKg: tarif,
        minimalBerat: 50,
        leadTime: '2-3 HARI'
      };
      const updated = [newPresetItem, ...routes];
      setRoutes(updated);
      saveStoredPricelist(updated);
      showToast(`Rute ${asal} → ${tujuan} (Rp ${tarif.toLocaleString('id-ID')}/kg) ditambahkan ke Pricelist & Kalkulator!`);
    } else {
      showToast(`Rute ${asal} → ${tujuan} dimuat ke Kalkulator Live!`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B1B4D] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-blue-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP TOGGLE BUTTONS (Matching Image 1 & 2) */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          id="btn-nav-kelola-resi"
          onClick={onNavigateToShipments}
          className="bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-900 border border-slate-200 px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <Truck className="w-4 h-4 text-slate-500" />
          <span>KELOLA RESI PENGIRIMAN ({shipmentsCount})</span>
        </button>

        <button
          id="btn-nav-pricelist-active"
          className="bg-[#0B1B4D] text-white border border-[#0B1B4D] px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-2 shadow-md cursor-default"
        >
          <Tag className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>PRICELIST TARIF ONGKIR ({countSemua})</span>
        </button>
      </div>

      {/* 1. KALKULATOR ONGKIR MANUAL (BERAT X VOLUME / KG) (Image 2) */}
      <div className="bg-[#0B1B4D] text-white rounded-2xl p-5 sm:p-6 border border-blue-900 shadow-xl relative overflow-hidden">
        {/* Background glow subtle effect */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-800/60 rounded-xl text-amber-400 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase flex items-center gap-2">
                <span>HARGA ONGKIR</span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Hitung estimasi tarif pengiriman berdasarkan berat aktual atau berat volumetrik (P x L x T)
              </p>
            </div>
          </div>
        </div>

        {/* Quick Auto Route Selector & Simulation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 bg-[#051138]/90 p-2.5 rounded-xl border border-blue-600/40">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              AUTO HARGA SIMULASI
            </span>
            <span className="text-xs text-blue-200 hidden md:inline font-semibold">
              Pilih rute terdaftar atau klik tombol Auto Harga untuk otomatis mengisi tarif:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              id="select-auto-rute"
              defaultValue=""
              onChange={(e) => {
                const selected = routes.find(r => r.id === e.target.value);
                if (selected) {
                  setCalcAsal(selected.kotaAsal);
                  setCalcTujuan(selected.kotaTujuan);
                  setCalcTarifKg(selected.tarifKg);
                  if (selected.moda === 'Udara') {
                    setCalcDivisor(6000);
                  } else {
                    setCalcDivisor(4000);
                  }
                  showToast(`⚡ Rute dimuat: ${selected.kotaAsal} → ${selected.kotaTujuan} (${selected.moda}) - Rp ${selected.tarifKg.toLocaleString('id-ID')}/kg`);
                }
              }}
              className="bg-[#071946] border border-blue-500/60 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-hidden focus:border-amber-400 cursor-pointer w-full sm:w-72 font-semibold"
            >
              <option value="" disabled>... Pilih Rute untuk Simulasi Otomatis ...</option>
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.kotaAsal} → {r.kotaTujuan} ({r.moda}) - Rp {r.tarifKg.toLocaleString('id-ID')}/kg
                </option>
              ))}
            </select>

            <button
              type="button"
              id="btn-auto-harga-top"
              onClick={handleAutoHarga}
              className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md shrink-0 transition-all cursor-pointer"
              title="Cari & isi tarif otomatis berdasarkan Kota Asal & Tujuan yang diisi"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>AUTO HARGA</span>
            </button>
          </div>
        </div>

        {/* Inputs Grid - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-3.5">
          {/* Kota Asal */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1 flex items-center justify-between">
              <span>KOTA ASAL</span>
              <span className="text-amber-400 text-[9px] font-extrabold">ASAL</span>
            </label>
            <input
              type="text"
              list="list-kota-asal"
              value={calcAsal}
              onChange={(e) => setCalcAsal(e.target.value)}
              className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
              placeholder="e.g. Jakarta"
            />
            <datalist id="list-kota-asal">
              {originCities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Kota Tujuan */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1 flex items-center justify-between">
              <span>KOTA / DAERAH TUJUAN</span>
              <span className="text-blue-300 text-[9px] font-extrabold">TUJUAN</span>
            </label>
            <input
              type="text"
              list="list-kota-tujuan"
              value={calcTujuan}
              onChange={(e) => setCalcTujuan(e.target.value)}
              className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
              placeholder="e.g. Surabaya, Jawa Timur"
            />
            <datalist id="list-kota-tujuan">
              {destinationCities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* Jalur / Divisor Volume */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1">
              JALUR / DIVISOR VOLUME
            </label>
            <select
              value={calcDivisor}
              onChange={(e) => setCalcDivisor(Number(e.target.value))}
              className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
            >
              <option value={4000}>Darat / Laut ( / 4000 )</option>
              <option value={6000}>Udara ( / 6000 )</option>
            </select>
          </div>

          {/* Berat Aktual */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1">
              BERAT AKTUAL (KG)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.5"
              value={calcBeratAktual || ''}
              onChange={(e) => setCalcBeratAktual(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Dimensi Paket (P x L x T) */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1">
              DIMENSI PAKET (P X L X T CM)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="number"
                min="1"
                title="Panjang (cm)"
                value={calcPanjang || ''}
                onChange={(e) => setCalcPanjang(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-[#051138] border border-blue-500/50 rounded-lg px-2 py-2 text-xs font-bold text-center text-white focus:outline-hidden focus:border-amber-400"
              />
              <input
                type="number"
                min="1"
                title="Lebar (cm)"
                value={calcLebar || ''}
                onChange={(e) => setCalcLebar(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-[#051138] border border-blue-500/50 rounded-lg px-2 py-2 text-xs font-bold text-center text-white focus:outline-hidden focus:border-amber-400"
              />
              <input
                type="number"
                min="1"
                title="Tinggi (cm)"
                value={calcTinggi || ''}
                onChange={(e) => setCalcTinggi(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-[#051138] border border-blue-500/50 rounded-lg px-2 py-2 text-xs font-bold text-center text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {/* Tarif / Kg with Auto Harga Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-blue-200">
                TARIF / KG (RP)
              </label>
              <button
                type="button"
                id="btn-auto-harga-col"
                onClick={handleAutoHarga}
                className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                title="Cek & pasang harga otomatis dari master pricelist"
              >
                <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                <span>AUTO HARGA</span>
              </button>
            </div>
            <input
              type="number"
              step="500"
              min="0"
              value={calcTarifKg || ''}
              onChange={(e) => setCalcTarifKg(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#051138] border border-amber-400/80 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 font-mono focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Inputs Grid - Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
          {/* Harga Barang (Rp) with Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-blue-200">
                HARGA BARANG (RP)
              </label>
              <button
                type="button"
                onClick={() => setIsItemIncluded(!isItemIncluded)}
                className="text-[10px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
              >
                <span>{isItemIncluded ? '🛒 Pembelian + Kirim' : 'Hanya Ongkir'}</span>
              </button>
            </div>
            <input
              type="number"
              step="10000"
              min="0"
              disabled={!isItemIncluded}
              value={isItemIncluded ? calcHargaBarang : 0}
              onChange={(e) => setCalcHargaBarang(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full bg-[#051138] border rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden ${
                isItemIncluded ? 'border-amber-400/80' : 'border-blue-900 opacity-50'
              }`}
            />
          </div>

          {/* Biaya Packing */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1">
              BIAYA PACKING (RP)
            </label>
            <input
              type="number"
              step="5000"
              min="0"
              value={calcBiayaPacking}
              onChange={(e) => setCalcBiayaPacking(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* Asuransi */}
          <div>
            <label className="block text-[10px] font-black uppercase text-blue-200 mb-1">
              ASURANSI (RP)
            </label>
            <input
              type="number"
              step="1000"
              min="0"
              value={calcAsuransi}
              onChange={(e) => setCalcAsuransi(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>

          {/* PPN Manual */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-blue-200">
                PPN MANUAL / %
              </label>
              <div className="flex gap-1 text-[9px]">
                <button
                  type="button"
                  onClick={() => setCalcPpnPercent(12)}
                  className={`px-1 rounded ${calcPpnPercent === 12 ? 'bg-blue-600 text-white' : 'text-blue-300'}`}
                >
                  12%
                </button>
                <button
                  type="button"
                  onClick={() => setCalcPpnPercent(0)}
                  className={`px-1 rounded ${calcPpnPercent === 0 ? 'bg-blue-600 text-white' : 'text-blue-300'}`}
                >
                  0%
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={calcPpnPercent}
                onChange={(e) => setCalcPpnPercent(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
              />
              <span className="text-[10px] font-bold text-blue-300 px-2 py-2 bg-[#051138] rounded-xl border border-blue-500/30">
                Manual
              </span>
            </div>
          </div>

          {/* PPH Manual */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-black uppercase text-blue-200">
                PPH MANUAL / %
              </label>
              <div className="flex gap-1 text-[9px]">
                <button
                  type="button"
                  onClick={() => setCalcPphPercent(2)}
                  className={`px-1 rounded ${calcPphPercent === 2 ? 'bg-blue-600 text-white' : 'text-blue-300'}`}
                >
                  2%
                </button>
                <button
                  type="button"
                  onClick={() => setCalcPphPercent(0)}
                  className={`px-1 rounded ${calcPphPercent === 0 ? 'bg-blue-600 text-white' : 'text-blue-300'}`}
                >
                  0%
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={calcPphPercent}
                onChange={(e) => setCalcPphPercent(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-[#051138] border border-blue-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-hidden focus:border-amber-400"
              />
              <span className="text-[10px] font-bold text-blue-300 px-2 py-2 bg-[#051138] rounded-xl border border-blue-500/30">
                Manual
              </span>
            </div>
          </div>
        </div>

        {/* Live Badges Summary Bar (Image 2) */}
        <div className="pt-4 border-t border-blue-800/80 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-[#051138] px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-300 font-bold flex items-center gap-1.5">
              <span>📍 Rute:</span>
              <span className="text-white font-semibold">{calcAsal} → {calcTujuan}</span>
              <span className="text-[10px] text-blue-200 bg-blue-900/60 px-1.5 py-0.5 rounded border border-blue-700 font-mono">
                {calcDivisor === 6000 ? 'Udara' : 'Darat/Laut'}
              </span>
            </div>

            <div className="bg-[#051138] px-3 py-1.5 rounded-lg border border-blue-500/30 text-amber-300 font-bold flex items-center gap-1.5">
              <span>📦 Volume:</span>
              <span className="text-white font-mono">{volumeM3.toFixed(2)} m³</span>
            </div>

            <div className="bg-[#051138] px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-200 font-bold flex items-center gap-1.5">
              <span>⚖️ Berat Charge:</span>
              <span className="text-emerald-400 font-mono font-black">{beratCharge} Kg</span>
            </div>

            <div className="bg-blue-900/60 px-3 py-1.5 rounded-lg border border-blue-400/40 text-blue-100 font-bold">
              ONGKIR: Rp {totalOngkir.toLocaleString('id-ID')}
            </div>

            {calcBiayaPacking > 0 && (
              <div className="bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-200 font-bold">
                Packing: Rp {calcBiayaPacking.toLocaleString('id-ID')}
              </div>
            )}

            {calcAsuransi > 0 && (
              <div className="bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-200 font-bold">
                Asuransi: Rp {calcAsuransi.toLocaleString('id-ID')}
              </div>
            )}

            {nominalPpn > 0 && (
              <div className="bg-blue-950/80 px-3 py-1.5 rounded-lg border border-blue-400/30 text-blue-200 font-bold">
                PPN ({calcPpnPercent}%): +Rp {nominalPpn.toLocaleString('id-ID')}
              </div>
            )}
          </div>

          {/* Big Green Ending Tagihan Banner */}
          <div className="w-full bg-[#002f1a] hover:bg-[#003820] border-2 border-emerald-500/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left transition-colors">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-emerald-300">
              TOTAL AKHIR TAGIHAN (CARGO ENDING):
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
              Rp {grandTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* JALUR FILTER TABS & SUBTITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semua Jalur */}
          <button
            onClick={() => setActiveJalur('Semua')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeJalur === 'Semua'
                ? 'bg-[#0B1B4D] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>🌐</span>
            <span>Semua Jalur ({countSemua})</span>
          </button>

          {/* Darat */}
          <button
            onClick={() => setActiveJalur('Darat')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeJalur === 'Darat'
                ? 'bg-[#0B1B4D] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>🚛</span>
            <span>Darat ({countDarat})</span>
          </button>

          {/* Udara */}
          <button
            onClick={() => setActiveJalur('Udara')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeJalur === 'Udara'
                ? 'bg-[#0B1B4D] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>✈️</span>
            <span>Udara ({countUdara})</span>
          </button>

          {/* Laut */}
          <button
            onClick={() => setActiveJalur('Laut')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeJalur === 'Laut'
                ? 'bg-[#0B1B4D] text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>🚢</span>
            <span>Laut ({countLaut})</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Pemisahan Rute Pengiriman Logistik Darat, Udara &amp; Laut
        </p>
      </div>

      {/* 4. ACTION BAR: SEARCH + TAMBAH MANUAL + IMPORT EXCEL + EXPORT + TEMPLATE (Image 1 & 3) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari rute asal, kota tujuan, kurir, atau layanan..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* + TAMBAH MANUAL */}
          <button
            id="btn-tambah-manual-rute"
            onClick={() => {
              setEditingRoute(null);
              setIsAddModalOpen(true);
            }}
            className="bg-[#0B1B4D] hover:bg-blue-900 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
          >
            <span className="text-amber-400 font-bold text-sm">+</span>
            <span>+ TAMBAH MANUAL</span>
          </button>

          {/* IMPORT EXCEL / CSV */}
          <button
            id="btn-import-excel-csv"
            onClick={() => setIsImportModalOpen(true)}
            className="bg-[#059669] hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>IMPORT EXCEL / CSV</span>
          </button>

          {/* Export */}
          <button
            id="btn-export-excel-csv"
            onClick={() => exportPricelistToExcel(routes)}
            className="bg-[#1E293B] hover:bg-slate-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
            title="Export ke Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Template */}
          <button
            id="btn-download-template-rates"
            onClick={downloadPricelistTemplate}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Unduh Format Template Excel"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Template</span>
          </button>
        </div>
      </div>

      {/* 5. PRICELIST DATA TABLE (Matching Image 1 & 3) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header: Dark Navy */}
            <thead className="bg-[#0B1B4D] text-white text-[11px] font-black uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">KOTA ASAL</th>
                <th className="py-3.5 px-4">KOTA / KAB TUJUAN</th>
                <th className="py-3.5 px-4">JALUR &amp; LAYANAN</th>
                <th className="py-3.5 px-4">TARIF ONGKIR / KG</th>
                <th className="py-3.5 px-4">MINIMAL BERAT</th>
                <th className="py-3.5 px-4">LEAD TIME</th>
                <th className="py-3.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRoutes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Tidak ada rute yang ditemukan.</p>
                    <p className="text-xs mt-1">Coba gunakan kata kunci lain atau tambahkan rute baru.</p>
                  </td>
                </tr>
              ) : (
                filteredRoutes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* KOTA ASAL */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="capitalize">{item.kotaAsal}</span>
                      </div>
                    </td>

                    {/* KOTA / KAB TUJUAN */}
                    <td className="py-3 px-4 font-black text-blue-900">
                      <span className="text-sm">{item.kotaTujuan}</span>
                    </td>

                    {/* JALUR & LAYANAN */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          {item.moda === 'Darat' ? '🚛 Cargo Darat' : item.moda === 'Laut' ? '🚢 Cargo Laut' : '✈️ Cargo Udara'}
                        </span>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{item.vendor}</p>
                          <p className="text-[11px] text-slate-500">{item.layanan}</p>
                        </div>
                      </div>
                    </td>

                    {/* TARIF ONGKIR / KG */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-black text-emerald-600 text-sm">
                          Rp {item.tarifKg.toLocaleString('id-ID')}
                          <span className="text-[11px] font-normal text-slate-500 ml-1">/kg jual</span>
                        </div>
                        {item.modalKg && item.modalKg > 0 && (
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Modal Rp {item.modalKg.toLocaleString('id-ID')}
                            {item.marginPercent !== undefined && (
                              <span className="text-emerald-700 font-bold ml-1">
                                • +{item.marginPercent}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* MINIMAL BERAT */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                        <span>{item.minimalBerat} Kg</span>
                      </span>
                    </td>

                    {/* LEAD TIME */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{item.leadTime}</span>
                      </span>
                    </td>

                    {/* AKSI: EDIT & DELETE */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingRoute(item);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Rute"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRoute(item.id, item.kotaTujuan)}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Rute"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <span>Menampilkan <strong>{filteredRoutes.length}</strong> dari <strong>{countSemua}</strong> rute pricelist</span>
          <span className="text-[11px] text-slate-400">Data tersimpan otomatis di perangkat &amp; siap diekspor</span>
        </div>
      </div>

      {/* Modals */}
      <PricelistRouteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRoute(null);
        }}
        onSave={handleSaveRoute}
        editItem={editingRoute}
      />

      <ImportPricelistExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRoutes}
      />
    </div>
  );
};
