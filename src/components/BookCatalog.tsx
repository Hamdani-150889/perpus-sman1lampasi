import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  BookMarked,
  X,
  PlusCircle,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Book } from '../types';

interface BookCatalogProps {
  books: Book[];
  onAddBook: (book: Omit<Book, 'id' | 'createdAt' | 'availableStock'>) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
  onImportBooks: (importedBooks: any[]) => { addedCount: number; updatedCount: number };
}

const CATEGORIES = [
  'Sastra & Novel',
  'Pengembangan Diri',
  'Bisnis & Keuangan',
  'Sejarah & Budaya',
  'Sains & Teknologi'
];

const COVER_GRADIENTS = [
  { label: 'Blue Sky', value: 'from-blue-500 to-indigo-600' },
  { label: 'Deep Blue', value: 'from-blue-800 to-indigo-900' },
  { label: 'Teal/Emerald', value: 'from-emerald-500 to-teal-700' },
  { label: 'Ocean Cyan', value: 'from-cyan-500 to-blue-600' },
  { label: 'Warm Sunset', value: 'from-orange-500 to-red-600' },
  { label: 'Earthy Amber', value: 'from-amber-600 to-amber-950' },
  { label: 'Elegant Slate', value: 'from-slate-700 to-slate-900' }
];

export default function BookCatalog({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  openAddModal,
  setOpenAddModal,
  onImportBooks
}: BookCatalogProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'empty'>('all');

  // Selected book details expanded state
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);

  // Excel Export Handler
  const handleExportExcel = () => {
    try {
      const worksheetData = books.map(book => ({
        'ID Buku': book.id,
        'Judul': book.title,
        'Penulis': book.author,
        'Kategori': book.category,
        'ISBN': book.isbn,
        'Total Stok': book.stock,
        'Stok Tersedia': book.availableStock,
        'Sinopsis': book.description || '',
        'Tanggal Dibuat': book.createdAt
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Katalog Buku');
      XLSX.writeFile(workbook, 'Katalog_Buku_SMAN3Tolitoli.xlsx');
    } catch (error) {
      console.error('Gagal mengekspor Excel:', error);
      alert('Gagal mengekspor data ke Excel!');
    }
  };

  // Excel Import Handler
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (jsonData.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        // Check format: must have title and author column (either in Indonesian or English)
        const firstRow = jsonData[0];
        const hasTitle = 'Judul' in firstRow || 'title' in firstRow || 'Judul Buku' in firstRow;
        const hasAuthor = 'Penulis' in firstRow || 'author' in firstRow || 'Pengarang' in firstRow;

        if (!hasTitle || !hasAuthor) {
          alert('Format Excel salah! Pastikan file Excel memiliki kolom "Judul" dan "Penulis"!');
          return;
        }

        const importedBooksList = jsonData.map((row: any) => {
          const title = String(row['Judul'] || row['title'] || row['Judul Buku'] || '').trim();
          const author = String(row['Penulis'] || row['author'] || row['Pengarang'] || '').trim();
          const categoryRaw = String(row['Kategori'] || row['category'] || 'Sastra & Novel').trim();
          
          // Match category with valid categories or default
          let category = CATEGORIES[0];
          const matched = CATEGORIES.find(cat => cat.toLowerCase() === categoryRaw.toLowerCase());
          if (matched) {
            category = matched;
          }

          const isbn = String(row['ISBN'] || row['isbn'] || '').trim();
          const stock = Number(row['Total Stok'] || row['stock'] || row['Stok'] || row['Jumlah'] || 1);
          const description = String(row['Sinopsis'] || row['description'] || row['Deskripsi'] || '').trim();
          const id = String(row['ID Buku'] || row['id'] || '').trim();

          const randomGrad = COVER_GRADIENTS[Math.floor(Math.random() * COVER_GRADIENTS.length)].value;

          return {
            id,
            title,
            author,
            category,
            isbn,
            stock,
            description,
            coverColor: randomGrad
          };
        }).filter(b => b.title && b.author);

        if (importedBooksList.length === 0) {
          alert('Tidak ada data buku valid untuk diimpor. Pastikan kolom Judul dan Penulis terisi.');
          return;
        }

        const { addedCount, updatedCount } = onImportBooks(importedBooksList);
        alert(`Berhasil memproses file Excel!\n- Buku baru ditambahkan: ${addedCount}\n- Buku lama diperbarui (sinkronisasi stok): ${updatedCount}`);
      } catch (err) {
        console.error(err);
        alert('Gagal membaca file Excel. Pastikan file berformat .xlsx atau .xls yang valid.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // reset
  };

  // Download Sample/Template Excel Handler
  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          'ID Buku': 'B-001',
          'Judul': 'Laskar Pelangi',
          'Penulis': 'Andrea Hirata',
          'Kategori': 'Sastra & Novel',
          'ISBN': '978-979-3062-79-1',
          'Total Stok': 5,
          'Sinopsis': 'Kisah tentang perjuangan sepuluh anak di Belitong.'
        },
        {
          'ID Buku': '',
          'Judul': 'Sains Masa Depan',
          'Penulis': 'Prof. Handoko',
          'Kategori': 'Sains & Teknologi',
          'ISBN': '978-602-1234-56-7',
          'Total Stok': 3,
          'Sinopsis': 'Eksplorasi inovasi teknologi modern abad ke-21.'
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(templateData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Templat Impor Buku');
      XLSX.writeFile(workbook, 'Templat_Impor_Buku_SMAN3Tolitoli.xlsx');
    } catch (error) {
      console.error(error);
      alert('Gagal mengunduh templat Excel.');
    }
  };

  // Edit book state
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // New book form state
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: CATEGORIES[0],
    isbn: '',
    stock: 3,
    description: '',
    coverColor: COVER_GRADIENTS[0].value
  });

  const resetNewBookForm = () => {
    setNewBook({
      title: '',
      author: '',
      category: CATEGORIES[0],
      isbn: '',
      stock: 3,
      description: '',
      coverColor: COVER_GRADIENTS[0].value
    });
  };

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.isbn.trim()) {
      alert('Harap isi judul, penulis, dan nomor ISBN!');
      return;
    }
    onAddBook({
      ...newBook,
      stock: Number(newBook.stock)
    });
    resetNewBookForm();
    setOpenAddModal(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    if (!editingBook.title.trim() || !editingBook.author.trim() || !editingBook.isbn.trim()) {
      alert('Harap isi judul, penulis, dan nomor ISBN!');
      return;
    }
    
    // adjust availableStock to never exceed new total stock
    const borrowedCount = editingBook.stock - editingBook.availableStock;
    const newAvailableStock = Math.max(0, editingBook.stock - borrowedCount);

    onUpdateBook({
      ...editingBook,
      availableStock: newAvailableStock
    });
    setEditingBook(null);
  };

  // Filtering Logic
  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory ? book.category === selectedCategory : true;
    
    const matchesStock = 
      stockFilter === 'all' ? true :
      stockFilter === 'available' ? book.availableStock > 0 :
      book.availableStock === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6" id="book-catalog-view">
      {/* Title & Action Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4" id="catalog-header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookMarked className="text-blue-600" size={24} />
            Katalog Buku SMAN 3 Tolitoli
          </h2>
          <p className="text-xs text-slate-500 mt-1">Kelola sirkulasi, serta impor & ekspor data buku format Excel secara instan.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 self-start xl:self-auto">
          {/* Unduh Templat Button */}
          <button
            type="button"
            onClick={handleDownloadTemplate}
            title="Unduh contoh file Excel untuk format impor"
            className="border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download size={13} className="text-slate-400" />
            Templat Excel
          </button>

          {/* Impor Excel Button */}
          <label className="border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white transition flex items-center gap-1.5 cursor-pointer shadow-xs">
            <Upload size={13} className="text-slate-400" />
            <span>Impor Excel</span>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleImportExcel} 
              className="hidden" 
            />
          </label>

          {/* Ekspor Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            title="Ekspor seluruh katalog buku ke file Excel"
            className="border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet size={13} className="text-slate-400" />
            Ekspor Excel ({books.length})
          </button>

          {/* Tambah Buku Baru */}
          <button
            type="button"
            onClick={() => setOpenAddModal(true)}
            id="btn-add-book-header"
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer ml-1"
          >
            <Plus size={16} />
            Tambah Buku
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4" id="catalog-filters">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, penulis, atau nomor ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-input"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="category-filter"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="w-full md:w-48">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            id="stock-filter"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="all">Semua Status Stok</option>
            <option value="available">Tersedia untuk Dipinjam</option>
            <option value="empty">Stok Habis</option>
          </select>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="book-grid">
        {filteredBooks.map(book => {
          const isExpanded = expandedBookId === book.id;
          const isOutOfStock = book.availableStock === 0;

          return (
            <div 
              key={book.id} 
              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition duration-200 group relative"
              id={`book-card-${book.id}`}
            >
              {/* Dynamic visual book cover */}
              <div className={`h-40 bg-gradient-to-br ${book.coverColor} p-4 flex flex-col justify-between text-white relative overflow-hidden shrink-0`}>
                <div className="absolute top-0 right-0 p-3 opacity-15 group-hover:scale-110 transition duration-300">
                  <BookOpen size={96} />
                </div>
                <div className="flex justify-between items-start z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {book.category}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider bg-slate-950/35 px-2 py-0.5 rounded text-white/90">
                    ID: {book.id}
                  </span>
                </div>
                <div className="z-10">
                  <h4 className="font-bold text-base leading-tight tracking-tight drop-shadow-sm line-clamp-2">
                    {book.title}
                  </h4>
                  <p className="text-xs text-white/80 mt-1 font-medium truncate">
                    {book.author}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>ISBN: <strong className="font-mono">{book.isbn}</strong></span>
                  </div>

                  {/* Stock meter */}
                  <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Ketersediaan Stok</span>
                      <span className={`font-bold ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                        {book.availableStock} / {book.stock} Eks
                      </span>
                    </div>
                    {/* stock bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${(book.availableStock / book.stock) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded description snippet */}
                  {isExpanded && (
                    <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 mt-3 animate-fadeIn">
                      <p className="font-semibold text-slate-700 mb-1">Sinopsis Buku:</p>
                      <p className="leading-relaxed italic">"{book.description || 'Tidak ada deskripsi sinopsis untuk buku ini.'}"</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 py-1 cursor-pointer"
                  >
                    {isExpanded ? 'Sembunyikan' : 'Lihat Sinopsis'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingBook(book)}
                      title="Edit Buku"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}" dari katalog?`)) {
                          onDeleteBook(book.id);
                        }
                      }}
                      title="Hapus Buku"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredBooks.length === 0 && (
          <div className="col-span-full bg-slate-50 border border-slate-100 rounded-xl p-12 text-center text-slate-500" id="empty-state-catalog">
            <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
            <p className="font-semibold text-slate-700 text-sm">Buku tidak ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ganti filter saringan kategori Anda.</p>
          </div>
        )}
      </div>

      {/* Add New Book Modal */}
      {openAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="add-book-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <PlusCircle className="text-blue-600" size={18} />
                Tambah Buku Baru ke Katalog
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
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Judul Buku *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul lengkap buku..."
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Author & ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Penulis / Pengarang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama penulis..."
                    value={newBook.author}
                    onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor ISBN *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 978-602-..."
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Category, Stock, and Cover style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kategori Buku *</label>
                  <select
                    value={newBook.category}
                    onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Jumlah Stok (Eksemplar) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBook.stock}
                    onChange={(e) => setNewBook({...newBook, stock: Math.max(1, Number(e.target.value))})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Cover Gradient Design Pick */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Desain Sampul Visual *</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
                  {COVER_GRADIENTS.map(grad => (
                    <button
                      key={grad.value}
                      type="button"
                      onClick={() => setNewBook({...newBook, coverColor: grad.value})}
                      className={`h-10 rounded-lg bg-gradient-to-br ${grad.value} relative flex items-center justify-center border transition cursor-pointer ${
                        newBook.coverColor === grad.value ? 'ring-2 ring-blue-500 border-white shadow-md' : 'border-slate-200 hover:scale-105'
                      }`}
                      title={grad.label}
                    >
                      {newBook.coverColor === grad.value && (
                        <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sinopsis / Deskripsi Ringkas</label>
                <textarea
                  rows={3}
                  placeholder="Ketik sinopsis singkat buku di sini..."
                  value={newBook.description}
                  onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
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
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="edit-book-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit2 className="text-blue-600" size={18} />
                Edit Detail Buku
              </h3>
              <button 
                onClick={() => setEditingBook(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Judul Buku *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul lengkap buku..."
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({...editingBook, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Author & ISBN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Penulis / Pengarang *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama penulis..."
                    value={editingBook.author}
                    onChange={(e) => setEditingBook({...editingBook, author: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor ISBN *</label>
                  <input
                    type="text"
                    required
                    placeholder="ISBN..."
                    value={editingBook.isbn}
                    onChange={(e) => setEditingBook({...editingBook, isbn: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Category, Stock, and Cover style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kategori Buku *</label>
                  <select
                    value={editingBook.category}
                    onChange={(e) => setEditingBook({...editingBook, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Jumlah Total Stok *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingBook.stock}
                    onChange={(e) => setEditingBook({...editingBook, stock: Math.max(1, Number(e.target.value))})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Cover Gradient Design Pick */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Desain Sampul Visual *</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
                  {COVER_GRADIENTS.map(grad => (
                    <button
                      key={grad.value}
                      type="button"
                      onClick={() => setEditingBook({...editingBook, coverColor: grad.value})}
                      className={`h-10 rounded-lg bg-gradient-to-br ${grad.value} relative flex items-center justify-center border transition cursor-pointer ${
                        editingBook.coverColor === grad.value ? 'ring-2 ring-blue-500 border-white shadow-md' : 'border-slate-200 hover:scale-105'
                      }`}
                      title={grad.label}
                    >
                      {editingBook.coverColor === grad.value && (
                        <CheckCircle2 size={16} className="text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sinopsis / Deskripsi Ringkas</label>
                <textarea
                  rows={3}
                  placeholder="Ketik sinopsis singkat buku di sini..."
                  value={editingBook.description}
                  onChange={(e) => setEditingBook({...editingBook, description: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Information warning about stock */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex gap-2 text-xs text-amber-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>Mengubah total stok akan otomatis menyinkronkan stok tersedia. Saat ini, sebanyak <strong>{editingBook.stock - editingBook.availableStock} eksemplar</strong> sedang dipinjam anggota.</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-sm font-semibold rounded-xl text-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Perbarui Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
