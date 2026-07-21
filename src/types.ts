export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  stock: number;
  availableStock: number;
  description: string;
  coverColor: string; // Tailwind class like bg-blue-600, bg-sky-500, etc.
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Borrowing {
  id: string;
  bookId: string;
  memberId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  fine: number; // in IDR
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface LibraryStats {
  totalBooks: number;
  totalAvailableBooks: number;
  totalMembers: number;
  totalActiveBorrows: number;
  totalOverdueBorrows: number;
  categoryStats: { name: string; count: number; color: string }[];
}
