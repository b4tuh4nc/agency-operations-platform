'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToInvoices } from '@/utils/rolePermissions';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  campaign: any;
  client: any;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  description?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  exportedToAccounting: boolean;
  exportedAt?: string;
  paidDate?: string;
  sentDate?: string;
  createdAt: string;
}

interface Campaign {
  _id: string;
  title: string;
  status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [exportingInvoiceId, setExportingInvoiceId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, invoiceId: string | null, invoiceNumber: string}>({
    show: false,
    invoiceId: null,
    invoiceNumber: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInvoices();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setToast({ message: 'Oturum açmanız gerekiyor', type: 'error' });
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/invoices', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const contentType = response.headers.get('content-type');
      const responseText = await response.text();
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('Response text (first 500 chars):', responseText.substring(0, 500));

      if (response.ok) {
        if (!responseText || responseText.trim() === '') {
          console.log('Boş response, boş array döndürülüyor');
          setInvoices([]);
          return;
        }

        try {
          const data = JSON.parse(responseText);
          console.log('Faturalar yüklendi:', data);
          setInvoices(Array.isArray(data) ? data : []);
        } catch (parseError) {
          console.error('JSON parse hatası:', parseError);
          console.error('Response text:', responseText);
          setToast({ message: 'Fatura verileri parse edilemedi', type: 'error' });
          setInvoices([]);
        }
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorData.error || errorMessage;
            console.error('Fatura yükleme hatası (response):', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
          }
        } catch (parseError) {
          console.error('Fatura yükleme hatası (text):', {
            status: response.status,
            statusText: response.statusText,
            text: responseText
          });
        }
        setToast({ message: errorMessage, type: 'error' });
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      const errorMessage = error?.message || 'Faturalar yüklenirken bir hata oluştu';
      setToast({ message: errorMessage, type: 'error' });
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
        // Sadece tamamlanmış kampanyaları göster
        const completed = data.filter((c: any) => c.status === 'completed');
        setCampaigns(completed);
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    }
  };

