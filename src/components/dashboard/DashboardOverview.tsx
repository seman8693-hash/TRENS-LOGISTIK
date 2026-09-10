import React from 'react';
import { 
  Package, 
  Truck, 
  Ship, 
  Plane, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  Users, 
  FileText, 
  Webhook, 
  Plus, 
  Printer, 
  AlertCircle
} from 'lucide-react';
import { TrackingItem, OrderRequest, PartnerLead, DashboardTab } from '../../types';
import { rupiah } from '../../data/logisticData';

interface DashboardOverviewProps {
  tracks: Record<string, TrackingItem>;
  orders: OrderRequest[];
  partners: PartnerLead[];
  onNavigateTab: (tab: DashboardTab) => void;
  onOpenCreateShipment: () => void;
  onSelectUpdateResi: (resi: string) => void;
  onPrintLabel: (resi: string, item: TrackingItem) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  tracks,
  orders,
  partners,
  onNavigateTab,
  onOpenCreateShipment,
  onSelectUpdateResi,
  onPrintLabel
}) => {
  const trackEntries = Object.entries(tracks) as [string, TrackingItem][];
  const totalShipments = trackEntries.length;
  
  // Status breakdown
  const diproses = trackEntries.filter(([_, t]) => t.status === 'Diproses').length;
  const dalamPerjalanan = trackEntries.filter(([_, t]) => t.status === 'Dalam Perjalanan').length;
  const tibaTujuan = trackEntries.filter(([_, t]) => t.status === 'Tiba di Kota Tujuan').length;
  const terkirim = trackEntries.filter(([_, t]) => t.status === 'Terkirim').length;
  
  // Moda breakdown
  const daratCount = trackEntries.filter(([_, t]) => t.moda === 'Darat').length;
  const lautCount = trackEntries.filter(([_, t]) => t.moda === 'Laut').length;
  const udaraCount = trackEntries.filter(([_, t]) => t.moda === 'Udara').length;

  // Total revenue & weight
  const totalRevenue = trackEntries.reduce((acc, [_, t]) => acc + (t.cost || 0), 0);
  const totalWeight = trackEntries.reduce((acc, [_, t]) => acc + (t.weight || 0), 0);

  // New Orders
  const pendingOrders = orders.filter(o => o.status === 'Baru' || o.status === 'Dikonfirmasi').length;
  const pendingPartners = partners.filter(p => p.status === 'Menunggu').length;

  // Recent shipments (last 5)
  const recentShipments = [...trackEntries].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome & Quick CTA */}
      <div className="bg-gradient-to-r from-[#0B1B4D] via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sistem Operasional Aktif • Siap Integrasi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Dashboard Logistik &amp; Eksekusi Pengiriman
            </h2>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-2xl">
              Pusat kendali resi, status tracking multi-moda (Darat, Laut, Udara), order penjemputan, serta konektor API &amp; Webhook resmi TRENS-LOGISTIC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateShipment}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-102"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Resi Baru</span>
            </button>
            <button
              onClick={() => onNavigateTab('integration')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all"
            >
              <Webhook className="w-4 h-4 text-amber-300" />
              <span>Portal Integrasi API</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pengiriman Aktif */}
        <div 
          onClick={() => onNavigateTab('shipments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Resi Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalShipments}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +{totalShipments} kargo
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total muatan terdaftar di database
          </p>
        </div>

        {/* Card 2: Dalam Perjalanan */}
        <div 
          onClick={() => onNavigateTab('shipments')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dalam Perjalanan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{dalamPerjalanan + tibaTujuan}</span>
            <span className="text-xs text-amber-600 font-semibold">
              Armada Jalan
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {tibaTujuan} kargo telah tiba di kota tujuan
          </p>
        </div>

        {/* Card 3: Permintaan Pickup */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Baru</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{pendingOrders}</span>
            {pendingOrders > 0 ? (
              <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                Perlu Follow-up
              </span>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold">Semua Terproses</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Pesanan penjemputan dari pelanggan
          </p>
        </div>

        {/* Card 4: Total Nilai Kargo */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Transaksi</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {rupiah(totalRevenue)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total tonase: ~{totalWeight.toFixed(1)} Kg
          </p>
        </div>

      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Pipeline Progress */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pipeline Status Pengiriman</h3>
              <p className="text-xs text-slate-500">Distribusi real-time proses paket dan kargo</p>
            </div>
            <span className="text-xs font-bold text-blue-700">{totalShipments} Resi Total</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${totalShipments ? (diproses / totalShipments) * 100 : 25}%` }} 
              className="bg-blue-400 h-full transition-all" 
              title={`Diproses: ${diproses}`}
            />
            <div 
              style={{ width: `${totalShipments ? (dalamPerjalanan / totalShipments) * 100 : 35}%` }} 
              className="bg-amber-500 h-full transition-all" 
              title={`Dalam Perjalanan: ${dalamPerjalanan}`}
            />
            <div 
              style={{ width: `${totalShipments ? (tibaTujuan / totalShipments) * 100 : 20}%` }} 
              className="bg-indigo-500 h-full transition-all" 
              title={`Tiba di Tujuan: ${tibaTujuan}`}
            />
            <div 
              style={{ width: `${totalShipments ? (terkirim / totalShipments) * 100 : 20}%` }} 
              className="bg-emerald-500 h-full transition-all" 
              title={`Terkirim: ${terkirim}`}
            />
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-1.5 text-xs text-blue-900 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>Diproses</span>
              </div>
              <p className="text-lg font-black text-blue-950 mt-1">{diproses}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Di Perjalanan</span>
              </div>
              <p className="text-lg font-black text-amber-950 mt-1">{dalamPerjalanan}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center gap-1.5 text-xs text-indigo-900 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Tiba di Tujuan</span>
              </div>
              <p className="text-lg font-black text-indigo-950 mt-1">{tibaTujuan}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Terkirim</span>
              </div>
              <p className="text-lg font-black text-emerald-950 mt-1">{terkirim}</p>
            </div>
          </div>
        </div>

        {/* Moda Transportasi Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Distribusi Moda Armada</h3>
            <p className="text-xs text-slate-500">Volume kargo per jalur logistik</p>
          </div>

          <div className="space-y-3">
            {/* Darat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" /> Darat (Truk &amp; Kereta)
                </span>
                <span className="font-bold text-slate-900">{daratCount} Kargo</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full" 
                  style={{ width: `${totalShipments ? (daratCount / totalShipments) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Laut */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-cyan-600" /> Laut (Kapal Kontainer/RoRo)
                </span>
                <span className="font-bold text-slate-900">{lautCount} Kargo</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-600 h-full rounded-full" 
                  style={{ width: `${totalShipments ? (lautCount / totalShipments) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Udara */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-sky-600" /> Udara (Pesawat Kargo)
                </span>
                <span className="font-bold text-slate-900">{udaraCount} Kargo</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="bg-sky-500 h-full rounded-full" 
                  style={{ width: `${totalShipments ? (udaraCount / totalShipments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mitra Baru Menunggu:</span>
            <button 
              onClick={() => onNavigateTab('partners')}
              className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
            >
              {pendingPartners} Calon Mitra
            </button>
          </div>
        </div>

      </div>

      {/* Tabel Resi Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Pengiriman &amp; Resi Terbaru
            </h3>
            <p className="text-xs text-slate-500">
              Pantau dan update status armada secara instan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('shipments')}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
            >
              <span>Lihat Semua Resi ({totalShipments})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Resi</th>
                <th className="py-3 px-4">Kargo / Barang</th>
                <th className="py-3 px-4">Rute</th>
                <th className="py-3 px-4">Moda</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Biaya</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentShipments.map(([resi, t]) => (
                <tr key={resi} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                    {resi}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-800 line-clamp-1">{t.nama}</p>
                    <p className="text-[11px] text-slate-400">Pengirim: {t.sender || '-'}</p>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                    {t.rute}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.moda === 'Darat'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : t.moda === 'Laut'
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                        : 'bg-sky-50 text-sky-700 border border-sky-200'
                    }`}>
                      {t.moda}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
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
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {t.cost ? rupiah(t.cost) : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectUpdateResi(resi)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors text-[11px]"
                        title="Update Checkpoint & Status"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => onPrintLabel(resi, t)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Cetak Label Pengiriman"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
