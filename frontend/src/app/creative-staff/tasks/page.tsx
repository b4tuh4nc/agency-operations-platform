'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function MyTasks() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null);
  const [spentAmounts, setSpentAmounts] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, taskId: string | null, taskTitle: string}>({
    show: false,
    taskId: null,
    taskTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitModal, setSubmitModal] = useState<{show: boolean, taskId: string | null, taskTitle: string}>({
    show: false,
    taskId: null,
    taskTitle: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchMyTasks();
    }
  }, []);

  const fetchMyTasks = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const userId = user._id || user.id;
      
      if (!userId) {
        console.error('User ID bulunamadı:', user);
        return;
      }
      
      const token = localStorage.getItem('access_token');
      
      console.log('Görevler çekiliyor, userId:', userId);
      
      const response = await fetch(`http://localhost:3000/tasks/my-tasks?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (taskId: string) => {
    if (!uploadFile) {
      setToast({
        message: 'Lütfen bir dosya seçin',
        type: 'error'
      });
      return;
    }

    setUploadingTaskId(taskId);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/tasks/${taskId}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setToast({
          message: 'Dosya başarıyla yüklendi!',
          type: 'success'
        });
        fetchMyTasks();
        setUploadFile(null);
      } else {
        const error = await response.json().catch(() => ({ message: 'Dosya yükleme başarısız' }));
        setToast({
          message: error.message || 'Dosya yükleme başarısız!',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setToast({
        message: 'Bir hata oluştu!',
        type: 'error'
      });
    } finally {
      setUploadingTaskId(null);
    }
  };

  const handleSubmitClick = (taskId: string, taskTitle: string) => {
    setSubmitModal({
      show: true,
      taskId,
      taskTitle
    });
  };

  const handleSubmitConfirm = async () => {
    if (!submitModal.taskId) return;

    // Harcanan tutar kontrolü
    const spentAmountValue = spentAmounts[submitModal.taskId];
    if (!spentAmountValue || spentAmountValue.trim() === '') {
      setToast({
        message: 'Lütfen harcanan tutar girin',
        type: 'error'
      });
      return;
    }

    const spentAmount = parseFloat(spentAmountValue);
    if (isNaN(spentAmount) || spentAmount <= 0) {
      setToast({
        message: 'Harcanan tutar 0\'dan büyük olmalıdır',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/tasks/${submitModal.taskId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          submissionNote: '',
          spentAmount: spentAmount
        }),
      });

      if (response.ok) {
        setToast({
          message: 'Görev başarıyla teslim edildi',
          type: 'success'
        });
        // SpentAmount'u state'den temizle
        const newSpentAmounts = { ...spentAmounts };
        delete newSpentAmounts[submitModal.taskId!];
        setSpentAmounts(newSpentAmounts);
        setSubmitModal({ show: false, taskId: null, taskTitle: '' });
        fetchMyTasks();
        // Kampanya sayfasını yenile
        window.dispatchEvent(new CustomEvent('campaignUpdated'));
      } else {
        const error = await response.json().catch(() => ({ message: 'Görev teslim edilemedi' }));
        setToast({
          message: error.message || 'Görev teslim edilemedi',
          type: 'error'
        });
        setSubmitModal({ show: false, taskId: null, taskTitle: '' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setToast({
        message: 'Görev teslim edilirken bir hata oluştu',
        type: 'error'
      });
      setSubmitModal({ show: false, taskId: null, taskTitle: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCancel = () => {
    setSubmitModal({ show: false, taskId: null, taskTitle: '' });
  };

  const updateProgress = async (taskId: string, percentage: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          completionPercentage: percentage,
          status: percentage === 100 ? 'submitted' : 'in_progress'
        }),
      });

      if (response.ok) {
        fetchMyTasks();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
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
        fetchMyTasks();
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-green-100 text-green-700'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-blue-50 text-blue-600 border-blue-200',
      medium: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      high: 'bg-orange-50 text-orange-600 border-orange-200',
      urgent: 'bg-red-50 text-red-600 border-red-200'
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Görevler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Görevlerim
          </h1>
          <p className="text-slate-600">
            Size atanan görevleri görüntüleyin ve tamamlayın
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Henüz görev yok</h3>
            <p className="text-slate-500">Size atanan görevler burada görünecektir.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-800">
                        {task.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-1 rounded border text-xs font-medium ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-2 mb-3">{task.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Kampanya: {task.campaign?.title}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Reklam: {task.advert?.title}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Atayan: {task.assignedBy?.firstName} {task.assignedBy?.lastName}
                      </span>
                      {task.spentAmount && task.spentAmount > 0 && (
                        <span className="flex items-center text-green-600 font-medium">
                          💰 Harcanan: ₺{task.spentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-blue-600">
                      %{Math.min(100, Math.max(0, task.completionPercentage || 0))}
                    </div>
                    <div className="text-xs text-slate-600">Tamamlandı</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, task.completionPercentage || 0))}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.min(100, Math.max(0, task.completionPercentage || 0))}
                    onChange={(e) => {
                      const value = Math.min(100, Math.max(0, parseInt(e.target.value)));
                      updateProgress(task._id, value);
                    }}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={task.status === 'submitted' || task.status === 'completed'}
                  />
                </div>

                {/* Dosya Yükleme */}
                {task.status !== 'completed' && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      📎 Dosya Yükle
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <button
                        onClick={() => handleFileUpload(task._id)}
                        disabled={!uploadFile || uploadingTaskId === task._id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium"
                      >
                        {uploadingTaskId === task._id ? 'Yükleniyor...' : 'Yükle'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Yüklenen Dosyalar */}
                {task.uploadedFiles && task.uploadedFiles.length > 0 && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      ✅ Yüklenen Dosyalar ({task.uploadedFiles.length}):
                    </p>
                    <ul className="space-y-1">
                      {task.uploadedFiles.map((file: string, idx: number) => (
                        <li key={idx} className="text-sm text-green-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {file.split('/').pop()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Harcanan Tutar Girişi */}
                {task.status !== 'submitted' && task.status !== 'completed' && task.status !== 'approved' && (
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      💰 Harcanan Tutar (₺)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={spentAmounts[task._id] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Sadece pozitif sayıları kabul et
                        if (value === '' || (parseFloat(value) >= 0.01 && !isNaN(parseFloat(value)))) {
                          setSpentAmounts({ ...spentAmounts, [task._id]: value });
                        }
                      }}
                      placeholder="0.00"
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      Bu tutar kampanyanın "Harcanan" kısmına otomatik olarak eklenecektir. <span className="text-red-600 font-semibold">*Zorunlu</span>
                    </p>
                  </div>
                )}

                {/* Teslim Edildiğinde Harcanan Tutar Gösterimi */}
                {(task.status === 'submitted' || task.status === 'completed' || task.status === 'approved') && task.spentAmount && task.spentAmount > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-slate-900">
                      💰 Harcanan Tutar: <span className="font-bold text-blue-700">₺{task.spentAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </p>
                  </div>
                )}

                {/* Teslim Et Butonu */}
                {task.status !== 'submitted' && task.status !== 'completed' && task.status !== 'approved' && (
                  <button
                    onClick={() => handleSubmitClick(task._id, task.title)}
                    disabled={!spentAmounts[task._id] || !spentAmounts[task._id].trim() || parseFloat(spentAmounts[task._id]) <= 0}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-600 disabled:hover:to-green-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Görevi Teslim Et</span>
                  </button>
                )}

                {/* Teslim Edildi Mesajı */}
                {task.status === 'submitted' && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <p className="text-blue-700 font-medium">
                      ✓ Görev teslim edildi, onay bekleniyor...
                    </p>
                    {task.submissionNote && (
                      <p className="text-sm text-blue-600 mt-1">Not: {task.submissionNote}</p>
                    )}
                  </div>
                )}

                {/* Onaylandı Mesajı */}
                {(task.status === 'completed' || task.status === 'approved') && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <p className="text-green-700 font-medium">
                      ✓ Görev onaylandı ve tamamlandı!
                    </p>
                    {task.feedback && (
                      <p className="text-sm text-green-600 mt-1">Geri bildirim: {task.feedback}</p>
                    )}
                  </div>
                )}

                {/* Reddedildi Mesajı */}
                {task.status === 'rejected' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 font-medium mb-2">
                      ✗ Görev reddedildi, lütfen tekrar çalışın
                    </p>
                    {task.feedback && (
                      <div className="bg-white p-3 rounded border border-red-200">
                        <p className="text-sm font-semibold text-red-700 mb-1">Reddetme Nedeni:</p>
                        <p className="text-sm text-red-600">{task.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Silme Butonu */}
                <div className="flex justify-end pt-4 border-t border-slate-200 mt-4">
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
          </div>
        )}

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

        {/* Submit Confirmation Modal */}
        <ConfirmationModal
          isOpen={submitModal.show}
          onClose={handleSubmitCancel}
          onConfirm={handleSubmitConfirm}
          type="create"
          title="Görevi Teslim Et"
          message={`"${submitModal.taskTitle}" görevini teslim etmek istediğinizden emin misiniz?`}
          confirmText="Teslim Et"
          cancelText="İptal"
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}

