import { doc, setDoc, collection, onSnapshot, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ActivityLog, LogCategory, LogLevel } from '../types';

const LOCAL_STORAGE_KEY = 'trens_activity_logs';

/**
 * Seed realistic initial audit logs if storage is currently empty
 */
const getInitialSeedLogs = (): ActivityLog[] => {
  const now = new Date();
  
  const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'LOG-SYS-001',
      timestamp: hoursAgo(6),
      category: 'SYSTEM',
      action: 'SYSTEM_BOOT',
      actor: 'Sistem Kargo',
      title: 'Inisialisasi Sistem ERP Kargo',
      description: 'Engine routing, gateway tarif kargo real-time, dan modul sinkronisasi database aktif.',
      targetId: 'SYS-INIT',
      level: 'info'
    },
    {
      id: 'LOG-AUTH-002',
      timestamp: hoursAgo(5),
      category: 'AUTH',
      action: 'ADMIN_LOGIN',
      actor: 'Master Admin (admin)',
      title: 'Otorisasi Akses Admin Berhasil',
      description: 'Sesi administrator aktif melalui verifikasi kata sandi master dari perangkat lokal.',
      level: 'success'
    },
    {
      id: 'LOG-RESI-003',
      timestamp: hoursAgo(4),
      category: 'RESI',
      action: 'CREATE_RESI',
      actor: 'Admin Dispatcher',
      title: 'Pemuatan Resi Baru Diterbitkan',
      description: 'Resi TRN-2026-0891 dibuat untuk rute Surabaya ke Makassar via Kargo Laut Pelni.',
      targetId: 'TRN-2026-0891',
      details: { moda: 'Laut', berat: '145 kg', koli: 3 },
      level: 'success'
    },
    {
      id: 'LOG-RESI-004',
      timestamp: hoursAgo(3),
      category: 'RESI',
      action: 'UPDATE_CHECKPOINT',
      actor: 'Petugas Hub Perak',
      title: 'Checkpoint Pemindaian Kargo',
      description: 'Resi TRN-2026-0891 tiba di Hub Pelabuhan Tanjung Perak & siap loading kapal container.',
      targetId: 'TRN-2026-0891',
      details: { lokasi: 'Pelabuhan Tanjung Perak', status: 'Dalam Perjalanan' },
      level: 'info'
    },
    {
      id: 'LOG-ORDER-005',
      timestamp: hoursAgo(2),
      category: 'ORDER',
      action: 'CONFIRM_ORDER',
      actor: 'Admin CS',
      title: 'Konfirmasi Permintaan Order Pickup',
      description: 'Order ORD-8491 (PT Sinar Abadi - Jakarta ke Balikpapan) telah dikonfirmasi & dijadwalkan pickup.',
      targetId: 'ORD-8491',
      details: { armada: 'Blind Van CDE', estimasiBiaya: 1850000 },
      level: 'success'
    },
    {
      id: 'LOG-INV-006',
      timestamp: hoursAgo(1),
      category: 'INVOICE',
      action: 'ISSUE_INVOICE',
      actor: 'Finance Officer',
      title: 'Penerbitan Resi Pengiriman & Faktur Tagihan',
      description: 'Dokumen faktur tagihan INV-2026-0041 diterbitkan untuk PT Mitra Logistik Nusantara.',
      targetId: 'INV-2026-0041',
      details: { totalTagihan: 4250000, statusBayar: 'LUNAS' },
      level: 'info'
    },
    {
      id: 'LOG-PARTNER-007',
      timestamp: minutesAgo(40),
      category: 'PARTNER',
      action: 'PARTNER_APPROVED',
      actor: 'Manager Operasional',
      title: 'Persetujuan Mitra Agen Kargo',
      description: 'Pengajuan kemitraan agen resmi PT Borneo Kargo Perkasa (Balikpapan) disetujui.',
      targetId: 'PTR-092',
      level: 'success'
    },
    {
      id: 'LOG-AUTH-008',
      timestamp: minutesAgo(15),
      category: 'AUTH',
      action: 'CHANGE_PASSWORD',
      actor: 'Master Admin (admin)',
      title: 'Pembaruan Kata Sandi Administrator',
      description: 'Kata sandi akun master admin berhasil diperbarui melalui verifikasi sandi lama.',
      level: 'warning'
    }
  ];
};

/**
 * Get cached logs from local storage
 */
export const getCachedActivityLogs = (): ActivityLog[] => {
  if (typeof window === 'undefined') return getInitialSeedLogs();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedLogs();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getInitialSeedLogs();
  } catch {
    return getInitialSeedLogs();
  }
};

