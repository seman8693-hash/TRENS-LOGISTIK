import React, { useState } from 'react';
import { 
  Star, 
  ChevronDown, 
  HelpCircle, 
  MessageSquareQuote, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Truck, 
  MessageCircle, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { WA_NUMBER } from '../data/logisticData';

export const TestimoniFaqSection: React.FC = () => {
  const testimonials = [
    {
      nama: 'Budi Santoso',
      role: 'Owner Toko Elektronik',
      lokasi: 'Jakarta Barat',
      inisial: 'BS',
      avatarBg: 'bg-blue-100 text-blue-700',
      text: 'Pengiriman sparepart komputer Jakarta ke Medan sampai lebih cepat dari perkiraan. Packing kayu & bubble wrap rapi, barang aman tanpa cacat.'
    },
    {
      nama: 'Rina Wulandari',
      role: 'UMKM Fashion & Kain Batik',
      lokasi: 'Surabaya',
      inisial: 'RW',
      avatarBg: 'bg-emerald-100 text-emerald-700',
      text: 'Harga sangat transparan dan tidak ada biaya tersembunyi saat barang tiba. Sudah berlangganan pengiriman kargo darat & laut setiap pekan.'
    },
    {
      nama: 'Andi Pratama',
      role: 'Pengusaha Furniture & Interior',
      lokasi: 'Makassar',
      inisial: 'AP',
      avatarBg: 'bg-purple-100 text-purple-700',
      text: 'Tim customer care sangat tanggap di WhatsApp. Paket kiriman berat lewat kontainer laut selalu terpantau statusnya di tracking web.'
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana cara menghitung estimasi ongkos kirim?',
      a: 'Masukkan rute kota asal, tujuan, berat aktual timbangan, dan dimensi paket (Panjang × Lebar × Tinggi) di Kalkulator Tarif. Biaya dihitung dari berat chargeable (nilai tertinggi antara berat fisik vs berat volumetrik: P × L × T ÷ 4000 untuk Darat/Laut, dan ÷ 5000/6000 untuk Udara).'
    },
    {
      q: 'Berapa lama estimasi pengiriman barang sampai ke tujuan?',
      a: 'Tergantung moda yang Anda pilih: Jalur Darat (1 – 14 hari sesuai jarak rute), Jalur Laut (2 – 16 hari sesuai jadwal sandar kapal), dan Kargo Udara (1 – 3 hari ekspres).'
    },
    {
      q: 'Apakah TRENS-LOGISTIC melayani penjemputan barang (Door to Door)?',
      a: 'Ya, kami melayani penjemputan gratis ke gudang, kantor, atau rumah Anda untuk pengiriman dengan berat minimum tertentu. Cukup cantumkan alamat penjemputan pada form pemesanan atau infokan via WhatsApp.'
    },
    {
      q: 'Bagaimana dengan asuransi dan jaminan keamanan barang?',
      a: 'Setiap pengiriman pertama mendapatkan gratis packing & asuransi perlindungan dasar. Untuk kiriman berharga tinggi berikutnya, Anda dapat menambahkan proteksi asuransi all-risk dengan premi sangat terjangkau.'
    },
    {
      q: 'Jenis barang apa saja yang dilarang untuk dikirim?',
      a: 'Bahan mudah meledak/terbakar (flammable dangerous goods tanpa sertifikasi), narkotika & zat terlarang, senjata api/tajam ilegal, hewan langka yang dilindungi, serta uang tunai & perhiasan tanpa deklarasi khusus.'
    },
    {
      q: 'Bagaimana cara memantau status posisi kiriman saya?',
      a: 'Gunakan nomor resi / AWB resmi yang Anda dapatkan saat pemesanan lalu masukkan ke menu Tracking Pengiriman di website ini. Status akan diperbarui secara real-time di setiap transit hub.'
    }
  ];

  return (
    <>
      {/* Testimoni Section */}
      <section id="testimoni" className="py-20 bg-white border-b border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              <MessageSquareQuote className="w-3.5 h-3.5 text-blue-600" />
              <span>Testimoni Pelanggan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
              Kepercayaan Mitra &amp; Pelanggan
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              Ratusan UMKM dan perusahaan telah mempercayakan distribusi logistik mereka kepada TRENS-LOGISTIC.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-3xl p-7 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-200 flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl ${item.avatarBg} font-black flex items-center justify-center text-sm shadow-2xs`}>
                    {item.inisial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0B1B4D]">{item.nama}</p>
                    <p className="text-xs text-slate-500">{item.role} • {item.lokasi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200/80 scroll-mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Pusat Informasi</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Temukan jawaban cepat seputar ketentuan pengiriman, tarif, dan tracking armada.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all open:ring-2 open:ring-blue-100 open:border-blue-300"
              >
                <summary className="font-bold text-[#0B1B4D] text-sm sm:text-base cursor-pointer list-none flex items-center justify-between gap-4 select-none">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-blue-700 transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
