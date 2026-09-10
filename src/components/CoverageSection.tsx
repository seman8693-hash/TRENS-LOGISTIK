import React from 'react';
import { 
  MapPin, 
  Receipt, 
  Search, 
  Globe2, 
  Headphones, 
  Sparkles,
  ShieldCheck,
  Zap,
  Building2
} from 'lucide-react';

export const CoverageSection: React.FC = () => {
  const regions = [
    {
      name: 'Pulau Jawa',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      cities: ['Jakarta', 'Bandung', 'Semarang', 'Yogyakarta', 'Surabaya']
    },
    {
      name: 'Sumatera',
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      cities: ['Medan', 'Padang', 'Palembang', 'Pekanbaru', 'Bandar Lampung']
    },
    {
      name: 'Kalimantan',
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      cities: ['Pontianak', 'Banjarmasin', 'Balikpapan', 'Samarinda']
    },
    {
      name: 'Sulawesi',
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      cities: ['Makassar', 'Manado', 'Palu', 'Kendari']
    },
    {
      name: 'Bali & Nusa Tenggara',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      cities: ['Denpasar', 'Mataram', 'Kupang']
    },
    {
      name: 'Papua & Maluku',
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      cities: ['Jayapura', 'Sorong', 'Ambon', 'Timika']
    }
  ];

  return (
    <>
      {/* Coverage Section */}
      <section id="coverage" className="py-20 bg-white border-b border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Globe2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Jangkauan Luas</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
              Menjangkau Seluruh Nusantara
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Didukung oleh jaringan perwakilan agen resmi dan armada lintas pulau dari Sabang hingga Merauke.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.map((reg, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-3xl border ${reg.borderColor} ${reg.bgColor} hover:shadow-md transition-all flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-xs flex items-center justify-center">
                      <MapPin className={`w-5 h-5 ${reg.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-[#0B1B4D] text-base">{reg.name}</h3>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Kota Utama:</strong> {reg.cities.join(', ')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 text-[11px] text-slate-500 font-medium">
                  <span>Darat, Laut &amp; Udara Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section id="keunggulan" className="py-20 bg-[#0B1B4D] text-white border-b border-blue-950 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">Kenapa Memilih Kami</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">Keunggulan Layanan TRENS-LOGISTIC</h2>
            <p className="text-white/80 mt-3 text-base">Standar pelayanan prima untuk kelancaran distribusi logistik bisnis Anda.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl mb-5">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">Harga Transparan</h3>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                Biaya terhitung rinci tanpa tagihan tak terduga. Rumus volumetrik jelas dan terstandardisasi.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl mb-5">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">Barang Terlacak Real-Time</h3>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                Setiap perpindahan barang dicatat dalam sistem checkpoint resi yang dapat diakses publik 24 jam.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl mb-5">
                <Globe2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">Jaringan Lintas Pulau</h3>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                Kerjasama resmi dengan armada pelayaran BUMN/swasta dan maskapai kargo penerbangan nasional.
              </p>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-3xl p-6 backdrop-blur-md hover:bg-white/15 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-2xl mb-5">
                <Headphones className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold">Layanan Pelanggan 24/7</h3>
              <p className="text-sm text-white/80 mt-2 leading-relaxed">
                Admin ramah dan sigap membantu via WhatsApp untuk konsultasi rute, tarif, dan update pengiriman.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};
