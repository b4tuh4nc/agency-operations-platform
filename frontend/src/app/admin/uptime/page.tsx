'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import { ROLES } from '@/utils/rolePermissions';

interface UptimeStats {
  period: string;
  totalSeconds: number;
  uptimeSeconds: number;
  downtimeSeconds: number;
  uptimePercentage: number;
  downtimeCount: number;
  downtimes: Array<{
    _id: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    reason?: string;
    component?: string;
    resolved: boolean;
  }>;
  sla: {
    limit: number;
    used: number;
    remaining: number;
    status: 'ok' | 'violated';
    percentage: number;
  };
  currentStatus: 'up' | 'down';
  lastHealthCheck: string | null;
}

export default function UptimePage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<UptimeStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      if (parsedUser.role === ROLES.ADMIN || parsedUser.role === ROLES.COMPUTER_MANAGER) {
        fetchStats(selectedPeriod);
      }
    }
  }, [selectedPeriod]);

  const fetchStats = async (period: '24h' | '7d' | '30d') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/uptime/stats?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Uptime stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} saniye`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} saat ${minutes} dakika`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.COMPUTER_MANAGER)) {
    return (
      <ProtectedPage checkAccess={(role) => role === ROLES.ADMIN || role === ROLES.COMPUTER_MANAGER}>
        <div className="min-h-screen bg-gray-50 flex">
          <AdminSidebar />
          <div className="flex-1 p-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
              <p className="text-red-600">Bu sayfaya erişim yetkiniz yok.</p>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage checkAccess={(role) => role === ROLES.ADMIN || role === ROLES.COMPUTER_MANAGER}>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />

        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Sistem Uptime & SLA İzleme</h1>
            <p className="text-slate-600">Sistem durumu ve kesinti takibi</p>
          </div>

          {/* Period Selector */}
          <div className="mb-6 flex space-x-3">
            <button
              onClick={() => setSelectedPeriod('24h')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === '24h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Son 24 Saat
            </button>
            <button
              onClick={() => setSelectedPeriod('7d')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === '7d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Son 7 Gün
            </button>
            <button
              onClick={() => setSelectedPeriod('30d')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === '30d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              Son 30 Gün
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Yükleniyor...</p>
            </div>
          ) : stats ? (
            <>
              {/* Uptime Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Uptime Yüzdesi</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">
                        {stats.uptimePercentage.toFixed(2)}%
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      stats.uptimePercentage >= 99.9 ? 'bg-green-100' : 
                      stats.uptimePercentage >= 99 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <svg className={`w-8 h-8 ${
                        stats.uptimePercentage >= 99.9 ? 'text-green-600' : 
                        stats.uptimePercentage >= 99 ? 'text-yellow-600' : 'text-red-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Toplam Kesinti</p>
                      <p className="text-3xl font-bold text-slate-800 mt-1">
                        {formatDuration(stats.downtimeSeconds)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{stats.downtimeCount} kesinti</p>
                    </div>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={`bg-white rounded-xl p-6 shadow-sm border-2 ${
                  stats.sla.status === 'violated' ? 'border-red-300' : 'border-green-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">SLA Durumu</p>
                      <p className={`text-3xl font-bold mt-1 ${
                        stats.sla.status === 'violated' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {stats.sla.status === 'violated' ? 'İhlal' : 'OK'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDuration(stats.sla.used)} / {formatDuration(stats.sla.limit)}
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      stats.sla.status === 'violated' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <svg className={`w-8 h-8 ${
                        stats.sla.status === 'violated' ? 'text-red-600' : 'text-green-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {stats.sla.status === 'violated' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Sistem Durumu</h2>
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    stats.currentStatus === 'up' ? 'bg-green-500' : 'bg-red-500'
                  } animate-pulse`}></div>
                  <span className="text-lg font-medium text-slate-800">
                    Sistem {stats.currentStatus === 'up' ? 'Çalışıyor' : 'Kesintide'}
                  </span>
                  {stats.lastHealthCheck && (
                    <span className="text-sm text-slate-500">
                      Son kontrol: {formatDate(stats.lastHealthCheck)}
                    </span>
                  )}
                </div>
              </div>

              {/* Downtime History */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Kesinti Geçmişi</h2>
                {stats.downtimes.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Kesinti kaydı bulunmuyor.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">Başlangıç</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">Bitiş</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">Süre</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">Neden</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-800">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.downtimes.map((downtime) => (
                          <tr key={downtime._id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-sm text-slate-800">
                              {formatDate(downtime.startTime)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {downtime.endTime ? formatDate(downtime.endTime) : 'Devam ediyor...'}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {downtime.duration ? formatDuration(downtime.duration) : '-'}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {downtime.reason || 'Bilinmiyor'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                downtime.resolved
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-red-100 text-red-700 border border-red-300'
                              }`}>
                                {downtime.resolved ? 'Çözüldü' : 'Devam Ediyor'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <p className="text-slate-500 text-center">Veri yüklenemedi.</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedPage>
  );
}

