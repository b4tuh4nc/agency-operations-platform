'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function AccountsDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalClients: 0, 
    totalCampaigns: 0,
    totalUsers: 0,
    totalInvoices: 0
  });
  const [urgentTasks, setUrgentTasks] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStats();
      fetchUrgentTasks(parsedUser);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const [clientsRes, campaignsRes, usersRes, invoicesRes] = await Promise.all([
        fetch('http://localhost:3000/clients', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('http://localhost:3000/campaigns', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('http://localhost:3000/users', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('http://localhost:3000/invoices', { headers: { 'Authorization': `Bearer ${token}` }})
      ]);
      
      if (clientsRes.ok && campaignsRes.ok && usersRes.ok && invoicesRes.ok) {
        const clients = await clientsRes.json();
        const campaigns = await campaignsRes.json();
        const users = await usersRes.json();
        const invoices = await invoicesRes.json();
        
        // Accounts departmanındaki kullanıcıları say
        const accountsRoles = ['accountant', 'credit_controller', 'accounts_clerk', 'purchasing_assistant'];
        const accountsUsers = users.filter((u: any) => accountsRoles.includes(u.role));
        
        setStats({
          totalClients: clients.length,
          totalCampaigns: campaigns.length,
          totalUsers: accountsUsers.length,
          totalInvoices: invoices.length
        });
      }
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const fetchUrgentTasks = async (currentUser: any) => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = currentUser._id || currentUser.id;
      if (!userId) return;

      const response = await fetch(`http://localhost:3000/tasks/my-tasks?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const tasks = await response.json();
        const urgent = tasks.filter((task: any) => 
          (task.priority === 'high' || task.priority === 'urgent') && 
          task.status !== 'completed' && 
          task.status !== 'approved'
        );
        setUrgentTasks(urgent);
      }
    } catch (error) {
      console.error('Urgent tasks fetch error:', error);
    }
  };

  if (!user) return <div>Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Muhasebe Paneli</h1>
          <p className="text-slate-600">Finansal işlemler ve faturalama</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Muhasebe Personeli</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Müşteri</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalClients}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktif Kampanya</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Fatura</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalInvoices}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Acil Görevler */}
        {urgentTasks.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Acil ve Yüksek Öncelikli Görevler
              </h2>
              <Link 
                href={user?.role === 'graphic_designer' || user?.role === 'photographer' || user?.role === 'copy_writer' || user?.role === 'editor' || user?.role === 'audio_technician' || user?.role === 'resource_librarian' 
                  ? '/creative-staff/tasks' 
                  : '/admin/my-tasks'}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Tümünü Gör →
              </Link>
            </div>
            <div className="space-y-3">
              {urgentTasks.slice(0, 5).map((task: any) => (
                <Link
                  key={task._id}
                  href={user?.role === 'graphic_designer' || user?.role === 'photographer' || user?.role === 'copy_writer' || user?.role === 'editor' || user?.role === 'audio_technician' || user?.role === 'resource_librarian' 
                    ? '/creative-staff/tasks' 
                    : '/admin/my-tasks'}
                  className="block p-4 border border-red-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-slate-800">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'urgent' 
                            ? 'bg-red-100 text-red-700 border border-red-300' 
                            : 'bg-orange-100 text-orange-700 border border-orange-300'
                        }`}>
                          {task.priority === 'urgent' ? 'Acil' : 'Yüksek'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'in_progress' 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {task.status === 'in_progress' ? 'Devam Ediyor' : task.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-1">{task.description}</p>
                      {task.campaign && (
                        <p className="text-xs text-slate-500 mt-1">Kampanya: {task.campaign?.title}</p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-red-600">%{task.completionPercentage || 0}</div>
                      <div className="text-xs text-slate-500">Tamamlandı</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/admin/invoices"
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Fatura Yönetimi</h3>
                <p className="text-sm text-slate-600">Faturaları görüntüle ve yönet</p>
              </div>
            </Link>

            <Link 
              href="/admin/invoices"
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Muhasebe Aktarımı</h3>
                <p className="text-sm text-slate-600">Faturaları muhasebe sistemine aktar</p>
              </div>
            </Link>

            <Link 
              href="/admin/performance"
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Performans İzleme</h3>
                <p className="text-sm text-slate-600">Departman performansını izle</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
