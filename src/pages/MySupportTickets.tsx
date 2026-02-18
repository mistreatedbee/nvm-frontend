import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { supportAPI } from '../lib/api';

export function MySupportTickets() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [thread, setThread] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await supportAPI.getMyTickets({ page: 1, limit: 50 });
      const rows = response.data?.data || [];
      setTickets(rows);
      if (rows.length && !selected) {
        loadTicket(rows[0].ticketNumber);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadTicket = async (ticketNumber: string) => {
    try {
      const response = await supportAPI.getMyTicketByNumber(ticketNumber);
      setSelected(response.data?.data?.ticket);
      setThread(response.data?.data?.messages || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load ticket');
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const sendMessage = async () => {
    if (!selected?.ticketNumber || !message.trim()) return;
    setSending(true);
    try {
      await supportAPI.sendMyTicketMessage(selected.ticketNumber, { message });
      setMessage('');
      await loadTicket(selected.ticketNumber);
      toast.success('Message sent');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900">My Support Tickets</h1>
          <Link to="/support" className="px-4 py-2 rounded-lg bg-nvm-green-primary text-white font-semibold">New Ticket</Link>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">Loading tickets...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 max-h-[640px] overflow-auto">
              {tickets.map((ticket) => (
                <button
                  key={ticket._id}
                  onClick={() => loadTicket(ticket.ticketNumber)}
                  className={`w-full text-left border rounded-lg p-3 ${selected?.ticketNumber === ticket.ticketNumber ? 'border-nvm-green-primary bg-green-50' : 'border-gray-200'}`}
                >
                  <p className="font-semibold text-sm">{ticket.ticketNumber}</p>
                  <p className="text-sm text-gray-700 line-clamp-1">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">{ticket.status}</p>
                </button>
              ))}
              {!tickets.length && <p className="text-gray-500 text-sm p-2">No tickets yet.</p>}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[640px] flex flex-col">
              {selected ? (
                <>
                  <div className="mb-3 border-b border-gray-200 pb-3">
                    <h2 className="text-lg font-semibold">{selected.subject}</h2>
                    <p className="text-sm text-gray-500">{selected.ticketNumber} • {selected.status} • {selected.priority}</p>
                  </div>
                  <div className="flex-1 overflow-auto space-y-3">
                    {thread.map((item) => (
                      <div key={item._id} className={`p-3 rounded-lg ${item.senderRole === 'ADMIN' ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-100'}`}>
                        <p className="text-xs text-gray-500 mb-1">{item.senderRole}</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.message}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]" placeholder="Add follow-up message..." />
                    <button disabled={sending || !message.trim()} onClick={sendMessage} className="px-4 py-2 h-fit rounded-lg bg-nvm-green-primary text-white font-semibold disabled:opacity-70">
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Select a ticket to view details.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