/**
 * Save logs to local cache
 */
const saveCachedActivityLogs = (logs: ActivityLog[]): void => {
  if (typeof window === 'undefined') return;
  try {
    // Keep maximum 500 newest logs
    const trimmed = logs.slice(0, 500);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Could not cache activity logs:', e);
  }
};

/**
 * Record a new activity log event
 */
export const logActivity = async (
  entry: Omit<ActivityLog, 'id' | 'timestamp'> & { customId?: string; timestamp?: string }
): Promise<ActivityLog> => {
  const newLog: ActivityLog = {
    id: entry.customId || `LOG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    category: entry.category,
    action: entry.action,
    actor: entry.actor || 'Admin',
    title: entry.title,
    description: entry.description,
    targetId: entry.targetId,
    details: entry.details,
    level: entry.level
  };

  // 1. Immediately prepend to local cache so UI updates with zero latency
  const currentLogs = getCachedActivityLogs();
  const updatedLogs = [newLog, ...currentLogs.filter(l => l.id !== newLog.id)];
  saveCachedActivityLogs(updatedLogs);

  // 2. Persist to Firestore asynchronously
  try {
    const docRef = doc(db, 'activity_logs', newLog.id);
    await setDoc(docRef, newLog, { merge: true });
  } catch (err) {
    console.warn('Notice: Log saved to local storage, Firestore sync pending:', err);
  }

  return newLog;
};

/**
 * Real-time subscription to activity logs
 */
export const subscribeActivityLogs = (callback: (logs: ActivityLog[]) => void): (() => void) => {
  // Give immediate response from local cache
  const initialLogs = getCachedActivityLogs();
  callback(initialLogs);

  try {
    const colRef = collection(db, 'activity_logs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(150));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ActivityLog[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as ActivityLog);
          });
          // Merge with any local logs not yet in snapshot
          const mergedMap = new Map<string, ActivityLog>();
          list.forEach(item => mergedMap.set(item.id, item));
          initialLogs.forEach(item => {
            if (!mergedMap.has(item.id)) {
              mergedMap.set(item.id, item);
            }
          });
          const sorted = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          saveCachedActivityLogs(sorted);
          callback(sorted);
        }
      },
      (err) => {
        console.warn('Activity logs firestore subscription notice (using local offline cache):', err);
      }
    );
  } catch (err) {
    console.warn('Activity logs subscription fallback:', err);
    return () => {};
  }
};

/**
 * Clear or reset all activity logs
 */
export const clearActivityLogs = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  }
  try {
    const colRef = collection(db, 'activity_logs');
    const snap = await getDocs(query(colRef, limit(50)));
    snap.forEach(async (d) => {
      try {
        await deleteDoc(d.ref);
      } catch {}
    });
  } catch (e) {
    console.warn('Notice clearing firestore logs:', e);
  }
};

/* Convenience Helper Methods */

export const logAdminLogin = (actor: string = 'Master Administrator (admin)') => {
  return logActivity({
    category: 'AUTH',
    action: 'ADMIN_LOGIN',
    actor,
    title: 'Otorisasi Masuk Admin',
    description: 'Sesi Dashboard Admin berhasil dibuka menggunakan kata sandi.',
    level: 'success'
  });
};

export const logAdminLogout = (actor: string = 'Master Administrator (admin)') => {
  return logActivity({
    category: 'AUTH',
    action: 'ADMIN_LOGOUT',
    actor,
    title: 'Keluar Sesi Admin (Logout)',
    description: 'Sesi administrator ditutup & portal admin dikunci kembali.',
    level: 'info'
  });
};

export const logAdminPasswordChanged = (actor: string = 'Master Administrator (admin)') => {
  return logActivity({
    category: 'AUTH',
    action: 'CHANGE_PASSWORD',
    actor,
    title: 'Pembaruan Kata Sandi Admin',
    description: 'Kata sandi master administrator berhasil diperbarui.',
    level: 'warning'
  });
};

export const logResiCreated = (resi: string, rute: string, moda: string, actor: string = 'Petugas Dispatcher') => {
  return logActivity({
    category: 'RESI',
    action: 'CREATE_RESI',
    actor,
    title: 'Pemuatan Resi Baru Dibuat',
    description: `Resi ${resi} berhasil diterbitkan untuk rute ${rute} via kargo ${moda}.`,
    targetId: resi,
    details: { rute, moda },
    level: 'success'
  });
};

export const logCheckpointUpdated = (resi: string, checkpointKota: string, status: string, actor: string = 'Petugas Hub') => {
  return logActivity({
    category: 'RESI',
    action: 'UPDATE_CHECKPOINT',
    actor,
    title: 'Pembaruan Checkpoint Kargo',
    description: `Resi ${resi} diperbarui: Checkpoint ${checkpointKota} - Status "${status}".`,
    targetId: resi,
    details: { checkpointKota, status },
    level: 'info'
  });
};

export const logResiDeleted = (resi: string, actor: string = 'Master Admin') => {
  return logActivity({
    category: 'RESI',
    action: 'DELETE_RESI',
    actor,
    title: 'Penghapusan Resi Kargo',
    description: `Data muatan kargo nomor resi ${resi} telah dihapus dari sistem.`,
    targetId: resi,
    level: 'danger'
  });
};

export const logOrderCreated = (orderId: string, nama: string, rute: string) => {
  return logActivity({
    category: 'ORDER',
    action: 'CREATE_ORDER',
    actor: `Customer (${nama})`,
    title: 'Permintaan Pickup / Order Baru',
    description: `Order ${orderId} diajukan oleh ${nama} untuk pengiriman rute ${rute}.`,
    targetId: orderId,
    level: 'info'
  });
};

export const logOrderStatusUpdated = (orderId: string, status: string, actor: string = 'Admin Operasional') => {
  return logActivity({
    category: 'ORDER',
    action: 'UPDATE_ORDER_STATUS',
    actor,
    title: `Status Order ${orderId} Diperbarui`,
    description: `Order pickup ${orderId} diubah statusnya menjadi "${status}".`,
    targetId: orderId,
    level: status === 'Selesai' || status === 'Dikonfirmasi' ? 'success' : 'info'
  });
};

export const logInvoiceCreated = (invoiceId: string, resi: string, total: number, actor: string = 'Admin Keuangan') => {
  return logActivity({
    category: 'INVOICE',
    action: 'CREATE_INVOICE',
    actor,
    title: 'Penerbitan Dokumen Resi & Invoice',
    description: `Faktur tagihan / resi pengiriman ${invoiceId} diterbitkan untuk Resi ${resi} total Rp ${total.toLocaleString('id-ID')}.`,
    targetId: invoiceId,
    details: { resi, total },
    level: 'info'
  });
};

export const logInvoiceUpdated = (invoiceId: string, customerName: string, total: number, actor: string = 'Admin Keuangan') => {
  return logActivity({
    category: 'INVOICE',
    action: 'UPDATE_INVOICE',
    actor,
    title: `Pembaruan Invoice #${invoiceId}`,
    description: `Faktur tagihan ${invoiceId} atas nama ${customerName} diperbarui (Total: Rp ${total.toLocaleString('id-ID')}).`,
    targetId: invoiceId,
    details: { customerName, total },
    level: 'info'
  });
};

