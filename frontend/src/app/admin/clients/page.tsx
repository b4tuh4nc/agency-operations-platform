'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToClients } from '@/utils/rolePermissions';

interface Client {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  staffContact?: any;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, clientId: string | null, clientName: string}>({
    show: false,
    clientId: null,
    clientName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/clients', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const clientData = {
      name: formData.get('name'),
      contactPerson: formData.get('contactPerson'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      country: formData.get('country'),
      postalCode: formData.get('postalCode'),
      notes: formData.get('notes'),
    };

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedClient 
        ? `http://localhost:3000/clients/${selectedClient._id}`
        : 'http://localhost:3000/clients';
      
      const response = await fetch(url, {
        method: selectedClient ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(clientData),
      });

      if (response.ok) {
        setToast({
          message: selectedClient ? 'Müşteri güncellendi' : 'Müşteri oluşturuldu',
          type: 'success'
        });
        setShowModal(false);
        setSelectedClient(null);
        fetchClients();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDeleteClick = (clientId: string, clientName: string) => {
    setDeleteModal({
      show: true,
      clientId,
      clientName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.clientId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/clients/${deleteModal.clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({message: 'Müşteri başarıyla silindi', type: 'success'});
        setDeleteModal({ show: false, clientId: null, clientName: '' });
        fetchClients();
      } else {
        const error = await response.json().catch(() => ({ message: 'Müşteri silinemedi' }));
        setToast({ message: error.message || 'Müşteri silinemedi', type: 'error' });
        setDeleteModal({ show: false, clientId: null, clientName: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Müşteri silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, clientId: null, clientName: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, clientId: null, clientName: '' });
  };

  return (
    <ProtectedPage checkAccess={hasAccessToClients}>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Müşteri Yönetimi</h1>
            <p className="text-slate-600">Müşterileri görüntüle ve yönet</p>
          </div>
          <button
            onClick={() => {
              setSelectedClient(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            + Yeni Müşteri
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div key={client._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{client.name}</h3>
                    <p className="text-sm text-slate-600">{client.contactPerson}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-600 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {client.email}
                  </p>
                  {client.phone && (
                    <p className="text-sm text-slate-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {client.phone}
                    </p>
                  )}
                  {client.city && (
                    <p className="text-sm text-slate-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {client.city}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowModal(true);
                    }}
                    className="flex-1 text-blue-600 hover:bg-blue-50 py-2 rounded-lg transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteClick(client._id, client.name)}
                    className="flex-1 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedClient ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Şirket Adı *</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={selectedClient?.name}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">İletişim Kişisi *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      defaultValue={selectedClient?.contactPerson}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-posta *</label>
                    <input
                      type="email"
                      name="email"
                      defaultValue={selectedClient?.email}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={selectedClient?.phone}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adres</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={selectedClient?.address}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Şehir</label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={selectedClient?.city}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ülke</label>
                    <input
                      type="text"
                      name="country"
                      defaultValue={selectedClient?.country}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Posta Kodu</label>
                    <input
                      type="text"
                      name="postalCode"
                      defaultValue={selectedClient?.postalCode}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedClient?.notes}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedClient ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedClient(null);
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
          title="Müşteriyi Sil"
          message={`"${deleteModal.clientName}" müşterisini silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}
