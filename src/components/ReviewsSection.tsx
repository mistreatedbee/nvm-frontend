import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { reviewsAPI } from '../lib/api';

export function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    satisfactionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getAll({ limit: 6, sort: '-createdAt' });
      const reviewsData = response.data.data || [];
      setReviews(reviewsData);
      
      // Calculate stats from reviews
      if (reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsData.length;
        const satisfaction = (reviewsData.filter((r: any) => r.rating >= 4).length / reviewsData.length) * 100;
        
        setStats({
          averageRating: avgRating,
          totalReviews: response.data.total || reviewsData.length,
          satisfactionRate: satisfaction
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set empty state instead of showing error
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get time ago
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-nvm-green-bg via-white to-nvm-gold-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-gray-600">Loading reviews...</div>
        </div>
      </section>
    );
  }

  // Don't show section if no reviews
  if (reviews.length === 0) {
    return null;
  }
  return (
    <section className="py-20 bg-gradient-to-br from-nvm-green-bg via-white to-nvm-gold-bg relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-nvm-gold-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-nvm-green-primary/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-nvm-gold-primary/20 rounded-full mb-4">
            <Star className="w-5 h-5 text-nvm-gold-primary fill-current" />
            <span className="text-nvm-gold-primary font-semibold">Customer Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-4">
            What Our <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">Customers Say</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers shopping from trusted South African vendors
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review: any, index: number) => {
            const userName = review.user?.name || 'Anonymous';
            const userLocation = review.user?.address?.city || 'South Africa';
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2D6A4F&color=fff`;
            
            return (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 text-nvm-gold-primary/20">
                  <Quote className="w-12 h-12" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-nvm-gold-primary fill-current" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-6 relative z-10 leading-relaxed">
                  "{review.comment || review.review}"
                </p>

                {/* Reviewer Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-12 h-12 rounded-full border-2 border-nvm-green-primary/20"
                  />
                  <div>
                    <div className="font-semibold text-nvm-dark-900">{userName}</div>
                    <div className="text-sm text-gray-500">{userLocation} • {getTimeAgo(review.createdAt)}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall Rating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-xl max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(stats.averageRating) ? 'text-nvm-gold-primary fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <div className="text-sm text-gray-600 font-medium">Average Rating</div>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent mb-2">
                {stats.totalReviews >= 1000 ? `${(stats.totalReviews / 1000).toFixed(1)}k` : stats.totalReviews}+
              </div>
              <div className="text-sm text-gray-600 font-medium mt-5">Total Reviews</div>
            </div>
            <div>
              <div className="text-5xl font-bold bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent mb-2">
                {Math.round(stats.satisfactionRate)}%
              </div>
              <div className="text-sm text-gray-600 font-medium mt-5">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
