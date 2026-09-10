import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  Printer, 
  Edit3, 
  Trash2, 
  Download, 
  Clock, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Truck,
  Ship,
  Plane,
  AlertCircle,
  Camera,
  ZoomIn,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { TrackingItem, ShipmentStatus, ShipmentMode } from '../../types';
import { rupiah } from '../../data/logisticData';

interface DashboardShipmentsProps {
  tracks: Record<string, TrackingItem>;
  onOpenCreateShipment: () => void;
  onSelectUpdateResi: (resi: string) => void;
  onPrintLabel: (resi: string, item: TrackingItem) => void;
  onDeleteResi: (resi: string) => void;
}

export const DashboardShipments: React.FC<DashboardShipmentsProps> = ({
  tracks,
  onOpenCreateShipment,
  onSelectUpdateResi,
  onPrintLabel,
  onDeleteResi
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [modaFilter, setModaFilter] = useState<string>('Semua');
  const [expandedResi, setExpandedResi] = useState<string | null>(null);
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  const entries = Object.entries(tracks) as [string, TrackingItem][];

  // Filter logic
  const filtered = entries.filter(([resi, item]) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      resi.toLowerCase().includes(q) ||
      item.nama.toLowerCase().includes(q) ||
      item.rute.toLowerCase().includes(q) ||
      (item.sender && item.sender.toLowerCase().includes(q)) ||
      (item.recipient && item.recipient.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;
    const matchModa = modaFilter === 'Semua' || item.moda === modaFilter;

    return matchSearch && matchStatus && matchModa;
  });

  const handleExportCSV = () => {
    const headers = ['No Resi', 'Nama Barang', 'Rute', 'Moda', 'Status', 'Berat (Kg)', 'Biaya (Rp)', 'Pengirim', 'Penerima'];
    const rows = filtered.map(([resi, t]) => [
      resi,
      `"${t.nama.replace(/"/g, '""')}"`,
      `"${t.rute}"`,
      t.moda,
      t.status,
      t.weight || 0,
      t.cost || 0,
      `"${t.sender || ''}"`,
      `"${t.recipient || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trens-shipments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      
      {/* Top Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-700" />
              <span>Manajemen Resi &amp; Pengiriman Kargo</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola status, perjalanan armada, serta cetak label thermal AWB
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              title="Unduh Data Pengiriman format CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenCreateShipment}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Resi Baru</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor resi, nama barang, pengirim, penerima..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="Semua">Semua Status</option>
              <option value="Diproses">Diproses</option>
              <option value="Dalam Perjalanan">Dalam Perjalanan</option>
              <option value="Tiba di Kota Tujuan">Tiba di Kota Tujuan</option>
              <option value="Terkirim">Terkirim</option>
            </select>
          </div>

          {/* Moda Filter */}
          <div>
            <select
              value={modaFilter}
              onChange={(e) => setModaFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="Semua">Semua Moda Transportasi</option>
              <option value="Darat">Darat (Truk &amp; Kereta)</option>
              <option value="Laut">Laut (Kapal Kargo/RoRo)</option>
              <option value="Udara">Udara (Pesawat Kargo)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Shipments Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">No. Resi (AWB)</th>
                <th className="py-3.5 px-4">Informasi Kargo</th>
                <th className="py-3.5 px-4">Rute Asal → Tujuan</th>
                <th className="py-3.5 px-4">Moda &amp; Berat</th>
                <th className="py-3.5 px-4">Status Terkini</th>
                <th className="py-3.5 px-4 text-right">Tarif Biaya</th>
                <th className="py-3.5 px-4 text-center">Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">Tidak ada data resi yang cocok dengan filter pencarian.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(([resi, t]) => {
                  const isExpanded = expandedResi === resi;
                  return (
                    <React.Fragment key={resi}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                        
                        {/* Resi */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-blue-900">{resi}</span>
                            <button
                              onClick={() => setExpandedResi(isExpanded ? null : resi)}
                              className="text-slate-400 hover:text-blue-700 p-0.5 rounded transition-colors"
                              title={isExpanded ? 'Tutup detail' : 'Buka detail checkpoint'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">{t.date || 'Aktif'}</span>
                            {(t.photoUrl || t.photoProof) && (
                              <button
                                onClick={() => setSelectedPreviewPhoto({
                                  url: (t.photoProof || t.photoUrl)!,
                                  title: t.photoProof ? `Foto Bukti POD - Resi ${resi}` : `Foto Fisik Paket - Resi ${resi}`
                                })}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[9px] font-bold border border-amber-200 transition-colors"
                                title="Klik untuk lihat foto dokumentasi"
                              >
                                <Camera className="w-2.5 h-2.5 text-amber-600" />
                                <span>{t.photoProof ? 'POD' : 'Foto'}</span>
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Kargo Info */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 line-clamp-1">{t.nama}</p>
                          <p className="text-[11px] text-slate-500">
                            Pengirim: <span className="font-medium text-slate-700">{t.sender || '-'}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Penerima: <span className="font-medium text-slate-700">{t.recipient || '-'}</span>
                          </p>
                        </td>

                        {/* Rute */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{t.rute}</span>
                          </div>
                          {t.recipientAddress && (
                            <p className="text-[10px] text-slate-400 max-w-xs truncate mt-0.5">
                              {t.recipientAddress}
                            </p>
                          )}
                        </td>

                        {/* Moda & Berat */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.moda === 'Darat'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : t.moda === 'Laut'
                                ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}>
                              {t.moda === 'Darat' && <Truck className="w-3 h-3" />}
                              {t.moda === 'Laut' && <Ship className="w-3 h-3" />}
                              {t.moda === 'Udara' && <Plane className="w-3 h-3" />}
                              <span>{t.moda}</span>
                            </span>
                            <span className="font-bold text-slate-700 text-xs">
                              {t.weight || 0} Kg
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            t.status === 'Terkirim'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'Dalam Perjalanan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : t.status === 'Tiba di Kota Tujuan'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{t.status}</span>
                          </span>
                        </td>

                        {/* Tarif Biaya */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {t.cost ? rupiah(t.cost) : '-'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onSelectUpdateResi(resi)}
                              className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors text-[11px] flex items-center gap-1"
                              title="Update Checkpoint & Status"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Update</span>
                            </button>
                            <button
                              onClick={() => onPrintLabel(resi, t)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Cetak Label Thermal AWB"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus resi ${resi}?`)) {
                                  onDeleteResi(resi);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Resi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>

                      {/* Expandable Row: Checkpoint History & Photo Documentation */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={7} className="p-4 sm:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              
                              {/* Left: Checkpoints (2 cols on lg) */}
                              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span>Riwayat Checkpoint Perjalanan ({t.history?.length || 0} Titik)</span>
                                  </h4>
                                  <button
                                    onClick={() => onSelectUpdateResi(resi)}
                                    className="text-xs text-blue-700 font-bold hover:underline"
                                  >
                                    + Tambah Checkpoint
                                  </button>
                                </div>

                                <div className="space-y-2 border-l-2 border-blue-200 ml-2 pl-4 py-1 max-h-64 overflow-y-auto">
                                  {t.history?.map((cp, idx) => (
                                    <div key={idx} className="relative">
                                      <span className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full ${
                                        cp.s === 'current' ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-blue-600'
                                      }`} />
                                      <p className="font-semibold text-slate-800 text-xs">{cp.k}</p>
                                      <span className="text-[10px] text-slate-400 font-mono">{cp.w}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right: Foto Dokumentasi (Fisik & POD) */}
                              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-2.5">
                                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                                      <Camera className="w-4 h-4 text-amber-600" />
                                      <span>Dokumentasi Foto Paket</span>
                                    </h4>
                                    <button
                                      onClick={() => onSelectUpdateResi(resi)}
                                      className="text-xs text-blue-700 font-bold hover:underline"
                                    >
                                      Kelola Foto
                                    </button>
                                  </div>

                                  <div className="space-y-3">
                                    {/* Foto Fisik Paket */}
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Foto Fisik Kargo</span>
                                      {t.photoUrl ? (
                                        <div 
                                          onClick={() => setSelectedPreviewPhoto({
                                            url: t.photoUrl!,
                                            title: `Foto Fisik Paket - Resi ${resi}`
                                          })}
                                          className="mt-1 relative h-28 rounded-lg overflow-hidden border border-slate-200 cursor-pointer group bg-slate-100"
                                        >
                                          <img 
                                            src={t.photoUrl} 
                                            alt="Fisik Kargo" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                            <ZoomIn className="w-3.5 h-3.5" />
                                            <span>Perbesar</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="mt-1 h-14 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-[11px] gap-1.5">
                                          <ImageIcon className="w-3.5 h-3.5" />
                                          <span>Belum ada foto fisik</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Foto Bukti Serah Terima (POD) */}
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-400 uppercase">Bukti Serah Terima (POD)</span>
                                      {t.photoProof ? (
                                        <div 
                                          onClick={() => setSelectedPreviewPhoto({
                                            url: t.photoProof!,
                                            title: `Bukti Serah Terima (POD) - Resi ${resi}`
                                          })}
                                          className="mt-1 relative h-28 rounded-lg overflow-hidden border border-emerald-200 cursor-pointer group bg-emerald-50/50"
                                        >
                                          <img 
                                            src={t.photoProof} 
                                            alt="Bukti POD" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                          />
                                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1">
                                            <ZoomIn className="w-3.5 h-3.5" />
                                            <span>Perbesar POD</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="mt-1 h-14 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-[11px] gap-1.5">
                                          <ImageIcon className="w-3.5 h-3.5" />
                                          <span>Belum ada foto POD</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onSelectUpdateResi(resi)}
                                  className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors text-center"
                                >
                                  + Upload / Update Foto
                                </button>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {selectedPreviewPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPreviewPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">{selectedPreviewPhoto.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPreviewPhoto(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img 
                src={selectedPreviewPhoto.url} 
                alt={selectedPreviewPhoto.title} 
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="px-3 py-1.5 text-center text-[11px] text-white/60">
              Klik di luar gambar atau tombol silang untuk menutup
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
