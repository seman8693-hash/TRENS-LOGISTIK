import React, { useState } from 'react';
import { X, Navigation, CheckCircle2, Clock, Plus, Trash2, ArrowRight, Camera } from 'lucide-react';
import { TrackingItem, ShipmentStatus, TrackingCheckpoint } from '../../types';
import { PhotoUploadDropzone } from '../PhotoUploadDropzone';

interface UpdateCheckpointModalProps {
  isOpen: boolean;
  resi: string;
  item: TrackingItem;
  onClose: () => void;
  onUpdate: (resi: string, updatedItem: TrackingItem) => void;
}

export const UpdateCheckpointModal: React.FC<UpdateCheckpointModalProps> = ({
  isOpen,
  resi,
  item,
  onClose,
  onUpdate
}) => {
  const [status, setStatus] = useState<ShipmentStatus>(item.status);
  const [newCheckpointText, setNewCheckpointText] = useState('');
  const [checkpoints, setCheckpoints] = useState<TrackingCheckpoint[]>([...item.history]);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(item.photoUrl);
  const [photoProof, setPhotoProof] = useState<string | undefined>(item.photoProof);

  if (!isOpen) return null;

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
  };

  const handleRemoveCheckpoint = (index: number) => {
    setCheckpoints(checkpoints.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedItem: TrackingItem = {
      ...item,
      status,
      history: checkpoints,
      photoUrl: photoUrl || undefined,
      photoProof: photoProof || undefined,
      photoTimestamp: (photoUrl || photoProof) ? (item.photoTimestamp || new Date().toLocaleString('id-ID')) : undefined
    };
    onUpdate(resi, updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B1B4D] to-blue-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">Update Status &amp; Checkpoint Resi</h3>
              <p className="text-xs text-blue-200 font-mono">AWB: {resi} • {item.rute}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
              Status Pengiriman Saat Ini:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Diproses', 'Dalam Perjalanan', 'Tiba di Kota Tujuan', 'Terkirim'] as ShipmentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                    status === st
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs ring-2 ring-blue-500/20'
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
            <label className="block text-xs font-bold uppercase text-slate-700">
              Tambah Posisi / Checkpoint Baru:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Paket sedang dalam perjalanan armada darat via Tol Trans Jawa"
                value={newCheckpointText}
                onChange={(e) => setNewCheckpointText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCheckpoint();
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddCheckpoint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500">Preset Cepat:</span>
              {[
                'Barang disortir di Hub Utama',
                'Muatan diberangkatkan menuju pelabuhan/bandara',
                'Armada tiba di Hub kota transit',
                'Kurir sedang melakukan pengantaran ke penerima',
                'Paket telah diterima dengan baik di alamat tujuan'
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewCheckpointText(preset)}
                  className="text-[10px] bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 px-2 py-0.5 rounded-md text-slate-600 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Checkpoints */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-600 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Daftar Riwayat Perjalanan ({checkpoints.length} Titik)</span>
            </h4>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {checkpoints.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat checkpoint.</p>
              ) : (
                checkpoints.map((cp, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                        cp.s === 'current' ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-blue-600'
                      }`} />
                      <div>
                        <p className="font-semibold text-slate-800">{cp.k}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{cp.w}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckpoint(idx)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Hapus checkpoint ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section Upload Foto: Fisik Paket & Bukti Pengiriman (POD) */}
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-blue-700" />
              <span>Dokumentasi Foto Pengiriman</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foto Fisik Barang / Paket */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <PhotoUploadDropzone
                  label="Foto Fisik Barang / Paket"
                  subLabel="Foto paket saat penimbangan atau di gudang hub"
                  currentPhotoUrl={photoUrl}
                  onPhotoChange={setPhotoUrl}
                />
              </div>

              {/* Foto Bukti Serah Terima (POD) */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                status === 'Terkirim'
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <PhotoUploadDropzone
                  label="Foto Bukti Penerimaan (POD)"
                  subLabel={
                    status === 'Terkirim'
                      ? 'Wajib / direkomendasikan untuk status Terkirim'
                      : 'Foto serah terima tanda tangan / penerima di lokasi'
                  }
                  currentPhotoUrl={photoProof}
                  onPhotoChange={setPhotoProof}
                  required={status === 'Terkirim'}
                />
              </div>
            </div>
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
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
