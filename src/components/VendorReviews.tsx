import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, Shield, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

interface VendorReviewsProps {
  vendorId: string;
}

type SortOption = 'newest' | 'highest' | 'lowest' | 'helpful';

export function VendorReviews({ vendorId }: VendorReviewsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<SortOption>('newest');
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    void fetchReviews();
  }, [vendorId, page, sort]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getVendorPageReviews(vendorId, { page, limit: 6, sort });
      setReviews(response.data.data || []);
      setPages(response.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load vendor reviews');
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated || user?.role !== 'customer') {
      toast.error('Only customers can leave reviews');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsAPI.create({
        targetType: 'VENDOR',
        vendorId,
        rating: form.rating,
        title: form.title,
        body: form.body
      });
      toast.success('Vendor review submitted');
      setForm({ rating: 5, title: '', body: '' });
      setPage(1);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit vendor review');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHelpful = async (reviewId: string) => {
    try {
      await reviewsAPI.markHelpful(reviewId);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to vote');
    }
  };

  const reportReview = async (reviewId: string) => {
    const reason = window.prompt('Reason (spam, abuse, fake, off-topic, copyright, other):', 'spam');
    if (!reason) return;
    try {
      await reviewsAPI.report(reviewId, { reason });
      toast.success('Review reported');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to report review');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-nvm-dark-900">Vendor Reviews</h3>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="border rounded-lg px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {isAuthenticated && user?.role === 'customer' && (
        <form onSubmit={submitReview} className="mb-5 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <select value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="border rounded px-2 py-1 text-sm">
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
            </select>
          </div>
          <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title (optional)" className="w-full border rounded-lg px-3 py-2" />
          <textarea value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} rows={3} placeholder="Write your vendor review..." className="w-full border rounded-lg px-3 py-2" />
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Vendor Review'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-6 text-center text-gray-500">Loading vendor reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-center text-gray-500">No vendor reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review._id} className="border border-gray-200 rounded-lg p-4">
              <p className="font-medium">{review.reviewerId?.name || 'Customer'}</p>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                ))}
                {(review.verifiedPurchase || review.isVerifiedPurchase) && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                    <Shield className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>
              {review.title ? <h4 className="font-medium mt-2">{review.title}</h4> : null}
              <p className="mt-2 text-gray-700">{review.body || review.comment}</p>
              <div className="mt-3 flex gap-4">
                <button onClick={() => void toggleHelpful(review._id)} className="text-sm text-gray-600 hover:text-nvm-green-700 inline-flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulCount || 0})
                </button>
                <button onClick={() => void reportReview(review._id)} className="text-sm text-gray-600 hover:text-red-700 inline-flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-5 flex justify-between">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">
            Prev
          </button>
          <button onClick={() => setPage((prev) => Math.min(pages, prev + 1))} disabled={page >= pages} className="px-3 py-1 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </section>
  );
}
