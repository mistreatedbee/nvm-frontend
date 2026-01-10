import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Share2, MessageCircle } from 'lucide-react';
import { PatternOverlay } from '../components/PatternOverlay';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { vendors, products } from '../utils/mockData';
export function VendorStorefront() {
  const {
    id
  } = useParams();
  const vendor = vendors.find(v => v.id === id) || vendors[0];
  const vendorProducts = products.filter(p => p.vendorId === vendor.id);
  return <div className="min-h-screen bg-nvm-green-bg">
      {/* Header Banner */}
      <div className="h-64 md:h-80 bg-nvm-green-primary relative overflow-hidden">
        <PatternOverlay pattern="ankara" color="#D4AF37" opacity={0.15} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {/* Vendor Profile Card */}
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} className="bg-white rounded-xl shadow-xl overflow-hidden mb-12">
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-grow pt-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                    {vendor.name}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-2">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {vendor.location}
                    </span>
                    <span className="flex items-center text-nvm-gold-primary font-bold">
                      <Star className="w-4 h-4 mr-1 fill-current" />{' '}
                      {vendor.rating} (124 reviews)
                    </span>
                  </div>
                  <p className="text-nvm-earth-ochre font-medium">
                    {vendor.specialty}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                  <Button size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" /> Contact
                  </Button>
                </div>
              </div>

              <div className="prose prose-green max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {vendor.description}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative Footer Strip */}
          <div className="h-3 bg-gradient-to-r from-nvm-earth-terracotta via-nvm-gold-primary to-nvm-green-primary" />
        </motion.div>

        {/* Products Grid */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Store Products</h2>
          <div className="flex gap-2">
            <select className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-nvm-green-primary">
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vendorProducts.length > 0 ? vendorProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />) : <div className="col-span-full text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500">
                No products found for this vendor.
              </p>
            </div>}
        </div>
      </main>
    </div>;
}