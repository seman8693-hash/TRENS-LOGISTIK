import React, { useState, useMemo } from 'react';
import { 
  X, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Camera, 
  Package, 
  MapPin, 
  User, 
  Phone, 
  CircleDollarSign, 
  Sparkles,
  Truck,
  Ship,
  Plane,
  FileText
} from 'lucide-react';
import { TrackingItem, ShipmentStatus, ShipmentMode, TrackingCheckpoint } from '../../types';
import { PhotoUploadDropzone } from '../PhotoUploadDropzone';
import { rupiah, CITIES } from '../../data/logisticData';
import { getStoredPricelistRoutes, DEFAULT_PRICELIST_ROUTES } from '../../data/pricelistData';

interface UpdateCheckpointModalProps {
  isOpen: boolean;
  resi: string;
  item: TrackingItem;
  onClose: () => void;
  onUpdate: (resi: string, updatedItem: TrackingItem) => void;
}

type ModalTab = 'status_checkpoint' | 'detail_kargo' | 'foto_pod';

export const UpdateCheckpointModal: React.FC<UpdateCheckpointModalProps> = ({
  isOpen,
  resi,
  item,
  onClose,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('status_checkpoint');

  // Status & Checkpoints
  const [status, setStatus] = useState<ShipmentStatus>(item.status);
  const [newCheckpointText, setNewCheckpointText] = useState('');
  const [checkpoints, setCheckpoints] = useState<TrackingCheckpoint[]>([...(item.history || [])]);

  // Kargo & Rute Details
  const [namaBarang, setNamaBarang] = useState(item.nama || '');
  const [moda, setModa] = useState<ShipmentMode>(item.moda || 'Darat');
  
  // Parse route into origin and destination
  const initialParts = (item.rute || '').split(/→|-|ke/);
  const initialOrigin = item.senderCity || (initialParts[0]?.trim() || 'Jakarta');
  const initialDest = item.recipientCity || (initialParts[1]?.trim() || 'Surabaya');
  const [originCity, setOriginCity] = useState(initialOrigin);
  const [destCity, setDestCity] = useState(initialDest);

  const [weight, setWeight] = useState<number>(item.berat || item.weight || 1);
  const [colly, setColly] = useState<number>(item.colly || 1);
  const [cost, setCost] = useState<number>(item.cost || item.ongkirPokok || 0);

  // Sender & Recipient
  const [senderName, setSenderName] = useState(item.sender || '');
  const [senderPhone, setSenderPhone] = useState(item.senderPhone || '');
  const [senderAddress, setSenderAddress] = useState(item.senderAddress || '');

  const [recipientName, setRecipientName] = useState(item.recipient || '');
  const [recipientPhone, setRecipientPhone] = useState(item.recipientPhone || '');
  const [recipientAddress, setRecipientAddress] = useState(item.recipientAddress || '');
  const [notes, setNotes] = useState(item.notes || '');

  // Photos
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(item.photoUrl);
  const [photoProof, setPhotoProof] = useState<string | undefined>(item.photoProof);

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  const routes = useMemo(() => {
    const stored = getStoredPricelistRoutes();
    return stored.length > 0 ? stored : DEFAULT_PRICELIST_ROUTES;
  }, []);

  const originCities = useMemo(() => {
    const list = ['Jakarta', 'Jakarta Barat', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Tangerang', 'Bekasi', 'Bogor', 'Depok', 'Bandung', 'Semarang', 'Surabaya'];
    routes.forEach(r => {
      if (r.kotaAsal && !list.includes(r.kotaAsal)) list.push(r.kotaAsal);
    });
    return list;
  }, [routes]);

  const destinationCities = useMemo(() => {
    const list: string[] = [];
    routes.forEach(r => {
      if (r.kotaTujuan && !list.includes(r.kotaTujuan)) list.push(r.kotaTujuan);
    });
    Object.values(CITIES).forEach(c => {
      if (!list.includes(c.n)) list.push(c.n);
    });
    return list;
  }, [routes]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAutoHarga = () => {
    const qAsal = (originCity || '').trim().toLowerCase();
    const qTujuan = (destCity || '').trim().toLowerCase();

    if (!qTujuan) {
      showToast('Pilih atau ketik Kota Tujuan terlebih dahulu.');
      return;
    }

    let match = routes.find(r => {
      const rAsal = r.kotaAsal.toLowerCase();
      const rTujuan = r.kotaTujuan.toLowerCase();
      const asalMatch = !qAsal || rAsal.includes(qAsal) || qAsal.includes(rAsal);
      const tujuanMatch = rTujuan.includes(qTujuan) || qTujuan.includes(rTujuan);
      return asalMatch && tujuanMatch;
    });

    if (!match) {
      match = routes.find(r => {
        const rTujuan = r.kotaTujuan.toLowerCase();
        return rTujuan.includes(qTujuan) || qTujuan.includes(rTujuan);
      });
    }

    if (match) {
      const calcAmount = Math.round(match.tarifKg * Math.max(1, weight));
      setCost(calcAmount);
      setOriginCity(match.kotaAsal);
      setDestCity(match.kotaTujuan);
      showToast(`⚡ Auto Harga Diterapkan: Rp ${calcAmount.toLocaleString('id-ID')} (${match.kotaAsal} → ${match.kotaTujuan}, @Rp ${match.tarifKg.toLocaleString('id-ID')}/kg)`);
    } else {
      showToast(`⚠️ Rute "${originCity} → ${destCity}" belum ditemukan di master pricelist.`);
    }
  };

  const handleAddCheckpoint = () => {
    if (!newCheckpointText.trim()) return;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const timestamp = `${dateFormatted} ${timeFormatted}`;

    // Mark previous current checkpoints as done
    const updated = checkpoints.map((cp) => ({
      ...cp,
      s: (cp.s === 'current' ? 'done' : cp.s) as 'done' | 'current' | ''
    }));

    updated.push({
      w: timestamp,
      k: newCheckpointText.trim(),
      s: 'current'
    });

    setCheckpoints(updated);
    setNewCheckpointText('');
    showToast('Checkpoint baru ditambahkan ke riwayat!');
  };

  const handleRemoveCheckpoint = (index: number) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!namaBarang.trim()) {
      showToast('Nama barang tidak boleh kosong!');
      setActiveTab('detail_kargo');
      return;
    }

    const compiledRute = originCity && destCity ? `${originCity} → ${destCity}` : item.rute;

    const updatedItem: TrackingItem = {
      ...item,
      no: resi,
      nama: namaBarang.trim(),
      rute: compiledRute,
      moda,
      status,
      weight: Math.max(1, weight),
      berat: Math.max(1, weight),
      colly: Math.max(1, colly),
      cost,
      ongkirPokok: cost,
      sender: senderName.trim(),
      senderPhone: senderPhone.trim(),
      senderCity: originCity.trim(),
      senderAddress: senderAddress.trim(),
      recipient: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      recipientCity: destCity.trim(),
      recipientAddress: recipientAddress.trim(),
      notes: notes.trim(),
      history: checkpoints,
      photoUrl: photoUrl || undefined,
      photoProof: photoProof || undefined,
      photoTimestamp: (photoUrl || photoProof) ? (item.photoTimestamp || new Date().toLocaleString('id-ID')) : undefined
    };

    onUpdate(resi, updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1B4D] to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Edit &amp; Update Resi Pemuatan: {resi}</h3>
              <p className="text-xs text-blue-200 font-mono">
                {originCity} → {destCity} • Moda: {moda} • Status: {status}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold flex items-center gap-2 border-b border-amber-500">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('status_checkpoint')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'status_checkpoint'
                ? 'border-blue-700 text-blue-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>1. Status &amp; Checkpoint ({checkpoints.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('detail_kargo')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'detail_kargo'
                ? 'border-blue-700 text-blue-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>2. Edit Rincian Resi &amp; Kargo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('foto_pod')}
            className={`py-2.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'foto_pod'
                ? 'border-blue-700 text-blue-800 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>3. Dokumentasi Foto ({photoUrl || photoProof ? 'Ada' : '0'})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: STATUS & CHECKPOINT */}
          {activeTab === 'status_checkpoint' && (
            <div className="space-y-6">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-2">
                  Status Pengiriman Resi Saat Ini:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['Diproses', 'Dalam Perjalanan', 'Tiba di Kota Tujuan', 'Terkirim', 'Dibatalkan'] as ShipmentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2.5 px-2 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                        status === st
                          ? 'bg-[#0B1B4D] text-white border-[#0B1B4D] shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Tambah Checkpoint Baru */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-black uppercase text-slate-700">
                  Tambah Posisi / Checkpoint Baru:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Paket telah tiba di Hub Transit Surabaya dan siap sortir"
                    value={newCheckpointText}
                    onChange={(e) => setNewCheckpointText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCheckpoint();
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCheckpoint}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer shadow-xs active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500">Preset Cepat:</span>
                  {[
                    'Barang disortir di Hub Utama',
                    'Muatan diberangkatkan menuju Hub transit',
                    'Armada tiba di pelabuhan / pergudangan tujuan',
                    'Kurir sedang melakukan pengantaran ke penerima',
                    'Paket telah diserahterimakan dan diterima dengan baik'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCheckpointText(preset)}
                      className="text-[10px] bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 px-2 py-0.5 rounded-md text-slate-600 transition-colors cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Checkpoints */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span>Daftar Riwayat Perjalanan ({checkpoints.length} Titik)</span>
                </h4>
                
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {checkpoints.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Belum ada riwayat checkpoint.</p>
                  ) : (
                    checkpoints.map((cp, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                            cp.s === 'current' ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-blue-600'
                          }`} />
                          <div>
                            <p className="font-bold text-slate-800">{cp.k}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{cp.w}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCheckpoint(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Hapus checkpoint ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT DETAIL RESI & KARGO */}
          {activeTab === 'detail_kargo' && (
            <div className="space-y-5">
              {/* Nama Barang & Moda */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    NAMA BARANG / DESKRIPSI MUATAN *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaBarang}
                    onChange={(e) => setNamaBarang(e.target.value)}
                    placeholder="Contoh: Mesin Konveksi & Bahan Kain"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                    MODA TRANSPORTASI
                  </label>
                  <select
                    value={moda}
                    onChange={(e) => setModa(e.target.value as ShipmentMode)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold cursor-pointer"
                  >
                    <option value="Darat">🚛 Darat (Trucking/Van)</option>
                    <option value="Laut">🚢 Laut (Pelni/Cargo Ship)</option>
                    <option value="Udara">✈️ Udara (Air Cargo)</option>
                  </select>
                </div>
              </div>

              {/* Rute Asal & Tujuan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-700">
                    📍 KOTA ASAL PENGIRIM
                  </label>
                  <input
                    type="text"
                    list="ship-origin-list"
                    value={originCity}
                    onChange={(e) => setOriginCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  />
                  <datalist id="ship-origin-list">
                    {originCities.map((c, i) => <option key={i} value={c} />)}
                  </datalist>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="block text-[10px] font-black uppercase text-slate-700">
                    🏁 KOTA TUJUAN PENERIMA
                  </label>
                  <input
                    type="text"
                    list="ship-dest-list"
                    value={destCity}
                    onChange={(e) => setDestCity(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  />
                  <datalist id="ship-dest-list">
                    {destinationCities.map((c, i) => <option key={i} value={c} />)}
                  </datalist>
                </div>
              </div>

              {/* Berat, Colly & Biaya Ongkir */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <CircleDollarSign className="w-4 h-4 text-amber-600" />
                    <span>Fisik &amp; Tarif Ongkir</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAutoHarga}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                    title="Hitung ongkir otomatis dari master tarif pricelist"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>⚡ AUTO HARGA</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                      BERAT TOTAL (KG)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                      JUMLAH COLLY / KOLI
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={colly}
                      onChange={(e) => setColly(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                      TOTAL BIAYA / ONGKIR (RP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={cost}
                      onChange={(e) => setCost(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-black text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Data Pengirim & Penerima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pengirim */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-900 block">DATA PENGIRIM</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">NAMA PENGIRIM</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="PT / Nama Pengirim"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">NO HP PENGIRIM</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="0812..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Penerima */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-900 block">DATA PENERIMA</span>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">NAMA PENERIMA</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nama Penerima"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">NO HP PENERIMA</label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="0812..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">ALAMAT DETAIL</label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Alamat lengkap tujuan..."
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-600 mb-1">
                  CATATAN PENGIRIMAN / INSTRUKSI KHUSUS
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruksi handling, jadwal kirim, atau catatan khusus armada..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DOKUMENTASI FOTO */}
          {activeTab === 'foto_pod' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Foto Fisik Barang */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <PhotoUploadDropzone
                    label="Foto Fisik Barang / Paket"
                    subLabel="Dokumentasi fisik paket saat penimbangan atau di gudang"
                    currentPhotoUrl={photoUrl}
                    onPhotoChange={setPhotoUrl}
                  />
                </div>

                {/* Foto POD */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  status === 'Terkirim'
                    ? 'bg-emerald-50/70 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <PhotoUploadDropzone
                    label="Foto Bukti Penerimaan (POD)"
                    subLabel={
                      status === 'Terkirim'
                        ? 'Wajib / direkomendasikan untuk status Terkirim'
                        : 'Foto tanda tangan serah terima atau penerima di lokasi'
                    }
                    currentPhotoUrl={photoProof}
                    onPhotoChange={setPhotoProof}
                    required={status === 'Terkirim'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs font-mono font-bold text-slate-600">
              Biaya: <span className="text-blue-700">{rupiah(cost)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Perubahan Resi</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
