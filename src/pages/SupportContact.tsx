import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { helpAPI, supportAPI } from '../lib/api';
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await helpAPI.getFaqs({
        category: form.category === 'VENDOR' ? 'VENDORS' : form.category,
        q: form.subject || form.message || undefined,
        page: 1,
        limit: 4
      });
      setSuggestions(response.data?.data || []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
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

        <div className="mb-4 bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="font-semibold text-nvm-dark-900">Quick Help Before You Submit</p>
            <button onClick={loadSuggestions} className="text-sm text-nvm-green-primary font-semibold">Find Answers</button>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            You can also use <Link to="/help" className="text-nvm-green-primary font-semibold">Help Center</Link> or <Link to="/chat?type=support" className="text-nvm-green-primary font-semibold">Support Chat</Link>.
          </div>
          {loadingSuggestions ? (
            <p className="text-sm text-gray-500">Loading suggested FAQs...</p>
          ) : suggestions.length ? (
            <div className="space-y-2">
              {suggestions.map((item) => (
                <div key={item._id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-sm text-nvm-dark-900">{item.question}</p>
                  <p className="text-xs text-gray-500 mt-1">Category: {item.category}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No suggestions yet. Click "Find Answers" to search FAQs by your issue.</p>
          )}
        </div>

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
