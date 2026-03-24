'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function FileManagement() {
  const [files, setFiles] = useState<any[]>([]);
  const [quotas, setQuotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newQuota, setNewQuota] = useState({ maxFileSize: 25, totalStorage: 1024 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const [filesRes, quotasRes] = await Promise.all([
        fetch('http://localhost:3000/file-management/files?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/file-management/quotas', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (filesRes.ok) setFiles(await filesRes.json());
      if (quotasRes.ok) setQuotas(await quotasRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserQuota = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    const currentUser = JSON.parse(userData || '{}');

    try {
      const response = await fetch(
        `http://localhost:3000/file-management/quota/${selectedUser._id}?modifiedBy=${currentUser._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newQuota)
        }
      );

      if (response.ok) {
        alert('Kota başarıyla güncellendi!');
        setSelectedUser(null);
        fetchData();
      } else {
        alert('Kota güncellenemedi!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Bir hata oluştu!');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Dosya Yönetimi
          </h1>
          <p className="text-slate-600">
            Yüklenen dosyaları görüntüleyin ve kullanıcı kotalarını yönetin
          </p>
        </div>

        {/* User Quotas */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Kullanıcı Kotaları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotas.map(quota => (
              <div key={quota._id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {quota.user?.firstName} {quota.user?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{quota.user?.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(quota.user);
                      setNewQuota({
                        maxFileSize: quota.maxFileSize,
                        totalStorage: quota.totalStorageQuota
                      });
                    }}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium"
                  >
                    Düzenle
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Maks. Dosya:</span>
                    <span className="font-medium">{quota.maxFileSize} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Toplam Kota:</span>
                    <span className="font-medium">{quota.totalStorageQuota} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kullanılan:</span>
                    <span className="font-medium text-blue-600">
                      {quota.usedStorage.toFixed(2)} MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(quota.usedStorage / quota.totalStorageQuota) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Quota Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">
                Kota Düzenle: {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Maksimum Dosya Boyutu (MB)
                  </label>
                  <input
                    type="number"
                    value={newQuota.maxFileSize}
                    onChange={(e) => setNewQuota({...newQuota, maxFileSize: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Toplam Depolama Kotası (MB)
                  </label>
                  <input
                    type="number"
                    value={newQuota.totalStorage}
                    onChange={(e) => setNewQuota({...newQuota, totalStorage: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={updateUserQuota}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Kaydet
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Files List */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Yüklenen Dosyalar</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Dosya Adı</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Boyut</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Yükleyen</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Modül</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm text-slate-800">{file.originalName}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{formatBytes(file.size)}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {file.uploadedBy?.firstName} {file.uploadedBy?.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {file.module || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(file.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {files.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Dosya bulunamadı</h3>
                <p className="text-slate-500">Henüz dosya yüklenmemiş.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

