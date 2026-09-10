import React, { useState } from 'react';
import { 
  Calculator, 
  Truck, 
  Ship, 
  Plane, 
  Save, 
  RotateCcw, 
  Check, 
  Layers, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { ShipmentMode } from '../../types';
import { DEFAULT_RATES, rupiah, CITIES, zonePair, MIN_BIAYA } from '../../data/logisticData';

interface DashboardRatesProps {
  rates: Record<ShipmentMode, Record<string, number>>;
  onSaveRates: (newRates: Record<ShipmentMode, Record<string, number>>) => void;
  onResetRates: () => void;
}

const ZONE_LABELS: Record<string, string> = {
  same: 'Dalam Satu Zona / Provinsi',
  jawaSumatera: 'Jawa ↔ Sumatera',
  jawaKalimantan: 'Jawa ↔ Kalimantan',
  jawaSulawesi: 'Jawa ↔ Sulawesi',
  jawaBali: 'Jawa ↔ Bali & NTB',
  jawaPapua: 'Jawa ↔ Papua & Maluku',
  cross: 'Antarpulau Lainnya (Luar Jawa)'
};

export const DashboardRates: React.FC<DashboardRatesProps> = ({
  rates,
  onSaveRates,
  onResetRates
}) => {
  const [currentRates, setCurrentRates] = useState<Record<ShipmentMode, Record<string, number>>>(rates);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick simulator state
  const [simAsal, setSimAsal] = useState('jakarta');
  const [simTujuan, setSimTujuan] = useState('surabaya');
  const [simBerat, setSimBerat] = useState(15);
  const [simModa, setSimModa] = useState<ShipmentMode>('Darat');

  const handleRateChange = (moda: ShipmentMode, zone: string, value: number) => {
    setCurrentRates((prev) => ({
      ...prev,
      [moda]: {
        ...prev[moda],
        [zone]: value
      }
    }));
  };

  const handleSave = () => {
    onSaveRates(currentRates);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Simulator calculation
  const zAsal = CITIES[simAsal]?.z || 'Jawa';
  const zTujuan = CITIES[simTujuan]?.z || 'Jawa';
  const pair = zonePair(zAsal, zTujuan);
  const simTarifKg = currentRates[simModa]?.[pair] || 4000;
  const simTotal = Math.max(MIN_BIAYA, simBerat * simTarifKg);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-700" />
            <span>Konfigurasi Tarif Dasar &amp; Rute Pengiriman</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur tarif ongkos kirim per kilogram untuk setiap rute moda transportasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Kembalikan tarif ke pengaturan default awal?')) {
                onResetRates();
                setCurrentRates(DEFAULT_RATES);
              }
            }}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 hover:scale-102"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulator Card */}
      <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-5 rounded-2xl border border-blue-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase text-blue-900 tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Live Rate Simulator (Uji Coba Tarif)</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kota Asal</label>
            <select
              value={simAsal}
              onChange={(e) => setSimAsal(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              {Object.entries(CITIES).map(([k, c]) => (
                <option key={k} value={k}>{c.n} ({c.z})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kota Tujuan</label>
            <select
              value={simTujuan}
              onChange={(e) => setSimTujuan(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              {Object.entries(CITIES).map(([k, c]) => (
                <option key={k} value={k}>{c.n} ({c.z})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Moda Transportasi</label>
            <select
              value={simModa}
              onChange={(e) => setSimModa(e.target.value as ShipmentMode)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800"
            >
              <option value="Darat">Darat (Truk &amp; Kereta)</option>
              <option value="Laut">Laut (Kapal Kargo/RoRo)</option>
              <option value="Udara">Udara (Pesawat Kargo)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Berat Kargo (Kg)</label>
            <input
              type="number"
              min="1"
              value={simBerat}
              onChange={(e) => setSimBerat(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-blue-200/60 text-xs">
          <span className="text-slate-600">
            Zona Terdeteksi: <strong className="text-blue-900">{ZONE_LABELS[pair] || pair}</strong> • Tarif: <strong className="text-slate-900">{rupiah(simTarifKg)} / kg</strong>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Hasil Estimasi:</span>
            <span className="text-base font-extrabold text-blue-950 font-mono">
              {rupiah(simTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Rates Table by Mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Darat */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
              <Truck className="w-4 h-4 text-blue-700" />
              <span>Kargo Darat</span>
            </div>
            <span className="text-[10px] font-bold bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded">
              Truk &amp; Kereta
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100">
            {Object.entries(ZONE_LABELS).map(([zoneKey, label]) => {
              const currentVal = currentRates.Darat?.[zoneKey] || 3000;
              return (
                <div key={zoneKey} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="max-w-[65%]">
                    <p className="text-xs font-semibold text-slate-700">{label}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{zoneKey}</span>
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-[11px] text-slate-400 font-medium">Rp</span>
                    <input
                      type="number"
                      step="500"
                      value={currentVal}
                      onChange={(e) => handleRateChange('Darat', zoneKey, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 hover:bg-white border border-slate-300 focus:border-blue-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-right focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Laut */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-cyan-50 px-4 py-3 border-b border-cyan-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-cyan-950 text-sm">
              <Ship className="w-4 h-4 text-cyan-700" />
              <span>Kargo Laut</span>
            </div>
            <span className="text-[10px] font-bold bg-cyan-200/60 text-cyan-800 px-2 py-0.5 rounded">
              Kapal RoRo/Kontainer
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100">
            {Object.entries(ZONE_LABELS).map(([zoneKey, label]) => {
              const currentVal = currentRates.Laut?.[zoneKey] || 2500;
              return (
                <div key={zoneKey} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="max-w-[65%]">
                    <p className="text-xs font-semibold text-slate-700">{label}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{zoneKey}</span>
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-[11px] text-slate-400 font-medium">Rp</span>
                    <input
                      type="number"
                      step="500"
                      value={currentVal}
                      onChange={(e) => handleRateChange('Laut', zoneKey, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 hover:bg-white border border-slate-300 focus:border-cyan-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-right focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Udara */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-sky-50 px-4 py-3 border-b border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
              <Plane className="w-4 h-4 text-sky-700" />
              <span>Kargo Udara</span>
            </div>
            <span className="text-[10px] font-bold bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded">
              Ekspres Kilat
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100">
            {Object.entries(ZONE_LABELS).map(([zoneKey, label]) => {
              const currentVal = currentRates.Udara?.[zoneKey] || 15000;
              return (
                <div key={zoneKey} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="max-w-[65%]">
                    <p className="text-xs font-semibold text-slate-700">{label}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{zoneKey}</span>
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-[11px] text-slate-400 font-medium">Rp</span>
                    <input
                      type="number"
                      step="500"
                      value={currentVal}
                      onChange={(e) => handleRateChange('Udara', zoneKey, parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 hover:bg-white border border-slate-300 focus:border-sky-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 text-right focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
