import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  AlertCircle,
  Truck,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { 
  verifyAdminPassword, 
  setAdminSession, 
  setStoredAdminPassword,
  getStoredAdminPassword 
} from '../../utils/adminAuth';
import { logAdminPasswordChanged } from '../../utils/auditLogger';

interface AdminLoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onSuccess,
  onCancel
}) => {
  const [mode, setMode] = useState<'login' | 'change_password'>('login');
  
  // Login states
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Change password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Silakan masukkan kata sandi admin.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const isValid = verifyAdminPassword(password);
      if (isValid) {
        setAdminSession(rememberMe);
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError('Kata sandi admin salah! Pastikan Anda memasukkan sandi yang sesuai.');
      }
    }, 300);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    const currentActual = getStoredAdminPassword();
    if (oldPassword.trim() !== currentActual) {
      setChangeError('Kata sandi saat ini (lama) salah! Masukkan kata sandi yang valid.');
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setChangeError('Kata sandi baru minimal harus 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setChangeError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }

    const success = setStoredAdminPassword(newPassword.trim());
    if (success) {
      logAdminPasswordChanged();
      setChangeSuccess('Kata sandi admin berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setChangeSuccess(null);
      }, 1800);
    } else {
      setChangeError('Gagal memperbarui kata sandi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Dark Navy Logistic Gradient */}
        <div className="relative bg-gradient-to-br from-[#0B1B4D] via-blue-900 to-[#0A163D] p-6 text-white overflow-hidden">
          {/* Background Decorative Accent */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/20 rounded-full blur-xl" />

          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tutup & Kembali"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-[#0B1B4D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide text-amber-400">TRENS-LOGISTIC</span>
                <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PORTAL ADMIN</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                {mode === 'login' ? 'Otorisasi Masuk' : 'Ganti Kata Sandi'}
              </h2>
            </div>
          </div>
          
          <p className="text-xs text-blue-200 leading-relaxed">
            {mode === 'login' 
              ? 'Halaman ini dilindungi kata sandi master untuk keamanan data kargo & sistem operasional.'
              : 'Perbarui kata sandi akses Dashboard Admin secara aman.'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex bg-black/25 p-1 rounded-xl mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setChangeError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Masuk Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('change_password');
                setError(null);
                setChangeError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'change_password' ? 'bg-white text-slate-900 shadow-sm' : 'text-blue-200 hover:text-white'
              }`}
            >
              Ganti Kata Sandi
            </button>
          </div>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{error}</div>
              </div>
            )}

            {/* Username (Fixed / Info) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Identitas Pengguna
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Truck className="w-4 h-4 text-blue-700" />
                </div>
                <input
                  type="text"
                  value="Master Administrator (admin)"
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi Admin <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('change_password');
                    setError(null);
                  }}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                >
                  Ganti Kata Sandi?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Masukkan kata sandi..."
                  autoFocus
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Ingat sesi login di perangkat ini</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-[#0B1B4D] hover:from-blue-800 hover:to-blue-950 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Memeriksa...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Buka Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* CHANGE PASSWORD FORM */}
        {mode === 'change_password' && (
          <form onSubmit={handleChangePasswordSubmit} className="p-6 space-y-3.5 animate-in fade-in">
            {changeError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{changeError}</div>
              </div>
            )}

            {changeSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-snug">{changeSuccess}</div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Saat Ini (Lama) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showChangePassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama..."
                  required
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showChangePassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter..."
                  required
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showChangePassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang kata sandi baru..."
                  required
                  className="w-full px-3.5 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium">
                <input
                  type="checkbox"
                  checked={showChangePassword}
                  onChange={(e) => setShowChangePassword(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span>Tampilkan karakter kata sandi</span>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setChangeError(null);
                  setChangeSuccess(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#0B1B4D] hover:bg-blue-900 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Simpan Sandi Baru</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

