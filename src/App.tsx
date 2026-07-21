/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  ArrowLeftRight, 
  LayoutDashboard, 
  AlertCircle,
  Menu,
  X,
  Library,
  Calendar,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { Book, Member, Borrowing } from './types';
import { initialBooks, initialMembers, initialBorrowings } from './initialData';

// Views
import Dashboard from './components/Dashboard';
import BookCatalog from './components/BookCatalog';
import BorrowingManager from './components/BorrowingManager';
import MemberManager from './components/MemberManager';
import Login from './components/Login';

const TODAY_STR = '2026-07-18'; // Simulated system current date

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('lib_is_logged_in') === 'true' || sessionStorage.getItem('lib_is_logged_in') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('lib_is_logged_in');
    sessionStorage.removeItem('lib_is_logged_in');
    setIsLoggedIn(false);
  };

  // Core States
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);

  // Modal open states (passed down to trigger addition screens)
  const [addBookModalOpen, setAddBookModalOpen] = useState<boolean>(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<boolean>(false);
  const [addBorrowingModalOpen, setAddBorrowingModalOpen] = useState<boolean>(false);

  // Helper to sync fines and overdue status on startup or reload
  const updateBorrowingFinesAndStatus = (records: Borrowing[]): Borrowing[] => {
    const today = new Date(TODAY_STR);
    return records.map(record => {
      if (record.returnDate) {
        return record; // fine is fixed once returned
      }
      const dueDate = new Date(record.dueDate);
      if (today > dueDate) {
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...record,
          status: 'overdue',
          fine: diffDays * 1000
        };
      } else {
        return {
          ...record,
          status: 'borrowed',
          fine: 0
        };
      }
    });
  };

  // Initialization & LocalStorage Load
  useEffect(() => {
    const storedBooks = localStorage.getItem('lib_books');
    const storedMembers = localStorage.getItem('lib_members');
    const storedBorrowings = localStorage.getItem('lib_borrowings');

    let initialB: Book[];
    let initialM: Member[];
    let initialT: Borrowing[];

    if (storedBooks) {
      initialB = JSON.parse(storedBooks);
    } else {
      initialB = initialBooks;
      localStorage.setItem('lib_books', JSON.stringify(initialB));
    }

    if (storedMembers) {
      initialM = JSON.parse(storedMembers);
    } else {
      initialM = initialMembers;
      localStorage.setItem('lib_members', JSON.stringify(initialM));
    }

    if (storedBorrowings) {
      initialT = JSON.parse(storedBorrowings);
    } else {
      initialT = initialBorrowings;
    }

    // Always run the dynamic fine updater on mount
    const updatedT = updateBorrowingFinesAndStatus(initialT);
    setBooks(initialB);
    setMembers(initialM);
    setBorrowings(updatedT);
    localStorage.setItem('lib_borrowings', JSON.stringify(updatedT));
  }, []);

  // Sync state changes to LocalStorage
  const saveBooks = (updatedBooks: Book[]) => {
    setBooks(updatedBooks);
    localStorage.setItem('lib_books', JSON.stringify(updatedBooks));
  };

  const saveMembers = (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    localStorage.setItem('lib_members', JSON.stringify(updatedMembers));
  };

  const saveBorrowings = (updatedBorrowings: Borrowing[]) => {
    setBorrowings(updatedBorrowings);
    localStorage.setItem('lib_borrowings', JSON.stringify(updatedBorrowings));
  };

  // --- BOOK OPERATIONS ---
  const handleAddBook = (bookData: Omit<Book, 'id' | 'createdAt' | 'availableStock'>) => {
    const newId = `B-${String(books.length + 1).padStart(3, '0')}`;
    const newBook: Book = {
      ...bookData,
      id: newId,
      availableStock: bookData.stock, // Initially available stock equals total stock
      createdAt: TODAY_STR
    };
    saveBooks([...books, newBook]);
  };

  const handleUpdateBook = (updatedBook: Book) => {
    saveBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const handleDeleteBook = (id: string) => {
    saveBooks(books.filter(b => b.id !== id));
    // clean up related borrowings
    saveBorrowings(borrowings.filter(b => b.bookId !== id));
  };

  const handleImportBooks = (newBooksList: any[]) => {
    const updatedBooks = [...books];
    let addedCount = 0;
    let updatedCount = 0;

    newBooksList.forEach(importedBook => {
      // Clean isbn for comparison
      const importedIsbn = String(importedBook.isbn || '').trim();
      const importedTitle = String(importedBook.title || '').trim();

      // Check if book exists either by ID or ISBN or Title (case-insensitive fallback)
      const existingIndex = updatedBooks.findIndex(b => 
        (importedBook.id && b.id === importedBook.id) || 
        (importedIsbn && b.isbn === importedIsbn) ||
        (importedTitle && b.title.toLowerCase() === importedTitle.toLowerCase())
      );

      if (existingIndex !== -1) {
        // Update existing book
        const existingBook = updatedBooks[existingIndex];
        const newStock = Math.max(importedBook.stock, 1);
        const diff = newStock - existingBook.stock;
        
        updatedBooks[existingIndex] = {
          ...existingBook,
          title: importedBook.title || existingBook.title,
          author: importedBook.author || existingBook.author,
          category: importedBook.category || existingBook.category,
          isbn: importedBook.isbn || existingBook.isbn,
          stock: newStock,
          availableStock: Math.max(0, existingBook.availableStock + diff),
          description: importedBook.description || existingBook.description,
        };
        updatedCount++;
      } else {
        // Determine a clean, unused ID
        let prefixId = importedBook.id || '';
        if (!prefixId || prefixId.trim() === 'B-OPTIONAL' || prefixId.trim() === 'B-001') {
          prefixId = `B-${String(updatedBooks.length + 1).padStart(3, '0')}`;
        }
        
        let uniqueId = prefixId;
        let counter = 1;
        while (updatedBooks.some(b => b.id === uniqueId)) {
          uniqueId = `${prefixId}-${counter++}`;
        }

        updatedBooks.push({
          id: uniqueId,
          title: importedBook.title || 'Judul Tanpa Nama',
          author: importedBook.author || 'Penulis Tidak Diketahui',
          category: importedBook.category || 'Sastra & Novel',
          isbn: importedBook.isbn || `ISBN-${Math.floor(Math.random() * 1000000000)}`,
          stock: Number(importedBook.stock) || 1,
          availableStock: Number(importedBook.stock) || 1,
          description: importedBook.description || '',
          coverColor: importedBook.coverColor || 'from-blue-500 to-indigo-600',
          createdAt: TODAY_STR
        });
        addedCount++;
      }
    });

    saveBooks(updatedBooks);
    return { addedCount, updatedCount };
  };

  // --- MEMBER OPERATIONS ---
  const handleAddMember = (memberData: Omit<Member, 'id' | 'joinDate'>) => {
    const newId = `M-${String(members.length + 1).padStart(3, '0')}`;
    const newMember: Member = {
      ...memberData,
      id: newId,
      joinDate: TODAY_STR
    };
    saveMembers([...members, newMember]);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    saveMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  const handleDeleteMember = (id: string) => {
    saveMembers(members.filter(m => m.id !== id));
    // clean up related borrowings
    saveBorrowings(borrowings.filter(b => b.memberId !== id));
  };

  // --- BORROWING OPERATIONS ---
  const handleAddBorrowing = (borrowingData: Omit<Borrowing, 'id' | 'fine' | 'status'>) => {
    const newId = `T-${String(borrowings.length + 1).padStart(3, '0')}`;
    const newBorrow: Borrowing = {
      ...borrowingData,
      id: newId,
      fine: 0,
      status: 'borrowed'
    };

    // Decrement available stock
    const updatedBooks = books.map(b => {
      if (b.id === borrowingData.bookId) {
        return { ...b, availableStock: Math.max(0, b.availableStock - 1) };
      }
      return b;
    });

    saveBooks(updatedBooks);
    saveBorrowings([newBorrow, ...borrowings]);
  };

  const handleReturnBook = (borrowingId: string) => {
    let bookIdToIncrement = '';
    const updatedBorrowings = borrowings.map(b => {
      if (b.id === borrowingId) {
        bookIdToIncrement = b.bookId;
        return {
          ...b,
          returnDate: TODAY_STR,
          status: 'returned' as const,
        };
      }
      return b;
    });

    // Increment available stock
    if (bookIdToIncrement) {
      const updatedBooks = books.map(bk => {
        if (bk.id === bookIdToIncrement) {
          return { ...bk, availableStock: Math.min(bk.stock, bk.availableStock + 1) };
        }
        return bk;
      });
      saveBooks(updatedBooks);
    }

    saveBorrowings(updatedBorrowings);
  };

  // Quick helper count of overdue items for notification pill
  const overdueCount = borrowings.filter(b => b.status === 'overdue').length;

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="app-root">
      {/* Top Header/Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs px-4 md:px-8 py-3.5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Mobile Menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <Library size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">Pustaka SMAN 3 Tolitoli</h1>
            <span className="text-[10px] font-semibold text-blue-600 tracking-wider uppercase">Panel Admin & Sirkulasi</span>
          </div>
        </div>

        {/* Right tools (Status date, info and logout) */}
        <div className="flex items-center gap-3">
          {/* Simulated current system date */}
          <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-semibold">
            <Calendar size={14} />
            <span>Hari Ini: 18 Juli 2026</span>
          </div>

          {/* Overdue alert badge */}
          {overdueCount > 0 && (
            <div className="relative cursor-pointer" onClick={() => { setActiveTab('borrowing'); }} title={`${overdueCount} buku terlambat kembali`}>
              <div className="p-2 bg-red-50 text-red-600 hover:bg-red-100 transition rounded-xl relative">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Keluar dari Sistem Pustaka"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <LogOut size={14} className="shrink-0 text-slate-400 group-hover:text-red-500" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex relative">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-5 space-y-6 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3">Menu Utama</span>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              id="sidebar-tab-dashboard"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={18} />
              Beranda Dashboard
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              id="sidebar-tab-catalog"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'catalog' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BookOpen size={18} />
              Katalog Buku
            </button>

            <button
              onClick={() => setActiveTab('borrowing')}
              id="sidebar-tab-borrowing"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'borrowing' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight size={18} />
              Peminjaman & Pengembalian
            </button>

            <button
              onClick={() => setActiveTab('members')}
              id="sidebar-tab-members"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'members' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users size={18} />
              Data Anggota
            </button>
          </div>

          {/* Quick Stats sidebar widget */}
          <div className="pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-3">
              <span className="font-bold text-slate-500 uppercase tracking-wider block">Ringkasan Cepat</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Judul Buku:</span>
                <span className="font-semibold text-slate-800">{books.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Anggota Kartu:</span>
                <span className="font-semibold text-slate-800">{members.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sirkulasi Aktif:</span>
                <span className="font-semibold text-slate-800">
                  {borrowings.filter(b => b.status === 'borrowed' || b.status === 'overdue').length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay - Mobile */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="bg-white w-64 h-full p-5 space-y-6 flex flex-col shadow-xl animate-slideInRight"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-800">Menu Navigasi</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-500 p-1 rounded hover:bg-slate-100 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Beranda Dashboard
                </button>

                <button
                  onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'catalog' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen size={18} />
                  Katalog Buku
                </button>

                <button
                  onClick={() => { setActiveTab('borrowing'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'borrowing' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowLeftRight size={18} />
                  Peminjaman & Sirkulasi
                </button>

                <button
                  onClick={() => { setActiveTab('members'); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    activeTab === 'members' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Users size={18} />
                  Data Anggota
                </button>
              </div>

              <div className="sm:hidden bg-blue-50 text-blue-700 px-3 py-2 rounded-xl border border-blue-100 text-xs font-semibold flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Hari Ini: 18 Juli 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* Workspace panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              books={books}
              members={members}
              borrowings={borrowings}
              onNavigate={(tab) => setActiveTab(tab)}
              onQuickBorrow={() => {
                setActiveTab('borrowing');
                setAddBorrowingModalOpen(true);
              }}
              onQuickAddBook={() => {
                setActiveTab('catalog');
                setAddBookModalOpen(true);
              }}
              onQuickAddMember={() => {
                setActiveTab('members');
                setAddMemberModalOpen(true);
              }}
              onReturnBook={handleReturnBook}
            />
          )}

          {activeTab === 'catalog' && (
            <BookCatalog
              books={books}
              onAddBook={handleAddBook}
              onUpdateBook={handleUpdateBook}
              onDeleteBook={handleDeleteBook}
              openAddModal={addBookModalOpen}
              setOpenAddModal={setAddBookModalOpen}
              onImportBooks={handleImportBooks}
            />
          )}

          {activeTab === 'borrowing' && (
            <BorrowingManager
              books={books}
              members={members}
              borrowings={borrowings}
              onAddBorrowing={handleAddBorrowing}
              onReturnBook={handleReturnBook}
              openAddModal={addBorrowingModalOpen}
              setOpenAddModal={setAddBorrowingModalOpen}
            />
          )}

          {activeTab === 'members' && (
            <MemberManager
              members={members}
              borrowings={borrowings}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
              openAddModal={addMemberModalOpen}
              setOpenAddModal={setAddMemberModalOpen}
            />
          )}
        </main>
      </div>

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2 shrink-0">
        <p>© 2026 Perpustakaan Digital. All rights reserved.</p>
        <p>Aplikasi Sirkulasi Buku Mandiri v1.2.0 • Dioptimalkan untuk Kecepatan & Kemudahan Admin</p>
      </footer>
    </div>
  );
}
