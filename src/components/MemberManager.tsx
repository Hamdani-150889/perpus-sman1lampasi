import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  X,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Member, Borrowing } from '../types';

interface MemberManagerProps {
  members: Member[];
  borrowings: Borrowing[];
  onAddMember: (member: Omit<Member, 'id' | 'joinDate'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  openAddModal: boolean;
  setOpenAddModal: (open: boolean) => void;
}

export default function MemberManager({
  members,
  borrowings,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  openAddModal,
  setOpenAddModal
}: MemberManagerProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Editing state
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // New member state
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const resetNewMemberForm = () => {
    setNewMember({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    });
  };

  // Submit Add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim() || !newMember.email.trim() || !newMember.phone.trim()) {
      alert('Harap isi nama, email, dan telepon anggota!');
      return;
    }
    onAddMember(newMember);
    resetNewMemberForm();
    setOpenAddModal(false);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.name.trim() || !editingMember.email.trim() || !editingMember.phone.trim()) {
      alert('Harap isi nama, email, dan telepon anggota!');
      return;
    }
    onUpdateMember(editingMember);
    setEditingMember(null);
  };

  // Filtering
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus ? member.status === selectedStatus : true;

    return matchesSearch && matchesStatus;
  });

  // Calculate active borrowings count per member
  const getActiveBorrowCount = (memberId: string) => {
    return borrowings.filter(b => b.memberId === memberId && (b.status === 'borrowed' || b.status === 'overdue')).length;
  };

  return (
    <div className="space-y-6" id="member-manager-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="member-header">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            Manajemen Anggota Perpustakaan
          </h2>
          <p className="text-xs text-slate-500 mt-1">Daftarkan dan kelola status keaktifan kartu perpustakaan siswa dan pengajar.</p>
        </div>
        <button
          onClick={() => setOpenAddModal(true)}
          id="btn-add-member-header"
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} />
          Tambah Anggota Baru
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4" id="member-filters">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari anggota berdasarkan nama, ID, email, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Tidak Aktif</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" id="members-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">ID Anggota</th>
                <th className="py-4 px-5">Nama Lengkap</th>
                <th className="py-4 px-5">Informasi Kontak</th>
                <th className="py-4 px-5">Tanggal Bergabung</th>
                <th className="py-4 px-5">Buku Dipinjam</th>
                <th className="py-4 px-5">Status Kartu</th>
                <th className="py-4 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredMembers.map(member => {
                const activeBorrows = getActiveBorrowCount(member.id);
                const isActive = member.status === 'active';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/30 transition">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-slate-500">{member.id}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center border border-blue-100 shrink-0">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{member.name}</p>
                          <p className="text-xs text-slate-400">Peminjam Terpercaya</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={12} className="text-slate-400" />
                          {member.email}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Phone size={12} className="text-slate-400" />
                          {member.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar size={13} className="text-slate-400" />
                        {member.joinDate}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        activeBorrows > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {activeBorrows} Buku
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 size={12} />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                          <XCircle size={12} />
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingMember(member)}
                          title="Edit Anggota"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (activeBorrows > 0) {
                              alert(`Tidak bisa menghapus anggota "${member.name}" karena masih meminjam ${activeBorrows} buku yang belum dikembalikan!`);
                              return;
                            }
                            if (confirm(`Apakah Anda yakin ingin menghapus anggota "${member.name}" dari sistem?`)) {
                              onDeleteMember(member.id);
                            }
                          }}
                          title="Hapus Anggota"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto text-slate-300 mb-3" size={32} />
                    <p className="font-semibold text-slate-700 text-sm">Anggota tidak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan filter status atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {openAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="add-member-modal">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <PlusCircle className="text-blue-600" size={18} />
                Registrasi Anggota Baru
              </h3>
              <button 
                onClick={() => setOpenAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rafly..."
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="rafly@sekolah.sch.id..."
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor HP / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 0812-3456-7890..."
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status Kartu Awal</label>
                <select
                  value={newMember.status}
                  onChange={(e) => setNewMember({...newMember, status: e.target.value as any})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="active">Aktif (Bisa Pinjam Buku)</option>
                  <option value="inactive">Non-Aktif (Ditangguhkan)</option>
                </select>
              </div>

              {/* Actions */}
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
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="edit-member-modal">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Edit2 className="text-blue-600" size={18} />
                Edit Informasi Anggota
              </h3>
              <button 
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* ID Display */}
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Anggota (Terkunci)</span>
                <span className="text-sm font-mono font-bold text-slate-700">{editingMember.id}</span>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap..."
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="Email..."
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor HP / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="Nomor HP..."
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Status Kartu Perpustakaan</label>
                <select
                  value={editingMember.status}
                  onChange={(e) => setEditingMember({...editingMember, status: e.target.value as any})}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="active">Aktif (Diberikan Hak Sirkulasi)</option>
                  <option value="inactive">Non-Aktif (Ditangguhkan)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-sm font-semibold rounded-xl text-slate-700 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
                >
                  Perbarui Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
