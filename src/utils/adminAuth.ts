/**
 * Admin Authentication & Security Utility
 * Manages admin password validation, session state, and password updates.
 */

const ADMIN_PASSWORD_KEY = 'trens_admin_password';
const ADMIN_SESSION_KEY = 'trens_admin_session';
const ADMIN_REMEMBER_KEY = 'trens_admin_remember';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

/**
 * Get the current admin password from local storage or fallback to default
 */
export const getStoredAdminPassword = (): string => {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PASSWORD;
  return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
};

/**
 * Update the admin password in local storage
 */
export const setStoredAdminPassword = (newPass: string): boolean => {
  if (!newPass || newPass.trim().length < 4) return false;
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPass.trim());
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
};
