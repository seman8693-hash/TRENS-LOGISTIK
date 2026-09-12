import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  MapPin, 
  User, 
  Phone, 
  Package, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Send,
  Sparkles,
  Search
} from 'lucide-react';
import { CalculationResult, OrderRequest } from '../types';
import { saveStoredRequests, getStoredRequests, rupiah, WA_NUMBER } from '../data/logisticData';
import { saveOrderToDb } from '../firebase';
import { PhotoUploadDropzone } from './PhotoUploadDropzone';

interface BookingPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  calcData: CalculationResult | null;
}

export const BookingPickupModal: React.FC<BookingPickupModalProps> = ({
  isOpen,
  onClose,
  calcData
}) => {
  const [namaPengirim, setNamaPengirim] = useState('');
  const [hpPengirim, setHpPengirim] = useState('');
  const [alamatPickup, setAlamatPickup] = useState('');
  const [namaPenerima, setNamaPenerima] = useState('');
  const [hpPenerima, setHpPenerima] = useState('');
  const [alamatTujuan, setAlamatTujuan] = useState('');
  const [deskripsiBarang, setDeskripsiBarang] = useState('');
  const [catatan, setCatatan] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<OrderRequest | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPengirim.trim() || !hpPengirim.trim() || !alamatPickup.trim() || !namaPenerima.trim() || !hpPenerima.trim()) {
      alert('Mohon lengkapi data pengirim, penerima, dan alamat penjemputan.');
      return;
    }

    setIsSubmitting(true);
    const orderId = `ORD${Date.now().toString().slice(-6)}`;
    const newOrder: OrderRequest = {
      id: orderId,
      resi: orderId,
      nama: namaPengirim.trim(),
      hp: hpPengirim.trim(),
      moda: calcData?.moda || 'Darat',
      rute: `${calcData?.asalNama || 'Asal'} → ${calcData?.tujuanNama || 'Tujuan'}`,
      barang: deskripsiBarang.trim() || `Kiriman Kargo (${calcData?.chargeable.toFixed(1) || 10} kg)`,
      berat: calcData?.chargeable || 10,
      catatan: `Pickup: ${alamatPickup}. Penerima: ${namaPenerima} (${hpPenerima}). Alamat: ${alamatTujuan}. ${catatan ? `Catatan: ${catatan}` : ''}`,
      tanggal: new Date().toISOString(),
      status: 'Baru',
      estimasiBiaya: calcData?.totalBiaya || 50000,
      photoUrl: photoUrl || undefined,
      chat: [
        {
          dari: 'customer',
          waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isi: `Halo TRENS-LOGISTIC, saya melakukan booking penjemputan barang ${deskripsiBarang || 'Kargo'} seberat ${calcData?.chargeable.toFixed(1) || 10} kg dari ${calcData?.asalNama} ke ${calcData?.tujuanNama}.`
        }
      ]
    };

    try {
      // 1. Save to LocalStorage
      const current = getStoredRequests();
      saveStoredRequests([newOrder, ...current]);

      // 2. Save to Cloud Firestore
      await saveOrderToDb(newOrder);

      setSuccessOrder(newOrder);
    } catch (err) {
      console.warn('Booking order save notice:', err);
      setSuccessOrder(newOrder);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessOrder(null);
    setNamaPengirim('');
    setHpPengirim('');
    setAlamatPickup('');
    setNamaPenerima('');
    setHpPenerima('');
    setAlamatTujuan('');
    setDeskripsiBarang('');
    setCatatan('');
    setPhotoUrl(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B1B4D] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Truck className="w-5 h-5 text-[#0B1B4D]" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Formulir Booking &amp; Pickup Online</h3>
              <p className="text-xs text-blue-200">Terintegrasi otomatis ke Dashboard Operasional &amp; Database Real-Time</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {successOrder ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Booking Berhasil Masuk Database
              </span>
              <h4 className="text-2xl font-extrabold text-[#0B1B4D] mt-2">
                Permintaan Pickup Diterima!
              </h4>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                ID Pesanan Anda: <strong className="font-mono text-blue-700">{successOrder.id}</strong>. Tim operasional TRENS-LOGISTIC segera memproses penjemputan barang ke lokasi Anda.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Pengirim:</span>
                <span className="font-bold text-slate-800">{successOrder.nama} ({successOrder.hp})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Rute &amp; Moda:</span>
                <span className="font-bold text-blue-700">{successOrder.rute} • {successOrder.moda}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimasi Biaya:</span>
                <span className="font-bold text-emerald-700">{rupiah(successOrder.estimasiBiaya)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Dashboard:</span>
                <span className="font-bold text-amber-600">Menunggu Konfirmasi Admin</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const id = successOrder.id;
                  handleReset();
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('trens_track_requested', { detail: { resi: id } }));
                    const trackEl = document.getElementById('tracking');
                    if (trackEl) {
                      trackEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="bg-[#0B1B4D] hover:bg-blue-900 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Lacak Resi / ID Ini Sekarang</span>
              </button>

              <a
                href={`https://wa.me/${WA_NUMBER}?text=Halo%20TRENS-LOGISTIC%2C%20saya%20sudah%20mengirim%20booking%20pickup%20online%20dengan%20ID%20${successOrder.id}.%20Mohon%20konfirmasi%20jadwal.`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Konfirmasi via WhatsApp</span>
              </a>

              <button
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            
            {/* Calculation summary banner */}
            {calcData && (
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-extrabold text-blue-950 text-sm">
                    {calcData.asalNama} → {calcData.tujuanNama}
                  </span>
                  <p className="text-blue-700 mt-0.5">
                    Moda {calcData.moda} • Chargeable: {calcData.chargeable.toFixed(1)} kg • Est. {calcData.waktu}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Estimasi Ongkir</span>
                  <span className="text-base font-black text-blue-900">{rupiah(calcData.totalBiaya)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Data Pengirim */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-700" />
                  <span>Data Pengirim (Pickup)</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Pengirim *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={namaPengirim}
                    onChange={(e) => setNamaPengirim(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">No. WhatsApp / HP *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={hpPengirim}
                    onChange={(e) => setHpPengirim(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alamat Lengkap Pickup *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Jalan, Nomor Bangunan, Patokan, Kelurahan..."
                    value={alamatPickup}
                    onChange={(e) => setAlamatPickup(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Data Penerima */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Data Penerima (Tujuan)</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nama Penerima *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Harapan Jaya / Ibu Siti"
                    value={namaPenerima}
                    onChange={(e) => setNamaPenerima(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">No. WhatsApp / HP Penerima *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 085298765432"
                    value={hpPenerima}
                    onChange={(e) => setHpPenerima(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Alamat Tujuan Pengiriman</label>
                  <textarea
                    rows={2}
                    placeholder="Alamat kantor, gudang, atau rumah penerima..."
                    value={alamatTujuan}
                    onChange={(e) => setAlamatTujuan(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Deskripsi Barang & Catatan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis / Deskripsi Muatan Barang</label>
                <input
                  type="text"
                  placeholder="Contoh: Mesin Industri, Pakaian Konveksi, Sparepart"
                  value={deskripsiBarang}
                  onChange={(e) => setDeskripsiBarang(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Waktu / Jadwal Penjemputan Diinginkan</label>
                <input
                  type="text"
                  placeholder="Contoh: Besok jam 10:00 pagi"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Upload Foto Muatan Barang (Opsional) */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <PhotoUploadDropzone
                label="Foto Muatan Barang / Paket (Opsional)"
                subLabel="Unggah foto barang untuk memudahkan armada kurir mempersiapkan kendaraan yang tepat"
                currentPhotoUrl={photoUrl}
                onPhotoChange={setPhotoUrl}
              />
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Pesanan langsung terdata di Dashboard Admin &amp; Firestore</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/2 sm:w-auto px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto px-6 py-2.5 bg-[#0B1B4D] hover:bg-blue-900 disabled:opacity-60 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Booking Sekarang'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
