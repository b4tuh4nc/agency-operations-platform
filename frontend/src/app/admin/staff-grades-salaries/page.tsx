'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToStaffGrades, canEditStaffGrades, hasAccessToSalaries, canEditSalaries } from '@/utils/rolePermissions';

interface StaffGrade {
  _id: string;
  gradeName: string;
  gradeLevel: number;
  description?: string;
  department?: string;
  isActive: boolean;
}

interface Salary {
  _id: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
  gradeId?: {
    _id: string;
    gradeName: string;
    gradeLevel: number;
  };
  baseSalary: number;
  bonus?: number;
  allowances?: number;
  currency: string;
  effectiveDate: string;
  notes?: string;
}

export default function StaffGradesSalariesPage() {
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<StaffGrade[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  
  // Grade modals
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<StaffGrade | null>(null);
  const [gradeFormData, setGradeFormData] = useState({
    gradeName: '',
    gradeLevel: 5,
    description: '',
    department: '',
    isActive: true,
  });

  // Salary modals
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [salaryFormData, setSalaryFormData] = useState({
    userId: '',
    gradeId: '',
    baseSalary: 0,
    bonus: 0,
    allowances: 0,
    currency: 'TRY',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [users, setUsers] = useState<any[]>([]);
  const [deleteGradeModal, setDeleteGradeModal] = useState<{show: boolean, gradeId: string | null, gradeName: string}>({
    show: false,
    gradeId: null,
    gradeName: ''
  });
  const [deleteSalaryModal, setDeleteSalaryModal] = useState<{show: boolean, salaryId: string | null, userName: string}>({
    show: false,
    salaryId: null,
    userName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchData(parsedUser);
    }
  }, []);

  const fetchData = async (currentUser: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const userId = currentUser._id || currentUser.id;
      const userRole = currentUser.role;

      // Grades - herkes görebilir
      const gradesRes = await fetch('http://localhost:3000/staff-grades', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Salaries - hierarchical erişim (backend req.user'dan alacak)
      const salariesRes = await fetch('http://localhost:3000/salaries', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Users - salary oluşturma için (hierarchical erişim)
      const usersRes = await fetch(`http://localhost:3000/users?userId=${userId}&userRole=${userRole}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        setGrades(gradesData);
      }

      if (salariesRes.ok) {
        const salariesData = await salariesRes.json();
        setSalaries(salariesData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.filter((u: any) => u.role !== 'client' && u.isActive !== false));
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setToast({ message: 'Veriler yüklenirken hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditStaffGrades(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedGrade 
        ? `http://localhost:3000/staff-grades/${selectedGrade._id}`
        : 'http://localhost:3000/staff-grades';
      
      const response = await fetch(url, {
        method: selectedGrade ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeFormData),
      });

      if (response.ok) {
        setToast({ 
          message: selectedGrade ? 'Derece güncellendi' : 'Derece oluşturuldu', 
          type: 'success' 
        });
        setShowGradeModal(false);
        setSelectedGrade(null);
        setGradeFormData({
          gradeName: '',
          gradeLevel: 5,
          description: '',
          department: '',
          isActive: true,
        });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'İşlem başarısız' }));
        setToast({ message: error.message || 'İşlem başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setToast({ message: 'Bir hata oluştu', type: 'error' });
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSalaries(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedSalary 
        ? `http://localhost:3000/salaries/${selectedSalary._id}`
        : 'http://localhost:3000/salaries';
      
      const response = await fetch(url, {
        method: selectedSalary ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaryFormData),
      });

      if (response.ok) {
        setToast({ 
          message: selectedSalary ? 'Ücret güncellendi' : 'Ücret oluşturuldu', 
          type: 'success' 
        });
        setShowSalaryModal(false);
        setSelectedSalary(null);
        setSalaryFormData({
          userId: '',
          gradeId: '',
          baseSalary: 0,
          bonus: 0,
          allowances: 0,
          currency: 'TRY',
          effectiveDate: new Date().toISOString().split('T')[0],
          notes: '',
        });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'İşlem başarısız' }));
        setToast({ message: error.message || 'İşlem başarısız', type: 'error' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setToast({ message: 'Bir hata oluştu', type: 'error' });
    }
  };

  const handleDeleteGrade = async () => {
    if (!deleteGradeModal.gradeId) return;
    if (!canEditStaffGrades(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/staff-grades/${deleteGradeModal.gradeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({ message: 'Derece silindi', type: 'success' });
        setDeleteGradeModal({ show: false, gradeId: null, gradeName: '' });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'Derece silinemedi' }));
        setToast({ message: error.message || 'Derece silinemedi', type: 'error' });
        setDeleteGradeModal({ show: false, gradeId: null, gradeName: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Derece silinirken bir hata oluştu', type: 'error' });
      setDeleteGradeModal({ show: false, gradeId: null, gradeName: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSalary = async () => {
    if (!deleteSalaryModal.salaryId) return;
    if (!canEditSalaries(user?.role || '')) {
      setToast({ message: 'Bu işlem için yetkiniz yok', type: 'error' });
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/salaries/${deleteSalaryModal.salaryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({ message: 'Ücret kaydı silindi', type: 'success' });
        setDeleteSalaryModal({ show: false, salaryId: null, userName: '' });
        if (user) fetchData(user);
      } else {
        const error = await response.json().catch(() => ({ message: 'Ücret silinemedi' }));
        setToast({ message: error.message || 'Ücret silinemedi', type: 'error' });
        setDeleteSalaryModal({ show: false, salaryId: null, userName: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Ücret silinirken bir hata oluştu', type: 'error' });
      setDeleteSalaryModal({ show: false, salaryId: null, userName: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalSalary = (salary: Salary) => {
    return (salary.baseSalary || 0) + (salary.bonus || 0) + (salary.allowances || 0);
  };

  return (
    <ProtectedPage checkAccess={hasAccessToStaffGrades}>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Personel Dereceleri ve Ücretleri</h1>
          <p className="text-slate-600">Personel derecelerini ve ücret bilgilerini yönetin</p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Staff Grades Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Personel Dereceleri</h2>
                {canEditStaffGrades(user?.role || '') && (
                  <button
                    onClick={() => {
                      setSelectedGrade(null);
                      setGradeFormData({
                        gradeName: '',
                        gradeLevel: 5,
                        description: '',
                        department: '',
                        isActive: true,
                      });
                      setShowGradeModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Yeni Derece
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-800">Derece Adı</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-800">Seviye</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-800">Departman</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-800">Açıklama</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-800">Durum</th>
                      {canEditStaffGrades(user?.role || '') && (
                        <th className="text-right py-3 px-4 font-semibold text-slate-800">İşlemler</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((grade) => (
                      <tr key={grade._id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-800">{grade.gradeName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                            Seviye {grade.gradeLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{grade.department || '-'}</td>
                        <td className="py-3 px-4 text-slate-600">{grade.description || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            grade.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {grade.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        {canEditStaffGrades(user?.role || '') && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedGrade(grade);
                                  setGradeFormData({
                                    gradeName: grade.gradeName,
                                    gradeLevel: grade.gradeLevel,
                                    description: grade.description || '',
                                    department: grade.department || '',
                                    isActive: grade.isActive,
                                  });
                                  setShowGradeModal(true);
                                }}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setDeleteGradeModal({ show: true, gradeId: grade._id, gradeName: grade.gradeName })}
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {grades.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    Henüz derece tanımlanmamış
                  </div>
                )}
              </div>
            </div>

            {/* Salaries Section */}
            {hasAccessToSalaries(user?.role || '') && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">Ücret Bilgileri</h2>
                  {canEditSalaries(user?.role || '') && (
                    <button
                      onClick={() => {
                        setSelectedSalary(null);
                        setSalaryFormData({
                          userId: '',
                          gradeId: '',
                          baseSalary: 0,
                          bonus: 0,
                          allowances: 0,
                          currency: 'TRY',
                          effectiveDate: new Date().toISOString().split('T')[0],
                          notes: '',
                        });
                        setShowSalaryModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      + Yeni Ücret Kaydı
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Personel</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Derece</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Maaş</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Bonus</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Ödenek</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Toplam</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-800">Para Birimi</th>
                        {canEditSalaries(user?.role || '') && (
                          <th className="text-right py-3 px-4 font-semibold text-slate-800">İşlemler</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {salaries.map((salary) => (
                        <tr key={salary._id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-slate-800">
                                {salary.userId?.firstName} {salary.userId?.lastName}
                              </p>
                              <p className="text-sm text-slate-500">{salary.userId?.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {salary.gradeId ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                                {salary.gradeId.gradeName}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            ₺{salary.baseSalary.toLocaleString('tr-TR')}
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            ₺{(salary.bonus || 0).toLocaleString('tr-TR')}
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            ₺{(salary.allowances || 0).toLocaleString('tr-TR')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-green-700">
                              ₺{totalSalary(salary).toLocaleString('tr-TR')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{salary.currency || 'TRY'}</td>
                          {canEditSalaries(user?.role || '') && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSalary(salary);
                                    setSalaryFormData({
                                      userId: salary.userId._id,
                                      gradeId: salary.gradeId?._id || '',
                                      baseSalary: salary.baseSalary,
                                      bonus: salary.bonus || 0,
                                      allowances: salary.allowances || 0,
                                      currency: salary.currency || 'TRY',
                                      effectiveDate: salary.effectiveDate ? new Date(salary.effectiveDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                      notes: salary.notes || '',
                                    });
                                    setShowSalaryModal(true);
                                  }}
                                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteSalaryModal({ 
                                    show: true, 
                                    salaryId: salary._id, 
                                    userName: `${salary.userId?.firstName} ${salary.userId?.lastName}`.trim() || salary.userId?.email 
                                  })}
                                  className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salaries.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      Henüz ücret kaydı bulunmuyor
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Grade Modal */}
        {showGradeModal && canEditStaffGrades(user?.role || '') && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedGrade ? 'Derece Düzenle' : 'Yeni Derece'}
              </h2>
              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Derece Adı *</label>
                  <input
                    type="text"
                    required
                    value={gradeFormData.gradeName}
                    onChange={(e) => setGradeFormData({...gradeFormData, gradeName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seviye (1-10) *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={gradeFormData.gradeLevel}
                    onChange={(e) => setGradeFormData({...gradeFormData, gradeLevel: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Departman</label>
                  <select
                    value={gradeFormData.department}
                    onChange={(e) => setGradeFormData({...gradeFormData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">Seçiniz...</option>
                    <option value="creative">Creative</option>
                    <option value="accounts">Accounts</option>
                    <option value="administration">Administration</option>
                    <option value="computing">Computing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Açıklama</label>
                  <textarea
                    value={gradeFormData.description}
                    onChange={(e) => setGradeFormData({...gradeFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gradeFormData.isActive}
                    onChange={(e) => setGradeFormData({...gradeFormData, isActive: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded"
                  />
                  <label className="ml-2 text-sm text-slate-700">Aktif</label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedGrade ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGradeModal(false);
                      setSelectedGrade(null);
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

        {/* Salary Modal */}
        {showSalaryModal && canEditSalaries(user?.role || '') && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedSalary ? 'Ücret Düzenle' : 'Yeni Ücret Kaydı'}
              </h2>
              <form onSubmit={handleSalarySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Personel *</label>
                  <select
                    required
                    value={salaryFormData.userId}
                    onChange={(e) => setSalaryFormData({...salaryFormData, userId: e.target.value})}
                    disabled={!!selectedSalary}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800 disabled:bg-slate-100"
                  >
                    <option value="">Seçiniz...</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.firstName} {u.lastName} ({u.email}) - {u.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Derece</label>
                  <select
                    value={salaryFormData.gradeId}
                    onChange={(e) => setSalaryFormData({...salaryFormData, gradeId: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">Seçiniz...</option>
                    {grades.map(g => (
                      <option key={g._id} value={g._id}>
                        {g.gradeName} (Seviye {g.gradeLevel})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Maaş (₺) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={salaryFormData.baseSalary}
                      onChange={(e) => setSalaryFormData({...salaryFormData, baseSalary: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bonus (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salaryFormData.bonus}
                      onChange={(e) => setSalaryFormData({...salaryFormData, bonus: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ödenek (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={salaryFormData.allowances}
                      onChange={(e) => setSalaryFormData({...salaryFormData, allowances: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Para Birimi</label>
                    <select
                      value={salaryFormData.currency}
                      onChange={(e) => setSalaryFormData({...salaryFormData, currency: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="TRY">TRY (₺)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Geçerlilik Tarihi</label>
                    <input
                      type="date"
                      value={salaryFormData.effectiveDate}
                      onChange={(e) => setSalaryFormData({...salaryFormData, effectiveDate: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notlar</label>
                  <textarea
                    value={salaryFormData.notes}
                    onChange={(e) => setSalaryFormData({...salaryFormData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {selectedSalary ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSalaryModal(false);
                      setSelectedSalary(null);
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

        {/* Delete Grade Modal */}
        <ConfirmationModal
          isOpen={deleteGradeModal.show}
          onClose={() => setDeleteGradeModal({ show: false, gradeId: null, gradeName: '' })}
          onConfirm={handleDeleteGrade}
          type="delete"
          title="Dereceyi Sil"
          message={`"${deleteGradeModal.gradeName}" derecesini silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />

        {/* Delete Salary Modal */}
        <ConfirmationModal
          isOpen={deleteSalaryModal.show}
          onClose={() => setDeleteSalaryModal({ show: false, salaryId: null, userName: '' })}
          onConfirm={handleDeleteSalary}
          type="delete"
          title="Ücret Kaydını Sil"
          message={`"${deleteSalaryModal.userName}" kullanıcısının ücret kaydını silmek istediğinizden emin misiniz?`}
          isLoading={isDeleting}
        />
      </div>
    </div>
    </ProtectedPage>
  );
}

