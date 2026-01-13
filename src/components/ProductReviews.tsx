import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { reviewsAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import { 
  Star, 
  ThumbsUp,
  MessageSquare,
  Shield,
  X,
  Send
} from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  vendorId?: string;
}

interface ReviewForm {
  rating: number;
  title: string;
  comment: string;
}

export function ProductReviews({ productId, vendorId }: ProductReviewsProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ReviewForm>();

  const selectedRating = watch('rating') || 0;

  useEffect(() => {
    fetchReviews();
  }, [productId, filterRating]);

  const fetchReviews = async () => {
    try {
      const params: any = {};
      if (filterRating) params.rating = filterRating;
      
      const response = await reviewsAPI.getProductReviews(productId, params);
      const reviewsData = response.data.data || [];
      setReviews(reviewsData);

      // Calculate statistics
      if (reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length;
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        
        reviewsData.forEach((r: any) => {
          distribution[r.rating as keyof typeof distribution]++;
        });

        setStats({
          average: avgRating,
          total: response.data.total || reviewsData.length,
          distribution
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReviewForm) => {
    if (!isAuthenticated) {
      toast.error('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.create({
        product: productId,
        vendor: vendorId,
        rating: data.rating,
        title: data.title,
        comment: data.comment
      });

      toast.success('Review submitted successfully!');
      reset();
      setShowForm(false);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark reviews as helpful');
      return;
    }

    try {
      await reviewsAPI.markHelpful(reviewId);
      fetchReviews();
      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark review');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-display font-bold text-nvm-dark-900 mb-4">
              Customer Reviews
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-nvm-gold-primary">
                {stats.average.toFixed(1)}
              </div>
              <div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(stats.average)
                          ? 'text-nvm-gold-primary fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{stats.total} reviews</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating as keyof typeof stats.distribution] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              
              return (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`w-full flex items-center gap-3 text-sm hover:bg-gray-50 p-2 rounded transition-colors ${
                    filterRating === rating ? 'bg-nvm-green-50' : ''
                  }`}
                >
                  <span className="w-12">{rating} star</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-nvm-gold-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-600">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        {isAuthenticated && user?.role === 'customer' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full md:w-auto px-6 py-3 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Write a Review
            </button>
          </div>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-nvm-dark-900">
                Write Your Review
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('rating', star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || selectedRating)
                            ? 'text-nvm-gold-primary fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  {...register('rating', {
                    required: 'Please select a rating',
                    min: 1,
                    max: 5
                  })}
                />
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title *
                </label>
                <input
                  type="text"
                  {...register('title', {
                    required: 'Title is required',
                    maxLength: { value: 100, message: 'Title too long' }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                  placeholder="Summarize your experience"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  {...register('comment', {
                    required: 'Review comment is required',
                    minLength: { value: 20, message: 'Review must be at least 20 characters' },
                    maxLength: { value: 1000, message: 'Review too long' }
                  })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                  placeholder="Tell others about your experience with this product..."
                />
                {errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review: any) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.customer?.name || 'User')}&background=2D6A4F&color=fff`}
                  alt={review.customer?.name}
                  className="w-12 h-12 rounded-full"
                />

                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-nvm-dark-900">
                          {review.customer?.name || 'Anonymous'}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                            <Shield className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-nvm-gold-primary fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-ZA')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  {review.title && (
                    <h4 className="font-semibold text-nvm-dark-900 mb-2">{review.title}</h4>
                  )}

                  {/* Comment */}
                  <p className="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                  {/* Helpful Button */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleMarkHelpful(review._id)}
                      disabled={!isAuthenticated}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-nvm-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
                    </button>
                  </div>

                  {/* Vendor Response */}
                  {review.vendorResponse && (
                    <div className="mt-4 pl-4 border-l-2 border-nvm-green-500 bg-nvm-green-50 p-4 rounded-r-lg">
                      <p className="text-sm font-semibold text-nvm-dark-900 mb-2">
                        Vendor Response:
                      </p>
                      <p className="text-sm text-gray-700">{review.vendorResponse.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.vendorResponse.respondedAt).toLocaleDateString('en-ZA')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
