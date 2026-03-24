'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import { hasAccessToPerformanceMonitoring, hasFullPerformanceAccess } from '@/utils/rolePermissions';

export default function PerformanceMonitoring() {
  const [user, setUser] = useState<any>(null);
  const [systemSummary, setSystemSummary] = useState<any>(null);
  const [usersPerformance, setUsersPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      const hasFull = hasFullPerformanceAccess(parsedUser.role);
      if (hasFull) {
        fetchSystemSummary();
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsersPerformance();
    }
  }, [selectedPeriod, user]);

  const fetchSystemSummary = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/performance/system/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSystemSummary(data);
      }
    } catch (error) {
      console.error('System summary error:', error);
    }
  };

  const fetchUsersPerformance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Tarih aralığını hesapla
      const endDate = new Date();
      const startDate = new Date();
      
      if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (selectedPeriod === 'quarter') {
        startDate.setMonth(endDate.getMonth() - 3);
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Eğer kullanıcının tam erişimi yoksa, sadece kendi departmanını getir
      if (user && !hasFullPerformanceAccess(user.role)) {
        const userId = user._id || user.id;
        if (userId) {
          params.append('userId', userId);
          params.append('userRole', user.role);
        }
      }

      const response = await fetch(`http://localhost:3000/performance/users/summary?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsersPerformance(data);
      }
    } catch (error) {
      console.error('Users performance error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPerformance = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const endDate = new Date();
      const startDate = new Date();
      
      if (selectedPeriod === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else if (selectedPeriod === 'quarter') {
        startDate.setMonth(endDate.getMonth() - 3);
      }

      const params = new URLSearchParams({
        userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`http://localhost:3000/performance/user?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('User performance error:', error);
    }
    return null;
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 80) return 'Mükemmel';
    if (rate >= 60) return 'İyi';
    if (rate >= 40) return 'Orta';
    return 'Düşük';
  };

  if (loading) {
    return (
      <ProtectedPage checkAccess={hasAccessToPerformanceMonitoring}>
        <div className="min-h-screen bg-gray-50 flex">
          <AdminSidebar />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Performans verileri yükleniyor...</p>
            </div>
          </div>
        </div>
      </ProtectedPage>
    );
  }

  const hasFullAccess = user && hasFullPerformanceAccess(user.role);

  return (
    <ProtectedPage checkAccess={hasAccessToPerformanceMonitoring}>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Performans İzleme</h1>
            <p className="text-slate-600">Sistem ve kullanıcı performans metriklerini görüntüleyin</p>
          </div>

          {/* Period Selector */}
          <div className="mb-6 flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">Dönem:</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter')}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="week">Son 1 Hafta</option>
              <option value="month">Son 1 Ay</option>
              <option value="quarter">Son 3 Ay</option>
            </select>
          </div>

          {/* System Summary */}
          {hasFullAccess && systemSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Toplam Kullanıcı</h3>
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-slate-800">{systemSummary.totalUsers}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Toplam Kampanya</h3>
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-slate-800">{systemSummary.totalCampaigns}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Toplam Görev</h3>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-slate-800">{systemSummary.totalTasks}</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-600">Tamamlanma Oranı</h3>
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-slate-800">
                  {Math.round(systemSummary.taskCompletionRate)}%
                </p>
              </div>
            </div>
          )}

          {/* Users Performance Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-800">Kullanıcı Performans Metrikleri</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Kullanıcı</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Toplam Görev</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Tamamlanan</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Tamamlanma Oranı</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Ort. Tamamlanma Süresi</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-800">Performans</th>
                  </tr>
                </thead>
                <tbody>
                  {usersPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-6 text-center text-slate-500">
                        Performans verisi bulunamadı
                      </td>
                    </tr>
                  ) : (
                    usersPerformance.map((perf: any) => (
                      <tr key={perf.user._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {perf.user.firstName?.[0]}{perf.user.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-800">
                                {perf.user.firstName} {perf.user.lastName}
                              </p>
                              <p className="text-sm text-slate-600">{perf.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-800">{perf.metrics.tasksTotal || 0}</td>
                        <td className="py-4 px-6 text-slate-800">{perf.metrics.tasksCompleted || 0}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                              <div
                                className={`h-2 rounded-full ${
                                  perf.metrics.completionRate >= 80
                                    ? 'bg-green-600'
                                    : perf.metrics.completionRate >= 60
                                    ? 'bg-yellow-600'
                                    : 'bg-red-600'
                                }`}
                                style={{ width: `${Math.min(perf.metrics.completionRate || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-800">
                              {Math.round(perf.metrics.completionRate || 0)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-800">
                          {perf.metrics.averageCompletionTime
                            ? `${Math.round(perf.metrics.averageCompletionTime)} saat`
                            : '-'}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(
                              perf.metrics.completionRate || 0,
                            )}`}
                          >
                            {getPerformanceBadge(perf.metrics.completionRate || 0)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}

