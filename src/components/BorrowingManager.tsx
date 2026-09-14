import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar,
  X,
  FileText,
  User,
  BookOpen,
  DollarSign
} from 'lucide-react';
import { Book, Member, Borrowing } from '../types';

interface BorrowingManagerProps {
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];
  onAddBorrowing: (borrowing: Omit<Borrowing, 'id' | 'fine' | 'status'>) => void;
  onReturnBook: (borrowingId: string) => void;
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
}

export default function BorrowingManager({
  books,
  members,
  borrowings,
  onAddBorrowing,
  onReturnBook,
  openAddModal,
  setOpenAddModal
}: BorrowingManagerProps) {
  // Search and tabs state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'borrowed' | 'overdue' | 'returned'>('all');

  // New borrowing form state
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  
  // Default dates: Real-time dynamic date
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFutureDateStr = (days: number, baseDate?: string) => {
    const d = baseDate ? new Date(baseDate) : new Date();
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [borrowDate, setBorrowDate] = useState(getTodayStr());
  const [dueDate, setDueDate] = useState(getFutureDateStr(7));

  // Reset form
  const resetForm = () => {
    setSelectedBookId('');
    setSelectedMemberId('');
    setBorrowDate(getTodayStr());
    setDueDate(getFutureDateStr(7));
  };

  // Adjust due date when borrow date changes
  const handleBorrowDateChange = (val: string) => {
    setBorrowDate(val);
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + 7);
        setDueDate(d.toISOString().split('T')[0]);
      }
    } catch (e) {}
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !selectedMemberId || !borrowDate || !dueDate) {
      alert('Harap pilih buku, anggota, dan tentukan tanggal!');
      return;
    }

    const book = books.find(b => b.id === selectedBookId);
    if (!book || book.availableStock <= 0) {
      alert('Stok buku tersebut sedang habis!');
      return;
    }

    const member = members.find(m => m.id === selectedMemberId);
    if (!member || member.status !== 'active') {
      alert('Anggota yang dipilih berstatus tidak aktif!');
      return;
    }

    onAddBorrowing({
      bookId: selectedBookId,
      memberId: selectedMemberId,
      borrowDate,
      dueDate,
      returnDate: null
    });

    resetForm();
    setOpenAddModal(false);
  };

  // Filters logic
  const filteredBorrowings = borrowings.filter(b => {
    const book = books.find(bk => bk.id === b.bookId);
    const member = members.find(m => m.id === b.memberId);
    
    const matchesSearch = 
      (book?.title.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (member?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'borrowed' ? (b.status === 'borrowed' || b.status === 'overdue') :
      activeTab === 'overdue' ? b.status === 'overdue' :
      b.status === 'returned';

    return matchesSearch && matchesTab;
  });

  // Helper formatting currencies
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val);
  };

  // Get status label details
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'borrowed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            <Clock size={12} />
            Dipinjam
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100 animate-pulse">
            <AlertTriangle size={12} />
            Terlambat
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 size={12} />
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  // Only active members can borrow
  const activeMembers = members.filter(m => m.status === 'active');
  // Only books with available stock can be borrowed
  const availableBooks = books.filter(b => b.availableStock > 0);

  return (
    <div className="space-y-6" id="borrowing-manager-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="borrow-header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ArrowLeftRight className="text-blue-600" size={24} />
            Sistem Peminjaman & Pengembalian
          </h2>
          <p className="text-xs text-slate-500 mt-1">Lakukan pencatatan sirkulasi buku perpustakaan untuk siswa dan guru.</p>
        </div>
        <button
          onClick={() => setOpenAddModal(true)}
          id="btn-add-borrowing-header"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          Catat Pinjaman Baru
        </button>
      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-200" id="borrowing-tabs">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'all' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Semua Transaksi ({borrowings.length})
          </button>
          <button
            onClick={() => setActiveTab('borrowed')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'borrowed' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Sedang Dipinjam ({borrowings.filter(b => b.status === 'borrowed' || b.status === 'overdue').length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'overdue' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Terlambat ({borrowings.filter(b => b.status === 'overdue').length})
          </button>
          <button
            onClick={() => setActiveTab('returned')}
            className={`pb-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'returned' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Sudah Kembali ({borrowings.filter(b => b.status === 'returned').length})
          </button>
        </nav>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4" id="borrowing-search-container">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama anggota, judul buku, atau ID transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Transactions Table/List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="borrowings-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">ID Transaksi</th>
                <th className="py-4 px-5">Anggota</th>
                <th className="py-4 px-5">Buku Dipinjam</th>
                <th className="py-4 px-5">Tanggal Sirkulasi</th>
                <th className="py-4 px-5">Denda Terkumpul</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredBorrowings.map(b => {
                const book = books.find(bk => bk.id === b.bookId);
                const member = members.find(m => m.id === b.memberId);
                const isActive = b.status === 'borrowed' || b.status === 'overdue';

                return (
                  <tr key={b.id} className="hover:bg-slate-50/30 transition">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-slate-500">{b.id}</td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">{member?.name || 'Anggota Terhapus'}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{member?.id}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800 max-w-xs truncate" title={book?.title}>
                        {book?.title || 'Buku Terhapus'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{book?.author} • <span className="font-mono">{book?.isbn}</span></div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col text-xs gap-1">
                        <span className="flex items-center gap-1 text-slate-600" title="Tanggal Pinjam">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Pinjam: {b.borrowDate}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600" title="Batas Pengembalian">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Batas: {b.dueDate}
                        </span>
                        {b.returnDate && (
                          <span className="flex items-center gap-1 text-blue-600 font-semibold" title="Tanggal Dikembalikan">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Kembali: {b.returnDate}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`font-mono font-semibold ${b.fine > 0 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100' : 'text-slate-400'}`}>
                        {formatRupiah(b.fine)}
                      </span>
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(b.status)}</td>
                    <td className="py-4 px-5 text-right">
                      {isActive ? (
                        <button
                          onClick={() => onReturnBook(b.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition flex items-center gap-1 inline-flex cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          Kembalikan
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic select-none">Sudah Kembali</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredBorrowings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ArrowLeftRight className="mx-auto text-slate-300 mb-3" size={32} />
                    <p className="font-semibold text-slate-700 text-sm">Transaksi tidak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba ganti tab filter saringan atau sesuaikan kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record New Borrowing Modal */}
      {openAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="add-borrowing-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ArrowLeftRight className="text-blue-600" size={18} />
                Catat Transaksi Peminjaman Baru
              </h3>
              <button 
                onClick={() => setOpenAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Select Member */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <User size={13} className="text-blue-500" />
                  Pilih Anggota Perpustakaan *
                </label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Pilih Anggota Aktif --</option>
                  {activeMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Hanya anggota terdaftar dengan status AKTIF yang muncul di daftar ini.</p>
              </div>

              {/* Select Book */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <BookOpen size={13} className="text-blue-500" />
                  Pilih Buku yang Dipinjam *
                </label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="">-- Pilih Buku Tersedia --</option>
                  {availableBooks.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} (Sisa Stok: {b.availableStock} Eks)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Buku dengan stok kosong (0) tidak akan muncul di daftar sirkulasi.</p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={13} className="text-blue-500" />
                    Tanggal Pinjam
                  </label>
                  <input
                    type="date"
                    required
                    value={borrowDate}
                    onChange={(e) => handleBorrowDateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={13} className="text-blue-500" />
                    Tenggat Kembali
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Note about denda */}
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex gap-2 text-xs text-blue-700">
                <Clock size={16} className="shrink-0 mt-0.5" />
                <p>Durasi standar peminjaman adalah 7 hari. Batas pengembalian buku di atas dikenakan denda keterlambatan sebesar <strong>Rp 1.000 / hari</strong>.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-sm font-semibold rounded-xl text-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Konfirmasi Pinjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
