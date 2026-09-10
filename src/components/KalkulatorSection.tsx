import React, { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import { ShipmentMode, CalculationResult } from '../types';
import { CITIES, DEFAULT_RATES, DAYS, MIN_BIAYA, WA_NUMBER, rupiah, zonePair } from '../data/logisticData';

export const KalkulatorSection: React.FC = () => {
  const [mode, setMode] = useState<ShipmentMode>('Darat');
  const [divisiUdara, setDivisiUdara] = useState<number>(6000);
  const [asal, setAsal] = useState<string>('jakarta');
  const [tujuan, setTujuan] = useState<string>('medan');
  const [berat, setBerat] = useState<string>('25');
  const [panjang, setPanjang] = useState<string>('50');
  const [lebar, setLebar] = useState<string>('40');
  const [tinggi, setTinggi] = useState<string>('30');
  
  const [hasil, setHasil] = useState<CalculationResult | null>(() => {
    // Initial default calculation for Jakarta -> Medan 25kg Darat
    const p = 50, l = 40, t = 30, b = 25;
    const vol = (p * l * t) / 4000;
    const chg = Math.max(b, vol);
    const key = zonePair(CITIES['jakarta'].z, CITIES['medan'].z);
    const tarif = DEFAULT_RATES['Darat'][key] || 4500;
    const total = Math.max(chg * tarif, MIN_BIAYA);
    return {
      beratAktual: b,
      volumetrik: vol,
      chargeable: chg,
      tarifKg: tarif,
      totalBiaya: total,
      waktu: DAYS['Darat'][key] || '3-5 hari',
      kenaMin: (chg * tarif) < MIN_BIAYA,
      asalNama: 'Jakarta',
      tujuanNama: 'Medan',
      moda: 'Darat'
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

  const handleHitung = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!asal || !tujuan) {
      alert('Silakan pilih kota asal dan kota tujuan pengiriman.');
      return;
    }
    if (asal === tujuan) {
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
    const chg = Math.max(b, volKg);
    const key = zonePair(CITIES[asal].z, CITIES[tujuan].z);
    const tarifKg = DEFAULT_RATES[mode][key] || 5000;
    let rawTotal = chg * tarifKg;
    const kenaMin = rawTotal < MIN_BIAYA;
    const totalBiaya = kenaMin ? MIN_BIAYA : rawTotal;
    const waktu = DAYS[mode][key] || '3-5 hari';

    setHasil({
      beratAktual: b,
      volumetrik: volKg,
      chargeable: chg,
      tarifKg: tarifKg,
      totalBiaya: totalBiaya,
      waktu: waktu,
      kenaMin: kenaMin,
      asalNama: CITIES[asal].n,
      tujuanNama: CITIES[tujuan].n,
      moda: mode
    });
  };

  const generateWhatsAppLink = () => {
    if (!hasil) return `https://wa.me/${WA_NUMBER}`;
    const text = encodeURIComponent(
      `Halo TRENS-LOGISTIC, saya ingin pesan pengiriman:\n` +
      `Moda: ${hasil.moda}\n` +
      `Rute: ${hasil.asalNama} -> ${hasil.tujuanNama}\n` +
      `Berat Aktual: ${hasil.beratAktual} kg\n` +
      (hasil.volumetrik > 0 ? `Dimensi Volumetrik: ${hasil.volumetrik.toFixed(1)} kg\n` : '') +
      `Chargeable Weight: ${hasil.chargeable.toFixed(1)} kg\n` +
      `Estimasi Ongkir: ${rupiah(hasil.totalBiaya)}\n` +
      `Estimasi Waktu: ${hasil.waktu}\n\n` +
      `Mohon jadwal penjemputan barang dan konfirmasi pesanan. Terima kasih!`
    );
    return `https://wa.me/${WA_NUMBER}?text=${text}`;
  };

  return (
    <section id="kalkulator" className="py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Kalkulator Tarif Real-Time</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
            Hitung Estimasi Ongkir Akurat
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Perhitungan transparan: <strong>P × L × T ÷ 4000</strong> (Darat &amp; Laut) atau <strong>÷ 5000 / 6000</strong> (Udara). Biaya dikenakan dari nilai terbesar antara berat aktual vs volumetrik.
          </p>
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
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
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
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
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
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2 ${
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
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
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
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
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
                  <optgroup label="Pulau Jawa">
                    <option value="jakarta">Jakarta</option>
                    <option value="bandung">Bandung</option>
                    <option value="semarang">Semarang</option>
                    <option value="yogyakarta">Yogyakarta</option>
                    <option value="surabaya">Surabaya</option>
                  </optgroup>
                  <optgroup label="Sumatera">
                    <option value="medan">Medan</option>
                    <option value="padang">Padang</option>
                    <option value="palembang">Palembang</option>
                    <option value="pekanbaru">Pekanbaru</option>
                    <option value="lampung">Bandar Lampung</option>
                  </optgroup>
                  <optgroup label="Kalimantan">
                    <option value="pontianak">Pontianak</option>
                    <option value="banjarmasin">Banjarmasin</option>
                    <option value="balikpapan">Balikpapan</option>
                    <option value="samarinda">Samarinda</option>
                  </optgroup>
                  <optgroup label="Sulawesi">
                    <option value="makassar">Makassar</option>
                    <option value="manado">Manado</option>
                  </optgroup>
                  <optgroup label="Bali &amp; Nusa Tenggara">
                    <option value="denpasar">Denpasar</option>
                    <option value="mataram">Mataram</option>
                  </optgroup>
                  <optgroup label="Papua">
                    <option value="jayapura">Jayapura</option>
                    <option value="sorong">Sorong</option>
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
                  <optgroup label="Pulau Jawa">
                    <option value="jakarta">Jakarta</option>
                    <option value="bandung">Bandung</option>
                    <option value="semarang">Semarang</option>
                    <option value="yogyakarta">Yogyakarta</option>
                    <option value="surabaya">Surabaya</option>
                  </optgroup>
                  <optgroup label="Sumatera">
                    <option value="medan">Medan</option>
                    <option value="padang">Padang</option>
                    <option value="palembang">Palembang</option>
                    <option value="pekanbaru">Pekanbaru</option>
                    <option value="lampung">Bandar Lampung</option>
                  </optgroup>
                  <optgroup label="Kalimantan">
                    <option value="pontianak">Pontianak</option>
                    <option value="banjarmasin">Banjarmasin</option>
                    <option value="balikpapan">Balikpapan</option>
                    <option value="samarinda">Samarinda</option>
                  </optgroup>
                  <optgroup label="Sulawesi">
                    <option value="makassar">Makassar</option>
                    <option value="manado">Manado</option>
                  </optgroup>
                  <optgroup label="Bali &amp; Nusa Tenggara">
                    <option value="denpasar">Denpasar</option>
                    <option value="mataram">Mataram</option>
                  </optgroup>
                  <optgroup label="Papua">
                    <option value="jayapura">Jayapura</option>
                    <option value="sorong">Sorong</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Dimensions (P x L x T) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dimensi Ukuran Paket (cm)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="P (cm)"
                    value={panjang}
                    onChange={(e) => setPanjang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none text-center"
                  />
                  <span className="block text-[10px] text-center text-slate-400 mt-1">Panjang</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="L (cm)"
                    value={lebar}
                    onChange={(e) => setLebar(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none text-center"
                  />
                  <span className="block text-[10px] text-center text-slate-400 mt-1">Lebar</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    placeholder="T (cm)"
                    value={tinggi}
                    onChange={(e) => setTinggi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none text-center"
                  />
                  <span className="block text-[10px] text-center text-slate-400 mt-1">Tinggi</span>
                </div>
              </div>
            </div>

            {/* Actual Weight */}
            <div>
              <label htmlFor="k-berat" className="block text-xs font-bold text-slate-700 mb-1.5">
                Berat Timbangan Aktual (kg)
              </label>
              <input
                id="k-berat"
                type="number"
                min="0"
                step="0.1"
                placeholder="Contoh: 25"
                value={berat}
                onChange={(e) => setBerat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-800 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Action Buttons: Hitung & Refresh/Reset */}
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
                      <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                        Moda {hasil.moda}
                      </span>
                      <p className="font-extrabold text-base text-white mt-0.5">
                        {hasil.asalNama} → {hasil.tujuanNama}
                      </p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-xs px-3 py-1 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{hasil.waktu}</span>
                    </div>
                  </div>

                  {/* Big Total Price */}
                  <div className="my-6">
                    <p className="text-xs text-white/70 uppercase font-semibold tracking-wider">
                      Estimasi Total Biaya
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight mt-1">
                      {rupiah(hasil.totalBiaya)}
                    </p>
                    {hasil.kenaMin && (
                      <p className="text-[11px] text-amber-200/90 mt-1 flex items-center gap-1 font-medium">
                        <Info className="w-3 h-3 shrink-0" />
                        <span>Dikenakan ketentuan tarif minimum kiriman ({rupiah(MIN_BIAYA)})</span>
                      </p>
                    )}
                  </div>

                  {/* Breakdown Specs */}
                  <div className="space-y-2.5 text-xs text-white/90 bg-black/15 rounded-2xl p-4 border border-white/10">
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
                      <span>Berat Chargeable</span>
                      <span>{hasil.chargeable.toFixed(1)} kg</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-white/75">
                      <span>Tarif Dasar per kg</span>
                      <span>{rupiah(hasil.tarifKg)} / kg</span>
                    </div>
                  </div>
                </div>

                {/* Bottom WhatsApp CTA */}
                <div className="mt-6 pt-4 border-t border-white/15">
                  <a
                    id="btn-pesan-wa-calc"
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                    <span>Pesan via WhatsApp Langsung</span>
                  </a>
                  <p className="text-[10px] text-white/60 text-center mt-2">
                    *Tarif estimasi. Nilai final dikonfirmasi setelah penimbangan fisik di gudang.
                  </p>
                </div>

              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
                <Boxes className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Hasil Estimasi Tarif</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                  Pilih moda dan masukkan data rute untuk melihat rincian biaya pengiriman.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
