import React, { useState } from 'react';
import { X, Package, Truck, Ship, Plane, Calculator, Check, ArrowRight } from 'lucide-react';
import { ShipmentMode, TrackingItem, ShipmentStatus } from '../../types';
import { CITIES, DEFAULT_RATES, zonePair, rupiah, MIN_BIAYA } from '../../data/logisticData';
import { PhotoUploadDropzone } from '../PhotoUploadDropzone';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resi: string, item: TrackingItem) => void;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const generateResi = () => {
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `LN${yy}${mm}${dd}${rand}`;
  };

  const [resi, setResi] = useState(generateResi());
  const [namaBarang, setNamaBarang] = useState('');
  const [asal, setAsal] = useState('jakarta');
  const [tujuan, setTujuan] = useState('surabaya');
  const [moda, setModa] = useState<ShipmentMode>('Darat');
  const [sender, setSender] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [weight, setWeight] = useState<number>(10);
  const [panjang, setPanjang] = useState<number>(30);
  const [lebar, setLebar] = useState<number>(25);
  const [tinggi, setTinggi] = useState<number>(20);
  const [notes, setNotes] = useState('');
  const [customCost, setCustomCost] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  if (!isOpen) return null;

  // Calculate rate
  const zAsal = CITIES[asal]?.z || 'Jawa';
  const zTujuan = CITIES[tujuan]?.z || 'Jawa';
  const pair = zonePair(zAsal, zTujuan);
  const tarifKg = DEFAULT_RATES[moda]?.[pair] || 4000;

  // Volumetric calculation
  const divider = moda === 'Udara' ? 6000 : 4000;
  const volWeight = (panjang * lebar * tinggi) / divider;
  const chargeableWeight = Math.max(weight, Math.round(volWeight * 10) / 10);
  const calculatedCost = Math.max(MIN_BIAYA, Math.round(chargeableWeight * tarifKg));
  const finalCost = customCost !== null ? customCost : calculatedCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang || !sender || !recipient) {
      alert('Mohon lengkapi Nama Barang, Pengirim, dan Penerima');
      return;
    }

    const asalName = CITIES[asal]?.n || asal;
    const tujuanName = CITIES[tujuan]?.n || tujuan;
    const todayFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newItem: TrackingItem = {
      nama: namaBarang,
      rute: `${asalName} → ${tujuanName}`,
      moda,
      status: 'Diproses' as ShipmentStatus,
      sender,
      senderPhone: senderPhone || '-',
      recipient,
      recipientPhone: recipientPhone || '-',
      recipientAddress: recipientAddress || `${tujuanName}, Indonesia`,
      weight: chargeableWeight,
      cost: finalCost,
      date: todayFormatted,
      notes: notes || undefined,
      photoUrl: photoUrl || undefined,
      photoTimestamp: photoUrl ? `${todayFormatted} ${timeFormatted}` : undefined,
      history: [
        {
          w: `${todayFormatted} ${timeFormatted}`,
          k: `Resi terbit di Hub ${asalName}. Paket dalam proses administrasi & packaging.`,
          s: 'current'
        }
      ]
    };

    onSave(resi, newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0B1B4D] to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Input Resi &amp; Pengiriman Baru</h3>
              <p className="text-xs text-blue-200">Sistem Penomoran Resi Resmi TRENS-LOGISTIC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Baris 1: Nomor Resi & Moda */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nomor Resi (AWB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={resi}
                  onChange={(e) => setResi(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setResi(generateResi())}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline whitespace-nowrap"
                  title="Generate nomor acak"
                >
                  Acak
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Moda Transportasi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Darat', 'Laut', 'Udara'] as ShipmentMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModa(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      moda === m
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {m === 'Darat' && <Truck className="w-3.5 h-3.5" />}
                    {m === 'Laut' && <Ship className="w-3.5 h-3.5" />}
                    {m === 'Udara' && <Plane className="w-3.5 h-3.5" />}
                    <span>{m}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Baris 2: Detail Barang */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama &amp; Deskripsi Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Mesin Genset 5KVA, 4 Dus Pakaian Konveksi, dll"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Upload Foto Fisik Barang */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <PhotoUploadDropzone
              label="Foto Fisik Barang / Paket Kargo (Opsional)"
              subLabel="Tarik &amp; lepas foto atau ambil via kamera HP untuk bukti penerimaan fisik di gudang/hub"
              currentPhotoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
            />
          </div>

          {/* Baris 3: Rute Asal & Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota Asal Pengirim
              </label>
              <select
                value={asal}
                onChange={(e) => setAsal(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {Object.entries(CITIES).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.n} ({c.z})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota Tujuan Penerima
              </label>
              <select
                value={tujuan}
                onChange={(e) => setTujuan(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {Object.entries(CITIES).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.n} ({c.z})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Baris 4: Pengirim & Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box Pengirim */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2.5">
              <span className="text-xs font-bold text-blue-900 uppercase">Informasi Pengirim</span>
              <div>
                <input
                  type="text"
                  placeholder="Nama Pengirim / PT *"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="No. Telp / WhatsApp Pengirim"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            {/* Box Penerima */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2.5">
              <span className="text-xs font-bold text-emerald-900 uppercase">Informasi Penerima</span>
              <div>
                <input
                  type="text"
                  placeholder="Nama Penerima *"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="No. Telp Penerima"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Alamat Lengkap Penerima"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Baris 5: Berat, Dimensi, dan Ongkir Otomatis */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 uppercase">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Kalkulasi Berat &amp; Tarif Biaya</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  Berat Aktual (Kg)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  P (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={panjang}
                  onChange={(e) => setPanjang(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  L (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={lebar}
                  onChange={(e) => setLebar(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  T (cm)
                </label>
                <input
                  type="number"
                  min="1"
                  value={tinggi}
                  onChange={(e) => setTinggi(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="text-xs text-slate-600">
                <span>Berat Dikenakan: </span>
                <span className="font-bold text-blue-900">{chargeableWeight} Kg</span>
                <span className="text-slate-400 text-[10px] ml-1">
                  (Volumetrik: {Math.round(volWeight * 10) / 10} kg)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Total Biaya:</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  {rupiah(finalCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Baris 6: Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instruksi Khusus / Catatan
            </label>
            <input
              type="text"
              placeholder="Contoh: Jangan dibanting, simpan di tempat kering, dsb"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan &amp; Terbitkan Resi</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
