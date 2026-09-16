import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Phone,
  Circle,
  CheckCheck,
  CheckCircle2,
  Trash2,
  Plus,
  X,
  Inbox,
  Clock,
  UserRound,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { ChatThread, ChatThreadStatus } from '../../types';
import { QUICK_REPLY_TEMPLATES, buildChatSummary } from '../../utils/chatStore';

interface DashboardChatProps {
  threads: ChatThread[];
  canEdit: boolean;
  currentUserName: string;
  onReply: (threadId: string, text: string) => void;
  onMarkRead: (threadId: string) => void;
  onMarkAllRead: () => void;
  onUpdateStatus: (threadId: string, status: ChatThreadStatus) => void;
  onDeleteThread: (threadId: string) => void;
  onCreateThread: (payload: {
    customerName: string;
    customerPhone: string;
    subject: string;
    message: string;
  }) => void;
}

interface NewThreadForm {
  customerName: string;
  customerPhone: string;
  subject: string;
  message: string;
}

const emptyThreadForm = (): NewThreadForm => ({
  customerName: '',
  customerPhone: '',
  subject: '',
  message: ''
});

const normalizePhone = (value?: string): string => (value || '').replace(/[^0-9]/g, '');

const buildWaLink = (phone: string, text: string): string => {
  const digits = normalizePhone(phone);
  const waNumber = digits.startsWith('0') ? '62' + digits.slice(1) : digits;
  return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
};

