import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { Mail, Lock, User as UserIcon, ArrowRight, Chrome, AlertCircle, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { signInWithGoogle, signInEmail, signUpEmail } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Nama lengkap wajib diisi');
        if (password.length < 6) throw new Error('Password minimal 6 karakter');
        await signUpEmail(name, email, password);
      } else {
        await signInEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email atau kata sandi tidak valid.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar. Silakan login.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat masuk.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Gagal login menggunakan akun Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Subtle modern backdrop gradient glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="lg" />
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-4">
            {isRegister ? 'Buat Akun Baru' : 'Selamat Datang Kembali'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola dompet, catat transaksi & scan struk AI dengan aman di cloud.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Login Button */}
        <button
          type="button"
          id="btn-google-login"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 flex items-center justify-center gap-3 font-medium text-slate-700 dark:text-slate-200 text-sm shadow-xs cursor-pointer disabled:opacity-60"
        >
          <Chrome className="w-5 h-5 text-emerald-500" />
          <span>Lanjutkan dengan Google</span>
        </button>

        <div className="flex items-center my-5">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="px-3 text-xs uppercase font-medium text-slate-400 tracking-wider">
            atau email
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="input-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                id="input-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn-submit-auth"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            <span>{loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk ke Akun'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button
            type="button"
            id="btn-toggle-auth-mode"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isRegister ? 'Masuk di sini' : 'Daftar gratis'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Keamanan Cloud Firestore & Firebase Auth</span>
        </div>
      </div>
    </div>
  );
};
