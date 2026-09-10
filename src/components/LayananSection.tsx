import React from 'react';
import { 
  Truck, 
  Ship, 
  Plane, 
  CheckCircle2, 
  Zap,
  Building2,
  Package,
  Layers, 
  ArrowRight
} from 'lucide-react';
import { WA_NUMBER } from '../data/logisticData';

export const LayananSection: React.FC = () => {
  return (
    <section id="layanan" className="py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Layanan Terpadu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
            Solusi Pengiriman Nusantara
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Sesuaikan moda armada dengan urgensi waktu, bobot muatan, dan anggaran logistik bisnis Anda.
          </p>
        </div>

        {/* 4 Services Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Same Day Service */}
          <div className="bg-white rounded-3xl p-7 border-2 border-blue-500/30 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-xs">
              ⚡ Prioritas Kilat
            </div>

            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl shadow-xs group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1B4D] mt-5">Same Day Service</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Layanan pengiriman kilat prioritas tinggi dengan proses penjemputan dan pengantaran langsung tiba di hari yang sama.
              </p>
              
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">⚡</span>
                  <span className="font-medium">Pickup &amp; delivery di hari yang sama.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">🏢</span>
                  <span className="font-medium">Prioritas untuk area/kota besar.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0">📦</span>
                  <span className="font-medium">Cocok untuk dokumen &amp; paket urgent.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <a 
                href={`https://wa.me/${WA_NUMBER}?text=Halo%20TRENS-LOGISTIC%2C%20saya%20ingin%20menggunakan%20layanan%20Same%20Day%20Service.`} 
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0B1B4D] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:gap-3"
              >
                <span>Selengkapnya</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 2: Darat */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-2xl shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1B4D] mt-5">Pengiriman Darat</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Armada truk engkel, CDD, fuso, tronton, hingga kontainer door-to-door dengan jaringan penyeberangan kapal Ro-Ro.
              </p>
              
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Estimasi:</strong> 1 – 14 hari sesuai rute</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Ekonomis untuk muatan besar &amp; pindahan</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Penjemputan armada langsung Door-to-Door</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <a 
                href="#kalkulator" 
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-all hover:gap-3"
              >
                <span>Cek Tarif Darat</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 3: Laut */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-2xl shadow-xs group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Ship className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1B4D] mt-5">Pengiriman Laut</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Kargo laut via kontainer FCL &amp; LCL, kapal kargo curah, serta pengiriman alat berat &amp; kendaraan antar pulau.
              </p>
              
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Tarif kubikasi (m³)</strong> paling terjangkau</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Kapasitas motor, mobil &amp; mesin pabrik</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Jadwal rutin ke pelabuhan utama</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <a 
                href="#kalkulator" 
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-all hover:gap-3"
              >
                <span>Cek Tarif Laut</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Card 4: Udara */}
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center text-2xl shadow-xs group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Plane className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1B4D] mt-5">Pengiriman Udara</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Kargo udara kilat dan prioritas penerbangan reguler untuk dokumen penting, sampel, dan barang bernilai tinggi.
              </p>
              
              <div className="mt-5 pt-5 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span><strong>Super Cepat:</strong> 1 – 3 hari kerja</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>Prioritas penanganan aman &amp; higienis</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <span>Terhubung bandara domestik seluruh RI</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4">
              <a 
                href="#kalkulator" 
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold rounded-xl border border-sky-200 transition-all hover:gap-3"
              >
                <span>Cek Tarif Udara</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
