import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { CategoryNav } from '../components/CategoryNav';
import { NewsletterSection } from '../components/NewsletterSection';
import { ProductCard } from '../components/ProductCard';
import { productsAPI, recommendationsAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { ArrowRight, Sparkles, ShoppingBag, Flame, Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MarketplaceHome() {
  const { isAuthenticated } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [allProducts, setAllProducts] = useState([]);
  const [apiFeaturedProducts, setApiFeaturedProducts] = useState([]);
  const [apiTrendingProducts, setApiTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);

  useEffect(() => {
    productsAPI.getAll({ status: 'PUBLISHED', limit: 12 })
      .then((res) => setAllProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingAll(false));

    productsAPI.getFeatured()
      .then((res) => setApiFeaturedProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    productsAPI.getTrending({ range: '7d', limit: 8 })
      .then((res) => setApiTrendingProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingTrending(false));

    productsAPI.getNewArrivals({ limit: 8 })
      .then((res) => setNewArrivals(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingNew(false));

    if (isAuthenticated) {
      recommendationsAPI.get({ limit: 8 }).then((res) => setRecommendedProducts(res.data.data || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  const filteredFeatured = activeCategory === 'all'
    ? apiFeaturedProducts
    : apiFeaturedProducts.filter((p: any) => {
        const cat = typeof p.category === 'string' ? p.category : p.category?.name || '';
        return cat.toLowerCase().includes(activeCategory);
      });

  const SkeletonGrid = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="h-64 bg-white rounded-xl border animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />

      {/* ─── ALL PRODUCTS ─────────────────────────────────────── */}
      <section className="py-16 bg-nvm-green-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-nvm-green-primary/10 rounded-full text-sm font-semibold text-nvm-green-primary mb-3">
                <ShoppingBag className="w-4 h-4" />
                Shop Now
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nvm-dark-900">
                Browse Our{' '}
                <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">
                  Collection
                </span>
              </h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Fresh products from trusted vendors across South Africa
              </p>
            </div>
            <Link
              to="/marketplace"
              className="hidden md:inline-flex items-center gap-2 text-nvm-green-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingAll ? (
            <SkeletonGrid count={8} />
          ) : allProducts.length === 0 ? (
            <div className="bg-white border rounded-xl text-center py-16 text-gray-500">
              No products yet — check back soon.
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {allProducts.slice(0, 12).map((product: any, index: number) => (
                <ProductCard key={product._id || product.id} product={product} index={index} trackingSource="HOMEPAGE" />
              ))}
            </motion.div>
          )}

          <div className="mt-10 text-center md:hidden">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-nvm-green-primary text-white rounded-xl font-semibold text-sm shadow-md"
            >
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ───────────────────────────────── */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute -left-20 top-20 w-64 h-64 bg-nvm-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 bottom-20 w-64 h-64 bg-nvm-green-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-nvm-gold-primary/10 rounded-full text-sm font-semibold text-nvm-gold-dark mb-3">
                <Sparkles className="w-4 h-4" />
                Featured Picks
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nvm-dark-900">
                Featured{' '}
                <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">
                  Products
                </span>
              </h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Handpicked products from our best vendors
              </p>
            </div>
            <Link
              to="/marketplace"
              className="hidden md:inline-flex items-center gap-2 text-nvm-green-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mb-8">
            <CategoryNav activeCategory={activeCategory} onSelect={setActiveCategory} />
          </div>

          {loadingFeatured ? (
            <SkeletonGrid count={8} />
          ) : filteredFeatured.length === 0 ? (
            <div className="bg-gray-50 border rounded-xl text-center py-16 text-gray-500">
              No featured products in this category yet.
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFeatured.slice(0, 8).map((product: any, index: number) => (
                <ProductCard key={product._id || product.id} product={product} index={index} trackingSource="HOMEPAGE" />
              ))}
            </motion.div>
          )}

          <div className="mt-10 text-center">
            <Link to="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                Browse All Products
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SPECIAL OFFERS (Trending) ───────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-nvm-orange-primary/10 rounded-full text-sm font-semibold text-nvm-orange-primary mb-3">
                <Flame className="w-4 h-4" />
                Hot This Week
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nvm-dark-900">
                Hot Deals &{' '}
                <span className="bg-gradient-to-r from-nvm-orange-primary to-nvm-gold-primary bg-clip-text text-transparent">
                  Special Offers
                </span>
              </h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Popular products with high buyer activity this week
              </p>
            </div>
            <Link
              to="/marketplace?sort=best_selling"
              className="hidden md:inline-flex items-center gap-2 text-nvm-green-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingTrending ? (
            <SkeletonGrid count={8} />
          ) : apiTrendingProducts.length === 0 ? (
            <div className="bg-white border rounded-xl text-center py-16 text-gray-500">
              No trending products yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {apiTrendingProducts.slice(0, 8).map((product: any, index: number) => (
                <ProductCard key={product._id || product.id} product={product} index={index} trackingSource="HOMEPAGE" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── NEW ARRIVALS ────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-nvm-green-primary/10 rounded-full text-sm font-semibold text-nvm-green-primary mb-3">
                <Star className="w-4 h-4" />
                Just Landed
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-nvm-dark-900">
                New{' '}
                <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">
                  Arrivals
                </span>
              </h2>
              <p className="text-gray-500 mt-2 max-w-xl">
                Latest products from active vendors, published this week
              </p>
            </div>
            <Link
              to="/marketplace?sort=newest"
              className="hidden md:inline-flex items-center gap-2 text-nvm-green-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingNew ? (
            <SkeletonGrid count={8} />
          ) : newArrivals.length === 0 ? (
            <div className="bg-gray-50 border rounded-xl text-center py-16 text-gray-500">
              No new arrivals yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.slice(0, 8).map((product: any, index: number) => (
                <ProductCard key={product._id || product.id} product={product} index={index} trackingSource="HOMEPAGE" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── RECOMMENDED FOR YOU (auth-gated) ───────────────── */}
      {isAuthenticated && recommendedProducts.length > 0 && (
        <section className="py-16 bg-nvm-gold-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-nvm-gold-primary/10 rounded-full text-sm font-semibold text-nvm-gold-dark mb-3">
                  <Heart className="w-4 h-4" />
                  Picked For You
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-nvm-dark-900">
                  Recommended{' '}
                  <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">
                    For You
                  </span>
                </h2>
                <p className="text-gray-500 mt-2 max-w-xl">
                  Based on your browsing activity and interests
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedProducts.slice(0, 8).map((product: any, index: number) => (
                <ProductCard key={product._id || product.id} product={product} index={index} trackingSource="HOMEPAGE" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <NewsletterSection />

      {/* Footer */}
      <footer className="bg-nvm-green-primary text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.jpeg"
                  alt="NVM"
                  className="h-16 w-auto object-contain brightness-0 invert opacity-90"
                />
              </div>
              <p className="text-sm text-nvm-gold-light font-medium mb-2">Your Marketplace for Every Business</p>
              <p className="text-green-100 max-w-sm">
                Connecting vendors with customers across South Africa.
                Authentic, trusted, and community-driven.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-nvm-gold-light">Shop</h4>
              <ul className="space-y-2 text-green-100">
                <li><Link to="/marketplace" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/marketplace?sort=best_selling" className="hover:text-white transition-colors">Special Offers</Link></li>
                <li><Link to="/marketplace?sort=newest" className="hover:text-white transition-colors">New Arrivals</Link></li>
                <li><Link to="/vendors" className="hover:text-white transition-colors">Browse Vendors</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-nvm-gold-light">Support</h4>
              <ul className="space-y-2 text-green-100">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Centre</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/vendor/setup" className="hover:text-white transition-colors">Become a Vendor</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-green-200 text-sm">
            © 2026 NVM Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
