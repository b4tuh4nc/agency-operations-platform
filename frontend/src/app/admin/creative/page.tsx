'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function CreativeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalCampaigns: 0,
    totalAdverts: 0,
    totalNotes: 0
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
      
      const [clientsRes, campaignsRes, advertsRes, notesRes] = await Promise.all([
        fetch('http://localhost:3000/clients', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('http://localhost:3000/campaigns', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('http://localhost:3000/adverts', { headers: { 'Authorization': `Bearer ${token}` }}),
        fetch('http://localhost:3000/concept-notes', { headers: { 'Authorization': `Bearer ${token}` }})
      ]);
      
      if (clientsRes.ok && campaignsRes.ok && advertsRes.ok && notesRes.ok) {
        const clients = await clientsRes.json();
        const campaigns = await campaignsRes.json();
        const adverts = await advertsRes.json();
        const notes = await notesRes.json();
        setStats({
          totalClients: clients.length,
          totalCampaigns: campaigns.length,
          totalAdverts: adverts.length,
          totalNotes: notes.length
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
        // Sadece high ve urgent öncelikli görevleri filtrele
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Yaratıcı Ekip Paneli</h1>
          <p className="text-slate-600">Kampanya ve reklam yönetimi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Müşteriler</p>
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
                <p className="text-sm font-medium text-slate-600">Kampanyalar</p>
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
                <p className="text-sm font-medium text-slate-600">Reklamlar</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalAdverts}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Konsept Notları</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalNotes}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/admin/campaigns"
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Kampanya Yönetimi</h3>
                <p className="text-sm text-slate-600">Kampanyaları görüntüle ve yönet</p>
              </div>
            </Link>

            <Link 
              href="/admin/clients"
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Müşteri İlişkileri</h3>
                <p className="text-sm text-slate-600">Müşterilerle iletişim</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
