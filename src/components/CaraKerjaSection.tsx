import React from 'react';
import { 
  FileEdit, 
  Truck, 
  Navigation, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Eye,
  Target
} from 'lucide-react';

export const CaraKerjaSection: React.FC = () => {
  return (
    <>
      {/* 4 Steps Section */}
      <section id="carakerja" className="py-20 bg-white border-b border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              <span>Alur Simpel &amp; Cepat</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
              4 Langkah Mudah Pengiriman
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Dari pengisian formulir hingga barang sampai aman ke tangan penerima.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 relative hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-700/20">
                    1
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Langkah 1</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl mt-5">
                  <FileEdit className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1B4D] mt-4">Pesan Kiriman</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Isi formulir pemesanan online atau konsultasikan tarif langsung ke admin WhatsApp resmi.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 relative hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-700/20">
                    2
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Langkah 2</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mt-5">
                  <Truck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1B4D] mt-4">Penjemputan Barang</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Kurir logistik menjemput barang di rumah/gudang Anda atau drop di gerai drop-point terdekat.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 relative hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-700/20">
                    3
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Langkah 3</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mt-5">
                  <Navigation className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1B4D] mt-4">Pemberangkatan Moda</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Paket diberangkatkan dengan armada Darat (Truk), Laut (Kapal Kontainer), atau Udara (Pesawat).
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 relative hover:shadow-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-700 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-700/20">
                    4
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Langkah 4</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl mt-5">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#0B1B4D] mt-4">Tiba &amp; Terlacak</h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Paket tiba di alamat penerima dengan tanda terima digital dan riwayat status real-time.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Visi & Misi Section */}
      <section id="visimisi" className="py-20 bg-gradient-to-br from-[#0B1B4D] via-[#12308F] to-[#0B1B4D] text-white border-b border-blue-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">Komitmen Perusahaan</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">Visi &amp; Misi TRENS-LOGISTIC</h2>
            <p className="text-white/80 mt-3 text-base">Membangun konektivitas logistik nusantara yang efisien, terpercaya, dan inklusif.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Visi */}
            <div className="bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-2xl mb-6">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">Visi</h3>
                <p className="text-white/90 mt-4 leading-relaxed text-base">
                  Menjadi perusahaan logistik terpercaya nomor satu di Indonesia yang menghubungkan seluruh Nusantara melalui integrasi layanan darat, laut, dan udara yang cepat, aman, berteknologi modern, dan terjangkau bagi seluruh pelaku usaha.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/15 flex items-center gap-3 text-xs text-amber-300 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Standar Keamanan Berkelanjutan</span>
              </div>
            </div>

            {/* Misi */}
            <div className="bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-md shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center text-2xl mb-6">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Misi Kami</h3>
              <ul className="mt-4 space-y-4 text-sm text-white/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Memberikan layanan pengiriman cepat, aman, dan transparan di setiap moda: darat, laut, dan udara.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Menghubungkan seluruh kepulauan Indonesia melalui jaringan hub dan mitra logistik lokal yang andal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Mengutamakan kepuasan pelanggan dengan harga kompetitif, sistem pelacakan resi real-time, dan layanan pelanggan 24/7.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Membangun tim operasional yang profesional, berintegritas, dan tanggap terhadap kebutuhan pelanggan UMKM maupun korporasi.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
