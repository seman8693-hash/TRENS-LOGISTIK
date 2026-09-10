import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Package, 
  MapPin, 
  Truck, 
  Ship, 
  Plane, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw,
  RotateCcw,
  Printer,
  Sparkles
} from 'lucide-react';
import { TrackingItem } from '../types';
import { getStoredTracks, saveStoredTracks, rupiah } from '../data/logisticData';
import { getShipmentFromDb, isFirebaseReady } from '../firebase';

interface TrackingSectionProps {
  onPrintLabel?: (resi: string, track: TrackingItem) => void;
}

export const TrackingSection: React.FC<TrackingSectionProps> = ({ onPrintLabel }) => {
  const [resiInput, setResiInput] = useState('');
  const [activeTrack, setActiveTrack] = useState<{ no: string; data: TrackingItem; fromFirestore?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResetSearch = () => {
    setResiInput('');
    setActiveTrack(null);
    setErrorMsg(null);
  };

  const handleSearch = async (customResi?: string) => {
    const targetNo = (customResi || resiInput).trim().toUpperCase();
    if (!targetNo) {
      setErrorMsg('Silakan masukkan nomor resi pengiriman Anda.');
      setActiveTrack(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. First check Firestore Cloud Database
      let found: TrackingItem | null = null;
      let fromFirestore = false;

      if (isFirebaseReady) {
        found = await getShipmentFromDb(targetNo);
        if (found) {
          fromFirestore = true;
          // Cache locally
          const local = getStoredTracks();
          local[targetNo] = found;
          saveStoredTracks(local);
        }
      }

      // 2. Fallback to local storage if Firestore returned null
      if (!found) {
        const allTracks = getStoredTracks();
        found = allTracks[targetNo] || null;
      }

      if (!found) {
        setErrorMsg(`Nomor resi "${targetNo}" tidak ditemukan dalam database pengiriman.`);
        setActiveTrack(null);
      } else {
        setErrorMsg(null);
        setActiveTrack({ no: targetNo, data: found, fromFirestore });
      }
    } catch (err) {
      console.warn('Search error:', err);
      // Fallback
      const allTracks = getStoredTracks();
      const localFound = allTracks[targetNo];
      if (localFound) {
        setActiveTrack({ no: targetNo, data: localFound, fromFirestore: false });
      } else {
        setErrorMsg(`Gagal memuat status resi. Pastikan koneksi internet aktif.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyResi = () => {
    if (!activeTrack) return;
    navigator.clipboard.writeText(activeTrack.no);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Terkirim':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dalam Perjalanan':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Tiba di Kota Tujuan':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Diproses':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'Laut':
        return <Ship className="w-4 h-4 text-teal-600" />;
      case 'Udara':
        return <Plane className="w-4 h-4 text-sky-600" />;
      default:
        return <Truck className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <section id="tracking" className="py-20 bg-white border-b border-slate-200/80 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Lacak Paket Nusantara</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B4D] tracking-tight">
            Tracking Posisi &amp; Status Pengiriman
          </h2>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">
            Pantau status barang dan riwayat perjalanan armada secara real-time.
          </p>
        </div>

        {/* Resi Search Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                id="resiInput"
                type="text"
                value={resiInput}
                onChange={(e) => setResiInput(e.target.value.toUpperCase())}
                placeholder="Masukkan No. Resi (contoh: LN25083001)"
                className="w-full bg-white border border-slate-300 focus:border-blue-700 rounded-xl px-4 py-3.5 text-sm sm:text-base font-mono font-bold tracking-wider text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 uppercase"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-track-submit"
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none bg-[#0B1B4D] hover:bg-blue-800 disabled:opacity-60 text-white font-bold px-6 py-3.5 rounded-xl text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Lacak Paket</span>
                  </>
                )}
              </button>
              <button
                id="btn-track-reset"
                type="button"
                onClick={handleResetSearch}
                className="px-4 py-3.5 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Kosongkan pencarian resi"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* Initial Empty State Helper */}
        {!activeTrack && !errorMsg && (
          <div className="mt-6 p-8 rounded-3xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-3">
              <Package className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Lacak Status Kiriman Anda</h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1">
              Ketik nomor resi / AWB resmi yang Anda peroleh dari admin untuk melihat posisi muatan dan rincian perjalanan barang Anda.
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMsg && (
          <div className="mt-6 p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold text-sm">Resi Tidak Ditemukan</p>
              <p className="text-xs text-rose-700 mt-1">{errorMsg}</p>
              <p className="text-xs text-slate-600 mt-2">
                Pastikan nomor resi ditulis tanpa spasi atau tanyakan ke admin kami via WhatsApp jika baru saja melakukan pemesanan.
              </p>
            </div>
          </div>
        )}

        {/* Tracking Details Result Card */}
        {activeTrack && (
          <div className="mt-8 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md">
            
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nomor Resi / AWB</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-[#0B1B4D]">
                    {activeTrack.no}
                  </span>
                  <button
                    onClick={copyResi}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Salin Nomor Resi"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-[11px]">{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeTrack.fromFirestore && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Cloud Firestore Live</span>
                  </span>
                )}

                <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold border ${getStatusBadge(activeTrack.data.status)}`}>
                  ● {activeTrack.data.status}
                </span>

                {onPrintLabel && (
                  <button
                    onClick={() => onPrintLabel(activeTrack.no, activeTrack.data)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                    title="Cetak Struk / Label Resi"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Cetak Label</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Nama Barang</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{activeTrack.data.nama}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Rute Pengiriman</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{activeTrack.data.rute}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Moda Pengiriman</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                  {getModeIcon(activeTrack.data.moda)}
                  <span>{activeTrack.data.moda}</span>
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Berat &amp; Ongkir</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">
                  {activeTrack.data.weight ? `${activeTrack.data.weight} kg` : '-'} 
                  {activeTrack.data.cost ? ` • ${rupiah(activeTrack.data.cost)}` : ''}
                </p>
              </div>
            </div>

            {/* Additional details if present */}
            {(activeTrack.data.recipient || activeTrack.data.sender) && (
              <div className="grid sm:grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs bg-slate-50/70 rounded-2xl p-4 my-4">
                {activeTrack.data.sender && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Pengirim</span>
                    <p className="font-bold text-slate-800">{activeTrack.data.sender}</p>
                    {activeTrack.data.senderPhone && <p className="text-slate-500">{activeTrack.data.senderPhone}</p>}
                  </div>
                )}
                {activeTrack.data.recipient && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Penerima &amp; Alamat</span>
                    <p className="font-bold text-slate-800">{activeTrack.data.recipient}</p>
                    {activeTrack.data.recipientAddress && <p className="text-slate-600 mt-0.5">{activeTrack.data.recipientAddress}</p>}
                  </div>
                )}
              </div>
            )}

            {/* Checkpoint Timeline */}
            <div className="pt-6">
              <h4 className="text-sm font-bold text-[#0B1B4D] mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-700" />
                <span>Riwayat Checkpoint Perjalanan</span>
              </h4>

              <div className="space-y-0 pl-2">
                {activeTrack.data.history.map((step, idx) => {
                  const isLast = idx === activeTrack.data.history.length - 1;
                  const isCurrent = step.s === 'current';
                  const isDone = step.s === 'done';

                  return (
                    <div key={idx} className="flex gap-4 relative">
                      {/* Vertical line indicator */}
                      <div className="flex flex-col items-center">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                          isDone 
                            ? 'bg-emerald-600 border-emerald-600' 
                            : isCurrent 
                              ? 'bg-blue-700 border-blue-700 ring-4 ring-blue-100' 
                              : 'bg-white border-slate-300'
                        }`} />
                        {!isLast && (
                          <div className={`w-0.5 flex-1 my-1 min-h-[36px] ${
                            isDone ? 'bg-emerald-500' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>

                      {/* Timeline content */}
                      <div className="pb-6">
                        <span className="text-[11px] font-bold text-slate-400">
                          {step.w}
                        </span>
                        <p className={`text-sm mt-0.5 ${
                          isCurrent 
                            ? 'font-extrabold text-blue-700' 
                            : isDone 
                              ? 'font-semibold text-slate-800' 
                              : 'text-slate-400 font-medium'
                        }`}>
                          {step.k}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
