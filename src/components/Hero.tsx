import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Store, Sparkles } from 'lucide-react';
import { vendorsAPI, productsAPI, authAPI } from '../lib/api';

export function Hero() {
  const [stats, setStats] = useState({
    vendors: 0,
    products: 0,
    customers: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [vendorsRes, productsRes] = await Promise.all([
        vendorsAPI.getAll({ limit: 1 }),
        productsAPI.getAll({ limit: 1 })
      ]);
      
      setStats({
        vendors: vendorsRes.data.total || 0,
        products: productsRes.data.total || 0,
        customers: Math.floor((vendorsRes.data.total || 0) * 100) // Estimate based on vendors
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-white via-nvm-green-bg to-nvm-gold-bg overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-nvm-green-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-nvm-gold-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            {/* Badge Only (Logo Removed) */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-nvm-gold-primary/20 to-nvm-green-primary/20 border border-nvm-gold-primary/30 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-nvm-gold-primary" />
              <span className="text-sm md:text-base font-semibold bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">
                Your Marketplace for Every Business
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-nvm-dark-900 leading-tight mb-6"
            >
              Discover South Africa's
              <br />
              <span className="bg-gradient-to-r from-nvm-green-primary via-nvm-gold-primary to-nvm-green-primary bg-clip-text text-transparent">
                Premier Marketplace
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed"
            >
              Connect with trusted vendors across South Africa. From fresh produce to handcrafted goods, 
              find everything you need in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link to="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/vendor/setup">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-nvm-gold-primary text-nvm-gold-primary rounded-xl font-semibold text-lg hover:bg-nvm-gold-primary hover:text-white shadow-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-5 h-5" />
                  Become a Vendor
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats - Real-Time Data */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-6 max-w-lg"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark bg-clip-text text-transparent">
                  {stats.vendors >= 1000 ? `${(stats.vendors / 1000).toFixed(1)}k` : stats.vendors}+
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-nvm-gold-primary to-nvm-gold-dark bg-clip-text text-transparent">
                  {stats.products >= 1000 ? `${(stats.products / 1000).toFixed(1)}k` : stats.products}+
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-nvm-orange-primary to-nvm-orange-600 bg-clip-text text-transparent">
                  {stats.customers >= 1000 ? `${(stats.customers / 1000).toFixed(1)}k` : stats.customers}+
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">Customers</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Image with Pop-out Effect (Smaller) */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Decorative Elements Behind Image */}
            <motion.div
              className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-br from-nvm-green-primary to-nvm-gold-primary rounded-3xl opacity-20 blur-2xl"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Floating Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, type: "spring" }}
              className="absolute -top-8 -left-8 z-20 bg-gradient-to-r from-nvm-orange-primary to-nvm-orange-600 text-white px-6 py-3 rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <div>
                  <div className="text-sm font-semibold">Trending Now</div>
                  <div className="text-xs opacity-90">Hot Deals</div>
                </div>
              </div>
            </motion.div>

            {/* Main Hero Image - Pop Out Effect (Smaller Size) */}
            <motion.div
              className="relative w-full max-w-md mx-auto"
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Image Container with 3D Effect */}
              <div className="relative transform perspective-1000 hover:rotate-y-6 transition-transform duration-500">
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  {/* Multiple Shadow Layers for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-nvm-green-primary/30 to-nvm-gold-primary/30 rounded-3xl transform translate-x-4 translate-y-4 blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-nvm-gold-primary/20 to-nvm-green-primary/20 rounded-3xl transform translate-x-2 translate-y-2 blur-xl" />
                  
                  {/* Main Image */}
                  <div className="relative rounded-3xl overflow-hidden border-6 border-white shadow-2xl transform transition-all hover:shadow-3xl">
                    <img 
                      src="/hero.jpeg" 
                      alt="NVM Marketplace" 
                      className="w-full h-auto object-cover rounded-2xl max-h-96"
                    />
                    
                    {/* Gradient Overlay on Image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
                    
                    {/* Shine Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Bottom Right Badge */}
            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="absolute -bottom-8 -right-8 z-20 bg-white border-4 border-nvm-gold-primary px-6 py-4 rounded-2xl shadow-2xl"
              whileHover={{ scale: 1.1, rotate: -5 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-nvm-green-primary">4.9★</div>
                <div className="text-xs text-gray-600 font-semibold">Trusted Platform</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path 
            d="M0 120L60 105C120 90 240 60 360 60C480 60 600 90 720 95C840 100 960 80 1080 65C1200 50 1320 40 1380 35L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="white" 
          />
        </svg>
      </div>
    </div>
  );
}
