import React from 'react';
import { 
  Handshake, 
  Store, 
  Truck, 
  Building2, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award
} from 'lucide-react';
import { WA_NUMBER } from '../data/logisticData';

interface KemitraanSectionProps {
  onOpenKemitraanModal: () => void;
}

export const KemitraanSection: React.FC<KemitraanSectionProps> = ({ onOpenKemitraanModal }) => {
  return (
    <section id="kemitraan" className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-200/80 mb-4 shadow-2xs">
            <Handshake className="w-3.5 h-3.5 text-blue-600" />
            <span>Peluang Bisnis Logistik Nusantara</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
            Program Kemitraan Pengiriman TRENS-LOGISTIC
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Nikmati kenyamanan dan safety barang Anda dengan tracking layanan kami dan banyak keuntungan.
          </p>
        </div>

        {/* 4 Partnership Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: Agen Gerai */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1B4D]">Keagenan / Drop Point</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Buka titik penerimaan paket kiriman darat, laut, dan udara dengan modal terjangkau.
              </p>
              
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Sistem komisi menarik &amp; transparan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Sistem web POS resi instan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>Branding media &amp; spanduk resmi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenKemitraanModal}
              className="mt-6 w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Daftar Keagenan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Mitra Armada */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1B4D]">Mitra Armada Truk</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pemilik unit CDE, CDD, Fuso, Tronton, hingga Trailer untuk pengangkutan kargo antar kota.
              </p>
              
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Alokasi muatan rutin harian</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Tarif transparan &amp; cair tepat waktu</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Dukungan surat jalan digital &amp; POD</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenKemitraanModal}
              className="mt-6 w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Daftar Armada</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: B2B Korporat */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1B4D]">B2B &amp; Korporat</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Solusi logistik terintegrasi untuk pabrik, distributor, manufaktur, dan e-commerce berskala besar.
              </p>
              
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Tarif khusus volume kontrak (SLA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Fasilitas Term of Payment (TOP)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Dedicated Key Account Manager</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenKemitraanModal}
              className="mt-6 w-full py-2.5 px-3 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Kerjasama B2B</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Kurir Pengiriman */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B1B4D]">Mitra Kurir Pickup</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Pengantaran paket same day, first-mile pickup dari gudang customer ke hub pengiriman.
              </p>
              
              <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Insentif harian kompetitif</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Fleksibilitas rute &amp; waktu</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>Bonus target performa kurir</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenKemitraanModal}
              className="mt-6 w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <span>Daftar Kurir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* CTA Banner Kemitraan */}
        <div className="bg-gradient-to-r from-[#0B1B4D] via-blue-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold">Siap Mengembangkan Usaha Bersama TRENS-LOGISTIC?</h3>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-xl">
              Hubungi tim kemitraan kami sekarang untuk kemudahan operasional, safety tracking pengiriman, dan berbagai keuntungan menarik.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onOpenKemitraanModal}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-105 flex items-center gap-2"
            >
              <Handshake className="w-4 h-4 text-slate-900" />
              <span>Daftar Kemitraan Sekarang</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
