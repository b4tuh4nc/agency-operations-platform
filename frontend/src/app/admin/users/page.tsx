'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { getRoleDisplayName, hasAccessToUsers } from '@/utils/rolePermissions';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  lastLogout?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, userId: string | null, userName: string}>({
    show: false,
    userId: null,
    userName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        setUsers([]); // Boş array set et, hata mesajı gösterme
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setUsers([]); // Boş array set et, hata mesajı gösterme
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData(e.target as HTMLFormElement);
      
      const updateData = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        role: formData.get('role'),
        isActive: formData.get('isActive') === 'on',
      };

      const response = await fetch(`http://localhost:3000/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setShowModal(false);
        setToast({message: 'Kullanıcı başarıyla güncellendi', type: 'success'});
        fetchUsers();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData(e.target as HTMLFormElement);
      
      const createData = {
        email: formData.get('email'),
        password: formData.get('password'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        role: formData.get('role'),
      };

      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(createData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setToast({message: 'Yeni kullanıcı başarıyla oluşturuldu', type: 'success'});
        fetchUsers();
      }
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({
      show: true,
      userId,
      userName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.userId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/users/${deleteModal.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setToast({message: 'Kullanıcı başarıyla silindi', type: 'success'});
        setDeleteModal({ show: false, userId: null, userName: '' });
        fetchUsers();
      } else {
        const error = await response.json().catch(() => ({ message: 'Kullanıcı silinemedi' }));
        setToast({ message: error.message || 'Kullanıcı silinemedi', type: 'error' });
        setDeleteModal({ show: false, userId: null, userName: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Kullanıcı silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, userId: null, userName: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, userId: null, userName: '' });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Hiç';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'admin') return 'bg-red-100 text-red-800';
    if (['office_manager', 'personal_assistant', 'receptionist', 'secretary', 'clerk_typist', 'filing_clerk'].includes(role)) 
      return 'bg-purple-100 text-purple-800';
    if (['accountant', 'credit_controller', 'accounts_clerk', 'purchasing_assistant'].includes(role)) 
      return 'bg-green-100 text-green-800';
    if (['director', 'account_manager'].includes(role)) 
      return 'bg-blue-100 text-blue-800';
    if (['graphic_designer', 'photographer', 'copy_writer', 'editor', 'audio_technician', 'resource_librarian'].includes(role)) 
      return 'bg-cyan-100 text-cyan-800';
    if (['computer_manager', 'network_support'].includes(role)) 
      return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <ProtectedPage checkAccess={hasAccessToUsers}>
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Kullanıcı Yönetimi</h1>
            <p className="text-slate-600">Sistem kullanıcılarını görüntüle ve yönet</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            + Yeni Kullanıcı
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Kullanıcı</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Rol</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Durum</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Son Giriş</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Oluşturulma</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-800">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.firstName?.[0] || user.email[0].toUpperCase()}
                              {user.lastName?.[0] || ''}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'İsimsiz'}
                            </p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {formatDate(user.lastLogin)}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user._id, `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Kullanıcı Düzenle</h2>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={selectedUser.firstName || ''}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={selectedUser.lastName || ''}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select
                    name="role"
                    defaultValue={selectedUser.role}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  >
                    <option value="admin">Sistem Yöneticisi</option>
                    <optgroup label="Administration">
                      <option value="office_manager">Ofis Müdürü</option>
                      <option value="personal_assistant">Kişisel Asistan</option>
                      <option value="receptionist">Resepsiyonist</option>
                      <option value="secretary">Sekreter</option>
                      <option value="clerk_typist">Katip</option>
                      <option value="filing_clerk">Arşiv Görevlisi</option>
                    </optgroup>
                    <optgroup label="Board of Directors">
                      <option value="director">Yönetim Kurulu / Direktör</option>
                    </optgroup>
                    <optgroup label="Accounts - Management">
                      <option value="accountant">Muhasebeci (Accounts Yöneticisi)</option>
                    </optgroup>
                    <optgroup label="Accounts - Staff">
                      <option value="credit_controller">Kredi Kontrolörü</option>
                      <option value="accounts_clerk">Muhasebe Memuru</option>
                      <option value="purchasing_assistant">Satın Alma Asistanı</option>
                    </optgroup>
                    <optgroup label="Creative - Management">
                      <option value="account_manager">Hesap Yöneticisi (Creative Yöneticisi)</option>
                    </optgroup>
                    <optgroup label="Creative - Staff">
                      <option value="graphic_designer">Grafik Tasarımcı</option>
                      <option value="photographer">Fotoğrafçı</option>
                      <option value="copy_writer">Metin Yazarı</option>
                      <option value="editor">Editör</option>
                      <option value="audio_technician">Ses Teknisyeni</option>
                      <option value="resource_librarian">Kaynak Kütüphanecisi</option>
                    </optgroup>
                    <optgroup label="Computing">
                      <option value="computer_manager">Bilgisayar Yöneticisi</option>
                      <option value="network_support">Ağ Destek</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={selectedUser.isActive}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-slate-700">Aktif</label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Güncelle
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Yeni Kullanıcı Oluştur</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Şifre</label>
                  <input
                    type="password"
                    name="password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ad</label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Soyad</label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                  <select
                    name="role"
                    defaultValue="account_manager"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  >
                    <option value="admin">Sistem Yöneticisi</option>
                    <optgroup label="Administration">
                      <option value="office_manager">Ofis Müdürü</option>
                      <option value="personal_assistant">Kişisel Asistan</option>
                      <option value="receptionist">Resepsiyonist</option>
                      <option value="secretary">Sekreter</option>
                      <option value="clerk_typist">Katip</option>
                      <option value="filing_clerk">Arşiv Görevlisi</option>
                    </optgroup>
                    <optgroup label="Board of Directors">
                      <option value="director">Yönetim Kurulu / Direktör</option>
                    </optgroup>
                    <optgroup label="Accounts - Management">
                      <option value="accountant">Muhasebeci (Accounts Yöneticisi)</option>
                    </optgroup>
                    <optgroup label="Accounts - Staff">
                      <option value="credit_controller">Kredi Kontrolörü</option>
                      <option value="accounts_clerk">Muhasebe Memuru</option>
                      <option value="purchasing_assistant">Satın Alma Asistanı</option>
                    </optgroup>
                    <optgroup label="Creative - Management">
                      <option value="account_manager">Hesap Yöneticisi (Creative Yöneticisi)</option>
                    </optgroup>
                    <optgroup label="Creative - Staff">
                      <option value="graphic_designer">Grafik Tasarımcı</option>
                      <option value="photographer">Fotoğrafçı</option>
                      <option value="copy_writer">Metin Yazarı</option>
                      <option value="editor">Editör</option>
                      <option value="audio_technician">Ses Teknisyeni</option>
                      <option value="resource_librarian">Kaynak Kütüphanecisi</option>
                    </optgroup>
                    <optgroup label="Computing">
                      <option value="computer_manager">Bilgisayar Yöneticisi</option>
                      <option value="network_support">Ağ Destek</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Oluştur
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.show}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          type="delete"
          title="Kullanıcıyı Sil"
          message={`"${deleteModal.userName}" kullanıcısını silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}
