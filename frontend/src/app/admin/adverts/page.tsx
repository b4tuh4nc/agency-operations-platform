'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToAdverts } from '@/utils/rolePermissions';

interface Advert {
  _id: string;
  title: string;
  campaign: any;
  description?: string;
  status: string;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedCost: number;
  actualCost: number;
  medium?: string;
  createdAt: string;
}

interface Campaign {
  _id: string;
  title: string;
  client?: any;
}

export default function AdvertsPage() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAdvert, setSelectedAdvert] = useState<Advert | null>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, advertId: string | null, advertTitle: string}>({
    show: false,
    advertId: null,
    advertTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [scheduledStartDate, setScheduledStartDate] = useState<string>('');
  const [scheduledEndDate, setScheduledEndDate] = useState<string>('');

  useEffect(() => {
    fetchAdverts();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchAdverts = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/adverts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAdverts(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

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
      console.error('Fetch campaigns error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tarih kontrolü
    if (scheduledStartDate && scheduledEndDate && new Date(scheduledStartDate) > new Date(scheduledEndDate)) {
      setToast({
        message: 'Başlangıç tarihi bitiş tarihinden sonra olamaz!',
        type: 'error'
      });
      return;
    }
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const advertData = {
      title: formData.get('title'),
      campaign: formData.get('campaign'),
      description: formData.get('description'),
      scheduledStartDate: scheduledStartDate || undefined,
      scheduledEndDate: scheduledEndDate || undefined,
      estimatedCost: parseFloat(formData.get('estimatedCost') as string) || 0,
      medium: formData.get('medium'),
      // Status otomatik güncellenir, manuel olarak gönderilmez
      // status: formData.get('status') || 'concept', // Kaldırıldı - otomatik güncellenir
    };

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedAdvert 
        ? `http://localhost:3000/adverts/${selectedAdvert._id}`
        : 'http://localhost:3000/adverts';
      
      const response = await fetch(url, {
        method: selectedAdvert ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(advertData),
      });

      if (response.ok) {
        setToast({
          message: selectedAdvert ? 'Reklam güncellendi' : 'Reklam oluşturuldu',
          type: 'success'
        });
        setShowModal(false);
        setSelectedAdvert(null);
        setScheduledStartDate('');
        setScheduledEndDate('');
        fetchAdverts();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDeleteClick = (advertId: string, advertTitle: string) => {
    setDeleteModal({
      show: true,
      advertId,
      advertTitle
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.advertId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/adverts/${deleteModal.advertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({message: 'Reklam başarıyla silindi', type: 'success'});
        setDeleteModal({ show: false, advertId: null, advertTitle: '' });
        fetchAdverts();
      } else {
        const error = await response.json().catch(() => ({ message: 'Reklam silinemedi' }));
        setToast({ message: error.message || 'Reklam silinemedi', type: 'error' });
        setDeleteModal({ show: false, advertId: null, advertTitle: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Reklam silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, advertId: null, advertTitle: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, advertId: null, advertTitle: '' });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      planning: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      planning: 'Planlandı',
      in_progress: 'Devam Ediyor',
      completed: 'Tamamlandı',
      cancelled: 'İptal'
    };
    return texts[status] || status;
  };

  return (
    <ProtectedPage checkAccess={hasAccessToAdverts}>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Reklam Yönetimi</h1>
            <p className="text-slate-600">Reklamları görüntüle ve yönet</p>
          </div>
          <button
            onClick={() => {
              setSelectedAdvert(null);
              setScheduledStartDate('');
              setScheduledEndDate('');
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            + Yeni Reklam
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Reklam</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Kampanya</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Medya</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Durum</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Maliyet</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Tarih</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-800">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {adverts.map((advert) => (
                  <tr key={advert._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-800">{advert.title}</p>
                        {advert.description && (
                          <p className="text-sm text-slate-600 truncate">{advert.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-800">{advert.campaign?.title || '-'}</p>
                      {advert.campaign?.client && (
                        <p className="text-xs text-slate-500">{advert.campaign.client.name}</p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-600">{advert.medium || '-'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(advert.status)}`}>
                        {getStatusText(advert.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-800">₺{advert.estimatedCost.toLocaleString()}</p>
                      {advert.actualCost > 0 && (
                        <p className="text-xs text-slate-500">Gerçek: ₺{advert.actualCost.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {advert.scheduledStartDate 
                        ? new Date(advert.scheduledStartDate).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAdvert(advert);
                            setScheduledStartDate(advert.scheduledStartDate?.split('T')[0] || '');
                            setScheduledEndDate(advert.scheduledEndDate?.split('T')[0] || '');
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(advert._id, advert.title)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
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

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedAdvert ? 'Reklam Düzenle' : 'Yeni Reklam'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reklam Başlığı *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedAdvert?.title}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Kampanya *</label>
                    <select
                      name="campaign"
                      defaultValue={selectedAdvert?.campaign?._id}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      required
                    >
                      <option value="">Kampanya seçin</option>
                      {campaigns.map(campaign => (
                        <option key={campaign._id} value={campaign._id}>
                          {campaign.title} {campaign.client && `(${campaign.client.name})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Medya Türü</label>
                    <select
                      name="medium"
                      defaultValue={selectedAdvert?.medium}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="">Seçin</option>
                      <option value="TV">TV</option>
                      <option value="Radio">Radyo</option>
                      <option value="Print">Basılı Medya</option>
                      <option value="Digital">Dijital</option>
                      <option value="Social Media">Sosyal Medya</option>
                      <option value="Outdoor">Açık Hava</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <textarea
                    name="description"
                    defaultValue={selectedAdvert?.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Başlangıç</label>
                    <input
                      type="date"
                      name="scheduledStartDate"
                      value={scheduledStartDate || selectedAdvert?.scheduledStartDate?.split('T')[0] || ''}
                      onChange={(e) => {
                        const startDate = e.target.value;
                        setScheduledStartDate(startDate);
                        // Eğer bitiş tarihi başlangıçtan önceyse, bitiş tarihini sıfırla
                        if (scheduledEndDate && new Date(startDate) > new Date(scheduledEndDate)) {
                          setScheduledEndDate('');
                        }
                      }}
                      max={scheduledEndDate || undefined}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Planlanan Bitiş</label>
                    <input
                      type="date"
                      name="scheduledEndDate"
                      value={scheduledEndDate || selectedAdvert?.scheduledEndDate?.split('T')[0] || ''}
                      onChange={(e) => {
                        const endDate = e.target.value;
                        setScheduledEndDate(endDate);
                        // Eğer başlangıç tarihi bitişten sonraysa, başlangıç tarihini sıfırla
                        if (scheduledStartDate && new Date(scheduledStartDate) > new Date(endDate)) {
                          setScheduledStartDate('');
                        }
                      }}
                      min={scheduledStartDate || selectedAdvert?.scheduledStartDate?.split('T')[0] || undefined}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tahmini Maliyet</label>
                    <input
                      type="number"
                      name="estimatedCost"
                      defaultValue={selectedAdvert?.estimatedCost}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Durum <span className="text-xs text-slate-500">(Otomatik güncellenir)</span>
                    </label>
                    <input
                      type="text"
                      value={selectedAdvert ? getStatusText(selectedAdvert.status) : 'Planlandı'}
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Durum otomatik olarak güncellenir: Görev yok → Planlandı, Görev var → Devam Ediyor, Tüm görevler tamamlanınca → Tamamlandı
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedAdvert ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedAdvert(null);
                      setScheduledStartDate('');
                      setScheduledEndDate('');
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
          title="Reklamı Sil"
          message={`"${deleteModal.advertTitle}" reklamını silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}
