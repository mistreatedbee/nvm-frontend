import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorReviewsMgmtAPI } from '../lib/api';
import toast from 'react-hot-toast';

export function VendorReviewsManagement() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({ avgRating: 0, count: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [reviews, setReviews] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [replyByReview, setReplyByReview] = useState<Record<string, string>>({});
  const [savingReply, setSavingReply] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, listRes] = await Promise.all([
        vendorReviewsMgmtAPI.summary(),
        vendorReviewsMgmtAPI.list({ page, limit: 10, sort })
      ]);
      setSummary(summaryRes.data?.data || { avgRating: 0, count: 0, breakdown: {} });
      setReviews(listRes.data?.data || []);
      setPages(listRes.data?.pages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, sort]);

  const saveReply = async (reviewId: string) => {
    const message = (replyByReview[reviewId] || '').trim();
    if (!message) return toast.error('Reply message is required');
    try {
      setSavingReply(reviewId);
      await vendorReviewsMgmtAPI.reply(reviewId, message);
      toast.success('Reply saved');
      setReplyByReview((prev) => ({ ...prev, [reviewId]: '' }));
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save reply');
    } finally {
      setSavingReply('');
    }
  };

  const deleteReply = async (reviewId: string) => {
    try {
      await vendorReviewsMgmtAPI.deleteReply(reviewId);
      toast.success('Reply deleted');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete reply');
    }
  };

  const reportReview = async (reviewId: string) => {
    const reason = prompt('Reason for reporting this review');
    if (!reason?.trim()) return;
    try {
      await vendorReviewsMgmtAPI.report(reviewId, reason.trim());
      toast.success('Review reported');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report review');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Review Management</h1>
        <p className="text-gray-600 mb-6">Reply to reviews, view ratings, and report abusive content.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border rounded-xl p-5">
            <div className="text-sm text-gray-500">Average Rating</div>
            <div className="text-2xl font-bold">{Number(summary.avgRating || 0).toFixed(2)}</div>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <div className="text-sm text-gray-500">Total Reviews</div>
            <div className="text-2xl font-bold">{summary.count || 0}</div>
          </div>
          <div className="bg-white border rounded-xl p-5 text-sm">
            <div className="font-semibold mb-1">Breakdown</div>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating}>{rating}★: {summary.breakdown?.[rating] || 0}</div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Reviews</h2>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          {loading ? <div className="text-gray-500">Loading reviews...</div> : null}
          {!loading && reviews.length === 0 ? <div className="text-gray-500">No reviews found.</div> : null}

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{review.reviewerId?.name || 'Customer'}</div>
                  <div className="text-sm text-gray-600">{review.rating} / 5</div>
                </div>
                <div className="text-sm text-gray-500 mb-2">{new Date(review.createdAt).toLocaleString()}</div>
                <div className="text-gray-800 mb-3">{review.body}</div>

                {review.reply ? (
                  <div className="bg-gray-50 border rounded p-3 mb-3">
                    <div className="text-xs text-gray-500 mb-1">Your reply</div>
                    <div className="text-sm">{review.reply.message}</div>
                    <button onClick={() => deleteReply(review._id)} className="mt-2 text-xs text-red-600 hover:underline">
                      Delete Reply
                    </button>
                  </div>
                ) : null}

                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    className="flex-1 border rounded px-3 py-2 text-sm"
                    placeholder="Write a reply..."
                    value={replyByReview[review._id] || ''}
                    onChange={(e) => setReplyByReview((prev) => ({ ...prev, [review._id]: e.target.value }))}
                  />
                  <button
                    onClick={() => saveReply(review._id)}
                    disabled={savingReply === review._id}
                    className="px-3 py-2 bg-nvm-green-primary text-white rounded text-sm disabled:opacity-60"
                  >
                    {savingReply === review._id ? 'Saving...' : 'Reply'}
                  </button>
                  <button
                    onClick={() => reportReview(review._id)}
                    className="px-3 py-2 border border-red-300 text-red-700 rounded text-sm hover:bg-red-50"
                  >
                    Report
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">Page {page} of {pages}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

