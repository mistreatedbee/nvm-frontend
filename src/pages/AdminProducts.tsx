import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { productsAPI } from '../lib/api';
import toast from 'react-hot-toast';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState('PENDING');
  const [q, setQ] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, status]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getAdminProducts({ page, limit: 12, status, q: q || undefined });
      setProducts(res.data.data || []);
      setPages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (productId: string) => {
    try {
      const res = await productsAPI.getAdminProductById(productId, { page: 1, limit: 50 });
      setDetail(res.data.data);
      setSelected(res.data.data?.product || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load product detail');
    }
  };

  const runAction = async (type: 'approve' | 'reject' | 'unpublish' | 'republish') => {
    if (!selected?._id) return;
    try {
      if (type === 'approve') await productsAPI.adminApprove(selected._id);
      if (type === 'reject') {
        if (!rejectReason.trim()) return toast.error('Rejection reason is required');
        await productsAPI.adminReject(selected._id, { reason: rejectReason.trim() });
      }
      if (type === 'unpublish') await productsAPI.adminUnpublish(selected._id, {});
      if (type === 'republish') await productsAPI.adminRepublish(selected._id);
      toast.success('Action completed');
      setRejectReason('');
      await fetchProducts();
      await openDetail(selected._id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Admin Product Moderation</h1>
        <p className="text-gray-600 mb-6">Review, approve, reject, unpublish and republish products.</p>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2">
            {['PENDING', 'PUBLISHED', 'REJECTED', 'DRAFT', 'all'].map((s) => (
              <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
            ))}
          </select>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title/vendor"
            className="border rounded-lg px-3 py-2 min-w-[260px]"
          />
          <button onClick={() => { setPage(1); fetchProducts(); }} className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg">Search</button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center">Loading...</div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-600">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="font-semibold truncate">{product.name}</p>
                <p className="text-sm text-gray-500">{product.vendor?.storeName || 'Unknown vendor'}</p>
                <p className="text-sm mt-2">Status: <span className="font-medium">{product.status}</span></p>
                <p className="text-sm">Visible: <span className="font-medium">{product.isActive ? 'Yes' : 'No'}</span></p>
                <button onClick={() => openDetail(product._id)} className="mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">View</button>
              </div>
            ))}
          </div>
        )}

        {!loading && pages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {pages}</div>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}

        {selected && detail && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={() => { setSelected(null); setDetail(null); }}>
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{selected.name}</h2>
                <button onClick={() => { setSelected(null); setDetail(null); }} className="px-3 py-1 bg-gray-100 rounded">Close</button>
              </div>

              <p className="text-sm text-gray-600 mb-1">Vendor: {selected.vendor?.storeName}</p>
              <p className="text-sm text-gray-600 mb-1">Status: {selected.status}</p>
              <p className="text-sm text-gray-600 mb-4">Visibility: {selected.isActive ? 'Public' : 'Hidden'}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => runAction('approve')} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
                <button onClick={() => runAction('unpublish')} className="px-3 py-2 bg-yellow-600 text-white rounded">Unpublish</button>
                <button onClick={() => runAction('republish')} className="px-3 py-2 bg-blue-700 text-white rounded">Republish</button>
              </div>

              <div className="mb-6 border border-gray-200 rounded-lg p-3">
                <p className="text-sm font-medium mb-2">Reject with reason</p>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="w-full border rounded-lg px-3 py-2" />
                <button onClick={() => runAction('reject')} className="mt-2 px-3 py-2 bg-red-600 text-white rounded">Reject</button>
              </div>

              <h3 className="font-semibold mb-3">History Timeline</h3>
              <div className="space-y-2">
                {(detail.history || []).map((item: any) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-3">
                    <div className="text-sm font-medium">{item.action} • {item.actorRole}</div>
                    <div className="text-xs text-gray-600">{new Date(item.createdAt).toLocaleString()}</div>
                    {item.note && <div className="text-sm text-gray-700 mt-1">{item.note}</div>}
                  </div>
                ))}
                {(!detail.history || detail.history.length === 0) && (
                  <div className="text-sm text-gray-600">No history yet.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