export const logInvoiceDeleted = (invoiceId: string, actor: string = 'Admin Keuangan') => {
  return logActivity({
    category: 'INVOICE',
    action: 'DELETE_INVOICE',
    actor,
    title: `Penghapusan Invoice #${invoiceId}`,
    description: `Faktur tagihan ${invoiceId} berhasil dihapus dari sistem kargo.`,
    targetId: invoiceId,
    level: 'danger'
  });
};

export const logResiUpdated = (resi: string, rute: string, actor: string = 'Petugas Dispatcher') => {
  return logActivity({
    category: 'RESI',
    action: 'UPDATE_RESI',
    actor,
    title: `Pembaruan Data Resi ${resi}`,
    description: `Rincian muatan kargo nomor resi ${resi} (${rute}) berhasil diperbarui.`,
    targetId: resi,
    level: 'info'
  });
};

export const logPartnerStatusUpdated = (partnerId: string, nama: string, status: string, actor: string = 'Admin Kemitraan') => {
  return logActivity({
    category: 'PARTNER',
    action: 'UPDATE_PARTNER',
    actor,
    title: `Status Kemitraan Diperbarui`,
    description: `Pendaftaran kemitraan ${nama} (${partnerId}) diubah statusnya menjadi "${status}".`,
    targetId: partnerId,
    level: status === 'Disetujui' ? 'success' : 'info'
  });
};

export const logExcelImported = (count: number, actor: string = 'Admin Operasional') => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'IMPORT_EXCEL',
    actor,
    title: 'Import Massal File Excel',
    description: `Sebanyak ${count} baris data berhasil diimpor ke sistem pemuatan kargo.`,
    level: 'success'
  });
};

/* ==========================================================================
 * Master Pelanggan
 * ========================================================================== */
