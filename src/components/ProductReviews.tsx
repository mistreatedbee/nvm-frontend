import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, Shield, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewsAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';

interface ProductReviewsProps {
  productId: string;
}

type SortOption = 'newest' | 'highest' | 'lowest' | 'helpful';

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SortOption>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });

  useEffect(() => {
    void fetchReviews();
  }, [productId, page, sort, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProductPageReviews(productId, {
        page,
        limit: 8,
        sort,
        rating: ratingFilter || undefined
      });
      setReviews(response.data.data || []);
      setPages(response.data.pages || 1);
      setTotal(response.data.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load reviews');
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

    if (form.body.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsAPI.create({
        targetType: 'PRODUCT',
        productId,
        rating: form.rating,
        title: form.title,
        body: form.body
      });
      toast.success('Review submitted');
      setForm({ rating: 5, title: '', body: '' });
      setPage(1);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Login required');
      return;
    }
    try {
      await reviewsAPI.markHelpful(reviewId);
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to vote');
    }
  };

  const reportReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Login required');
      return;
    }
    const reason = window.prompt('Reason (spam, abuse, fake, off-topic, copyright, other):', 'spam');
    if (!reason) return;
    try {
      await reviewsAPI.report(reviewId, { reason });
      toast.success('Review reported');
      await fetchReviews();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to report review');
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h3 className="text-2xl font-display font-bold text-nvm-dark-900">Product Reviews ({total})</h3>
        <div className="flex flex-wrap gap-2">
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {isAuthenticated && user?.role === 'customer' && (
        <form onSubmit={submitReview} className="mb-6 border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <label className="text-sm font-medium text-gray-700">Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
              className="border rounded px-2 py-1 text-sm"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Title (optional)"
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            placeholder="Write your review..."
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-10 text-center text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{review.reviewerId?.name || 'Customer'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('en-US')}</span>
                    {(review.verifiedPurchase || review.isVerifiedPurchase) && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        <Shield className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {review.title ? <h4 className="font-medium mt-3 text-gray-900">{review.title}</h4> : null}
              <p className="text-gray-700 mt-2">{review.body || review.comment}</p>

              <div className="flex gap-4 mt-3">
                <button onClick={() => void toggleHelpful(review._id)} className="text-sm text-gray-600 hover:text-nvm-green-700 flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpfulCount || 0})
                </button>
                <button onClick={() => void reportReview(review._id)} className="text-sm text-gray-600 hover:text-red-700 flex items-center gap-1">
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              disabled={page >= pages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
