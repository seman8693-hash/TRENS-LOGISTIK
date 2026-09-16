/**
 * Admin Authentication & Security Utility
 * Manages multi-user admin accounts, role based access control (RBAC),
 * session state, and password updates.
 *
 * CATATAN KEAMANAN: kata sandi sengaja HANYA disimpan di localStorage perangkat
 * (tidak pernah dikirim ke Firestore) agar tidak bisa dibaca klien lain.
 */

import { AdminUser, DashboardTab, UserRole } from '../types';

const ADMIN_PASSWORD_KEY = 'trens_admin_password';
const ADMIN_SESSION_KEY = 'trens_admin_session';
const ADMIN_REMEMBER_KEY = 'trens_admin_remember';
const ADMIN_USERS_KEY = 'trens_admin_users_v1';
const ADMIN_CURRENT_USER_KEY = 'trens_admin_current_user';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

/* ==========================================================================
 * Role Based Access Control Matrix
 * ========================================================================== */
export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner / Pemilik',
  admin: 'Administrator',
  operator: 'Operator Operasional',
  viewer: 'Viewer (Hanya Lihat)'
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  owner: 'Akses penuh termasuk kelola pengguna, tarif, integrasi API & seluruh data operasional.',
  admin: 'Akses hampir penuh untuk operasional, invoice, laporan, dan pelanggan (tanpa kelola pengguna).',
  operator: 'Fokus operasional harian: resi, order pickup, chat pelanggan, dan master pelanggan.',
  viewer: 'Hanya dapat melihat ringkasan, laporan, dan histori tanpa mengubah data.'
};

/** Daftar tab dashboard yang boleh diakses per role */
export const ROLE_TAB_ACCESS: Record<UserRole, DashboardTab[]> = {
  owner: [
    'overview', 'reports', 'logs', 'admin', 'users', 'invoices', 'customers',
    'chat', 'shipments', 'orders', 'partners', 'rates', 'integration'
  ],
  admin: [
    'overview', 'reports', 'logs', 'admin', 'invoices', 'customers',
    'chat', 'shipments', 'orders', 'partners', 'rates', 'integration'
  ],
  operator: [
    'overview', 'shipments', 'orders', 'partners', 'customers', 'chat', 'logs', 'admin'
  ],
  viewer: [
    'overview', 'reports', 'logs', 'customers', 'shipments', 'orders', 'partners', 'invoices'
  ]
};

/** Role yang diizinkan melakukan perubahan data (bukan read-only) */
export const WRITE_ROLES: UserRole[] = ['owner', 'admin', 'operator'];

/* ==========================================================================
 * Multi-user Store (localStorage only — tidak disinkronkan ke Firestore publik)
 * ========================================================================== */
export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-OWNER-001',
    username: 'admin',
    nama: 'Master Administrator',
    email: 'admin@trenslogistic.id',
    role: 'owner',
    password: DEFAULT_ADMIN_PASSWORD,
    active: true,
    createdAt: '2026-01-05T02:00:00.000Z',
    createdBy: 'system'
  },
  {
    id: 'USR-ADMIN-002',
    username: 'finance',
    nama: 'Admin Keuangan',
    email: 'finance@trenslogistic.id',
    role: 'admin',
    password: 'finance123',
    active: true,
    createdAt: '2026-01-12T02:00:00.000Z',
    createdBy: 'admin'
  },
  {
    id: 'USR-OPS-003',
    username: 'operasional',
    nama: 'Operator Gudang & Hub',
    email: 'ops@trenslogistic.id',
    role: 'operator',
    password: 'ops12345',
    active: true,
    createdAt: '2026-02-02T02:00:00.000Z',
    createdBy: 'admin'
  }
];

export const getStoredUsers = (): AdminUser[] => {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_USERS;
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (!raw) {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(DEFAULT_ADMIN_USERS));
      return DEFAULT_ADMIN_USERS;
    }
    return parsed as AdminUser[];
  } catch {
    return DEFAULT_ADMIN_USERS;
  }
};

export const saveStoredUsers = (users: AdminUser[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('trens_users_updated', { detail: users }));
  } catch (err) {
    console.warn('Failed to save admin users:', err);
  }
};

export const generateUserId = (role: UserRole): string => {
  const prefix = role === 'owner' ? 'OWNER' : role === 'admin' ? 'ADMIN' : role === 'operator' ? 'OPS' : 'VIEW';
  return `USR-${prefix}-${Date.now().toString(36).toUpperCase()}`;
};

export const getCurrentUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const id = sessionStorage.getItem(ADMIN_CURRENT_USER_KEY) || localStorage.getItem(ADMIN_CURRENT_USER_KEY);
  if (!id) {
    // Fallback sesi lama (login password-only) => dianggap master owner
    if (isAdminLoggedIn()) {
      return getStoredUsers().find((u) => u.role === 'owner') || null;
    }
    return null;
  }
  return getStoredUsers().find((u) => u.id === id) || null;
};

