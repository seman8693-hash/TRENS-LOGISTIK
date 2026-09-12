import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  MessageCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Plane, 
  Ship, 
  Trash2, 
  PhoneCall, 
  PackageCheck,
  AlertCircle,
  Camera,
  ZoomIn,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { OrderRequest, TrackingItem, ShipmentStatus } from '../../types';
import { rupiah } from '../../data/logisticData';

interface DashboardOrdersProps {
  orders: OrderRequest[];
  onUpdateOrderStatus: (id: string, status: OrderRequest['status']) => void;
  onConvertToShipment: (order: OrderRequest) => void;
  onDeleteOrder: (id: string) => void;
}

export const DashboardOrders: React.FC<DashboardOrdersProps> = ({
  orders,
  onUpdateOrderStatus,
  onConvertToShipment,
  onDeleteOrder
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);

  const filtered = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      order.id.toLowerCase().includes(q) ||
      order.nama.toLowerCase().includes(q) ||
      order.hp.includes(q) ||
      order.barang.toLowerCase().includes(q) ||
      order.rute.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'Semua' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenWhatsApp = (order: OrderRequest) => {
    const cleanPhone = order.hp.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    
    const msg = `Halo ${order.nama}, kami dari Layanan Pelanggan TRENS-LOGISTIC.%0A%0A` +
      `Mengenai pesanan penjemputan barang Anda (ID: ${order.id}):%0A` +
      `• Barang: ${encodeURIComponent(order.barang)} (${order.berat} Kg)%0A` +
      `• Rute: ${encodeURIComponent(order.rute)}%0A` +
      `• Status: *${order.status}*%0A%0A` +
      `Tim armada kami siap melakukan koordinasi penjemputan barang. Apakah waktu penjemputan sudah sesuai?`;

    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-5">
      
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-700" />
              <span>Order Penjemputan &amp; Permintaan Pengiriman</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pesanan pickup dari pelanggan website yang siap dikonfirmasi dan dikonversi ke Resi AWB
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {orders.length} Total Permintaan
          </span>
        </div>

        {/* Filter & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama pengirim, nomor WhatsApp, nama barang, kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
            >
              <option value="Semua">Semua Status Permintaan</option>
              <option value="Baru">Baru Masuk</option>
              <option value="Dikonfirmasi">Dikonfirmasi</option>
              <option value="Diproses">Diproses Armada</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">
              {orders.length === 0 ? 'Belum ada permintaan order penjemputan barang.' : 'Tidak ada pesanan pickup yang cocok dengan filter.'}
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {orders.length === 0 
                ? 'Setiap booking penjemputan baru yang dikirimkan oleh pelanggan melalui website akan langsung muncul di sini secara real-time.' 
                : 'Coba ubah kata kunci atau pilih status filter lain.'}
            </p>
          </div>
        ) : (
          filtered.map((order) => {
            const isNew = order.status === 'Baru';
            return (
              <div 
                key={order.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 ${
                  isNew ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-950">ID: {order.id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          order.status === 'Baru'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'Dikonfirmasi'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Diproses'
                            ? 'bg-indigo-100 text-indigo-800'
                            : order.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {order.barang}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        {order.estimasiBiaya ? rupiah(order.estimasiBiaya) : 'Estimasi Tarif'}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Pelanggan:</span>
                      <span className="font-bold text-slate-800">{order.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">No. WhatsApp:</span>
                      <span className="font-mono font-semibold text-blue-700">{order.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rute Pengiriman:</span>
                      <span className="font-semibold text-slate-800">{order.rute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Moda &amp; Berat:</span>
                      <span className="font-semibold text-slate-800">
                        {order.moda} • {order.berat} Kg
                      </span>
                    </div>
                    {order.catatan && (
                      <div className="pt-1.5 border-t border-slate-200 text-[11px] text-slate-600 italic">
                        &quot;{order.catatan}&quot;
                      </div>
                    )}
                    {order.photoUrl && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                          <Camera className="w-3.5 h-3.5 text-blue-700" />
                          <span>Foto Barang Dilampirkan</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto({
                            url: order.photoUrl!,
                            title: `Foto Barang - Order ${order.id} (${order.barang})`
                          })}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-bold flex items-center gap-1 border border-blue-200 transition-colors"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Lihat Foto</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {/* Change Status Dropdown */}
                    <select
                      value={order.status}
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderRequest['status'])}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    >
                      <option value="Baru">Status: Baru</option>
                      <option value="Dikonfirmasi">Status: Dikonfirmasi</option>
                      <option value="Diproses">Status: Diproses</option>
                      <option value="Selesai">Status: Selesai</option>
                      <option value="Dibatalkan">Status: Dibatalkan</option>
                    </select>

                    <button
                      onClick={() => handleOpenWhatsApp(order)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Kirim pesan WhatsApp langsung ke pelanggan"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onConvertToShipment(order)}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      title="Buat Resi Resmi dari order ini"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Jadikan Resi AWB</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus permintaan order ${order.id}?`)) {
                          onDeleteOrder(order.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/20 p-2 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">{selectedPhoto.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.title} 
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