export const DashboardChat: React.FC<DashboardChatProps> = ({
  threads,
  canEdit,
  currentUserName,
  onReply,
  onMarkRead,
  onMarkAllRead,
  onUpdateStatus,
  onDeleteThread,
  onCreateThread
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | ChatThreadStatus | 'Belum Dibaca'>('Semua');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState<NewThreadForm>(emptyThreadForm);
  const [newThreadError, setNewThreadError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const summary = useMemo(() => buildChatSummary(threads), [threads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads
      .filter((t) => {
        const matchSearch =
          !q ||
          t.customerName.toLowerCase().includes(q) ||
          t.customerPhone.includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          (t.resi || '').toLowerCase().includes(q);
        const matchStatus =
          statusFilter === 'Semua'
            ? true
            : statusFilter === 'Belum Dibaca'
            ? t.unreadAdmin > 0
            : t.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [threads, search, statusFilter]);

  const selected = useMemo(
    () => threads.find((t) => t.id === selectedId) || null,
    [threads, selectedId]
  );

  // Auto pilih thread pertama & tandai sudah dibaca
  useEffect(() => {
    if (!selectedId && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  useEffect(() => {
    if (selectedId && selected && selected.unreadAdmin > 0) {
      onMarkRead(selectedId);
    }
  }, [selectedId, selected?.unreadAdmin, onMarkRead, selected]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedId, selected?.messages.length]);

  const handleSend = (text?: string) => {
    const payload = (text ?? replyText).trim();
    if (!payload || !selected || !canEdit) return;
    onReply(selected.id, payload);
    setReplyText('');
  };

  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.customerName.trim() || !newThread.customerPhone.trim() || !newThread.message.trim()) {
      setNewThreadError('Nama pelanggan, nomor WhatsApp, dan isi pesan wajib diisi.');
      return;
    }
    onCreateThread({
      customerName: newThread.customerName.trim(),
      customerPhone: newThread.customerPhone.trim(),
      subject: newThread.subject.trim(),
      message: newThread.message.trim()
    });
    setNewThread(emptyThreadForm());
    setNewThreadError(null);
    setShowNewThread(false);
  };

  const statusBadgeClass = (status: ChatThreadStatus): string => {
    if (status === 'Baru') return 'bg-amber-100 text-amber-800 border-amber-200';
    if (status === 'Aktif') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const statsCards = [
    { label: 'Total Percakapan', value: summary.totalThreads, note: `${summary.activeThreads} sedang aktif`, icon: Inbox, color: 'text-blue-700' },
    { label: 'Belum Dibaca', value: summary.unreadMessages, note: `${summary.unreadThreads} thread menunggu`, icon: Circle, color: 'text-rose-600' },
    { label: 'Menunggu Balasan', value: summary.waitingReply, note: 'Pesan terakhir dari customer', icon: Clock, color: 'text-amber-600' },
    { label: 'Selesai', value: summary.closedThreads, note: `${summary.newThreads} percakapan baru`, icon: CheckCircle2, color: 'text-emerald-700' }
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-700" />
              <span>Pusat Chat &amp; Customer Service</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Balas pertanyaan pelanggan dari website, kirim tanggapan cepat, dan eskalasi ke WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>Tandai Semua Dibaca</span>
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => setShowNewThread(true)}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Percakapan Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">{card.value}</div>
              <p className="text-[11px] text-slate-500 mt-1">{card.note}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pelanggan, nomor WhatsApp, subjek, atau resi..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['Semua', 'Belum Dibaca', 'Baru', 'Aktif', 'Selesai'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setStatusFilter(opt)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                  statusFilter === opt
                    ? 'bg-[#0B1B4D] text-white border-[#0B1B4D]'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inbox + Percakapan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Daftar Thread */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Kotak Masuk ({filtered.length})</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Terbaru di atas</span>
          </div>

          <div className="max-h-[32rem] overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 && (
              <div className="py-14 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Belum ada percakapan.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[16rem] mx-auto">
                  Pesan dari form order pickup pelanggan akan otomatis masuk ke kotak masuk ini.
                </p>
              </div>
            )}

            {filtered.map((thread) => {
              const lastMessage = thread.messages[thread.messages.length - 1];
              const isActive = thread.id === selectedId;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedId(thread.id)}
                  className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                    isActive ? 'bg-blue-50 border-l-4 border-blue-700' : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {thread.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[11rem]">{thread.customerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{thread.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {thread.unreadAdmin > 0 && (
                        <span className="min-w-[1.25rem] text-center px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                          {thread.unreadAdmin}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-bold ${statusBadgeClass(thread.status)}`}>
                        {thread.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-700 mt-2 truncate">{thread.subject}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {lastMessage ? `${lastMessage.dari === 'admin' ? 'CS: ' : ''}${lastMessage.isi}` : 'Belum ada pesan.'}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {thread.resi ? `Resi ${thread.resi}` : `Thread ${thread.id}`}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {lastMessage ? lastMessage.waktu : '-'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Percakapan */}
        <div className="lg:col-span-8">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-full flex flex-col items-center justify-center py-20 text-center px-6">
              <UserRound className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-600">Pilih percakapan untuk mulai membalas</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Semua pesan pelanggan yang dikirim melalui form booking penjemputan di website akan tampil di kotak masuk.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              {/* Header chat */}
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-blue-700" />
                      {selected.customerName}
                      <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold ${statusBadgeClass(selected.status)}`}>
                        {selected.status}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 inline mr-1" />
                      {selected.customerPhone}
                      {selected.rute ? ` • ${selected.rute}` : ''}
                      {selected.moda ? ` • ${selected.moda}` : ''}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Subjek: <span className="font-semibold text-slate-700">{selected.subject}</span>
                      {selected.resi ? ` • Resi ${selected.resi}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      value={selected.status}
                      onChange={(e) => onUpdateStatus(selected.id, e.target.value as ChatThreadStatus)}
                      disabled={!canEdit}
                      className="text-[11px] font-bold rounded-lg px-2 py-1.5 border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:opacity-60"
                    >
                      <option value="Baru">Baru</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Selesai">Selesai</option>
                    </select>

                    <a
                      href={buildWaLink(
                        selected.customerPhone,
                        `Halo ${selected.customerName}, kami dari TRENS-LOGISTIC menindaklanjuti percakapan Anda mengenai ${selected.subject}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      title="Lanjutkan percakapan di WhatsApp"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus percakapan dengan ${selected.customerName}?`)) {
                            onDeleteThread(selected.id);
                            setSelectedId(null);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus percakapan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Daftar pesan */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100/60 min-h-[18rem] max-h-[24rem]"
              >
                {selected.messages.length === 0 && (
                  <p className="text-center text-[11px] text-slate-400 py-8">
                    Belum ada pesan pada percakapan ini.
                  </p>
                )}

                {selected.messages.map((msg) => {
                  const isAdmin = msg.dari === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[70%] ${isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isAdmin
                              ? 'bg-[#0B1B4D] text-white rounded-br-sm'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                          }`}
                        >
                          {msg.isi}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {isAdmin ? (msg.pengirim ? `${msg.pengirim} • ` : 'CS • ') : 'Customer • '}
                          {msg.waktu}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Balasan cepat + Composer */}
              <div className="border-t border-slate-200 p-3 space-y-2.5 bg-white">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Balasan Cepat
                  </span>
                  {QUICK_REPLY_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => setReplyText(tpl.text)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    disabled={!canEdit}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={canEdit ? 'Tulis balasan untuk pelanggan... (Enter untuk kirim, Shift+Enter baris baru)' : 'Role Anda hanya dapat melihat percakapan.'}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!canEdit || !replyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </div>

                <p className="text-[10px] text-slate-400">
                  Dibalas oleh: <span className="font-semibold text-slate-600">{currentUserName}</span> • Balasan juga tercatat pada histori order pickup pelanggan.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW_THREAD_MODAL */}
    </div>
  );
};