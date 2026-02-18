import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { supportAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

const categories = ['TECHNICAL', 'ACCOUNT', 'ORDERS', 'PAYMENTS', 'VENDOR', 'OTHER'];

export function SupportContact() {
  const { user, isAuthenticated } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    category: 'OTHER',
    message: ''
  });
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = async () => {
    if (!files.length) return [];
    const uploaded = [];
    for (const file of files) {
      const data = new FormData();
      data.append('file', file);
      const response = await supportAPI.uploadAttachment(data);
      uploaded.push(response.data?.data);
    }
    return uploaded;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setTicketNumber('');
    try {
      const attachments = await handleUpload();
      const response = await supportAPI.createTicket({
        ...form,
        attachments
      });
      setTicketNumber(response.data?.data?.ticketNumber || '');
      toast.success('Support ticket submitted');
      setForm((prev) => ({ ...prev, subject: '', message: '', phone: '' }));
      setFiles([]);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900">Contact Support</h1>
          {isAuthenticated && <Link to="/support/my" className="text-sm text-nvm-green-primary font-semibold">My Tickets</Link>}
        </div>

        {ticketNumber && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
            Ticket created successfully: <span className="font-semibold">{ticketNumber}</span>
          </div>
        )}

        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <input className="border border-gray-300 rounded-lg px-3 py-2 w-full" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2 w-full" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          <select className="border border-gray-300 rounded-lg px-3 py-2 w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {categories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
          <textarea className="border border-gray-300 rounded-lg px-3 py-2 w-full min-h-[160px]" placeholder="Tell us how we can help..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
          <button disabled={submitting} className="px-4 py-2 rounded-lg bg-nvm-green-primary text-white font-semibold disabled:opacity-70">
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
}
