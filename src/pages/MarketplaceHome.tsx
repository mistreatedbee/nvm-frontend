import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../components/Hero';
import { Navbar } from '../components/Navbar';
import { CategoryNav } from '../components/CategoryNav';
import { CategorySection } from '../components/CategorySection';
import { HowItWorks } from '../components/HowItWorks';
import { ReviewsSection } from '../components/ReviewsSection';
import { TrustBadges } from '../components/TrustBadges';
import { NewsletterSection } from '../components/NewsletterSection';
import { VendorCard } from '../components/VendorCard';
import { ProductCard } from '../components/ProductCard';
import { PatternOverlay } from '../components/PatternOverlay';
import { productsAPI, vendorsAPI } from '../lib/api';
import { ArrowRight, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MarketplaceHome() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [apiProducts, setApiProducts] = useState([]);
  const [apiVendors, setApiVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from API, fallback to mock data
    const fetchData = async () => {
      try {
        const [productsRes, vendorsRes] = await Promise.all([
          productsAPI.getFeatured(),
          vendorsAPI.getAll({ limit: 4 })
        ]);
        setApiProducts(productsRes.data.data || []);
        setApiVendors(vendorsRes.data.data || []);
      } catch (error) {
        console.log('Using mock data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayProducts = apiProducts;
  const displayVendors = apiVendors;
  const filteredProducts = activeCategory === 'all' 
    ? displayProducts 
    : displayProducts.filter((p: any) => {
        const category = typeof p.category === 'string' ? p.category : p.category?.name || '';
        return category.toLowerCase().includes(activeCategory);
      });

  return (
    <div className="min-h-screen bg-nvm-green-bg">
      <Navbar />
      <Hero />

      {/* Category Section - Expanded */}
      <CategorySection />

      {/* How It Works */}
      <HowItWorks />

      {/* Trust Badges */}
      <TrustBadges />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {/* Featured Vendors Section - Enhanced */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-nvm-green-primary/10 rounded-full mb-4">
              <TrendingUp className="w-5 h-5 text-nvm-green-primary" />
              <span className="text-nvm-green-primary font-semibold">Top Rated</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-4">
              Featured <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">Vendors</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Meet our top-rated vendors offering quality products and exceptional service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {displayVendors.map((vendor: any, index: number) => (
              <VendorCard key={vendor._id || vendor.id} vendor={vendor} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/vendors">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-nvm-green-primary text-nvm-green-primary rounded-xl font-semibold hover:bg-nvm-green-primary hover:text-white shadow-lg transition-all"
              >
                View All Vendors
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </section>

        {/* Featured Products Section - Enhanced */}
        <section className="relative">
          {/* Decorative Background Element */}
          <div className="absolute -left-20 top-20 w-64 h-64 bg-nvm-gold-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -right-20 bottom-20 w-64 h-64 bg-nvm-green-primary/10 rounded-full blur-3xl -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-nvm-gold-primary/10 rounded-full mb-4">
              <Sparkles className="w-5 h-5 text-nvm-gold-primary" />
              <span className="text-nvm-gold-primary font-semibold">Trending Now</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-4">
              Featured <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">Products</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover handpicked products from our best vendors
            </p>
            <CategoryNav activeCategory={activeCategory} onSelect={setActiveCategory} />
          </motion.div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 8).map((product: any, index: number) => (
              <ProductCard key={product._id || product.id} product={product} index={index} />
            ))}
          </motion.div>

          <div className="mt-12 text-center">
            <Link to="/marketplace">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                Browse All Products
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </section>

      </main>

      {/* Customer Reviews */}
      <ReviewsSection />

      {/* Newsletter Signup */}
      <NewsletterSection />

      <footer className="bg-nvm-green-primary text-white pt-16 pb-8 mt-20">
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
                <li>
                  <a href="#" className="hover:text-white">
                    All Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Featured Vendors
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Gift Cards
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-nvm-gold-light">Community</h4>
              <ul className="space-y-2 text-green-100">
                <li>
                  <a href="#" className="hover:text-white">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Vendor Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-green-200 text-sm">
            © 2024 NVM Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}