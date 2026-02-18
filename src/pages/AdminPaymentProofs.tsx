import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { adminPaymentProofsAPI } from '../lib/api';

export function AdminPaymentProofs() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('UNDER_REVIEW');
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminPaymentProofsAPI.list({
        status: status || undefined,
        q: q || undefined,
        limit: 100
      });
      setProofs(res.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load payment proofs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const approve = async (proofId: string) => {
    try {
      await adminPaymentProofsAPI.approve(proofId);
      toast.success('Payment proof approved');
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve payment proof');
    }
  };

  const reject = async (proofId: string) => {
    const note = window.prompt('Rejection reason');
    if (!note) return;
    try {
      await adminPaymentProofsAPI.reject(proofId, note);
      toast.success('Payment proof rejected');
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reject payment proof');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-nvm-dark-900">Payments / Proof of Payment</h1>
          <div className="flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search order number..."
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">All</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button onClick={load} className="px-3 py-2 bg-nvm-green-primary text-white rounded-lg">Search</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading payment proofs...</div>
          ) : !proofs.length ? (
            <div className="p-8 text-center text-gray-600">No payment proofs found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Uploaded</th>
                  <th className="text-left px-4 py-3">File</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((proof) => (
                  <tr key={proof._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{proof.orderId?.orderNumber || '-'}</td>
                    <td className="px-4 py-3">{proof.customerId?.name || '-'}</td>
                    <td className="px-4 py-3">{proof.status}</td>
                    <td className="px-4 py-3">{new Date(proof.uploadedAt || proof.createdAt).toLocaleString('en-ZA')}</td>
                    <td className="px-4 py-3">
                      <a href={proof.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        Open proof
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {proof.status === 'UNDER_REVIEW' ? (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => approve(proof._id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg">Approve</button>
                          <button onClick={() => reject(proof._id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg">Reject</button>
                        </div>
                      ) : (
                        <span className="text-gray-500">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
