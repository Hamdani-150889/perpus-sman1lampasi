import React from 'react';
import {
  BookOpen,
  Users,
  ArrowLeftRight,
  AlertTriangle,
  Plus,
  Clock,
  DollarSign,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Book, Member, Borrowing } from '../types';

interface DashboardProps {
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  onNavigate: (tab: string) => void;
  onQuickBorrow: () => void;
  onQuickAddBook: () => void;
  onQuickAddMember: () => void;
  onReturnBook: (borrowingId: string) => void;
}

export default function Dashboard({
  books,
  members,
  borrowings,
  onNavigate,
  onQuickBorrow,
  onQuickAddBook,
  onQuickAddMember,
  onReturnBook
}: DashboardProps) {
  // Calculations
  const totalBooks = books.reduce((sum, b) => sum + b.stock, 0);
  const totalBookTitles = books.length;
  const totalMembers = members.length;

  const activeBorrowings = borrowings.filter(b => b.status === 'borrowed' || b.status === 'overdue');
  const totalActiveBorrows = activeBorrowings.length;

  const overdueBorrowings = borrowings.filter(b => b.status === 'overdue');
  const totalOverdueBorrows = overdueBorrowings.length;

  const totalFines = borrowings.reduce((sum, b) => sum + (b.fine || 0), 0);

  // Group books by category for visual breakdown
  const categoryCounts: { [key: string]: number } = {};
  books.forEach(b => {
    categoryCounts[b.category] = (categoryCounts[b.category] || 0) + b.stock;
  });

  const categories = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat],
    percentage: Math.round((categoryCounts[cat] / (totalBooks || 1)) * 100),
    color: getCategoryColor(cat)
  })).sort((a, b) => b.count - a.count);

  function getCategoryColor(cat: string) {
    switch (cat) {
      case 'Sastra & Novel': return 'bg-blue-500';
      case 'Pengembangan Diri': return 'bg-sky-500';
      case 'Bisnis & Keuangan': return 'bg-indigo-600';
      case 'Sejarah & Budaya': return 'bg-amber-500';
      case 'Sains & Teknologi': return 'bg-blue-600';
      default: return 'bg-slate-400';
    }
  }

  // Format currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Welcome Hero / Quick action bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden" id="dashboard-hero">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
          <BookOpen size={240} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Selamat Datang di Pustaka SMAN 3 Tolitoli!</h1>
          <p className="mt-2 text-blue-100 font-normal text-sm md:text-base leading-relaxed">
            Kelola katalog buku, lacak peminjaman siswa, dan pantau status pengembalian dengan cepat
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onQuickBorrow}
              id="btn-quick-borrow"
              className="px-4 py-2 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeftRight size={16} />
              Pinjam Buku
            </button>
            <button
              onClick={onQuickAddBook}
              id="btn-quick-add-book"
              className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/45 border border-white/25 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Buku Baru
            </button>
            <button
              onClick={onQuickAddMember}
              id="btn-quick-add-member"
              className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/45 border border-white/25 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer"
            >
              <Users size={16} />
              Anggota Baru
            </button>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-grid">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-100 transition" id="stat-books">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Total Eksemplar</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalBooks}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{totalBookTitles} Judul Buku</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-100 transition" id="stat-members">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Anggota Aktif</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalMembers}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Status terdaftar</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-100 transition" id="stat-borrows">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Dipinjam</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{totalActiveBorrows}</p>
            <p className="text-[11px] text-indigo-500 mt-0.5">{totalActiveBorrows - totalOverdueBorrows} sedang dipinjam</p>
          </div>
        </div>

        <div className={`bg-white rounded-xl p-5 border shadow-sm flex items-center gap-4 transition ${totalOverdueBorrows > 0 ? 'border-red-100 hover:border-red-200' : 'border-slate-100 hover:border-blue-100'}`} id="stat-overdue">
          <div className={`p-3.5 rounded-xl ${totalOverdueBorrows > 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Terlambat</p>
            <p className={`text-2xl font-bold mt-1 ${totalOverdueBorrows > 0 ? 'text-red-600' : 'text-slate-800'}`}>{totalOverdueBorrows}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Denda: {formatRupiah(totalFines)}</p>
          </div>
        </div>
      </div>

      {/* Main Panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-main-grid">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Warning & Quick Return List */}
          {overdueBorrowings.length > 0 && (
            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden" id="overdue-warnings">
              <div className="bg-red-50 px-5 py-4 flex items-center justify-between border-b border-red-100">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={18} className="animate-pulse" />
                  <h3 className="font-semibold text-sm">Peringatan Keterlambatan Pengembalian</h3>
                </div>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {totalOverdueBorrows} Transaksi
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {overdueBorrowings.map(ob => {
                  const book = books.find(b => b.id === ob.bookId);
                  const member = members.find(m => m.id === ob.memberId);
                  return (
                    <div key={ob.id} className="p-4 flex items-center justify-between hover:bg-red-50/20 transition">
                      <div className="min-w-0 pr-4">
                        <p className="font-semibold text-sm text-slate-800 truncate">{book?.title || 'Buku Tidak Ditemukan'}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{member?.name}</span>
                          <span>•</span>
                          <span>Batas: {ob.dueDate}</span>
                          <span>•</span>
                          <span className="text-red-600 font-semibold">Denda: {formatRupiah(ob.fine)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onReturnBook(ob.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer"
                      >
                        Kembalikan
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Borrowings List */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm" id="active-borrowings">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                Peminjaman Buku Aktif
              </h3>
              <button
                onClick={() => onNavigate('borrowing')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Semua Transaksi
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activeBorrowings.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Tidak ada peminjaman buku aktif saat ini.
                </div>
              ) : (
                activeBorrowings.slice(0, 5).map(ab => {
                  const book = books.find(b => b.id === ab.bookId);
                  const member = members.find(m => m.id === ab.memberId);
                  const isOverdue = ab.status === 'overdue';
                  return (
                    <div key={ab.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                      <div className="min-w-0">
                        <div className="flex items-start gap-2">
                          <p className="font-semibold text-sm text-slate-800 truncate">{book?.title}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase mt-0.5 ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {isOverdue ? 'Terlambat' : 'Dipinjam'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">{member?.name}</span>
                          <span>•</span>
                          <span>Tanggal Pinjam: {ab.borrowDate}</span>
                          <span>•</span>
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>Kembali: {ab.dueDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => onReturnBook(ab.id)}
                          className="px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          Kembalikan
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column - Book Categories breakdown & Popular Books */}
        <div className="space-y-6">
          {/* Categories card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5" id="categories-breakdown">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              Kategori Perpustakaan
            </h3>
            <p className="text-xs text-slate-400 mt-1">Proporsi persebaran buku berdasarkan kategori</p>

            <div className="mt-5 space-y-4">
              {categories.map(cat => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 truncate pr-2">{cat.name}</span>
                    <span className="text-slate-500 shrink-0">{cat.count} Eks ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Kategori belum tersedia</p>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 space-y-3" id="quick-tips">
            <h4 className="font-bold text-blue-800 text-xs uppercase tracking-wider">Ketentuan & Denda</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
              <li>Maksimal durasi peminjaman buku adalah <strong>7 hari</strong>.</li>
              <li>Keterlambatan pengembalian dikenakan denda senilai <strong>Rp 1.000 / hari / buku</strong>.</li>
              <li>Anggota non-aktif tidak diperkenankan meminjam buku.</li>
              <li>Harap periksa kondisi fisik buku saat dipinjam maupun dikembalikan.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
