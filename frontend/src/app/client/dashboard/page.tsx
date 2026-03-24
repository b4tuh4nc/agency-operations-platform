'use client';

import { useState, useEffect } from 'react';
import ClientSidebar from '@/components/ClientSidebar';

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null);
  const [adverts, setAdverts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdvert, setSelectedAdvert] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchClientAdverts();
    }
  }, []);

  const fetchClientAdverts = async () => {
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTicket = (advertId: string, accountManagerId: string) => {
    window.location.href = `/client/tickets?advertId=${advertId}&managerId=${accountManagerId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <ClientSidebar />
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
      <ClientSidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">
          Reklamlarım
        </h1>

        {adverts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Henüz reklam bulunmuyor</h3>
            <p className="text-slate-500">Size atanan reklamlar burada görünecektir.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {adverts.map((advert) => (
              <div key={advert._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-1">
                      {advert.title}
                    </h3>
                    <p className="text-slate-600">
                      {advert.description || 'Açıklama yok'}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      Kampanya: {advert.campaign?.title || 'Belirtilmemiş'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      %{advert.completionPercentage || 0}
                    </div>
                    <div className="text-sm text-slate-600">Tamamlandı</div>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      advert.status === 'live' ? 'bg-green-100 text-green-700' :
                      advert.status === 'in_production' ? 'bg-yellow-100 text-yellow-700' :
                      advert.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {advert.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${advert.completionPercentage || 0}%` }}
                  />
                </div>

                {/* Görevler Özeti */}
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Görevler
                  </h4>
                  <div className="text-sm text-slate-600">
                    <p>Toplam Görev: <span className="font-semibold">0</span></p>
                    <p>Tamamlanan: <span className="font-semibold text-green-600">0</span></p>
                    <p>Devam Eden: <span className="font-semibold text-yellow-600">0</span></p>
                  </div>
                </div>

                {/* Account Manager İletişim */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Account Manager</p>
                      <p className="font-semibold text-slate-800">
                        {advert.accountManager?.firstName} {advert.accountManager?.lastName || 'Atanmamış'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openTicket(advert._id, advert.accountManager?._id)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span>Mesaj Gönder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

