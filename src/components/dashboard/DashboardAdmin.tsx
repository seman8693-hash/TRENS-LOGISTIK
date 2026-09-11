import React, { useState } from 'react';
import {
  ShieldCheck,
  ClipboardList,
  Users,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Plus,
  Send,
  ArrowRight
} from 'lucide-react';
import { DashboardTab, OrderRequest, PartnerLead, TrackingItem } from '../../types';

interface DashboardAdminProps {
  tracks: Record<string, TrackingItem>;
  orders: OrderRequest[];
  partners: PartnerLead[];
  onNavigateTab: (tab: DashboardTab) => void;
}

type AdminTaskPriority = 'Rendah' | 'Normal' | 'Tinggi';
type AdminTaskStatus = 'Baru' | 'Proses' | 'Selesai';

interface AdminTask {
  id: number;
  title: string;
  owner: string;
  priority: AdminTaskPriority;
  status: AdminTaskStatus;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  tracks,
  orders,
  partners,
  onNavigateTab
}) => {
  const [taskList, setTaskList] = useState<AdminTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('Ops 1');
  const [newTaskPriority, setNewTaskPriority] = useState<AdminTaskPriority>('Normal');
  const [newTaskStatus, setNewTaskStatus] = useState<AdminTaskStatus>('Baru');

  const totalShipments = Object.keys(tracks).length;
  const pendingPickup = orders.filter((o) => o.status === 'Baru' || o.status === 'Dikonfirmasi').length;
  const approvedPartners = partners.filter((p) => p.status === 'Disetujui').length;
  const activeFleet = Object.values(tracks).filter((track) => track.status === 'Dalam Perjalanan' || track.status === 'Tiba di Kota Tujuan').length;
  const delivered = Object.values(tracks).filter((track) => track.status === 'Terkirim').length;
  const onTimeRate = totalShipments > 0 ? Math.round((delivered / totalShipments) * 100) : 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    setTaskList((prev) => [
      {
        id: Date.now(),
        title: newTaskTitle.trim(),
        owner: newTaskOwner,
        priority: newTaskPriority,
        status: newTaskStatus
      },
      ...prev
    ]);

    setNewTaskTitle('');
    setNewTaskOwner('Ops 1');
    setNewTaskPriority('Normal');
    setNewTaskStatus('Baru');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#0B1B4D] via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.28),transparent_40%)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Operations Center
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Monitoring Tim & Operasional Harian</h2>
            <p className="text-sm text-blue-200 mt-1 max-w-2xl">
              Pantau performa armada, pickup menunggu, mitra aktif, dan prioritas tugas admin dari satu panel.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('overview')}
            className="bg-white/10 hover:bg-white/15 text-white border border-white/15 px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Kembali ke Ringkasan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup menunggu</span>
            <ClipboardList className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{pendingPickup}</div>
          <p className="text-[11px] text-slate-500 mt-1">Permintaan dari pelanggan butuh follow-up</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mitra aktif</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{approvedPartners}</div>
          <p className="text-[11px] text-slate-500 mt-1">Agen & armada yang sudah disetujui</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Armada berjalan</span>
            <CalendarClock className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{activeFleet}</div>
          <p className="text-[11px] text-slate-500 mt-1">Resi dalam perjalanan atau sudah sampai kota tujuan</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">On-time rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{onTimeRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Dari {totalShipments} resi yang terdaftar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tugas Admin Prioritas</h3>
              <p className="text-xs text-slate-500">Daftar pekerjaan operasional hari ini</p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              {taskList.filter((task) => task.status !== 'Selesai').length} aktif
            </div>
          </div>

          <div className="space-y-3">
            {taskList.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-slate-800">{task.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Owner: {task.owner}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    task.priority === 'Tinggi'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'Normal'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    task.status === 'Baru'
                      ? 'bg-slate-200 text-slate-700'
                      : task.status === 'Proses'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.status}
                  </span>
                  <button className="text-[11px] text-blue-700 font-semibold hover:text-blue-800">Lihat detail</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">Tambah Catatan Admin</h3>
          </div>

          <div className="space-y-3">
            <input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Contoh: Cek kiriman ekspres ke Bandung"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="grid grid-cols-2 gap-2.5">
              <select
                value={newTaskOwner}
                onChange={(e) => setNewTaskOwner(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option>Ops 1</option>
                <option>Ops 2</option>
                <option>Customer Care</option>
                <option>Admin Gudang</option>
              </select>

              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as AdminTaskPriority)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Rendah">Rendah</option>
                <option value="Normal">Normal</option>
                <option value="Tinggi">Tinggi</option>
              </select>
            </div>

            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value as AdminTaskStatus)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Baru">Baru</option>
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
            </select>

            <button
              onClick={handleAddTask}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simpan Catatan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
