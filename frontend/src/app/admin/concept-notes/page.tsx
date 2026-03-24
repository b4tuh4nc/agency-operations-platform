'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import ProtectedPage from '@/components/ProtectedPage';
import Toast, { ToastType } from '@/components/Toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { hasAccessToConceptNotes } from '@/utils/rolePermissions';

interface ConceptNote {
  _id: string;
  title: string;
  content: string;
  author: any;
  campaign?: any;
  tags: string[];
  createdAt: string;
}

interface Campaign {
  _id: string;
  title: string;
}

export default function ConceptNotesPage() {
  const [notes, setNotes] = useState<ConceptNote[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<ConceptNote | null>(null);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [deleteModal, setDeleteModal] = useState<{show: boolean, noteId: string | null, noteTitle: string}>({
    show: false,
    noteId: null,
    noteTitle: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchNotes();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/concept-notes', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:3000/campaigns', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Fetch campaigns error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()) : [];

    const noteData = {
      title: formData.get('title'),
      content: formData.get('content'),
      author: currentUser?.id,
      campaign: formData.get('campaign') || undefined,
      tags: tags,
    };

    try {
      const token = localStorage.getItem('access_token');
      const url = selectedNote 
        ? `http://localhost:3000/concept-notes/${selectedNote._id}`
        : 'http://localhost:3000/concept-notes';
      
      const response = await fetch(url, {
        method: selectedNote ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      });

      if (response.ok) {
        setToast({
          message: selectedNote ? 'Not güncellendi' : 'Not oluşturuldu',
          type: 'success'
        });
        setShowModal(false);
        setSelectedNote(null);
        fetchNotes();
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDeleteClick = (noteId: string, noteTitle: string) => {
    setDeleteModal({
      show: true,
      noteId,
      noteTitle
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.noteId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:3000/concept-notes/${deleteModal.noteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setToast({message: 'Not başarıyla silindi', type: 'success'});
        setDeleteModal({ show: false, noteId: null, noteTitle: '' });
        fetchNotes();
      } else {
        const error = await response.json().catch(() => ({ message: 'Not silinemedi' }));
        setToast({ message: error.message || 'Not silinemedi', type: 'error' });
        setDeleteModal({ show: false, noteId: null, noteTitle: '' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Not silinirken bir hata oluştu', type: 'error' });
      setDeleteModal({ show: false, noteId: null, noteTitle: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, noteId: null, noteTitle: '' });
  };

  return (
    <ProtectedPage checkAccess={hasAccessToConceptNotes}>
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Konsept Notları</h1>
            <p className="text-slate-600">Yaratıcı fikirlerinizi paylaşın</p>
          </div>
          <button
            onClick={() => {
              setSelectedNote(null);
              setShowModal(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg"
          >
            + Yeni Not
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-slate-800">{note.title}</h3>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => {
                        setSelectedNote(note);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(note._id, note.title)}
                      className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-3">{note.content}</p>

                {note.campaign && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-500">Kampanya</p>
                    <p className="text-sm font-medium text-blue-700">{note.campaign.title}</p>
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 text-xs text-slate-500">
                  <p>Yazar: {note.author?.firstName} {note.author?.lastName}</p>
                  <p>{new Date(note.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                {selectedNote ? 'Not Düzenle' : 'Yeni Konsept Notu'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Başlık *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={selectedNote?.title}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">İçerik *</label>
                  <textarea
                    name="content"
                    defaultValue={selectedNote?.content}
                    rows={6}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">İlgili Kampanya</label>
                  <select
                    name="campaign"
                    defaultValue={selectedNote?.campaign?._id}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="">Kampanya seçin (opsiyonel)</option>
                    {campaigns.map(campaign => (
                      <option key={campaign._id} value={campaign._id}>{campaign.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Etiketler (virgülle ayırın)</label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={selectedNote?.tags?.join(', ')}
                    placeholder="örn: yaratıcı, dijital, sosyal medya"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {selectedNote ? 'Güncelle' : 'Oluştur'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedNote(null);
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
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.show}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Notu Sil"
        message={`"${deleteModal.noteTitle}" notunu silmek istediğinizden emin misiniz?`}
        isLoading={isDeleting}
      />
    </div>
    </ProtectedPage>
  );
}