export const logCustomerCreated = (
  customerName: string,
  kota: string,
  segmen: string,
  actor: string = 'Admin Operasional'
) => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'CREATE_CUSTOMER',
    actor,
    title: 'Pelanggan Baru Ditambahkan',
    description: `Data pelanggan ${customerName} (${segmen}) wilayah ${kota} berhasil disimpan ke master pelanggan.`,
    targetId: customerName,
    details: { kota, segmen },
    level: 'success'
  });
};

export const logCustomerUpdated = (
  customerName: string,
  kota: string,
  actor: string = 'Admin Operasional'
) => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'UPDATE_CUSTOMER',
    actor,
    title: 'Data Pelanggan Diperbarui',
    description: `Profil pelanggan ${customerName} (${kota}) berhasil diperbarui.`,
    targetId: customerName,
    level: 'info'
  });
};

export const logCustomerDeleted = (customerName: string, actor: string = 'Admin Operasional') => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'DELETE_CUSTOMER',
    actor,
    title: 'Pelanggan Dihapus',
    description: `Data pelanggan ${customerName} dihapus dari master pelanggan.`,
    targetId: customerName,
    level: 'danger'
  });
};

/* ==========================================================================
 * Pusat Chat / Customer Service
 * ========================================================================== */
export const logChatThreadCreated = (
  threadId: string,
  customerName: string,
  subject: string,
  actor: string = 'Customer Service'
) => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'CREATE_CHAT_THREAD',
    actor,
    title: 'Percakapan CS Baru Dibuka',
    description: `Thread ${threadId} untuk ${customerName} (${subject}) dibuka dari pusat layanan pelanggan.`,
    targetId: threadId,
    level: 'info'
  });
};

export const logChatReplied = (
  threadId: string,
  customerName: string,
  actor: string = 'Customer Service'
) => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'REPLY_CHAT',
    actor,
    title: 'Balasan Chat Pelanggan Terkirim',
    description: `Balasan dikirim ke percakapan ${customerName} (thread ${threadId}).`,
    targetId: threadId,
    level: 'success'
  });
};

export const logChatStatusUpdated = (
  threadId: string,
  status: string,
  actor: string = 'Customer Service'
) => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'UPDATE_CHAT_STATUS',
    actor,
    title: 'Status Percakapan Diperbarui',
    description: `Thread ${threadId} diubah statusnya menjadi "${status}".`,
    targetId: threadId,
    level: status === 'Selesai' ? 'success' : 'info'
  });
};

export const logChatDeleted = (threadId: string, customerName: string, actor: string = 'Customer Service') => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'DELETE_CHAT_THREAD',
    actor,
    title: 'Percakapan Pelanggan Dihapus',
    description: `Thread ${threadId} milik ${customerName} dihapus dari inbox CS.`,
    targetId: threadId,
    level: 'danger'
  });
};

/* ==========================================================================
 * Manajemen Pengguna Admin (RBAC)
 * ========================================================================== */
export const logUserCreated = (
  username: string,
  role: string,
  actor: string = 'Owner'
) => {
  return logActivity({
    category: 'AUTH',
    action: 'CREATE_USER',
    actor,
    title: 'Akun Pengguna Baru Dibuat',
    description: `Akun "${username}" dengan hak akses ${role} berhasil ditambahkan ke sistem.`,
    targetId: username,
    details: { role },
    level: 'success'
  });
};

export const logUserUpdated = (
  username: string,
  detail: string,
  actor: string = 'Owner'
) => {
  return logActivity({
    category: 'AUTH',
    action: 'UPDATE_USER',
    actor,
    title: 'Akun Pengguna Diperbarui',
    description: `Akun "${username}" diperbarui (${detail}).`,
    targetId: username,
    level: 'warning'
  });
};

export const logUserDeleted = (username: string, role: string, actor: string = 'Owner') => {
  return logActivity({
    category: 'AUTH',
    action: 'DELETE_USER',
    actor,
    title: 'Akun Pengguna Dihapus',
    description: `Akun "${username}" dengan hak akses ${role} dihapus dari sistem.`,
    targetId: username,
    level: 'danger'
  });
};

/* ==========================================================================
 * Laporan & Keuangan
 * ========================================================================== */
export const logReportExported = (
  periodLabel: string,
  totalRows: number,
  actor: string = 'Admin Keuangan'
) => {
  return logActivity({
    category: 'OPERATIONAL',
    action: 'EXPORT_REPORT',
    actor,
    title: 'Unduh Laporan Keuangan & Operasional',
    description: `Laporan periode ${periodLabel} (${totalRows} resi) berhasil diekspor ke Excel.`,
    level: 'info'
  });
};
