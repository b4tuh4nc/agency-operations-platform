'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function ComputingDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({totalUsers: 0, activeUsers: 0});
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
      const response = await fetch('http://localhost:3000/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const users = await response.json();
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive).length,
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Bilgi İşlem Paneli</h1>
          <p className="text-slate-600">Sistem yönetimi ve kullanıcı hesapları</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-slate-800">{stats.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/admin/users"
              className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Kullanıcı Hesapları</h3>
                <p className="text-sm text-slate-600">Sistem hesaplarını yönet</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
