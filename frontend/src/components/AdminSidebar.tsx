'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  hasAccessToUsers, 
  hasAccessToClients, 
  hasAccessToCampaigns, 
  hasAccessToAdverts, 
  hasAccessToConceptNotes,
  hasAccessToInvoices,
  hasAccessToPerformanceMonitoring,
  hasAccessToStaffGrades,
  hasAccessToAnnualBonuses
} from '@/utils/rolePermissions';
import { getDashboardPath } from '@/utils/getDashboardPath';

export default function AdminSidebar() {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      // Backend'e logout isteği gönder
      if (userData && token) {
        const user = JSON.parse(userData);
        await fetch('http://localhost:3000/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: user.id || user._id })
        }).catch(err => console.error('Logout error:', err));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  };

  const isActive = (path: string) => pathname === path;
  
  const userDashboardPath = user ? getDashboardPath(user.role) : '/admin/dashboard';

  if (!user) return null;

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 flex-1 flex flex-col">
        <Link href={userDashboardPath} className="flex items-center space-x-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">AD</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">AdManager Pro</h1>
            <p className="text-sm text-slate-500">Admin Panel</p>
          </div>
        </Link>

        {/* User Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-slate-600">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 flex-1">
          <Link 
            href={userDashboardPath}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(userDashboardPath)
                ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
            <span className={isActive(userDashboardPath) ? 'font-medium' : ''}>Dashboard</span>
          </Link>

          {hasAccessToUsers(user?.role) && (
            <Link 
              href="/admin/users"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/users')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span className={isActive('/admin/users') ? 'font-medium' : ''}>Kullanıcılar</span>
            </Link>
          )}

          {hasAccessToClients(user?.role) && (
            <Link 
              href="/admin/clients"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/clients')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className={isActive('/admin/clients') ? 'font-medium' : ''}>Müşteriler</span>
            </Link>
          )}

          {hasAccessToCampaigns(user?.role) && (
            <Link 
              href="/admin/campaigns"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/campaigns')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={isActive('/admin/campaigns') ? 'font-medium' : ''}>Kampanyalar</span>
            </Link>
          )}

          {hasAccessToAdverts(user?.role) && (
            <Link 
              href="/admin/adverts"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/adverts')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className={isActive('/admin/adverts') ? 'font-medium' : ''}>Reklamlar</span>
            </Link>
          )}

          {hasAccessToConceptNotes(user?.role) && (
            <Link 
              href="/admin/concept-notes"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/concept-notes')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className={isActive('/admin/concept-notes') ? 'font-medium' : ''}>Konsept Notları</span>
            </Link>
          )}

          {hasAccessToInvoices(user?.role) && (
            <Link 
              href="/admin/invoices"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/invoices')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={isActive('/admin/invoices') ? 'font-medium' : ''}>Faturalar</span>
            </Link>
          )}

          {hasAccessToPerformanceMonitoring(user?.role) && (
            <Link 
              href="/admin/performance"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/performance')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={isActive('/admin/performance') ? 'font-medium' : ''}>Performans İzleme</span>
            </Link>
          )}

          {hasAccessToStaffGrades(user?.role) && (
            <Link 
              href="/admin/staff-grades-salaries"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/staff-grades-salaries')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className={isActive('/admin/staff-grades-salaries') ? 'font-medium' : ''}>Dereceler & Ücretler</span>
            </Link>
          )}

          {hasAccessToAnnualBonuses(user?.role) && (
            <Link 
              href="/admin/annual-bonuses"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/annual-bonuses')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={isActive('/admin/annual-bonuses') ? 'font-medium' : ''}>Yıllık Bonus</span>
            </Link>
          )}

          {/* Uptime & SLA - Admin ve Computer Manager için */}
          {(user?.role === 'admin' || user?.role === 'computer_manager') && (
            <Link 
              href="/admin/uptime"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/uptime')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className={isActive('/admin/uptime') ? 'font-medium' : ''}>Uptime & SLA</span>
            </Link>
          )}

          {/* Görevlerim - Tüm kullanıcılar için */}
          {user?.role !== 'client' && (
            <Link 
              href={user?.role === 'graphic_designer' || user?.role === 'photographer' || user?.role === 'copy_writer' || user?.role === 'editor' || user?.role === 'audio_technician' || user?.role === 'resource_librarian' 
                ? '/creative-staff/tasks' 
                : '/admin/my-tasks'}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/creative-staff/tasks') || isActive('/admin/my-tasks')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className={isActive('/creative-staff/tasks') || isActive('/admin/my-tasks') ? 'font-medium' : ''}>Görevlerim</span>
            </Link>
          )}

          {/* Görev Yönetimi - Sadece yöneticiler için */}
          {(user?.role === 'admin' || user?.role === 'director' || user?.role === 'account_manager') && (
            <Link 
              href="/admin/tasks"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/tasks')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className={isActive('/admin/tasks') ? 'font-medium' : ''}>Görev Yönetimi</span>
            </Link>
          )}

          {user?.role === 'computer_manager' && (
            <Link 
              href="/admin/activity-logs"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/activity-logs')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={isActive('/admin/activity-logs') ? 'font-medium' : ''}>Aktivite Logları</span>
            </Link>
          )}

          {user?.role === 'network_support' && (
            <Link 
              href="/admin/file-management"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/admin/file-management')
                  ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className={isActive('/admin/file-management') ? 'font-medium' : ''}>Dosya Yönetimi</span>
            </Link>
          )}

          <Link 
            href="/admin/tickets"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/tickets')
                ? 'text-slate-700 bg-blue-50 border-r-2 border-blue-500'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className={isActive('/admin/tickets') ? 'font-medium' : ''}>Mesajlar</span>
          </Link>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-6 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </div>
  );
}

