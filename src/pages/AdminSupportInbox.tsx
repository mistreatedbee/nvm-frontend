import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { supportAPI } from '../lib/api';

const statusOptions = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'];

export function AdminSupportInbox() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [thread, setThread] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', q: '' });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await supportAPI.adminListTickets({
        page: 1,
        limit: 80,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        q: filters.q || undefined
      });
      const rows = response.data?.data || [];
      setTickets(rows);
      if (rows.length && !selected) {
        loadTicket(rows[0].ticketNumber);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadTicket = async (ticketNumber: string) => {
    try {
      const response = await supportAPI.adminGetTicket(ticketNumber);
      setSelected(response.data?.data?.ticket);
      setThread(response.data?.data?.messages || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load ticket detail');
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters.status, filters.priority]);

  const updateStatus = async (status: string) => {
    if (!selected?.ticketNumber) return;
    try {
      await supportAPI.adminUpdateStatus(selected.ticketNumber, status as any);
      await loadTicket(selected.ticketNumber);
      await loadTickets();
      toast.success('Status updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update status');
    }
  };

  const updatePriority = async (priority: string) => {
    if (!selected?.ticketNumber) return;
    try {
      await supportAPI.adminUpdatePriority(selected.ticketNumber, priority as any);
      await loadTicket(selected.ticketNumber);
      await loadTickets();
      toast.success('Priority updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update priority');
    }
  };

  const sendReply = async () => {
    if (!selected?.ticketNumber || !reply.trim()) return;
    setSending(true);
    try {
      await supportAPI.adminReply(selected.ticketNumber, { message: reply.trim() });
      setReply('');
      await loadTicket(selected.ticketNumber);
      await loadTickets();
      toast.success('Reply sent');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-5">Admin Support Inbox</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Search tickets..." value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
          <select className="border border-gray-300 rounded-lg px-3 py-2" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Statuses</option>
            {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
            <option value="">All Priorities</option>
            {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button onClick={loadTickets} className="px-4 py-2 rounded-lg bg-nvm-green-primary text-white font-semibold">Apply</button>
        </div>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 max-h-[680px] overflow-auto">
              {tickets.map((ticket) => (
                <button
                  key={ticket._id}
                  onClick={() => loadTicket(ticket.ticketNumber)}
                  className={`w-full text-left border rounded-lg p-3 ${selected?.ticketNumber === ticket.ticketNumber ? 'border-nvm-green-primary bg-green-50' : 'border-gray-200'}`}
                >
                  <p className="font-semibold text-sm">{ticket.ticketNumber}</p>
                  <p className="text-sm text-gray-700 line-clamp-1">{ticket.subject}</p>
                  <p className="text-xs text-gray-500">{ticket.status} • {ticket.priority}</p>
                </button>
              ))}
              {!tickets.length && <p className="text-sm text-gray-500 p-2">No tickets found.</p>}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[680px] flex flex-col">
              {selected ? (
                <>
                  <div className="border-b border-gray-200 pb-3 mb-3">
                    <h2 className="font-semibold text-lg">{selected.subject}</h2>
                    <p className="text-sm text-gray-500">{selected.ticketNumber} • {selected.name} • {selected.email}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                      <select className="border border-gray-300 rounded-lg px-3 py-2" value={selected.status} onChange={(e) => updateStatus(e.target.value)}>
                        {statusOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                      <select className="border border-gray-300 rounded-lg px-3 py-2" value={selected.priority} onChange={(e) => updatePriority(e.target.value)}>
                        {priorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
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
                    <textarea className="flex-1 border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." />
                    <button onClick={sendReply} disabled={sending || !reply.trim()} className="px-4 py-2 h-fit rounded-lg bg-nvm-green-primary text-white font-semibold disabled:opacity-70">
                      {sending ? 'Sending...' : 'Reply'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Select a ticket to inspect.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