export const setCurrentUser = (user: AdminUser | null, remember: boolean = false): void => {
  if (typeof window === 'undefined') return;
  if (!user) {
    sessionStorage.removeItem(ADMIN_CURRENT_USER_KEY);
    localStorage.removeItem(ADMIN_CURRENT_USER_KEY);
    return;
  }
  sessionStorage.setItem(ADMIN_CURRENT_USER_KEY, user.id);
  if (remember) {
    localStorage.setItem(ADMIN_CURRENT_USER_KEY, user.id);
  } else {
    localStorage.removeItem(ADMIN_CURRENT_USER_KEY);
  }
};

export const getCurrentUserLabel = (user?: AdminUser | null): string => {
  const target = user === undefined ? getCurrentUser() : user;
  if (!target) return 'Master Administrator (admin)';
  return `${target.nama} (${target.username} • ${target.role})`;
};

/* ==========================================================================
 * Permission Helpers
 * ========================================================================== */
export const canAccessTab = (user: AdminUser | null, tab: DashboardTab): boolean => {
  if (!user) return false;
  const allowed = ROLE_TAB_ACCESS[user.role] || [];
  return allowed.includes(tab);
};

export const canWrite = (user: AdminUser | null): boolean => {
  if (!user) return false;
  return WRITE_ROLES.includes(user.role);
};

export const canManageUsers = (user: AdminUser | null): boolean => !!user && user.role === 'owner';

export const getFirstAccessibleTab = (user: AdminUser | null): DashboardTab => {
  if (!user) return 'overview';
  const allowed = ROLE_TAB_ACCESS[user.role] || ['overview'];
  return allowed.includes('overview') ? 'overview' : allowed[0];
};

/* ==========================================================================
 * Login / Logout
 * ========================================================================== */
export interface LoginResult {
  success: boolean;
  user?: AdminUser;
  message?: string;
}

export const loginUser = (username: string, password: string, remember: boolean = false): LoginResult => {
  const users = getStoredUsers();
  const cleanUsername = (username || '').trim().toLowerCase();
  const cleanPassword = password.trim();

  // Dukungan login lama: cukup kata sandi, username otomatis "admin"
  const normalizedUsername = cleanUsername || 'admin';

  const user = users.find((u) => u.username.toLowerCase() === normalizedUsername);

  if (!user) {
    return {
      success: false,
      message: `Akun "${normalizedUsername}" tidak ditemukan. Periksa kembali username Anda.`
    };
  }

  if (!user.active) {
    return {
      success: false,
      message: `Akun "${user.username}" sedang dinonaktifkan. Hubungi Owner untuk mengaktifkan kembali.`
    };
  }

  const masterPassword = getStoredAdminPassword();
  const isMasterOwner = user.role === 'owner';
  const passwordMatches = isMasterOwner
    ? cleanPassword === masterPassword || cleanPassword === user.password
    : cleanPassword === user.password;

  if (!passwordMatches) {
    return { success: false, message: 'Kata sandi salah! Pastikan username dan sandi Anda benar.' };
  }

  const loginTime = new Date().toISOString();
  saveStoredUsers(users.map((u) => (u.id === user.id ? { ...u, lastLogin: loginTime } : u)));

  const loggedInUser: AdminUser = { ...user, lastLogin: loginTime };
  setAdminSession(remember);
  setCurrentUser(loggedInUser, remember);

  return { success: true, user: loggedInUser };
};

/**
 * Get the current admin password from local storage or fallback to default
 */
export const getStoredAdminPassword = (): string => {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
};

/**
 * Update the admin password in local storage (sekaligus sinkron ke akun owner)
 */
export const setStoredAdminPassword = (newPass: string): boolean => {
  if (!newPass || newPass.trim().length < 4) return false;
  const clean = newPass.trim();
  localStorage.setItem(ADMIN_PASSWORD_KEY, clean);

  // Sinkronkan kata sandi akun owner agar login multi-user tetap konsisten
  try {
    const updated = getStoredUsers().map((u) =>
      u.role === 'owner' ? { ...u, password: clean } : u
    );
    saveStoredUsers(updated);
  } catch (err) {
    console.warn('Could not sync owner password:', err);
  }

  return true;
};

/**
 * Verify if the given password matches the current admin password
 */
export const verifyAdminPassword = (inputPass: string): boolean => {
  const currentPass = getStoredAdminPassword();
  return inputPass.trim() === currentPass;
};

/**
 * Check if the admin is currently authenticated in the active session
 */
export const isAdminLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  const inSession = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  const isRemembered = localStorage.getItem(ADMIN_REMEMBER_KEY) === 'true';
  return inSession || isRemembered;
};

/**
 * Set the admin session as authenticated
 */
export const setAdminSession = (remember: boolean = false): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  if (remember) {
    localStorage.setItem(ADMIN_REMEMBER_KEY, 'true');
  } else {
    localStorage.removeItem(ADMIN_REMEMBER_KEY);
  }
};

/**
 * Terminate the admin session (logout)
 */
export const clearAdminSession = (): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_REMEMBER_KEY);
  setCurrentUser(null);
};
