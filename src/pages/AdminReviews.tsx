import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { reviewsAPI } from '../lib/api';

type TabStatus = 'PENDING' | 'REPORTED' | 'HIDDEN' | 'APPROVED';

export function AdminReviews() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<TabStatus>('PENDING');
  const [targetType, setTargetType] = useState<'all' | 'PRODUCT' | 'VENDOR'>('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    void fetchReviews();
  }, [page, status, targetType]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.adminList({
        page,
        limit: 15,
        status,
        targetType: targetType === 'all' ? undefined : targetType,
        q: q || undefined
      });
      setItems(response.data.data || []);
      setPages(response.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (reviewId: string, action: 'approve' | 'reject' | 'hide' | 'delete') => {
    try {
      if (action === 'approve') await reviewsAPI.adminApprove(reviewId);
      if (action === 'reject') {
        const reason = window.prompt('Rejection reason:', 'Policy violation');
        if (!reason) return;
        await reviewsAPI.adminReject(reviewId, { reason });
      }
      if (action === 'hide') {
        const reason = window.prompt('Hide reason:', 'Flagged by moderation');
        if (!reason) return;
        await reviewsAPI.adminHide(reviewId, { reason });
      }
      if (action === 'delete') {
        const ok = window.confirm('Delete this review permanently?');
        if (!ok) return;
        const reason = window.prompt('Delete reason:');
        if (!reason) return;
        await reviewsAPI.adminDelete(reviewId, { reason });
      }
      toast.success('Action completed');
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Admin Review Moderation</h1>
        <p className="text-gray-600 mb-6">Approve, hide, reject, and remove product/vendor reviews.</p>

        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          {(['PENDING', 'REPORTED', 'HIDDEN', 'APPROVED'] as TabStatus[]).map((value) => (
            <button
              key={value}
              onClick={() => { setStatus(value); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-sm ${status === value ? 'bg-nvm-green-primary text-white' : 'bg-gray-100'}`}
            >
              {value}
            </button>
          ))}
          <select value={targetType} onChange={(e) => { setTargetType(e.target.value as any); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="all">All Targets</option>
            <option value="PRODUCT">Product Reviews</option>
            <option value="VENDOR">Vendor Reviews</option>
          </select>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title/body" className="border rounded-lg px-3 py-2 min-w-[240px]" />
          <button onClick={() => { setPage(1); void fetchReviews(); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Search</button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center">Loading...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-600">No reviews found.</div>
        ) : (
          <div className="space-y-3">
            {items.map((review) => (
              <article key={review._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{review.title || '(No title)'}</p>
                    <p className="text-sm text-gray-600 mt-1">{review.body || review.comment}</p>
                    <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-3">
                      <span>Status: {review.status}</span>
                      <span>Target: {review.targetType}</span>
                      <span>Rating: {review.rating}</span>
                      <span>Helpful: {review.helpfulCount || 0}</span>
                      <span>Reports: {review.reportedCount || 0}</span>
                      <span>Reviewer: {review.reviewerId?.name || 'Unknown'}</span>
                      <span>Order: {review.orderId?.orderNumber || '-'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => void runAction(review._id, 'approve')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Approve</button>
                    <button onClick={() => void runAction(review._id, 'hide')} className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm">Hide</button>
                    <button onClick={() => void runAction(review._id, 'reject')} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                    <button onClick={() => void runAction(review._id, 'delete')} className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && pages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {pages}</div>
            <div className="flex gap-2">
              <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setPage((prev) => Math.min(pages, prev + 1))} disabled={page >= pages} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
