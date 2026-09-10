import React from 'react';
import { 
  Truck, 
  Ship, 
  Plane, 
  Calculator, 
  Search, 
  MapPin, 
  Headphones, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Boxes,
  Handshake
} from 'lucide-react';

interface HeroSectionProps {
  onQuickTrack?: (resi: string) => void;
  onOpenKemitraanModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onQuickTrack, onOpenKemitraanModal }) => {
  return (
    <section id="beranda" className="relative bg-gradient-to-br from-[#0B1B4D] via-[#12308F] to-[#1D4ED8] text-white overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Logistik Multi-Moda Seluruh Nusantara</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Kirim Barang via <br className="hidden sm:inline" />
              <span className="text-amber-400 underline decoration-amber-400/50 underline-offset-8">Darat, Laut,</span> &amp;{' '}
              <span className="text-sky-300">Udara</span>
            </h1>

            <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Satu mitra andal untuk seluruh rantai logistik Indonesia. Nikmati perhitungan tarif otomatis transparan, pemantauan resi langsung, penjemputan barang door-to-door, serta jaminan keamanan prima.
            </p>

            {/* Quick Action CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
              <a 
                href="#kalkulator" 
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[#0B1B4D] font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-amber-950/20 hover:scale-[1.02] transition-all text-xs sm:text-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Hitung Tarif Ongkir</span>
              </a>
              <a 
                href="#tracking" 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-5 py-3 rounded-xl backdrop-blur-xs hover:scale-[1.02] transition-all text-xs sm:text-sm"
              >
                <Search className="w-4 h-4 text-sky-300" />
                <span>Lacak Resi</span>
              </a>
              <button
                onClick={onOpenKemitraanModal || (() => {
                  document.getElementById('kemitraan')?.scrollIntoView({ behavior: 'smooth' });
                })}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-white font-bold px-5 py-3 rounded-xl hover:scale-[1.02] transition-all text-xs sm:text-sm shadow-md"
              >
                <Handshake className="w-4 h-4 text-amber-300" />
                <span>Daftar Kemitraan</span>
              </button>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-white/15 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-left">
                <span className="text-2xl shrink-0 mt-0.5">🌐</span>
                <div>
                  <p className="font-extrabold text-white text-sm">Jangkauan Nasional</p>
                  <p className="text-xs text-white/80 leading-relaxed mt-0.5">
                    Terhubung dengan kota-kota besar di seluruh Indonesia.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 text-left">
                <span className="text-2xl shrink-0 mt-0.5">💬</span>
                <div>
                  <p className="font-extrabold text-white text-sm">Customer Support</p>
                  <p className="text-xs text-white/80 leading-relaxed mt-0.5">
                    Layanan bantuan pelanggan yang responsif untuk memastikan setiap kebutuhan pengiriman tertangani dengan baik.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Card & Brand Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              
              <div className="text-center flex flex-col items-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-2xl p-2 shadow-xl mb-4 flex items-center justify-center border-2 border-white/40">
                  <img 
                    src="https://sc04.alicdn.com/kf/Sd6bcc0f091b4437b89123bed660abc13Z.jpg" 
                    alt="TRENS-LOGISTIC Official" 
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">TRENS-LOGISTIC</h2>
                <p className="text-white/80 text-xs sm:text-sm mt-1">
                  Cepat • Aman • Terpercaya di Seluruh Nusantara
                </p>

                {/* 3 Modes Badges */}
                <div className="mt-5 grid grid-cols-3 gap-2 w-full">
                  <div className="bg-emerald-600/30 border border-emerald-400/40 rounded-xl p-2.5 text-center">
                    <Truck className="w-5 h-5 mx-auto text-emerald-300 mb-1" />
                    <span className="block text-xs font-bold">Darat</span>
                    <span className="block text-[10px] text-emerald-200">Truk &amp; FTL</span>
                  </div>
                  <div className="bg-teal-600/30 border border-teal-400/40 rounded-xl p-2.5 text-center">
                    <Ship className="w-5 h-5 mx-auto text-teal-300 mb-1" />
                    <span className="block text-xs font-bold">Laut</span>
                    <span className="block text-[10px] text-teal-200">Kontainer</span>
                  </div>
                  <div className="bg-sky-600/30 border border-sky-400/40 rounded-xl p-2.5 text-center">
                    <Plane className="w-5 h-5 mx-auto text-sky-300 mb-1" />
                    <span className="block text-xs font-bold">Udara</span>
                    <span className="block text-[10px] text-sky-200">Kargo Ekspres</span>
                  </div>
                </div>

                {/* Quick Resi Tracker Box */}
                <div className="mt-6 w-full bg-white/15 border border-white/25 rounded-2xl p-3.5 text-left">
                  <label htmlFor="quick-resi" className="block text-[11px] font-semibold text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5" /> Quick Resi Check
                  </label>
                  <div className="flex gap-2">
                    <input 
                      id="quick-resi"
                      type="text" 
                      placeholder="Nomor Resi / AWB..."
                      className="w-full bg-white text-slate-800 text-xs px-3 py-2 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase placeholder:text-slate-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          const el = document.getElementById('resiInput') as HTMLInputElement;
                          if (el) {
                            el.value = val;
                            el.scrollIntoView({ behavior: 'smooth' });
                            const btn = document.getElementById('btn-track-submit');
                            if (btn) btn.click();
                          }
                        }
                      }}
                    />
                    <a 
                      href="#tracking"
                      onClick={(e) => {
                        const input = document.getElementById('quick-resi') as HTMLInputElement;
                        if (input) {
                          const target = document.getElementById('resiInput') as HTMLInputElement;
                          if (target) {
                            target.value = input.value;
                            const btn = document.getElementById('btn-track-submit');
                            if (btn) setTimeout(() => btn.click(), 300);
                          }
                        }
                      }}
                      className="bg-amber-400 text-[#0B1B4D] font-extrabold px-3 py-2 rounded-lg text-xs flex items-center justify-center shrink-0 hover:bg-amber-300"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
