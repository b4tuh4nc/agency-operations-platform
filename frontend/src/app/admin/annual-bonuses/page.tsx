'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToAnnualBonuses, canCreateEditBonuses, canApproveBonuses } from '@/utils/rolePermissions';

interface AnnualBonus {
  _id: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
  year: number;
  bonusAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  calculationCriteria?: {
    performanceScore?: number;
    tasksCompleted?: number;
    tasksCompletedPercentage?: number;
    campaignsCompleted?: number;
    attendanceRate?: number;
    customFactors?: Record<string, number>;
  };
  calculationNotes?: string;
  approvedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
}

export default function AnnualBonusesPage() {
  const [user, setUser] = useState<any>(null);
  const [bonuses, setBonuses] = useState<AnnualBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  
  // Bonus modals
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<AnnualBonus | null>(null);
  const [bonusFormData, setBonusFormData] = useState({
    userId: '',
    year: new Date().getFullYear(),
    bonusAmount: 0,
    currency: 'TRY',
    calculationCriteria: {
      performanceScore: 0,
      tasksCompleted: 0,
      tasksCompletedPercentage: 0,
      campaignsCompleted: 0,
      attendanceRate: 0,
    },
    calculationNotes: '',
    notes: '',
  });

  const [users, setUsers] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, bonusId: string | null, userName: string, year: number}>({
    show: false,
    bonusId: null,
    userName: '',
    year: 0
  });
  const [approveModal, setApproveModal] = useState<{show: boolean, bonusId: string | null, userName: string, amount: number}>({
    show: false,
    bonusId: null,
    userName: '',
    amount: 0
  });
  const [rejectModal, setRejectModal] = useState<{show: boolean, bonusId: string | null, userName: string}>({
    show: false,
    bonusId: null,
    userName: ''
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchData(parsedUser);
    }
  }, []);

  const fetchData = async (currentUser: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const userId = currentUser._id || currentUser.id;
      const userRole = currentUser.role;

      // Bonuses - hierarchical erişim (backend req.user'dan alacak)
      const bonusesRes = await fetch('http://localhost:3000/annual-bonuses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Users - bonus oluşturma için (hierarchical erişim)
      const usersRes = await fetch(`http://localhost:3000/users?userId=${userId}&userRole=${userRole}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (bonusesRes.ok) {
        const bonusesData = await bonusesRes.json();
        setBonuses(bonusesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.filter((u: any) => u.role !== 'client' && u.isActive !== false));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setToast({ message: 'Veriler yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleBonusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateEditBonuses(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedBonus 
        ? `http://localhost:3000/annual-bonuses/${selectedBonus._id}`
        : 'http://localhost:3000/annual-bonuses';
      
      const response = await fetch(url, {
        method: selectedBonus ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bonusFormData),
      });

      if (response.ok) {
        setToast({ 
          message: selectedBonus ? 'Bonus güncellendi' : 'Bonus kaydı oluşturuldu', 
          type: 'success' 
        });
        setShowBonusModal(false);
        setSelectedBonus(null);
        setBonusFormData({
          userId: '',
          year: new Date().getFullYear(),
          bonusAmount: 0,
          currency: 'TRY',
          calculationCriteria: {
            performanceScore: 0,
            tasksCompleted: 0,
            tasksCompletedPercentage: 0,
            campaignsCompleted: 0,
            attendanceRate: 0,
          },
          calculationNotes: '',
          notes: '',
        });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'İşlem başarısız' }));
        setToast({ message: error.message || 'İşlem başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setToast({ message: 'Bir hata oluştu', type: 'error' });
    }
  };

  const handleApprove = async () => {
    if (!approveModal.bonusId) return;
    if (!canApproveBonuses(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/annual-bonuses/${approveModal.bonusId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setToast({ message: 'Bonus onaylandı', type: 'success' });
        setApproveModal({ show: false, bonusId: null, userName: '', amount: 0 });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'Onay başarısız' }));
        setToast({ message: error.message || 'Onay başarısız', type: 'error' });
        setApproveModal({ show: false, bonusId: null, userName: '', amount: 0 });
      }
    } catch (error) {
      console.error('Approve error:', error);
      setToast({ message: 'Onay işlemi sırasında bir hata oluştu', type: 'error' });
      setApproveModal({ show: false, bonusId: null, userName: '', amount: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.bonusId || !rejectionReason.trim()) {
      setToast({ message: 'Lütfen red nedeni giriniz', type: 'error' });
      return;
    }
    if (!canApproveBonuses(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/annual-bonuses/${rejectModal.bonusId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionReason }),
      });

      if (response.ok) {
        setToast({ message: 'Bonus reddedildi', type: 'success' });
        setRejectModal({ show: false, bonusId: null, userName: '' });
        setRejectionReason('');
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'Red işlemi başarısız' }));
        setToast({ message: error.message || 'Red işlemi başarısız', type: 'error' });
        setRejectModal({ show: false, bonusId: null, userName: '' });
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Reject error:', error);
      setToast({ message: 'Red işlemi sırasında bir hata oluştu', type: 'error' });
      setRejectModal({ show: false, bonusId: null, userName: '' });
      setRejectionReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsPaid = async (bonusId: string) => {
    if (!canCreateEditBonuses(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/annual-bonuses/${bonusId}/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setToast({ message: 'Bonus ödendi olarak işaretlendi', type: 'success' });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'İşlem başarısız' }));
        setToast({ message: error.message || 'İşlem başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Mark paid error:', error);
      setToast({ message: 'Bir hata oluştu', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.bonusId) return;
    if (!canCreateEditBonuses(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/annual-bonuses/${deleteModal.bonusId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({ message: 'Bonus kaydı silindi', type: 'success' });
        setDeleteModal({ show: false, bonusId: null, userName: '', year: 0 });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'Bonus silinemedi' }));
        setToast({ message: error.message || 'Bonus silinemedi', type: 'error' });
        setDeleteModal({ show: false, bonusId: null, userName: '', year: 0 });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Bonus silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, bonusId: null, userName: '', year: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border border-red-300';
      case 'paid':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'paid':
        return 'Ödendi';
      default:
        return status;
    }
  };

  return (
    <ProtectedPage checkAccess={hasAccessToAnnualBonuses}>
    <div className="min-h-screen bg-gray-50 flex">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Yıllık Bonus Yönetimi</h1>
          <p className="text-slate-600">Yıllık bonus kayıtlarını görüntüle ve yönet</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800">Bonus Kayıtları</h2>
              {canCreateEditBonuses(user?.role || '') && (
                <button
                  onClick={() => {
                    setSelectedBonus(null);
                    setBonusFormData({
                      userId: '',
                      year: new Date().getFullYear(),
                      bonusAmount: 0,
                      currency: 'TRY',
                      calculationCriteria: {
                        performanceScore: 0,
                        tasksCompleted: 0,
                        tasksCompletedPercentage: 0,
                        campaignsCompleted: 0,
                        attendanceRate: 0,
                      },
                      calculationNotes: '',
                      notes: '',
                    });
                    setShowBonusModal(true);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Yeni Bonus Kaydı
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-800">Personel</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-800">Yıl</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-800">Bonus Tutarı</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-800">Durum</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-800">Onaylayan</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-800">Tarih</th>
                    {canCreateEditBonuses(user?.role || '') && (
                      <th className="text-right py-3 px-4 font-semibold text-slate-800">İşlemler</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map((bonus) => (
                    <tr key={bonus._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">
                            {bonus.userId?.firstName} {bonus.userId?.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{bonus.userId?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-800">{bonus.year}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-700">
                          {bonus.currency === 'TRY' ? '₺' : bonus.currency === 'USD' ? '$' : '€'}
                          {bonus.bonusAmount.toLocaleString('tr-TR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(bonus.status)}`}>
                          {getStatusText(bonus.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {bonus.approvedBy ? (
                          <span className="text-sm">
                            {bonus.approvedBy.firstName} {bonus.approvedBy.lastName}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {bonus.approvedAt 
                          ? new Date(bonus.approvedAt).toLocaleDateString('tr-TR')
                          : bonus.createdAt 
                            ? new Date(bonus.createdAt).toLocaleDateString('tr-TR')
                            : '-'
                        }
                      </td>
                      {canCreateEditBonuses(user?.role || '') && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {bonus.status === 'pending' && canApproveBonuses(user?.role || '') && (
                              <>
                                <button
                                  onClick={() => setApproveModal({ 
                                    show: true, 
                                    bonusId: bonus._id, 
                                    userName: `${bonus.userId?.firstName} ${bonus.userId?.lastName}`.trim() || bonus.userId?.email,
                                    amount: bonus.bonusAmount
                                  })}
                                  className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                  title="Onayla"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setRejectModal({ 
                                    show: true, 
                                    bonusId: bonus._id, 
                                    userName: `${bonus.userId?.firstName} ${bonus.userId?.lastName}`.trim() || bonus.userId?.email
                                  })}
                                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                  title="Reddet"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {bonus.status === 'approved' && (
                              <button
                                onClick={() => handleMarkAsPaid(bonus._id)}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Ödendi Olarak İşaretle"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedBonus(bonus);
                                setBonusFormData({
                                  userId: bonus.userId._id,
                                  year: bonus.year,
                                  bonusAmount: bonus.bonusAmount,
                                  currency: bonus.currency || 'TRY',
                                  calculationCriteria: bonus.calculationCriteria || {
                                    performanceScore: 0,
                                    tasksCompleted: 0,
                                    tasksCompletedPercentage: 0,
                                    campaignsCompleted: 0,
                                    attendanceRate: 0,
                                  },
                                  calculationNotes: bonus.calculationNotes || '',
                                  notes: bonus.notes || '',
                                });
                                setShowBonusModal(true);
                              }}
                              className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                              title="Düzenle"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteModal({ 
                                show: true, 
                                bonusId: bonus._id, 
                                userName: `${bonus.userId?.firstName} ${bonus.userId?.lastName}`.trim() || bonus.userId?.email,
                                year: bonus.year
                              })}
                              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              title="Sil"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {bonuses.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  Henüz bonus kaydı bulunmuyor
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bonus Modal */}
        {showBonusModal && canCreateEditBonuses(user?.role || '') && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedBonus ? 'Bonus Düzenle' : 'Yeni Bonus Kaydı'}
              </h2>
              <form onSubmit={handleBonusSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Personel *</label>
                    <select
                      required
                      value={bonusFormData.userId}
                      onChange={(e) => setBonusFormData({...bonusFormData, userId: e.target.value})}
                      disabled={!!selectedBonus}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100"
                    >
                      <option value="">Seçiniz...</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.firstName} {u.lastName} ({u.email}) - {u.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Yıl *</label>
                    <input
                      type="number"
                      min="2000"
                      max="2100"
                      required
                      value={bonusFormData.year}
                      onChange={(e) => setBonusFormData({...bonusFormData, year: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bonus Tutarı (₺) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={bonusFormData.bonusAmount}
                      onChange={(e) => setBonusFormData({...bonusFormData, bonusAmount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Para Birimi</label>
                    <select
                      value={bonusFormData.currency}
                      onChange={(e) => setBonusFormData({...bonusFormData, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">Hesaplama Kriterleri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Performans Puanı (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={bonusFormData.calculationCriteria.performanceScore}
                        onChange={(e) => setBonusFormData({
                          ...bonusFormData,
                          calculationCriteria: {
                            ...bonusFormData.calculationCriteria,
                            performanceScore: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tamamlanan Görev Sayısı</label>
                      <input
                        type="number"
                        min="0"
                        value={bonusFormData.calculationCriteria.tasksCompleted}
                        onChange={(e) => setBonusFormData({
                          ...bonusFormData,
                          calculationCriteria: {
                            ...bonusFormData.calculationCriteria,
                            tasksCompleted: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Görev Tamamlama % (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={bonusFormData.calculationCriteria.tasksCompletedPercentage}
                        onChange={(e) => setBonusFormData({
                          ...bonusFormData,
                          calculationCriteria: {
                            ...bonusFormData.calculationCriteria,
                            tasksCompletedPercentage: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tamamlanan Kampanya Sayısı</label>
                      <input
                        type="number"
                        min="0"
                        value={bonusFormData.calculationCriteria.campaignsCompleted}
                        onChange={(e) => setBonusFormData({
                          ...bonusFormData,
                          calculationCriteria: {
                            ...bonusFormData.calculationCriteria,
                            campaignsCompleted: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Devam Oranı % (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={bonusFormData.calculationCriteria.attendanceRate}
                        onChange={(e) => setBonusFormData({
                          ...bonusFormData,
                          calculationCriteria: {
                            ...bonusFormData.calculationCriteria,
                            attendanceRate: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hesaplama Notları</label>
                  <textarea
                    value={bonusFormData.calculationNotes}
                    onChange={(e) => setBonusFormData({...bonusFormData, calculationNotes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="Bonus hesaplama detayları..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                  <textarea
                    value={bonusFormData.notes}
                    onChange={(e) => setBonusFormData({...bonusFormData, notes: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="Ek notlar..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {selectedBonus ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBonusModal(false);
                      setSelectedBonus(null);
                    }}
                    className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        <ConfirmationModal
          isOpen={approveModal.show}
          onClose={() => setApproveModal({ show: false, bonusId: null, userName: '', amount: 0 })}
          onConfirm={handleApprove}
          type="create"
          title="Bonusu Onayla"
          message={`"${approveModal.userName}" kullanıcısının ${approveModal.amount ? '₺' + approveModal.amount.toLocaleString('tr-TR') : ''} tutarındaki bonusunu onaylamak istediğinizden emin misiniz?`}
          confirmText="Evet, Onayla"
          isLoading={isProcessing}
        />

        {/* Reject Modal */}
        {rejectModal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Bonusu Reddet</h2>
              <p className="text-slate-600 mb-4">
                "{rejectModal.userName}" kullanıcısının bonusunu reddetmek istediğinizden emin misiniz?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Red Nedeni *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 text-slate-800"
                  placeholder="Red nedeni..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setRejectModal({ show: false, bonusId: null, userName: '' });
                    setRejectionReason('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>İşleniyor...</span>
                    </div>
                  ) : (
                    'Reddet'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        <ConfirmationModal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, bonusId: null, userName: '', year: 0 })}
          onConfirm={handleDelete}
          type="delete"
          title="Bonus Kaydını Sil"
          message={`"${deleteModal.userName}" kullanıcısının ${deleteModal.year} yılı bonus kaydını silmek istediğinizden emin misiniz?`}
          isLoading={isProcessing}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}

