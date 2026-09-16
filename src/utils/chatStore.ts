import { ChatMessage, ChatThread, ChatThreadStatus, OrderRequest } from '../types';

export const CHAT_STORAGE_KEY = 'trens_chat_threads_v1';

export const getStoredThreads = (): ChatThread[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ChatThread[]) : [];
  } catch {
    return [];
  }
};

export const saveStoredThreads = (threads: ChatThread[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(threads));
    window.dispatchEvent(new CustomEvent('trens_chat_updated', { detail: threads }));
  } catch (err) {
    console.warn('Failed to save chat threads:', err);
  }
};

export const generateThreadId = (): string => `THR-${Date.now().toString(36).toUpperCase()}`;
export const generateMessageId = (): string =>
  `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const messageSignature = (msg: ChatMessage): string =>
  `${msg.dari}|${msg.waktu}|${msg.isi}`.toLowerCase();

const messageExists = (messages: ChatMessage[], candidate: ChatMessage): boolean => {
  const sig = messageSignature(candidate);
  return messages.some((m) => messageSignature(m) === sig);
};

export const subscribeToChatUpdates = (callback: (threads: ChatThread[]) => void): (() => void) => {
  const handleCustom = (e: Event) => {
    const custom = e as CustomEvent<ChatThread[]>;
    callback(custom.detail || getStoredThreads());
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === CHAT_STORAGE_KEY) callback(getStoredThreads());
  };

  window.addEventListener('trens_chat_updated', handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('trens_chat_updated', handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
};

/**
 * Sinkronkan thread chat tersimpan dengan data order terbaru.
 * Pesan customer baru dari website otomatis masuk ke inbox CS
 * (dan dihitung sebagai belum dibaca), sedangkan balasan admin tetap tersimpan.
 */
export const mergeThreadsWithOrders = (stored: ChatThread[], orders: OrderRequest[]): ChatThread[] => {
  const map = new Map<string, ChatThread>();
  stored.forEach((t) => map.set(t.id, { ...t, messages: [...t.messages] }));

  orders.forEach((order) => {
    const existing = map.get(order.id);
    const orderMessages = order.chat || [];

    const thread: ChatThread = existing
      ? { ...existing, messages: [...existing.messages] }
      : {
          id: order.id,
          customerName: order.nama,
          customerPhone: order.hp,
          subject: order.barang || 'Permintaan Pengiriman',
          resi: order.resi,
          orderId: order.id,
          moda: order.moda,
          rute: order.rute,
          status: 'Baru' as ChatThreadStatus,
          messages: [],
          unreadAdmin: 0,
          createdAt: order.tanggal || new Date().toISOString(),
          updatedAt: order.tanggal || new Date().toISOString()
        };

    orderMessages.forEach((raw) => {
      const candidate: ChatMessage = {
        id: generateMessageId(),
        dari: raw.dari,
        isi: raw.isi,
        waktu: raw.waktu
      };
      if (!messageExists(thread.messages, candidate)) {
        thread.messages.push(candidate);
        if (raw.dari === 'customer') {
          thread.unreadAdmin += 1;
          if (thread.status === 'Selesai') thread.status = 'Baru';
        }
      }
    });

    thread.customerName = order.nama || thread.customerName;
    thread.customerPhone = order.hp || thread.customerPhone;
    thread.resi = order.resi || thread.resi;
    thread.subject = order.barang || thread.subject;
    thread.rute = order.rute || thread.rute;
    thread.status = order.status === 'Selesai' ? 'Selesai' : thread.status;

    map.set(order.id, thread);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

/**
 * Balas thread dari sisi admin (mengembalikan daftar thread terbaru)
 */
export const appendAdminReply = (
  threads: ChatThread[],
  threadId: string,
  text: string,
  pengirim: string = 'Customer Service'
): ChatThread[] => {
  const trimmed = text.trim();
  if (!trimmed) return threads;

  const now = new Date().toISOString();
  const timeLabel = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const updated = threads.map((t) => {
    if (t.id !== threadId) return t;
    const reply: ChatMessage = {
      id: generateMessageId(),
      dari: 'admin',
      isi: trimmed,
      waktu: timeLabel,
      pengirim
    };
    return {
      ...t,
      messages: [...t.messages, reply],
      status: t.status === 'Baru' ? 'Aktif' : t.status,
      updatedAt: now
    };
  });

  saveStoredThreads(updated);
  return updated;
};

export const markThreadRead = (threads: ChatThread[], threadId: string): ChatThread[] => {
  const updated = threads.map((t) => (t.id === threadId ? { ...t, unreadAdmin: 0 } : t));
  saveStoredThreads(updated);
  return updated;
};

export const markAllThreadsRead = (threads: ChatThread[]): ChatThread[] => {
  const updated = threads.map((t) => ({ ...t, unreadAdmin: 0 }));
  saveStoredThreads(updated);
  return updated;
};

export const updateThreadStatus = (
  threads: ChatThread[],
  threadId: string,
  status: ChatThreadStatus
): ChatThread[] => {
  const updated = threads.map((t) =>
    t.id === threadId ? { ...t, status, updatedAt: new Date().toISOString() } : t
  );
  saveStoredThreads(updated);
  return updated;
};

export const deleteThread = (threads: ChatThread[], threadId: string): ChatThread[] => {
  const updated = threads.filter((t) => t.id !== threadId);
  saveStoredThreads(updated);
  return updated;
};

export const createManualThread = (
  threads: ChatThread[],
  payload: { customerName: string; customerPhone: string; subject: string; message: string; pengirim?: string }
): ChatThread[] => {
  const now = new Date().toISOString();
  const timeLabel = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const thread: ChatThread = {
    id: generateThreadId(),
    customerName: payload.customerName.trim() || 'Pelanggan Baru',
    customerPhone: payload.customerPhone.trim(),
    subject: payload.subject.trim() || 'Pertanyaan Umum',
    status: 'Baru',
    messages: [
      {
        id: generateMessageId(),
        dari: 'customer',
        isi: payload.message.trim(),
        waktu: timeLabel
      }
    ],
    unreadAdmin: 1,
    createdAt: now,
    updatedAt: now
  };

  const updated = [thread, ...threads];
  saveStoredThreads(updated);
  return updated;
};

export interface ChatInboxSummary {
  totalThreads: number;
  unreadThreads: number;
  unreadMessages: number;
  newThreads: number;
  activeThreads: number;
  closedThreads: number;
  waitingReply: number;
}

export const buildChatSummary = (threads: ChatThread[]): ChatInboxSummary => {
  const unreadThreads = threads.filter((t) => t.unreadAdmin > 0);
  return {
    totalThreads: threads.length,
    unreadThreads: unreadThreads.length,
    unreadMessages: threads.reduce((sum, t) => sum + t.unreadAdmin, 0),
    newThreads: threads.filter((t) => t.status === 'Baru').length,
    activeThreads: threads.filter((t) => t.status === 'Aktif').length,
    closedThreads: threads.filter((t) => t.status === 'Selesai').length,
    waitingReply: threads.filter((t) => {
      const last = t.messages[t.messages.length - 1];
      return !!last && last.dari === 'customer';
    }).length
  };
};

export const QUICK_REPLY_TEMPLATES: { label: string; text: string }[] = [
  {
    label: 'Konfirmasi Pickup',
    text: 'Terima kasih telah menghubungi TRENS-LOGISTIC. Penjemputan barang Anda sudah kami jadwalkan. Tim kurir akan menghubungi Anda sebelum tiba di lokasi.'
  },
  {
    label: 'Estimasi Tiba',
    text: 'Untuk estimasi waktu tiba, kami akan menginformasikan update checkpoint terbaru melalui halaman pelacakan resi resmi kami. Mohon pantau terus ya Kak.'
  },
  {
    label: 'Konfirmasi Tarif',
    text: 'Berikut kami informasikan tarif pengiriman sesuai rute dan berat aktual. Tarif sudah termasuk asuransi dasar dan biaya handling gudang.'
  },
  {
    label: 'Minta Alamat Lengkap',
    text: 'Boleh dibantu kirimkan alamat lengkap penjemputan beserta patokan lokasinya, Kak? Agar tim kurir kami lebih mudah menemukan titik pickup.'
  },
  {
    label: 'Terima Kasih',
    text: 'Terima kasih telah menggunakan layanan TRENS-LOGISTIC. Kepuasan Anda adalah prioritas kami. Jika ada kebutuhan pengiriman berikutnya, silakan hubungi kami kembali.'
  }
];