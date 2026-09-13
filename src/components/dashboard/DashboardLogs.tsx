import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  XCircle, 
  Clock, 
  User, 
  Truck, 
  ShieldCheck, 
  FileText, 
  Users, 
  Cpu, 
  ChevronRight, 
  RotateCcw,
  Calendar,
  Layers,
  FileSpreadsheet,
  X,
  Send,
  Eye
} from 'lucide-react';
import { ActivityLog, LogCategory, LogLevel } from '../../types';
import { logActivity, clearActivityLogs } from '../../utils/auditLogger';

interface DashboardLogsProps {
  logs: ActivityLog[];
  onRefreshLogs?: () => void;
}

export const DashboardLogs: React.FC<DashboardLogsProps> = ({ logs, onRefreshLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [selectedLogDetail, setSelectedLogDetail] = useState<ActivityLog | null>(null);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  // Manual note form states
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<LogCategory>('OPERATIONAL');
  const [manualLevel, setManualLevel] = useState<LogLevel>('info');
  const [manualDescription, setManualDescription] = useState('');
  const [manualTargetId, setManualTargetId] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Filter logs based on search, category, and level
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = 
        !searchTerm.trim() ||
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.targetId && log.targetId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
      const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [logs, searchTerm, selectedCategory, selectedLevel]);

  // Summary Metrics
  const totalLogs = logs.length;
  const todayLogs = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return logs.filter(l => l.timestamp.startsWith(todayStr)).length;
  }, [logs]);

  const resiLogs = useMemo(() => logs.filter(l => l.category === 'RESI').length, [logs]);
  const authLogs = useMemo(() => logs.filter(l => l.category === 'AUTH').length, [logs]);

  // Format date nicely in Indonesian format
  const formatDateTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch {
      return iso;
    }
  };

  const formatRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} hari lalu`;
    } catch {
      return '';
    }
  };

  const getCategoryBadge = (cat: LogCategory) => {
    switch (cat) {
      case 'RESI':
        return { label: 'Kargo & Resi', bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck };
      case 'ORDER':
        return { label: 'Pesanan Pickup', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: FileText };
      case 'INVOICE':
        return { label: 'Faktur & Invoice', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: FileSpreadsheet };
      case 'PARTNER':
        return { label: 'Kemitraan', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Users };
      case 'AUTH':
        return { label: 'Keamanan / Auth', bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: ShieldCheck };
      case 'SYSTEM':
      case 'OPERATIONAL':
      default:
        return { label: 'Sistem & Ops', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Cpu };
    }
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'success':
        return { label: 'Sukses', bg: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 };
      case 'warning':
        return { label: 'Peringatan', bg: 'bg-amber-100 text-amber-800', icon: AlertTriangle };
      case 'danger':
        return { label: 'Perubahan Kritis', bg: 'bg-rose-100 text-rose-800', icon: XCircle };
      case 'info':
      default:
        return { label: 'Info', bg: 'bg-sky-100 text-sky-800', icon: Info };
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert('Tidak ada data log untuk diekspor.');
      return;
    }

    const headers = ['ID Log', 'Waktu (ISO)', 'Waktu Lokal', 'Kategori', 'Pelaku', 'Judul Aktivitas', 'Deskripsi', 'Target ID', 'Tingkat'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${formatDateTime(l.timestamp)}"`,
      `"${l.category}"`,
      `"${l.actor}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.targetId || '-'}"`,
      `"${l.level}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TRENS_LOGISTIC_AUDIT_LOGS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Logs
  const handlePrint = () => {
    window.print();
  };

  // Add Manual Note Submit
  const handleSaveManualNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualDescription.trim()) {
      alert('Judul dan rincian catatan wajib diisi.');
      return;
    }

    setIsSubmittingNote(true);
    try {
      await logActivity({
        category: manualCategory,
        action: 'MANUAL_MEMO',
        actor: 'Admin Lapangan / Dispatcher',
        title: manualTitle.trim(),
        description: manualDescription.trim(),
        targetId: manualTargetId.trim() || undefined,
        level: manualLevel
      });

      setManualTitle('');
      setManualDescription('');
      setManualTargetId('');
      setIsAddNoteModalOpen(false);
      if (onRefreshLogs) onRefreshLogs();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Audit Trail &amp; Log Keamanan</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Histori &amp; Log Aktivitas Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Pencatatan riwayat kronologis setiap perubahan status kargo, input resi, mutasi invoice, konfirmasi pickup, otorisasi login, dan kejadian penting kargo secara real-time.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddNoteModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-700 to-[#0B1B4D] hover:from-blue-800 hover:to-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Catat Memo Lapangan</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Unduh seluruh data log terfilter sebagai format spreadsheet CSV"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak format laporan audit trail log"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Log</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Riwayat Log</div>
            <div className="text-xl font-black text-slate-900">{totalLogs} Catatan</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aktivitas Hari Ini</div>
            <div className="text-xl font-black text-emerald-700">{todayLogs} Peristiwa</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Log Kargo &amp; Resi</div>
            <div className="text-xl font-black text-slate-900">{resiLogs} Aktivitas</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Keamanan &amp; Auth</div>
            <div className="text-xl font-black text-purple-700">{authLogs} Otorisasi</div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari No. Resi, ID Order, Pelaku, atau Aktivitas..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'timeline' ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Garis Waktu (Timeline)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-blue-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel Detail
            </button>
          </div>
        </div>

        {/* Category Pills & Level Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Kategori:
            </span>
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'RESI', label: 'Resi & Kargo' },
              { id: 'ORDER', label: 'Order Pickup' },
              { id: 'INVOICE', label: 'Invoice' },
              { id: 'PARTNER', label: 'Mitra' },
              { id: 'AUTH', label: 'Keamanan' },
              { id: 'OPERATIONAL', label: 'Operasional' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-[#0B1B4D] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-400">Tingkat:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="success">Sukses</option>
              <option value="info">Info</option>
              <option value="warning">Peringatan</option>
              <option value="danger">Kritis / Bahaya</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Timeline vs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ditemukan Catatan Log</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada aktivitas log yang cocok dengan filter atau kata kunci pencarian Anda.
          </p>
          {(searchTerm || selectedCategory !== 'ALL' || selectedLevel !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedLevel('ALL');
              }}
              className="text-xs text-blue-700 font-bold hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : viewMode === 'timeline' ? (
        /* TIMELINE VIEW */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative border-l-2 border-slate-200 pl-6 space-y-6">
            {filteredLogs.map((log) => {
              const catBadge = getCategoryBadge(log.category);
              const lvlBadge = getLevelBadge(log.level);
              const CatIcon = catBadge.icon;
              const LvlIcon = lvlBadge.icon;

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xs ${
                    log.level === 'success' ? 'bg-emerald-500 text-white' :
                    log.level === 'warning' ? 'bg-amber-500 text-white' :
                    log.level === 'danger' ? 'bg-rose-500 text-white' :
                    'bg-blue-600 text-white'
                  }`}>
                    <LvlIcon className="w-3.5 h-3.5" />
                  </div>

                  {/* Log Content Card */}
                  <div className="bg-slate-50 hover:bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${catBadge.bg}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catBadge.label}</span>
                        </span>
                        
                        {log.targetId && (
                          <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {log.targetId}
                          </span>
                        )}

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lvlBadge.bg}`}>
                          {lvlBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">{formatDateTime(log.timestamp)}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-slate-600">{formatRelativeTime(log.timestamp)}</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                      {log.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {log.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Pelaku: <strong className="text-slate-700">{log.actor}</strong></span>
                      </div>

                      {log.details && Object.keys(log.details).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedLogDetail(log)}
                          className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Rincian Metadata</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5">Waktu</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Pelaku</th>
                  <th className="p-3.5">Aktivitas &amp; Deskripsi</th>
                  <th className="p-3.5">Target ID</th>
                  <th className="p-3.5">Tingkat</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLogs.map((log) => {
                  const catBadge = getCategoryBadge(log.category);
                  const lvlBadge = getLevelBadge(log.level);
                  const CatIcon = catBadge.icon;

                  return (
                    <tr key={log.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{formatDateTime(log.timestamp)}</div>
                        <div className="text-[10px] text-slate-400">{formatRelativeTime(log.timestamp)}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${catBadge.bg}`}>
                          <CatIcon className="w-3 h-3" />
                          <span>{catBadge.label}</span>
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{log.actor}</span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{log.title}</div>
                        <div className="text-[11px] text-slate-500 leading-snug line-clamp-1">{log.description}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap font-mono font-bold text-slate-800">
                        {log.targetId || '-'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lvlBadge.bg}`}>
                          {lvlBadge.label}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-right">
                        {log.details ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLogDetail(log)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Rincian Detail Log"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL LOG INSPECTION */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#0B1B4D] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Inspeksi Rincian Audit Log</h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Log ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedLogDetail.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Waktu Lengkap</span>
                  <span className="font-bold text-slate-800">{formatDateTime(selectedLogDetail.timestamp)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Pelaku / Aktor</span>
                  <span className="font-bold text-slate-800">{selectedLogDetail.actor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori &amp; Level</span>
                  <span className="font-bold text-slate-800">{selectedLogDetail.category} ({selectedLogDetail.level})</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Aktivitas</label>
                <div className="font-bold text-slate-900 text-sm">{selectedLogDetail.title}</div>
                <div className="text-slate-600 mt-1 leading-relaxed">{selectedLogDetail.description}</div>
              </div>

              {selectedLogDetail.details && (
                <div>
                  <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1.5">Metadata Ekstra (Payload JSON)</label>
                  <pre className="p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedLogDetail.details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedLogDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH CATATAN / MEMO OPERASIONAL */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-[#0B1B4D] to-blue-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">Catat Memo / Log Operasional</h3>
              </div>
              <button
                onClick={() => setIsAddNoteModalOpen(false)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualNote} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Judul Memo / Peristiwa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Contoh: Kendala cuaca buruk di Selat Makassar..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as LogCategory)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                  >
                    <option value="OPERATIONAL">Operasional</option>
                    <option value="RESI">Kargo &amp; Resi</option>
                    <option value="ORDER">Pesanan Pickup</option>
                    <option value="INVOICE">Faktur &amp; Invoice</option>
                    <option value="SYSTEM">Sistem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tingkat</label>
                  <select
                    value={manualLevel}
                    onChange={(e) => setManualLevel(e.target.value as LogLevel)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white font-semibold"
                  >
                    <option value="info">Info</option>
                    <option value="success">Sukses</option>
                    <option value="warning">Peringatan</option>
                    <option value="danger">Kritis / Bahaya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target ID Terkait (Opsional)
                </label>
                <input
                  type="text"
                  value={manualTargetId}
                  onChange={(e) => setManualTargetId(e.target.value)}
                  placeholder="Misal No. Resi TRN-..., Plat Armada B 9123 ABC..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rincian Catatan / Keterangan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Tuliskan keterangan lengkap kejadian untuk arsip audit..."
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white font-medium text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNote ? 'Menyimpan...' : 'Simpan Catatan Log'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
