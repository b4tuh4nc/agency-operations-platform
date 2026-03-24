'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToCampaigns } from '@/utils/rolePermissions';

interface Campaign {
  _id: string;
  title: string;
  client: any;
  campaignManager?: any;
  description?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedCost: number;
  budget: number;
  actualCost: number;
  status: string;
  completionPercentage: number;
  assignedStaff: any[];
  createdAt: string;
}

interface Client {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, campaignId: string | null, campaignTitle: string}>({
    show: false,
    campaignId: null,
    campaignTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [plannedStartDate, setPlannedStartDate] = useState<string>('');
  const [plannedEndDate, setPlannedEndDate] = useState<string>('');

  useEffect(() => {
    fetchCampaigns();
    fetchClients();
    fetchUsers();
    
    // Kampanya güncelleme event'ini dinle
    const handleCampaignUpdate = () => {
      fetchCampaigns();
    };
    
    window.addEventListener('campaignUpdated', handleCampaignUpdate);
    
    return () => {
      window.removeEventListener('campaignUpdated', handleCampaignUpdate);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/clients', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Fetch clients error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tarih kontrolü
    if (plannedStartDate && plannedEndDate && new Date(plannedStartDate) > new Date(plannedEndDate)) {
      setToast({
        message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz!',
        type: 'error'
      });
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const campaignData = {
      title: formData.get('title'),
      client: formData.get('client'),
      campaignManager: formData.get('campaignManager') || undefined,
      description: formData.get('description'),
      plannedStartDate: plannedStartDate || undefined,
      plannedEndDate: plannedEndDate || undefined,
      estimatedCost: parseFloat(formData.get('estimatedCost') as string) || 0,
      budget: parseFloat(formData.get('budget') as string) || 0,
      // Status otomatik güncellenir, manuel olarak gönderilmez
      // status: formData.get('status') || 'planning', // Kaldırıldı - otomatik güncellenir
      completionPercentage: parseInt(formData.get('completionPercentage') as string) || 0,
    };

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedCampaign 
        ? `http://localhost:3000/campaigns/${selectedCampaign._id}`
        : 'http://localhost:3000/campaigns';
      
      const response = await fetch(url, {
        method: selectedCampaign ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        setToast({
          message: selectedCampaign ? 'Kampanya güncellendi' : 'Kampanya oluşturuldu',
          type: 'success'
        });
        setShowModal(false);
        setSelectedCampaign(null);
        setPlannedStartDate('');
        setPlannedEndDate('');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDeleteClick = (campaignId: string, campaignTitle: string) => {
    setDeleteModal({
      show: true,
      campaignId,
      campaignTitle
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.campaignId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/campaigns/${deleteModal.campaignId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({message: 'Kampanya başarıyla silindi', type: 'success'});
        setDeleteModal({ show: false, campaignId: null, campaignTitle: '' });
        fetchCampaigns();
      } else {
        const error = await response.json().catch(() => ({ message: 'Kampanya silinemedi' }));
        setToast({ message: error.message || 'Kampanya silinemedi', type: 'error' });
        setDeleteModal({ show: false, campaignId: null, campaignTitle: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Kampanya silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, campaignId: null, campaignTitle: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, campaignId: null, campaignTitle: '' });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      planning: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      planning: 'Planlama',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
      on_hold: 'Beklemede'
    };
    return texts[status] || status;
  };

  return (
    <ProtectedPage checkAccess={hasAccessToCampaigns}>
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Kampanya Yönetimi</h1>
            <p className="text-slate-600">Reklam kampanyalarını görüntüle ve yönet</p>
          </div>
          <button
            onClick={() => {
              setSelectedCampaign(null);
              setPlannedStartDate('');
              setPlannedEndDate('');
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            + Yeni Kampanya
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-800">{campaign.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-500">Müşteri</p>
                        <p className="text-sm font-medium text-slate-800">{campaign.client?.name || 'Belirsiz'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Bütçe</p>
                        <p className="text-sm font-medium text-slate-800">₺{campaign.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Harcanan</p>
                        <p className="text-sm font-medium text-slate-800">₺{campaign.actualCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Tamamlanma</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${campaign.completionPercentage}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-800">{campaign.completionPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {campaign.description && (
                      <p className="text-sm text-slate-600 mb-3">{campaign.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      {campaign.plannedStartDate && (
                        <span>Başlangıç: {new Date(campaign.plannedStartDate).toLocaleDateString('tr-TR')}</span>
                      )}
                      {campaign.plannedEndDate && (
                        <span>Bitiş: {new Date(campaign.plannedEndDate).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setPlannedStartDate(campaign.plannedStartDate?.split('T')[0] || '');
                        setPlannedEndDate(campaign.plannedEndDate?.split('T')[0] || '');
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(campaign._id, campaign.title)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kampanya Adı *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedCampaign?.title}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Müşteri *</label>
                    <select
                      name="client"
                      defaultValue={selectedCampaign?.client?._id}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      required
                    >
                      <option value="">Müşteri seçin</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kampanya Yöneticisi</label>
                    <select
                      name="campaignManager"
                      defaultValue={selectedCampaign?.campaignManager?._id}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="">Yönetici seçin</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <textarea
                    name="description"
                    defaultValue={selectedCampaign?.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Başlangıç</label>
                    <input
                      type="date"
                      name="plannedStartDate"
                      value={plannedStartDate || selectedCampaign?.plannedStartDate?.split('T')[0] || ''}
                      onChange={(e) => {
                        const startDate = e.target.value;
                        setPlannedStartDate(startDate);
                        // Eğer bitiş tarihi başlangıçtan önceyse, bitiş tarihini sıfırla
                        if (plannedEndDate && new Date(startDate) > new Date(plannedEndDate)) {
                          setPlannedEndDate('');
                        }
                      }}
                      max={plannedEndDate || undefined}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Bitiş</label>
                    <input
                      type="date"
                      name="plannedEndDate"
                      value={plannedEndDate || selectedCampaign?.plannedEndDate?.split('T')[0] || ''}
                      onChange={(e) => {
                        const endDate = e.target.value;
                        setPlannedEndDate(endDate);
                        // Eğer başlangıç tarihi bitişten sonraysa, başlangıç tarihini sıfırla
                        if (plannedStartDate && new Date(plannedStartDate) > new Date(endDate)) {
                          setPlannedStartDate('');
                        }
                      }}
                      min={plannedStartDate || selectedCampaign?.plannedStartDate?.split('T')[0] || undefined}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tahmini Maliyet</label>
                    <input
                      type="number"
                      name="estimatedCost"
                      defaultValue={selectedCampaign?.estimatedCost}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bütçe</label>
                    <input
                      type="number"
                      name="budget"
                      defaultValue={selectedCampaign?.budget}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tamamlanma %</label>
                    <input
                      type="number"
                      name="completionPercentage"
                      min="0"
                      max="100"
                      defaultValue={selectedCampaign?.completionPercentage}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Durum <span className="text-xs text-slate-500">(Otomatik güncellenir)</span>
                  </label>
                  <input
                    type="text"
                    value={selectedCampaign ? getStatusText(selectedCampaign.status) : 'Planlama'}
                    disabled
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Durum otomatik olarak güncellenir: Yeni kampanya → Planlama, Görev atanınca → Devam Ediyor, Tüm görevler tamamlanınca → Tamamlandı
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedCampaign ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCampaign(null);
                      setPlannedStartDate('');
                      setPlannedEndDate('');
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

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.show}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          type="delete"
          title="Kampanyayı Sil"
          message={`"${deleteModal.campaignTitle}" kampanyasını silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}
