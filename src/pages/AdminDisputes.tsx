import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { disputesAPI } from '../lib/api';
import { connectChatSocket } from '../lib/chatSocket';
import { useAuthStore } from '../lib/store';

export function AdminDisputes() {
  const { token } = useAuthStore();
  const lastToastRef = useRef(0);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await disputesAPI.getAdmin({ status: status || undefined });
      setDisputes(res.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  useEffect(() => {
    if (!token) return;
    const socket = connectChatSocket(token);
    if (!socket) return;

    const onAdminFeed = (payload: { event?: string; disputeId?: string; orderNumber?: string }) => {
      const now = Date.now();
      if (now - lastToastRef.current > 2000) {
        lastToastRef.current = now;
        const message = payload?.event === 'created'
          ? `New dispute opened${payload.orderNumber ? ` for order ${payload.orderNumber}` : ''}`
          : payload?.event === 'message'
            ? `New dispute message${payload.orderNumber ? ` for order ${payload.orderNumber}` : ''}`
            : 'Dispute status updated';
        toast(message);
      }
      load();
    };

    socket.on('dispute:admin-feed', onAdminFeed);
    return () => {
      socket.off('dispute:admin-feed', onAdminFeed);
    };
  }, [token, status]);

  const update = async (id: string, nextStatus: 'IN_REVIEW' | 'RESOLVED' | 'CLOSED') => {
    let resolution = '';
    if (nextStatus === 'RESOLVED' || nextStatus === 'CLOSED') {
      resolution = window.prompt('Resolution note') || '';
    }
    try {
      await disputesAPI.adminUpdate(id, { status: nextStatus, resolution });
      toast.success('Dispute updated');
      load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update dispute');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold text-nvm-dark-900">Admin Disputes</h1>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading disputes...</div>
          ) : !disputes.length ? (
            <div className="p-8 text-center text-gray-600">No disputes found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Vendor</th>
                  <th className="text-left px-4 py-3">Reason</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute._id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{dispute.order?.orderNumber || '-'}</td>
                    <td className="px-4 py-3">{dispute.customer?.name || '-'}</td>
                    <td className="px-4 py-3">{dispute.vendor?.storeName || '-'}</td>
                    <td className="px-4 py-3">{dispute.reason}</td>
                    <td className="px-4 py-3">{dispute.status}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/admin/disputes/${dispute._id}`} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 rounded">View Thread</Link>
                        <button onClick={() => update(dispute._id, 'IN_REVIEW')} className="px-3 py-1.5 bg-blue-600 text-white rounded">In Review</button>
                        <button onClick={() => update(dispute._id, 'RESOLVED')} className="px-3 py-1.5 bg-green-600 text-white rounded">Resolve</button>
                        <button onClick={() => update(dispute._id, 'CLOSED')} className="px-3 py-1.5 bg-gray-700 text-white rounded">Close</button>
                      </div>
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
