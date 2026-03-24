'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [filter, setFilter] = useState({
    userId: '',
    module: '',
    activityType: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const [logsRes, usersRes] = await Promise.all([
        fetch('http://localhost:3000/activity-logs?limit=100', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (logsRes.ok) setLogs(await logsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredLogs = async () => {
    setFiltering(true);
    const token = localStorage.getItem('access_token');
    let url = 'http://localhost:3000/activity-logs';
    const params = new URLSearchParams();
    
    // Eğer userId varsa, önce kullanıcıya göre filtrele
    if (filter.userId) {
      url = `http://localhost:3000/activity-logs/user/${filter.userId}`;
      // Module filtresini de ekle
      if (filter.module) {
        params.append('module', filter.module);
      }
      // ActivityType filtresini de ekle
      if (filter.activityType) {
        params.append('activityType', filter.activityType);
      }
    } else {
      // userId yoksa genel filtreleme
      if (filter.module) {
        params.append('module', filter.module);
      }
      if (filter.activityType) {
        params.append('activityType', filter.activityType);
      }
    }

    try {
      const queryString = params.toString();
      const finalUrl = queryString ? `${url}?${queryString}` : url;
      
      const response = await fetch(finalUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        console.error('Filter error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Filter fetch error:', error);
    } finally {
      setFiltering(false);
    }
  };

  const clearFilters = () => {
    setFilter({
      userId: '',
      module: '',
      activityType: ''
    });
    fetchData();
  };

  const getActivityIcon = (type: string) => {
    const icons = {
      login: '🔐',
      logout: '🚪',
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      assign: '👤',
      upload: '📤',
      submit: '✅',
      approve: '✓',
      reject: '✗',
      ticket_create: '🎫',
      ticket_reply: '💬'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getActivityColor = (type: string) => {
    const colors = {
      login: 'bg-green-50 text-slate-900 border-green-200',
      logout: 'bg-gray-50 text-slate-900 border-gray-200',
      create: 'bg-blue-50 text-slate-900 border-blue-200',
      update: 'bg-yellow-50 text-slate-900 border-yellow-200',
      delete: 'bg-red-50 text-slate-900 border-red-200',
      assign: 'bg-purple-50 text-slate-900 border-purple-200',
      upload: 'bg-indigo-50 text-slate-900 border-indigo-200',
      submit: 'bg-green-50 text-slate-900 border-green-200'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 text-slate-900 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-900">Loglar yükleniyor...</p>
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
            Aktivite Logları
          </h1>
          <p className="text-slate-900">
            Tüm sistem aktivitelerini görüntüleyin ve filtreleyin
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Filtrele</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Kullanıcı</label>
              <select
                value={filter.userId}
                onChange={(e) => setFilter({...filter, userId: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="" className="text-slate-900">Tümü</option>
                {users.map(u => (
                  <option key={u._id} value={u._id} className="text-slate-900">
                    {u.firstName} {u.lastName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Modül</label>
              <select
                value={filter.module}
                onChange={(e) => setFilter({...filter, module: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="" className="text-slate-900">Tümü</option>
                <option value="users" className="text-slate-900">Kullanıcılar</option>
                <option value="tasks" className="text-slate-900">Görevler</option>
                <option value="adverts" className="text-slate-900">Reklamlar</option>
                <option value="campaigns" className="text-slate-900">Kampanyalar</option>
                <option value="tickets" className="text-slate-900">Tickets</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Aktivite Tipi</label>
              <select
                value={filter.activityType}
                onChange={(e) => setFilter({...filter, activityType: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="" className="text-slate-900">Tümü</option>
                <option value="login" className="text-slate-900">Giriş</option>
                <option value="logout" className="text-slate-900">Çıkış</option>
                <option value="create" className="text-slate-900">Oluştur</option>
                <option value="update" className="text-slate-900">Güncelle</option>
                <option value="delete" className="text-slate-900">Sil</option>
                <option value="assign" className="text-slate-900">Ata</option>
                <option value="upload" className="text-slate-900">Yükle</option>
                <option value="submit" className="text-slate-900">Gönder</option>
                <option value="approve" className="text-slate-900">Onayla</option>
                <option value="reject" className="text-slate-900">Reddet</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchFilteredLogs}
                disabled={filtering}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {filtering ? 'Filtreleniyor...' : 'Filtrele'}
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.map((log, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className={`px-3 py-2 rounded-lg border ${getActivityColor(log.activityType)}`}>
                  <span className="text-2xl">{getActivityIcon(log.activityType)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{log.description}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-slate-900">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {log.user?.firstName} {log.user?.lastName}
                        </span>
                        {log.module && (
                          <>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-900">
                              {log.module}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getActivityColor(log.activityType)}`}>
                      {log.activityType}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="bg-white rounded-xl p-12 shadow-sm border text-center">
              <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Log kaydı bulunamadı</h3>
              <p className="text-slate-900">Seçilen filtreye uygun log bulunamadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

