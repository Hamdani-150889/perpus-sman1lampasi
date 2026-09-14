import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Library, 
  LogIn, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const defaultUsername = 'admin';
  const defaultPassword = 'admin123';

  const handleAutoFill = () => {
    setUsername(defaultUsername);
    setPassword(defaultPassword);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }
    if (!password) {
      setError('Password tidak boleh kosong');
      return;
    }

    setIsLoading(true);

    // Simulate small delay for professional feel
    setTimeout(() => {
      if (
        username.trim().toLowerCase() === defaultUsername && 
        password === defaultPassword
      ) {
        if (rememberMe) {
          localStorage.setItem('lib_is_logged_in', 'true');
        } else {
          sessionStorage.setItem('lib_is_logged_in', 'true');
        }
        setIsLoading(false);
        onLogin();
      } else {
        setIsLoading(false);
        setError('Username atau password salah! Silakan coba lagi.');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Top Header section with deep blue school vibes */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
          {/* Subtle background abstract shapes */}
          <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
            <Library size={180} />
          </div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-4 shadow-inner ring-1 ring-white/20">
              <Library size={32} className="text-white animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Perpus SMAN 1 Lampasi</h1>
            <p className="text-xs text-blue-100 mt-1.5 font-medium max-w-xs">
              Sistem Informasi & Manajemen Perpustakaan Sekolah Modern
            </p>
          </div>
        </div>

        {/* Login Form content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-800">Masuk sebagai Administrator</h2>
            <p className="text-xs text-slate-500">Gunakan akun admin untuk mengelola sirkulasi dan katalog buku.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold">Gagal Masuk</p>
                <p className="text-red-600/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-bold text-slate-700 block">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Ingat Saya</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 active:bg-blue-800 transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk Aplikasi</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Info / Demo Account Card */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-blue-800 font-bold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Gunakan Akun Default SMAN 1 Lampasi</span>
            </div>
            <p className="text-blue-700/80 leading-relaxed">
              Untuk kebutuhan demonstrasi, silakan klik tombol di bawah ini atau gunakan kredensial berikut:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-600 bg-white p-2.5 rounded-lg border border-blue-100/50">
              <div>
                <span className="block text-slate-400 font-medium">Username:</span>
                <code className="font-mono font-bold text-blue-600">admin</code>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Password:</span>
                <code className="font-mono font-bold text-blue-600">admin123</code>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isLoading}
              className="w-full mt-2 bg-white hover:bg-blue-50 text-blue-600 py-1.5 rounded-lg text-[11px] font-bold border border-blue-200 transition cursor-pointer"
            >
              Klik untuk Isi Kredensial Otomatis
            </button>
          </div>
        </div>

        {/* School Footer info */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Perpus SMAN 1 Lampasi © 2026 • Dirancang untuk Efisiensi
          </p>
        </div>
      </div>
    </div>
  );
}
