'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function TaskManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [adverts, setAdverts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, taskId: string | null, taskTitle: string}>({
    show: false,
    taskId: null,
    taskTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [rejectModal, setRejectModal] = useState<{show: boolean, taskId: string | null, taskTitle: string}>({
    show: false,
    taskId: null,
    taskTitle: ''
  });
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvedTaskId, setApprovedTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    advert: '',
    campaign: '',
    assignedTo: [] as string[],
    priority: 'medium',
    dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    const user = JSON.parse(userData || '{}');

    try {
      const [usersRes, advertsRes, campaignsRes, tasksRes] = await Promise.all([
        fetch('http://localhost:3000/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/adverts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/campaigns', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/tasks', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users fetched:', usersData);
        setUsers(usersData);
      }
      if (advertsRes.ok) setAdverts(await advertsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
      if (tasksRes.ok) setTasks(await tasksRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      setToast({
        message: 'Kullanıcı bilgisi bulunamadı!',
        type: 'error'
      });
      return;
    }
    
    const user = JSON.parse(userData);
    const userId = user._id || user.id;
    
    if (!userId) {
      setToast({
        message: 'Kullanıcı ID bulunamadı!',
        type: 'error'
      });
      return;
    }

    // Kampanya seçilmeden reklam seçilmişse kontrol et
    if (formData.advert && !formData.campaign) {
      setToast({
        message: 'Kampanya seçmeden reklam seçemezsiniz!',
        type: 'error'
      });
      return;
    }

    // Seçilen reklamın kampanyaya ait olup olmadığını kontrol et
    if (formData.campaign && formData.advert) {
      const selectedAdvert = adverts.find(a => a._id === formData.advert);
      if (selectedAdvert) {
        const advertCampaignId = typeof selectedAdvert.campaign === 'object' 
          ? selectedAdvert.campaign?._id 
          : selectedAdvert.campaign;
        if (advertCampaignId !== formData.campaign) {
          setToast({
            message: 'Seçilen reklam bu kampanyaya ait değil!',
            type: 'error'
          });
          return;
        }
      }
    }

    try {
      const response = await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          advert: formData.advert,
          campaign: formData.campaign,
          assignedBy: userId,
          assignedTo: Array.isArray(formData.assignedTo) ? formData.assignedTo : [formData.assignedTo].filter(Boolean),
          priority: formData.priority,
          dueDate: formData.dueDate || undefined
        })
      });

      if (response.ok) {
        setToast({
          message: 'Görev başarıyla oluşturuldu!',
          type: 'success'
        });
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          advert: '',
          campaign: '',
          assignedTo: [],
          priority: 'medium',
          dueDate: ''
        });
        fetchData();
        // Kampanya sayfasını yenilemek için event dispatch et
        window.dispatchEvent(new CustomEvent('campaignUpdated'));
      } else {
        const error = await response.json().catch(() => ({ message: 'Görev oluşturulamadı' }));
        setToast({
          message: error.message || 'Görev oluşturulamadı!',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({
        message: 'Bir hata oluştu!',
        type: 'error'
      });
    }
  };

  // Tüm aktif kullanıcıları göster (admin hariç)
  const assignableUsers = users.filter(u => 
    u.isActive !== false && u.role !== 'admin' && u.role !== 'client'
  );
  
  console.log('Assignable users:', assignableUsers);

  const openFile = (filePath: string) => {
    window.open(`http://localhost:3000/${filePath}`, '_blank');
  };

  const handleApproveClick = (taskId: string, taskTitle: string) => {
    setApprovedTaskId(taskId);
    approveTask(taskId, taskTitle);
  };

  const approveTask = async (taskId: string, taskTitle: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'approved',
          feedback: 'Görev onaylandı, harika iş!'
        })
      });

      if (response.ok) {
        setToast({
          message: `"${taskTitle}" görevi onaylandı!`,
          type: 'success'
        });
        fetchData();
        setSelectedTask(null);
        // Kampanya sayfasını yenile
        window.dispatchEvent(new CustomEvent('campaignUpdated'));
        // 3 saniye sonra approvedTaskId'yi temizle
        setTimeout(() => {
          setApprovedTaskId(null);
        }, 3000);
      } else {
        const error = await response.json().catch(() => ({ message: 'Görev onaylanamadı' }));
        setToast({
          message: error.message || 'Görev onaylanamadı',
          type: 'error'
        });
        setApprovedTaskId(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({
        message: 'Görev onaylanırken bir hata oluştu',
        type: 'error'
      });
      setApprovedTaskId(null);
    }
  };

  const handleRejectClick = (taskId: string, taskTitle: string) => {
    setRejectModal({
      show: true,
      taskId,
      taskTitle
    });
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.taskId || !rejectReason.trim()) {
      setToast({
        message: 'Lütfen reddetme nedeni girin',
        type: 'error'
      });
      return;
    }

    setIsRejecting(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/tasks/${rejectModal.taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'rejected',
          feedback: rejectReason.trim()
        })
      });

      if (response.ok) {
        setToast({
          message: `"${rejectModal.taskTitle}" görevi reddedildi`,
          type: 'success'
        });
        setRejectModal({ show: false, taskId: null, taskTitle: '' });
        setRejectReason('');
        fetchData();
        setSelectedTask(null);
        // Kampanya sayfasını yenile
        window.dispatchEvent(new CustomEvent('campaignUpdated'));
        // Kampanya sayfasını yenile
        window.dispatchEvent(new CustomEvent('campaignUpdated'));
      } else {
        const error = await response.json().catch(() => ({ message: 'Görev reddedilemedi' }));
        setToast({
          message: error.message || 'Görev reddedilemedi',
          type: 'error'
        });
        setRejectModal({ show: false, taskId: null, taskTitle: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      setToast({
        message: 'Görev reddedilirken bir hata oluştu',
        type: 'error'
      });
      setRejectModal({ show: false, taskId: null, taskTitle: '' });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectModal({ show: false, taskId: null, taskTitle: '' });
    setRejectReason('');
  };

  const handleDeleteClick = (taskId: string, taskTitle: string) => {
    setDeleteModal({
      show: true,
      taskId,
      taskTitle
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.taskId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/tasks/${deleteModal.taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setToast({message: 'Görev başarıyla silindi', type: 'success'});
        setDeleteModal({ show: false, taskId: null, taskTitle: '' });
        fetchData();
        // Kampanya sayfasını yenile
        window.dispatchEvent(new CustomEvent('campaignUpdated'));
      } else {
        const error = await response.json().catch(() => ({ message: 'Görev silinemedi' }));
        setToast({ message: error.message || 'Görev silinemedi', type: 'error' });
        setDeleteModal({ show: false, taskId: null, taskTitle: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Görev silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, taskId: null, taskTitle: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, taskId: null, taskTitle: '' });
  };

  return (
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Görev Yönetimi</h1>
            <p className="text-slate-600">Ekip üyelerine görev atayın ve takip edin</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Yeni Görev</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Yeni Görev Oluştur</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Görev Başlığı</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Örn: Logo tasarımı"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Öncelik</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Açıklama</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Görev detaylarını açıklayın..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kampanya</label>
                  <select
                    required
                    value={formData.campaign}
                    onChange={(e) => {
                      const selectedCampaignId = e.target.value;
                      // Kampanya değiştiğinde reklam seçimini sıfırla
                      setFormData({
                        ...formData,
                        campaign: selectedCampaignId,
                        advert: '' // Reklam seçimini sıfırla
                      });
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                  >
                    <option value="" className="text-slate-400">Kampanya seçin...</option>
                    {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Reklam</label>
                  <select
                    required
                    value={formData.advert}
                    onChange={(e) => setFormData({...formData, advert: e.target.value})}
                    disabled={!formData.campaign}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 ${
                      !formData.campaign ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="" className="text-slate-400">
                      {!formData.campaign ? 'Önce kampanya seçin...' : 'Reklam seçin...'}
                    </option>
                    {formData.campaign && adverts
                      .filter(a => {
                        // Reklamın campaign field'ı obje veya ID olabilir
                        const advertCampaignId = typeof a.campaign === 'object' 
                          ? a.campaign?._id 
                          : a.campaign;
                        return advertCampaignId === formData.campaign;
                      })
                      .map(a => (
                        <option key={a._id} value={a._id}>{a.title}</option>
                      ))}
                  </select>
                  {!formData.campaign && (
                    <p className="text-xs text-slate-500 mt-1">
                      Reklam seçmek için önce kampanya seçmelisiniz
                    </p>
                  )}
                  {formData.campaign && adverts.filter(a => {
                    const advertCampaignId = typeof a.campaign === 'object' 
                      ? a.campaign?._id 
                      : a.campaign;
                    return advertCampaignId === formData.campaign;
                  }).length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1">
                      Bu kampanyaya ait reklam bulunmuyor
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Atanan Kişiler (Çoklu Seçim) <span className="text-red-500">*</span>
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-3 bg-white">
                    {assignableUsers.length === 0 ? (
                      <p className="text-sm text-slate-500">Atanabilir kullanıcı bulunamadı</p>
                    ) : (
                      assignableUsers.map(user => {
                        const displayName = (user.firstName && user.lastName) 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.firstName || user.lastName || user.email || 'İsimsiz Kullanıcı';
                        const roleDisplay = user.role ? ` (${user.role})` : '';
                        return (
                          <label key={user._id} className="flex items-center space-x-2 py-2 hover:bg-slate-50 px-2 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.assignedTo.includes(user._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    assignedTo: [...formData.assignedTo, user._id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    assignedTo: formData.assignedTo.filter(id => id !== user._id)
                                  });
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-700">
                              {displayName}{roleDisplay}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  {formData.assignedTo.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.assignedTo.length} kişi seçildi
                    </p>
                  )}
                  {formData.assignedTo.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      En az bir kişi seçmelisiniz
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bitiş Tarihi (Opsiyonel)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const today = new Date().toISOString().split('T')[0];
                    if (selectedDate < today) {
                      setToast({
                        message: 'Bitiş tarihi bugünden önce olamaz!',
                        type: 'error'
                      });
                      return;
                    }
                    setFormData({...formData, dueDate: selectedDate});
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Görevi Oluştur
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="grid gap-4">
          {tasks.map(task => (
            <div key={task._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'completed' || task.status === 'approved' ? 'bg-green-100 text-green-700' :
                      task.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                      task.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Atanan: {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
                        ? task.assignedTo.map((user: any, idx: number) => {
                            const name = (user.firstName && user.lastName)
                              ? `${user.firstName} ${user.lastName}`
                              : user.firstName || user.lastName || user.email || 'İsimsiz';
                            return <span key={user._id || idx}>{idx > 0 ? ', ' : ''}{name}</span>;
                          })
                        : task.assignedTo && !Array.isArray(task.assignedTo)
                          ? ((task.assignedTo.firstName && task.assignedTo.lastName)
                              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                              : task.assignedTo.firstName || task.assignedTo.lastName || task.assignedTo.email || 'İsimsiz')
                          : 'Atanmamış'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Kampanya: {task.campaign?.title}
                    </span>
                    <span>•</span>
                    <span>İlerleme: %{Math.min(100, Math.max(0, task.completionPercentage || 0))}</span>
                    {task.spentAmount && task.spentAmount > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-green-600 font-medium">
                          💰 Harcanan: ₺{task.spentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {task.priority}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, task.completionPercentage || 0))}%` }}
                />
              </div>

              {/* Yüklenen Dosyalar */}
              {task.uploadedFiles && task.uploadedFiles.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Yüklenen Dosyalar ({task.uploadedFiles.length}):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {task.uploadedFiles.map((file: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => openFile(file)}
                        className="text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-blue-700 group-hover:text-blue-800 font-medium truncate">
                            {file.split('/').pop() || file.split('\\').pop()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teslim Edildi - Onay Butonları */}
              {task.status === 'submitted' && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-3">
                    ⏳ Görev teslim edildi, onay bekliyor
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApproveClick(task._id, task.title)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Kabul Et</span>
                    </button>
                    <button
                      onClick={() => handleRejectClick(task._id, task.title)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Reddet</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Onaylandı Mesajı */}
              {(task.status === 'approved' || approvedTaskId === task._id) && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4 animate-pulse">
                  <p className="text-sm font-semibold text-green-700">
                    ✓ Görev onaylandı!
                  </p>
                  {task.feedback && (
                    <p className="text-sm text-green-600 mt-1">{task.feedback}</p>
                  )}
                </div>
              )}

              {/* Reddedildi Mesajı */}
              {task.status === 'rejected' && task.feedback && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
                  <p className="text-sm font-semibold text-red-700 mb-1">✗ Görev reddedildi</p>
                  <p className="text-sm text-red-600">Neden: {task.feedback}</p>
                </div>
              )}

              {/* Silme Butonu */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleDeleteClick(task._id, task.title)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Görevi Sil</span>
                </button>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Henüz görev yok</h3>
              <p className="text-slate-500">Yeni görev oluşturmak için yukarıdaki butona tıklayın.</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.show}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          type="delete"
          title="Görevi Sil"
          message={`"${deleteModal.taskTitle}" görevini silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />

        {/* Reject Modal */}
        {rejectModal.show && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Görevi Reddet</h2>
              <p className="text-sm text-slate-600 mb-4">
                <span className="font-semibold">"{rejectModal.taskTitle}"</span> görevini reddetmek için lütfen nedenini belirtin:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reddetme nedeni..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-800 placeholder:text-slate-400 resize-none"
                autoFocus
              />
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || isRejecting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isRejecting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Reddediliyor...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Reddet</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRejectCancel}
                  disabled={isRejecting}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

