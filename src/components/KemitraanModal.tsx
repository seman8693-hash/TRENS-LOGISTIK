import React, { useState } from 'react';
import { 
  X, 
  Handshake, 
  Store, 
  Truck, 
  Building2, 
  UserCheck, 
  CheckCircle2, 
  Percent, 
  Send,
  MessageCircle,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { WA_NUMBER, WA_NUMBER_DISPLAY, getStoredPartners, saveStoredPartners } from '../data/logisticData';
import { PartnerLead } from '../types';
import { savePartnerToDb } from '../firebase';

interface KemitraanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KemitraanModal: React.FC<KemitraanModalProps> = ({ isOpen, onClose }) => {
  const [tipeKemitraan, setTipeKemitraan] = useState<'agen' | 'armada' | 'korporat' | 'kurir'>('agen');
  const [nama, setNama] = useState('');
  const [perusahaan, setPerusahaan] = useState('');
  const [noHp, setNoHp] = useState('');
  const [kota, setKota] = useState('');
  const [pesan, setPesan] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const getTipeLabel = (tipe: string) => {
    switch (tipe) {
      case 'agen': return 'Agen / Gerai Drop Point';
      case 'armada': return 'Mitra Armada & Transporter';
      case 'korporat': return 'Mitra Korporat & B2B';
      case 'kurir': return 'Mitra Kurir Pickup & Delivery';
      default: return 'Kemitraan Pengiriman';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !noHp || !kota) {
      alert('Mohon lengkapi Nama, Nomor WhatsApp, dan Kota Operasional.');
      return;
    }

    const textWa = `Halo Tim Kemitraan TRENS-LOGISTIC, saya ingin mendaftar kemitraan pengiriman:%0A%0A` +
      `*Pendaftaran Kemitraan Pengiriman:*%0A` +
      `• *Jenis Kemitraan:* ${getTipeLabel(tipeKemitraan)}%0A` +
      `• *Nama Pemohon:* ${encodeURIComponent(nama)}%0A` +
      (perusahaan ? `• *Nama Usaha/PT:* ${encodeURIComponent(perusahaan)}%0A` : '') +
      `• *No. WhatsApp/HP:* ${encodeURIComponent(noHp)}%0A` +
      `• *Kota/Domisili:* ${encodeURIComponent(kota)}%0A` +
      (pesan ? `• *Catatan Tambahan:* ${encodeURIComponent(pesan)}%0A` : '') +
      `%0AMohon informasi syarat & langkah kerjasama selanjutnya. Terima kasih!`;

    // Persist to partners list for Dashboard integration & Cloud Firestore
    try {
      const current = getStoredPartners();
      const newLead: PartnerLead = {
        id: 'PTR' + Date.now().toString().slice(-6),
        nama,
        perusahaan: perusahaan || undefined,
        tipe: tipeKemitraan,
        noHp,
        kota,
        pesan: pesan || undefined,
        tanggal: new Date().toISOString(),
        status: 'Menunggu'
      };
      saveStoredPartners([newLead, ...current]);
      savePartnerToDb(newLead).catch((err) => {
        console.warn('Firestore save partner error:', err);
      });
    } catch (e) {
      console.error('Failed to save partner lead', e);
    }

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${textWa}`;
    window.open(waUrl, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#0B1B4D] via-blue-900 to-indigo-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Peluang Bisnis &amp; Kerjasama Pengiriman</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Handshake className="w-6 h-6 text-amber-400 shrink-0" />
            <span>Formulir Pendaftaran Kemitraan</span>
          </h3>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
            Bergabunglah bersama jaringan TRENS-LOGISTIC di seluruh Nusantara. Nikmati kenyamanan dan safety barang Anda dengan tracking layanan kami dan banyak keuntungan.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil Dikirim!</h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Data pendaftaran kemitraan Anda telah diarahkan ke tim Kemitraan CS WhatsApp TRENS-LOGISTIC (<strong>{WA_NUMBER_DISPLAY}</strong>). Kami akan segera memverifikasi dan menghubungi Anda.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
                >
                  Selesai &amp; Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Pilihan Jenis Kemitraan */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  1. Pilih Jenis Kemitraan Pengiriman:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  
                  {/* Agen Drop Point */}
                  <button
                    type="button"
                    onClick={() => setTipeKemitraan('agen')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      tipeKemitraan === 'agen'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      tipeKemitraan === 'agen' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Gerai / Agen</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Komisi s/d 25%</p>
                    </div>
                  </button>

                  {/* Mitra Armada */}
                  <button
                    type="button"
                    onClick={() => setTipeKemitraan('armada')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      tipeKemitraan === 'armada'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      tipeKemitraan === 'armada' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Mitra Armada</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Truk / Kontainer</p>
                    </div>
                  </button>

                  {/* Mitra Korporat */}
                  <button
                    type="button"
                    onClick={() => setTipeKemitraan('korporat')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      tipeKemitraan === 'korporat'
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      tipeKemitraan === 'korporat' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">B2B Korporat</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Kontrak Bisnis</p>
                    </div>
                  </button>

                  {/* Mitra Kurir */}
                  <button
                    type="button"
                    onClick={() => setTipeKemitraan('kurir')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      tipeKemitraan === 'kurir'
                        ? 'border-amber-600 bg-amber-50/80 text-amber-900 shadow-xs ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      tipeKemitraan === 'kurir' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Mitra Kurir</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Same Day / Pickup</p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Detail Ringkas Manfaat Sesuai Pilihan */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  {tipeKemitraan === 'agen' && (
                    <span><strong>Keuntungan Gerai:</strong> Nikmati kemudahan sistem POS resi online gratis, live tracking terpadu, spanduk resmi &amp; pelatihan operasional.</span>
                  )}
                  {tipeKemitraan === 'armada' && (
                    <span><strong>Keuntungan Transporter:</strong> Muatan kargo rutin harian, pembayaran transparan &amp; jaminan rute antar kota / pulau.</span>
                  )}
                  {tipeKemitraan === 'korporat' && (
                    <span><strong>Keuntungan B2B:</strong> Tarif khusus volume besar, Dedicated Account Manager, Term of Payment (TOP) &amp; API Integrasi Resi.</span>
                  )}
                  {tipeKemitraan === 'kurir' && (
                    <span><strong>Keuntungan Kurir:</strong> Insentif harian kompetitif, fleksibilitas area pengantaran &amp; bonus performa pengiriman kilat.</span>
                  )}
                </div>
              </div>

              {/* Data Formulir Pendaftaran */}
              <div className="space-y-3.5">
                <label className="block text-xs font-bold uppercase text-slate-600">
                  2. Lengkapi Data Pendaftar:
                </label>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap / PIC <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Usaha / Toko / PT (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Toko Berkah / PT Mandiri"
                      value={perusahaan}
                      onChange={(e) => setPerusahaan(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 08123456789"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kota / Wilayah Operasional <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Jakarta Utara / Surabaya"
                      value={kota}
                      onChange={(e) => setKota(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Catatan Tambahan / Spesifikasi Armada / Lokasi Gerai
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Memiliki ruko pinggir jalan raya siap pakai / Memiliki 2 unit CDD box..."
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 text-center sm:text-left">
                  🔒 Data Anda aman &amp; akan langsung diverifikasi oleh CS Kemitraan Resmi.
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-3 text-xs rounded-xl shadow-md shadow-blue-900/10 transition-all hover:scale-102"
                >
                  <Handshake className="w-4 h-4 text-amber-300" />
                  <span>Kirim Pendaftaran via WhatsApp</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
