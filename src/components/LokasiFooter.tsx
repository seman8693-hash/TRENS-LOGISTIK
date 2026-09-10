import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  Calculator, 
  Search, 
  ShieldCheck, 
  MessageCircle, 
  ExternalLink, 
  Award, 
  Handshake
} from 'lucide-react';
import { OFFICE_PHONE, OFFICE_PHONE_DISPLAY, WA_NUMBER, WA_NUMBER_DISPLAY } from '../data/logisticData';

interface LokasiFooterProps {
  onOpenKemitraanModal?: () => void;
}

export const LokasiFooter: React.FC<LokasiFooterProps> = ({ onOpenKemitraanModal }) => {
  return (
    <>
      {/* Lokasi Kantor Pusat & Map */}
      <section id="lokasi" className="py-20 bg-white border-b border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Lokasi Kantor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
              Kunjungi Kantor &amp; Hub Logistik Kami
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              Pusat layanan operasional dan pergudangan siap melayani kebutuhan pengiriman Anda.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Office Info Card */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#0B1B4D]">Head Office (Kantor Pusat)</h3>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                  Jl. Jati 1 No. 12 RT 001/06 Kel. Kebon Bawang, Kec. Tanjung Priok, Jakarta Utara, DKI Jakarta 14320, Indonesia.
                </p>

                <div className="mt-8 space-y-4 text-sm text-slate-700">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <a href={`tel:${OFFICE_PHONE}`} className="font-semibold hover:text-blue-700 transition-colors">
                      {OFFICE_PHONE_DISPLAY} (Nomor Kantor)
                    </a>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <a 
                      href={`https://wa.me/${WA_NUMBER}?text=Halo%20TRENS-LOGISTIC%2C%20saya%20ingin%20konsultasi%20pengiriman.`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold hover:text-emerald-700 transition-colors"
                    >
                      {WA_NUMBER_DISPLAY} (WhatsApp Hotline)
                    </a>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-700 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <a href="mailto:halo@trens-logistic.id" className="font-semibold hover:text-blue-700 transition-colors">
                      halo@trens-logistic.id
                    </a>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="text-xs sm:text-sm space-y-1">
                      <p>
                        <strong className="text-slate-800">Operasional:</strong> Senin – Jumat (08:00 – 17:00 WIB)
                      </p>
                      <p>
                        <strong className="text-slate-800">Staff Office:</strong> Senin – Jumat (08:00 – 16:00 WIB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Area Parkir Armada Truk &amp; Forklift Siap Sedia</span>
              </div>
            </div>

            {/* Embedded Interactive Map */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 shadow-md min-h-[360px] relative">
              <iframe
                title="Peta Lokasi Head Office TRENS-LOGISTIC"
                src="https://maps.google.com/maps?q=Jl.+Jati+1+No.12+Kebon+Bawang+Tanjung+Priok+Jakarta+Utara&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full min-h-[360px] border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-[#0B1B4D] text-white border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md">
                <img 
                  src="https://sc04.alicdn.com/kf/Sd6bcc0f091b4437b89123bed660abc13Z.jpg" 
                  alt="TRENS-LOGISTIC" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="font-black text-xl tracking-tight">TRENS-LOGISTIC</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Perusahaan pengiriman kargo dan logistik multi-moda terpadu (Darat, Laut, Udara) yang menghubungkan seluruh pulau di Indonesia dengan komitmen cepat, aman, dan harga transparan.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <Award className="w-4 h-4" />
              <span>Izin Usaha Jasa Pengurusan Transportasi (SIUJPT) Resmi</span>
            </div>
          </div>

          {/* Quick Menu */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-extrabold text-white text-base">Menu Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-white/75">
              <li>
                <a href="#beranda" className="hover:text-amber-400 transition-colors">Beranda Utama</a>
              </li>
              <li>
                <a href="#layanan" className="hover:text-amber-400 transition-colors">Layanan Darat, Laut &amp; Udara</a>
              </li>
              <li>
                <a href="#coverage" className="hover:text-amber-400 transition-colors">Jangkauan Kota Nusantara</a>
              </li>
              <li>
                <a href="#visimisi" className="hover:text-amber-400 transition-colors">Visi &amp; Misi Perusahaan</a>
              </li>
              <li>
                <a href="#kalkulator" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kalkulator Tarif Ongkir</span>
                </a>
              </li>
              <li>
                <a href="#tracking" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lacak Nomor Resi</span>
                </a>
              </li>
              <li>
                <button 
                  onClick={onOpenKemitraanModal || (() => {
                    document.getElementById('kemitraan')?.scrollIntoView({ behavior: 'smooth' });
                  })}
                  className="hover:text-amber-400 text-amber-300 font-semibold transition-colors flex items-center gap-1.5 text-left"
                >
                  <Handshake className="w-3.5 h-3.5 text-amber-400" />
                  <span>Daftar Kemitraan Pengiriman</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-extrabold text-white text-base">Layanan Pelanggan</h4>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <a href={`tel:${OFFICE_PHONE}`} className="hover:text-amber-400 transition-colors">
                  <span>Nomor Kantor: {OFFICE_PHONE_DISPLAY}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a 
                  href={`https://wa.me/${WA_NUMBER}?text=Halo%20TRENS-LOGISTIC`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-emerald-400 transition-colors"
                >
                  <span>WhatsApp Hotline: {WA_NUMBER_DISPLAY}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Email: halo@trens-logistic.id</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p>Operasional: Senin – Jumat (08:00 – 17:00 WIB)</p>
                  <p>Staff Office: Senin – Jumat (08:00 – 16:00 WIB)</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/10 py-6 text-center text-xs text-white/50 px-4">
          <p>© 2026 TRENS-LOGISTIC Indonesia. Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Button */}
      <a
        id="btn-floating-wa"
        href={`https://wa.me/${WA_NUMBER}?text=Halo%20TRENS-LOGISTIC%2C%20saya%20ingin%20bertanya%20seputar%20pengiriman%20barang.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        aria-label="Chat WhatsApp CS"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="sr-only">Chat WhatsApp</span>
        {/* Tooltip */}
        <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
          Chat CS 24/7 di WhatsApp
        </span>
      </a>
    </>
  );
};
