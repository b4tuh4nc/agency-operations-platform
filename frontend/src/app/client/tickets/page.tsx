'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientSidebar from '@/components/ClientSidebar';

export default function ClientTickets() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    department: 'Creative',
    priority: 'medium',
    initialMessage: ''
  });
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      fetchMyTickets();
    }
  }, []);

  const fetchMyTickets = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost:3000/tickets/my-tickets?userId=${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch('http://localhost:3000/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          createdBy: user._id
        })
      });

      if (response.ok) {
        alert('Destek talebi oluşturuldu!');
        setShowCreateForm(false);
        setFormData({
          subject: '',
          department: 'Creative',
          priority: 'medium',
          initialMessage: ''
        });
        fetchMyTickets();
      } else {
        alert('Talep oluşturulamadı!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Bir hata oluştu!');
    }
  };

  const handleReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`http://localhost:3000/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: user._id,
          message: replyMessage
        })
      });

      if (response.ok) {
        setReplyMessage('');
        fetchMyTickets();
        // Refresh selected ticket
        const updatedTicket = await response.json();
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Mesajlar</h1>
            <p className="text-slate-600">Account Manager ile iletişime geçin</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold"
          >
            Yeni Mesaj
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Yeni Destek Talebi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Konu</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Öncelik</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mesajınız</label>
                <textarea
                  required
                  rows={4}
                  value={formData.initialMessage}
                  onChange={(e) => setFormData({...formData, initialMessage: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Gönder
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="col-span-1 space-y-3">
            {tickets.map(ticket => (
              <div
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all ${
                  selectedTicket?._id === ticket._id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{ticket.subject}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    ticket.status === 'resolved' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            ))}

            {tickets.length === 0 && (
              <div className="bg-white rounded-lg p-8 shadow-sm border text-center">
                <p className="text-slate-500">Henüz mesaj yok</p>
              </div>
            )}
          </div>

          {/* Ticket Details */}
          <div className="col-span-2">
            {selectedTicket ? (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-2xl font-semibold text-slate-800">{selectedTicket.subject}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                
                <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                  {selectedTicket.messages?.map((msg: any, idx: number) => (
                    <div key={idx} className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-md px-4 py-3 rounded-lg ${
                        msg.sender._id === user._id 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        <p className="text-sm font-semibold mb-1">
                          {msg.sender.firstName} {msg.sender.lastName}
                        </p>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${msg.sender._id === user._id ? 'text-blue-100' : 'text-slate-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-slate-200">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleReply(selectedTicket._id)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-slate-500">Bir mesaj seçin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

