import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Laptop, 
  Home, 
  Heart, 
  Shirt, 
  Book, 
  Dumbbell,
  Utensils,
  Palette,
  Wrench,
  Baby,
  Music,
  Camera,
  Watch,
  Gift,
  Car
} from 'lucide-react';

const categories = [
  { name: 'Fashion & Clothing', icon: Shirt, color: 'from-pink-500 to-purple-500', count: '1.2k+' },
  { name: 'Electronics', icon: Laptop, color: 'from-blue-500 to-cyan-500', count: '890+' },
  { name: 'Home & Garden', icon: Home, color: 'from-green-500 to-emerald-500', count: '650+' },
  { name: 'Health & Beauty', icon: Heart, color: 'from-red-500 to-pink-500', count: '520+' },
  { name: 'Food & Beverages', icon: Utensils, color: 'from-orange-500 to-yellow-500', count: '430+' },
  { name: 'Sports & Outdoors', icon: Dumbbell, color: 'from-teal-500 to-green-500', count: '380+' },
  { name: 'Books & Media', icon: Book, color: 'from-indigo-500 to-purple-500', count: '720+' },
  { name: 'Art & Crafts', icon: Palette, color: 'from-fuchsia-500 to-pink-500', count: '290+' },
  { name: 'Services', icon: Wrench, color: 'from-gray-600 to-gray-800', count: '150+' },
  { name: 'Baby & Kids', icon: Baby, color: 'from-pink-400 to-rose-400', count: '340+' },
  { name: 'Music & Instruments', icon: Music, color: 'from-purple-500 to-indigo-500', count: '180+' },
  { name: 'Photography', icon: Camera, color: 'from-slate-600 to-slate-800', count: '120+' },
  { name: 'Jewelry & Watches', icon: Watch, color: 'from-amber-500 to-yellow-600', count: '410+' },
  { name: 'Gifts & Party', icon: Gift, color: 'from-rose-500 to-pink-600', count: '270+' },
  { name: 'Automotive', icon: Car, color: 'from-blue-600 to-slate-700', count: '190+' },
  { name: 'All Products', icon: ShoppingBag, color: 'from-nvm-green-500 to-nvm-gold-500', count: '5k+' }
];

export function CategorySection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-4">
            Shop by <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore thousands of products across all categories from trusted South African vendors
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to="/marketplace"
                  state={{ category: category.name }}
                  className="block group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all border border-gray-100 overflow-hidden"
                  >
                    {/* Background Gradient on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    {/* Icon */}
                    <div className="relative z-10 mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} p-3 mx-auto flex items-center justify-center transform group-hover:rotate-6 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Category Name */}
                    <h3 className="relative z-10 text-center font-semibold text-gray-900 mb-2 group-hover:text-nvm-green-primary transition-colors">
                      {category.name}
                    </h3>

                    {/* Product Count */}
                    <p className="relative z-10 text-center text-sm text-gray-500 font-medium">
                      {category.count} products
                    </p>

                    {/* Hover Arrow */}
                    <motion.div
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      className="absolute bottom-4 right-4 text-nvm-green-primary"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/marketplace">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse All Products
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
