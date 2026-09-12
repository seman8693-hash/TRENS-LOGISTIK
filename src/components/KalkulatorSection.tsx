import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Truck, 
  Ship, 
  Plane, 
  ArrowRight, 
  Info, 
  Percent, 
  Boxes, 
  CheckCircle, 
  AlertCircle,
  MessageCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Send,
  ShieldCheck,
  Search,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { ShipmentMode, CalculationResult } from '../types';
import { CITIES, DEFAULT_RATES, getStoredRates, DAYS, MIN_BIAYA, WA_NUMBER, rupiah, zonePair } from '../data/logisticData';
import { getStoredPricelist, PricelistRouteItem } from '../data/pricelistData';
import { BookingPickupModal } from './BookingPickupModal';

export const KalkulatorSection: React.FC = () => {
  const [mode, setMode] = useState<ShipmentMode>('Darat');
  const [divisiUdara, setDivisiUdara] = useState<number>(6000);
  const [asal, setAsal] = useState<string>('jakarta');
  const [tujuan, setTujuan] = useState<string>('medan');
  const [berat, setBerat] = useState<string>('25');
  const [panjang, setPanjang] = useState<string>('50');
  const [lebar, setLebar] = useState<string>('40');
  const [tinggi, setTinggi] = useState<string>('30');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAllPricelistModal, setShowAllPricelistModal] = useState(false);

  // Synchronized state with Dashboard
  const [pricelistRoutes, setPricelistRoutes] = useState<PricelistRouteItem[]>(() => getStoredPricelist());
  const [activeRates, setActiveRates] = useState<Record<ShipmentMode, Record<string, number>>>(() => getStoredRates());

  // Listen to updates from Dashboard
  useEffect(() => {
    const handleSync = () => {
      setPricelistRoutes(getStoredPricelist());
      setActiveRates(getStoredRates());
    };

    window.addEventListener('trens_pricelist_updated' as any, handleSync);
    window.addEventListener('trens_rates_updated' as any, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('trens_pricelist_updated' as any, handleSync);
      window.removeEventListener('trens_rates_updated' as any, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute combined lists of Origins and Destinations from both CITIES & Pricelist
  const originOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string; group: string }>();
    
    // Group from pricelist
    pricelistRoutes.forEach((r) => {
      const key = r.kotaAsal.trim();
      if (!map.has(key.toLowerCase())) {
        map.set(key.toLowerCase(), { id: key.toLowerCase(), label: key, group: 'Rute Khusus Pricelist TRENS-LOG' });
      }
    });

    // Group from standard CITIES
    Object.entries(CITIES).forEach(([k, c]) => {
      if (!map.has(c.n.toLowerCase())) {
        map.set(c.n.toLowerCase(), { id: k, label: c.n, group: 'Kota Utama Nusantara' });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [pricelistRoutes]);

  const destinationOptions = useMemo(() => {
    const map = new Map<string, { id: string; label: string; group: string }>();
    
    // Group from pricelist
    pricelistRoutes.forEach((r) => {
      const key = r.kotaTujuan.trim();
      if (!map.has(key.toLowerCase())) {
        map.set(key.toLowerCase(), { id: key.toLowerCase(), label: key, group: 'Rute Khusus Pricelist TRENS-LOG' });
      }
    });

    // Group from standard CITIES
    Object.entries(CITIES).forEach(([k, c]) => {
      if (!map.has(c.n.toLowerCase())) {
        map.set(c.n.toLowerCase(), { id: k, label: c.n, group: 'Kota Utama Nusantara' });
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [pricelistRoutes]);

  // Initial calculation
  const [hasil, setHasil] = useState<CalculationResult | null>(() => {
    const p = 50, l = 40, t = 30, b = 25;
    const vol = (p * l * t) / 4000;
    const chg = Math.max(b, vol);
    const key = zonePair(CITIES['jakarta']?.z || 'jkt', CITIES['medan']?.z || 'sum1');
    const tarif = getStoredRates()['Darat']?.[key] ?? DEFAULT_RATES['Darat']?.[key] ?? 0;
    const total = Math.max(chg * tarif, tarif > 0 ? MIN_BIAYA : 0);
    return {
      beratAktual: b,
      volumetrik: vol,
      chargeable: chg,
      tarifKg: tarif,
      totalBiaya: total,
      waktu: DAYS['Darat'][key] || '3-5 hari',
      kenaMin: tarif > 0 && (chg * tarif) < MIN_BIAYA,
      asalNama: 'Jakarta',
      tujuanNama: 'Medan',
      moda: 'Darat',
      layanan: 'Cargo Regular Darat',
      vendor: 'trens-log',
      minimalBerat: 1,
      isPricelistMatch: false
    };
  });

  const handleReset = () => {
    setBerat('');
    setPanjang('');
    setLebar('');
    setTinggi('');
    setAsal('jakarta');
    setTujuan('medan');
    setMode('Darat');
    setHasil(null);
  };

  const applyRoute = (route: PricelistRouteItem) => {
    setMode(route.moda);
    setAsal(route.kotaAsal.toLowerCase());
    setTujuan(route.kotaTujuan.toLowerCase());
    const minB = route.minimalBerat || 1;
    const defaultB = Math.max(25, minB);
    setBerat(String(defaultB));
    setPanjang('');
    setLebar('');
    setTinggi('');

    const chg = Math.max(defaultB, minB);
    const total = chg * route.tarifKg;

    setHasil({
      beratAktual: defaultB,
      volumetrik: 0,
      chargeable: chg,
      tarifKg: route.tarifKg,
      totalBiaya: total,
      waktu: route.leadTime,
      kenaMin: defaultB < minB,
      asalNama: route.kotaAsal,
      tujuanNama: route.kotaTujuan,
      moda: route.moda,
      layanan: route.layanan,
      vendor: route.vendor || 'trens-log',
      minimalBerat: minB,
      isPricelistMatch: true
    });
  };

  const handleHitung = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!asal || !tujuan) {
      alert('Silakan pilih kota asal dan kota tujuan pengiriman.');
      return;
    }
    if (asal.toLowerCase().trim() === tujuan.toLowerCase().trim()) {
      alert('Kota asal dan tujuan tidak boleh sama.');
      return;
    }

    const b = parseFloat(berat) || 0;
    const p = parseFloat(panjang) || 0;
    const l = parseFloat(lebar) || 0;
    const t = parseFloat(tinggi) || 0;

    if (b <= 0 && (p <= 0 || l <= 0 || t <= 0)) {
      alert('Mohon masukkan berat aktual atau dimensi ukuran barang (P x L x T).');
      return;
    }

    const pembagi = mode === 'Udara' ? divisiUdara : 4000;
    const volKg = (p > 0 && l > 0 && t > 0) ? (p * l * t) / pembagi : 0;
    const rawChg = Math.max(b, volKg);

    // Resolve human-readable names
    const asalOpt = originOptions.find(o => o.id === asal || o.label.toLowerCase() === asal.toLowerCase());
    const tujuanOpt = destinationOptions.find(o => o.id === tujuan || o.label.toLowerCase() === tujuan.toLowerCase());
    const asalNama = asalOpt ? asalOpt.label : (CITIES[asal]?.n || asal);
    const tujuanNama = tujuanOpt ? tujuanOpt.label : (CITIES[tujuan]?.n || tujuan);

    // 1. Check if matched with Admin Pricelist Routes
    const matchedRoute = pricelistRoutes.find((r) => {
      const modeMatch = r.moda.toLowerCase() === mode.toLowerCase();
      const rAsal = r.kotaAsal.toLowerCase().trim();
      const rTujuan = r.kotaTujuan.toLowerCase().trim();
      const userAsal = asalNama.toLowerCase().trim();
      const userTujuan = tujuanNama.toLowerCase().trim();

      const asalMatch = rAsal === userAsal || rAsal.includes(userAsal) || userAsal.includes(rAsal);
      const tujuanMatch = rTujuan === userTujuan || rTujuan.includes(userTujuan) || userTujuan.includes(rTujuan);

      return modeMatch && asalMatch && tujuanMatch;
    });

    if (matchedRoute) {
      const minB = matchedRoute.minimalBerat || 1;
      const effectiveChg = Math.max(rawChg, minB);
      const total = effectiveChg * matchedRoute.tarifKg;

      setHasil({
        beratAktual: b,
        volumetrik: volKg,
        chargeable: effectiveChg,
        tarifKg: matchedRoute.tarifKg,
        totalBiaya: total,
        waktu: matchedRoute.leadTime,
        kenaMin: rawChg < minB,
        asalNama,
        tujuanNama,
        moda: mode,
        layanan: matchedRoute.layanan,
        vendor: matchedRoute.vendor || 'trens-log',
        minimalBerat: minB,
        isPricelistMatch: true
      });
      return;
    }

    // 2. Fallback to Zone Matrix
    const asalZone = CITIES[asal]?.z || 'jkt';
    const tujuanZone = CITIES[tujuan]?.z || 'jkt';
    const key = zonePair(asalZone, tujuanZone);
    const tarifKg = activeRates[mode]?.[key] ?? DEFAULT_RATES[mode]?.[key] ?? 0;
    const rawTotal = rawChg * tarifKg;
    const kenaMin = tarifKg > 0 && rawTotal < MIN_BIAYA;
    const totalBiaya = tarifKg === 0 ? 0 : (kenaMin ? MIN_BIAYA : rawTotal);
    const waktu = DAYS[mode][key] || '3-5 hari';

    setHasil({
      beratAktual: b,
      volumetrik: volKg,
      chargeable: rawChg,
      tarifKg: tarifKg,
      totalBiaya: totalBiaya,
      waktu: waktu,
      kenaMin: kenaMin,
      asalNama,
      tujuanNama,
      moda: mode,
      layanan: mode === 'Darat' ? 'Cargo Regular Darat' : mode === 'Laut' ? 'Cargo Ro-Ro Kapal Laut' : 'Cargo Express Udara',
      vendor: 'trens-log',
      minimalBerat: 1,
      isPricelistMatch: false
    });
  };

  const generateWhatsAppLink = () => {
    if (!hasil) return `https://wa.me/${WA_NUMBER}`;
    const text = encodeURIComponent(
      `Halo TRENS-LOGISTIC, saya ingin pesan pengiriman:\n` +
      `Vendor/Kurir: ${hasil.vendor || 'trens-log'}\n` +
      `Layanan: ${hasil.layanan || 'Cargo Regular'}\n` +
      `Moda: ${hasil.moda}\n` +
      `Rute: ${hasil.asalNama} -> ${hasil.tujuanNama}\n` +
      `Berat Aktual: ${hasil.beratAktual} kg\n` +
      (hasil.volumetrik > 0 ? `Dimensi Volumetrik: ${hasil.volumetrik.toFixed(1)} kg\n` : '') +
      `Chargeable Weight: ${hasil.chargeable.toFixed(1)} kg\n` +
      `Tarif: ${rupiah(hasil.tarifKg)}/kg\n` +
      `Estimasi Total Ongkir: ${rupiah(hasil.totalBiaya)}\n` +
      `Estimasi Waktu: ${hasil.waktu}\n\n` +
      `Mohon jadwal penjemputan barang dan konfirmasi pesanan. Terima kasih!`
    );
    return `https://wa.me/${WA_NUMBER}?text=${text}`;
  };

  return (
    <section id="kalkulator" className="py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Calculator className="w-3.5 h-3.5 text-blue-700" />
            <span>Kalkulator Tarif Terintegrasi Real-Time</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
            Cek Tarif Ongkir &amp; Terbitkan Resi
          </h2>
          <p className="text-slate-600 mt-3 text-sm sm:text-base">
            Tarif dihitung otomatis dan tersinkronisasi langsung dengan Master Data Tarif &amp; Rute di Dashboard Operasional TRENS-LOG.
          </p>
        </div>

        {/* Quick Pricelist Presets Strip */}
        <div className="mb-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Rute Pilihan Resmi TRENS-LOG (Tersinkronisasi Admin):</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAllPricelistModal(true)}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lihat Semua Daftar Tarif ({pricelistRoutes.length} Rute)</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {pricelistRoutes.slice(0, 6).map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => applyRoute(route)}
                className="shrink-0 px-3.5 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:text-blue-900">
                  <span>{route.kotaAsal}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                  <span>{route.kotaTujuan}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5 flex items-center justify-between gap-2">
                  <span>{rupiah(route.tarifKg)}/kg</span>
                  <span className="text-[10px] text-slate-500 font-medium">({route.moda})</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculator Main Layout */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8 lg:p-10 grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Form: 7 Columns */}
          <form onSubmit={handleHitung} className="lg:col-span-7 space-y-6">
            
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                1. Pilih Moda Pengiriman
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setMode('Darat'); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    mode === 'Darat'
                      ? 'border-blue-700 bg-blue-50 text-blue-900 font-extrabold shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-semibold'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mode === 'Darat' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm">Darat</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('Laut'); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    mode === 'Laut'
                      ? 'border-teal-700 bg-teal-50 text-teal-900 font-extrabold shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-semibold'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mode === 'Laut' ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Ship className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm">Laut</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('Udara'); }}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    mode === 'Udara'
                      ? 'border-sky-700 bg-sky-50 text-sky-900 font-extrabold shadow-sm'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-semibold'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    mode === 'Udara' ? 'bg-sky-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Plane className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm">Udara</span>
                </button>
              </div>
            </div>

            {/* If Udara: Divisor Options */}
            {mode === 'Udara' && (
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <label className="block text-xs font-bold text-sky-900 mb-2">
                  Rumus Volumetrik Kargo Udara:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDivisiUdara(6000)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      divisiUdara === 6000
                        ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    P × L × T ÷ 6000 (Reguler)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDivisiUdara(5000)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      divisiUdara === 5000
                        ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    P × L × T ÷ 5000 (Express)
                  </button>
                </div>
              </div>
            )}

            {/* City Origin & Destination */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="k-asal" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kota Asal Penjemputan
                </label>
                <select
                  id="k-asal"
                  value={asal}
                  onChange={(e) => setAsal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <optgroup label="Rute Khusus Pricelist TRENS-LOG">
                    {originOptions
                      .filter(o => o.group === 'Rute Khusus Pricelist TRENS-LOG')
                      .map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                  </optgroup>
                  <optgroup label="Kota Utama Nusantara Lainnya">
                    {originOptions
                      .filter(o => o.group !== 'Rute Khusus Pricelist TRENS-LOG')
                      .map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label htmlFor="k-tujuan" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kota Tujuan Pengantaran
                </label>
                <select
                  id="k-tujuan"
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <optgroup label="Rute Khusus Pricelist TRENS-LOG">
                    {destinationOptions
                      .filter(o => o.group === 'Rute Khusus Pricelist TRENS-LOG')
                      .map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                  </optgroup>
                  <optgroup label="Kota Utama Nusantara Lainnya">
                    {destinationOptions
                      .filter(o => o.group !== 'Rute Khusus Pricelist TRENS-LOG')
                      .map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Dimensions (P x L x T) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Dimensi Ukuran Koli / Paket (cm)
                </label>
                <span className="text-[11px] text-slate-400">Opsional jika sudah tahu berat koli</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="relative">
                    <input
                      id="input-panjang"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="50"
                      value={panjang}
                      onChange={(e) => setPanjang(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none transition-all pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">P</span>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="input-lebar"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="40"
                      value={lebar}
                      onChange={(e) => setLebar(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none transition-all pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">L</span>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <input
                      id="input-tinggi"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="30"
                      value={tinggi}
                      onChange={(e) => setTinggi(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none transition-all pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">T</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Weight */}
            <div>
              <label htmlFor="input-berat" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                3. Berat Aktual Timbangan (Kg)
              </label>
              <div className="relative">
                <input
                  id="input-berat"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="25"
                  value={berat}
                  onChange={(e) => setBerat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-base font-bold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none transition-all pr-12"
                />
                <span className="absolute right-4 top-3 text-sm text-slate-500 font-bold">KG</span>
              </div>
            </div>

            {/* Buttons Action */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                id="btn-hitung-tarif"
                type="submit"
                className="w-full sm:flex-1 bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer hover:scale-[1.01]"
              >
                <Calculator className="w-5 h-5" />
                <span>Hitung Estimasi Ongkir</span>
              </button>
              
              <button
                id="btn-reset-kalkulator"
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                title="Reset kembali semua inputan ke nol / kosong"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset (Nol)</span>
              </button>
            </div>
          </form>

          {/* Right Result Card: 5 Columns */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            {hasil ? (
              <div className="bg-gradient-to-br from-[#0B1B4D] via-[#12308F] to-[#1D4ED8] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
                
                {/* Result Top Info */}
                <div>
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                          Moda {hasil.moda}
                        </span>
                        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-md font-semibold">
                          {hasil.layanan || 'Cargo Regular'}
                        </span>
                      </div>
                      <p className="font-extrabold text-base text-white mt-1">
                        {hasil.asalNama} → {hasil.tujuanNama}
                      </p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{hasil.waktu}</span>
                    </div>
                  </div>

                  {/* Synchronized Badge */}
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {hasil.isPricelistMatch 
                        ? 'Tersinkronisasi Master Pricelist TRENS-LOG'
                        : 'Tersinkronisasi Matriks Tarif Standar TRENS-LOG'}
                    </span>
                  </div>

                  {/* Big Total Price */}
                  <div className="my-5">
                    <p className="text-xs text-white/70 uppercase font-semibold tracking-wider">
                      Estimasi Total Biaya
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight mt-1">
                      {rupiah(hasil.totalBiaya)}
                    </p>
                    {hasil.kenaMin && (
                      <p className="text-[11px] text-amber-200/90 mt-1.5 flex items-center gap-1 font-medium bg-white/10 p-2 rounded-xl">
                        <Info className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                        <span>
                          {hasil.minimalBerat && hasil.minimalBerat > 1
                            ? `Ketentuan minimal berat untuk rute ini: ${hasil.minimalBerat} kg`
                            : `Dikenakan ketentuan tarif minimum pengiriman (${rupiah(MIN_BIAYA)})`}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Breakdown Specs */}
                  <div className="space-y-2.5 text-xs text-white/90 bg-black/15 rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Kurir / Vendor Resmi</span>
                      <span className="font-bold text-amber-300 font-mono">{hasil.vendor || 'trens-log'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Berat Aktual Timbangan</span>
                      <span className="font-bold">{hasil.beratAktual} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Berat Volumetrik (P×L×T)</span>
                      <span className="font-bold">
                        {hasil.volumetrik > 0 ? `${hasil.volumetrik.toFixed(1)} kg` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-white/10 text-amber-300 font-extrabold text-sm">
                      <span>Berat Dikenakan (Chargeable)</span>
                      <span>{hasil.chargeable.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-white/75">
                      <span>Tarif Satuan per kg</span>
                      <span>{rupiah(hasil.tarifKg)} / kg</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTAs */}
                <div className="mt-6 pt-4 border-t border-white/15 space-y-2.5">
                  <button
                    id="btn-pesan-online-calc"
                    type="button"
                    onClick={() => setShowBookingModal(true)}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm hover:scale-101 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>🚚 Pesan Penjemputan &amp; Buat Resi / ID</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      id="btn-pesan-wa-calc"
                      href={generateWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-2.5 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 text-xs text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>Chat WhatsApp</span>
                    </a>

                    <a
                      href="#tracking"
                      className="bg-white/20 hover:bg-white/30 text-white font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs text-center"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Lacak Resi Anda</span>
                    </a>
                  </div>

                  <p className="text-[10px] text-white/60 text-center mt-1">
                    *Tarif real-time tersinkronisasi. Resi / ID terbit otomatis setelah booking tersimpan.
                  </p>
                </div>

              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                <Boxes className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Hasil Estimasi Tarif</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                  Pilih rute dan masukkan berat barang untuk melihat rincian biaya yang sinkron dengan database.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Booking Pickup Modal */}
      <BookingPickupModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        calcData={hasil}
      />

      {/* Modal: View All Master Pricelist */}
      {showAllPricelistModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#0B1B4D] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Daftar Lengkap Tarif &amp; Rute TRENS-LOG</h3>
                  <p className="text-xs text-blue-200">Semua rute aktif tersinkronisasi otomatis dengan Dashboard Admin</p>
                </div>
              </div>
              <button
                onClick={() => setShowAllPricelistModal(false)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {pricelistRoutes.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span className="font-bold text-blue-800">{r.moda}</span>
                        <span className="font-semibold text-[11px] bg-slate-200/80 px-2 py-0.5 rounded-md text-slate-700">{r.layanan}</span>
                      </div>
                      <p className="text-sm font-extrabold text-slate-900">
                        {r.kotaAsal} → {r.kotaTujuan}
                      </p>
                      <div className="mt-2 text-xs space-y-0.5 text-slate-600">
                        <div>Tarif: <strong className="text-emerald-700 text-sm">{rupiah(r.tarifKg)}</strong> /kg</div>
                        <div>Minimal: <strong>{r.minimalBerat} kg</strong> • Lead Time: <strong>{r.leadTime}</strong></div>
                        <div className="text-[11px] text-slate-400">Vendor: {r.vendor || 'trens-log'}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        applyRoute(r);
                        setShowAllPricelistModal(false);
                      }}
                      className="mt-3 w-full py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Pilih Rute Ini di Kalkulator
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowAllPricelistModal(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