  const handleCreateFromCampaign = async () => {
    if (!selectedCampaign) {
      setToast({ message: 'Lütfen bir kampanya seçin', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/invoices/from-campaign/${selectedCampaign}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fatura oluşturuldu:', data);
        setToast({ message: 'Fatura başarıyla oluşturuldu', type: 'success' });
        setShowModal(false);
        setSelectedCampaign('');
        // Biraz bekle ve sonra fetch et
        setTimeout(() => {
          fetchInvoices();
        }, 500);
      } else {
        const error = await response.json().catch(() => ({ message: 'Fatura oluşturulamadı' }));
        console.error('Fatura oluşturma hatası:', error);
        setToast({ message: error.message || 'Fatura oluşturulamadı', type: 'error' });
      }
    } catch (error) {
      console.error('Create error:', error);
      setToast({ message: 'Bir hata oluştu', type: 'error' });
    }
  };

  const handleExport = async (invoiceId: string, format: string = 'json') => {
    setExportingInvoiceId(invoiceId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/invoices/${invoiceId}/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        let data: any;
        let content: string;
        let mimeType: string;
        let fileExtension: string;

        if (format === 'json') {
          data = await response.json();
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          fileExtension = 'json';
        } else {
          // XML ve CSV için text olarak al
          content = await response.text();
          // Eğer JSON içinde string olarak geliyorsa parse et
          try {
            const parsed = JSON.parse(content);
            if (typeof parsed === 'string') {
              content = parsed;
            }
          } catch (e) {
            // Zaten string, devam et
          }
          
          if (format === 'xml') {
            mimeType = 'application/xml';
            fileExtension = 'xml';
          } else {
            mimeType = 'text/csv';
            fileExtension = 'csv';
          }
        }

        // Dosya olarak indir
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.${fileExtension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Aktarıldı olarak işaretle
        try {
          await fetch(`http://localhost:3000/invoices/${invoiceId}/mark-exported`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ format, externalId: `EXT-${invoiceId}` })
          });
        } catch (markError) {
          console.error('Mark exported error:', markError);
        }

        setToast({ message: `Fatura ${format.toUpperCase()} formatında indirildi ve muhasebe sistemine aktarıldı olarak işaretlendi`, type: 'success' });
        fetchInvoices();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Export işlemi başarısız' }));
        setToast({ message: errorData.message || 'Export işlemi başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Export error:', error);
      setToast({ message: 'Export işlemi sırasında hata oluştu', type: 'error' });
    } finally {
      setExportingInvoiceId(null);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, status: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const updateData: any = { status };
      if (status === 'paid') {
        updateData.paidDate = new Date().toISOString();
      } else if (status === 'sent') {
        updateData.sentDate = new Date().toISOString();
      }

      const response = await fetch(`http://localhost:3000/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        setToast({ message: 'Fatura durumu güncellendi', type: 'success' });
        fetchInvoices();
      }
    } catch (error) {
      console.error('Update error:', error);
      setToast({ message: 'Güncelleme başarısız', type: 'error' });
    }
  };

  const handleDeleteClick = (invoiceId: string, invoiceNumber: string) => {
    setDeleteModal({
      show: true,
      invoiceId,
      invoiceNumber
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.invoiceId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/invoices/${deleteModal.invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setToast({ message: result.message || 'Fatura başarıyla silindi', type: 'success' });
        setDeleteModal({ show: false, invoiceId: null, invoiceNumber: '' });
        fetchInvoices();
      } else {
        const error = await response.json().catch(() => ({ message: 'Fatura silinemedi' }));
        setToast({ message: error.message || 'Fatura silinemedi', type: 'error' });
        setDeleteModal({ show: false, invoiceId: null, invoiceNumber: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Fatura silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, invoiceId: null, invoiceNumber: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, invoiceId: null, invoiceNumber: '' });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-200 text-gray-800 border border-gray-300',
      pending: 'bg-yellow-200 text-yellow-900 border border-yellow-400',
      sent: 'bg-blue-200 text-blue-900 border border-blue-400',
      paid: 'bg-green-200 text-green-900 border border-green-400',
      overdue: 'bg-red-200 text-red-900 border border-red-400',
      cancelled: 'bg-slate-200 text-slate-800 border border-slate-400'
    };
    return colors[status] || 'bg-gray-200 text-gray-800 border border-gray-300';
  };

  const getStatusText = (status: string) => {
    const texts: any = {
      draft: 'Taslak',
      pending: 'Beklemede',
      sent: 'Gönderildi',
      paid: 'Ödendi',
      overdue: 'Vadesi Geçti',
      cancelled: 'İptal Edildi'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  return (
    <ProtectedPage checkAccess={hasAccessToInvoices}>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Fatura Yönetimi</h1>
            <p className="text-slate-600">Faturaları görüntüle, oluştur ve muhasebe sistemine aktar</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            + Kampanyadan Fatura Oluştur
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
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Fatura No</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Kampanya</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Müşteri</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Tarih</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Vade</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Tutar</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Durum</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-800">Export</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-800">Sil</th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-800">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-800">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-800">{invoice.campaign?.title || '-'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-slate-800">{invoice.client?.name || '-'}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {formatDate(invoice.invoiceDate)}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-semibold text-slate-800">₺{invoice.totalAmount.toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-slate-500">KDV: ₺{invoice.taxAmount.toLocaleString('tr-TR')}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                      </span>
                      {invoice.exportedToAccounting && (
                        <div className="mt-1">
                          <span className="text-xs text-green-600 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Aktarıldı
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleExport(invoice._id, 'json')}
                          disabled={exportingInvoiceId === invoice._id}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                          title="JSON Export"
                        >
                          JSON
                        </button>
                        <button
                          onClick={() => handleExport(invoice._id, 'xml')}
                          disabled={exportingInvoiceId === invoice._id}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                          title="XML Export"
                        >
                          XML
                        </button>
                        <button
                          onClick={() => handleExport(invoice._id, 'csv')}
                          disabled={exportingInvoiceId === invoice._id}
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                          title="CSV Export"
                        >
                          CSV
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteClick(invoice._id, invoice.invoiceNumber)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Faturayı Sil"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleUpdateStatus(invoice._id, e.target.value)}
                          className="text-xs px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white font-medium"
                        >
                          <option value="draft" className="text-slate-900">Taslak</option>
                          <option value="pending" className="text-slate-900">Beklemede</option>
                          <option value="sent" className="text-slate-900">Gönderildi</option>
                          <option value="paid" className="text-slate-900">Ödendi</option>
                          <option value="overdue" className="text-slate-900">Vadesi Geçti</option>
                          <option value="cancelled" className="text-slate-900">İptal</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {invoices.length === 0 && (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">Henüz fatura yok</h3>
                <p className="text-slate-500">Tamamlanmış kampanyalardan fatura oluşturabilirsiniz.</p>
              </div>
            )}
          </div>
        )}

        {/* Create Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Kampanyadan Fatura Oluştur</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Kampanya Seçin *</label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">Kampanya seçin...</option>
                    {campaigns.map(campaign => (
                      <option key={campaign._id} value={campaign._id}>
                        {campaign.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Sadece tamamlanmış kampanyalar listelenir</p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateFromCampaign}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Oluştur
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedCampaign('');
                    }}
                    className="flex-1 bg-slate-300 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-400 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModal.show}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          type="delete"
          title="Faturayı Sil"
          message={`"${deleteModal.invoiceNumber}" numaralı faturayı silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}

