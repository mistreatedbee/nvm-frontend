import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Share2, MessageCircle, Store, Mail, Phone } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { vendorsAPI, productsAPI } from '../lib/api';
import toast from 'react-hot-toast';

export function VendorStorefront() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (id) {
      fetchVendor();
      fetchProducts();
    }
  }, [id]);

  const fetchVendor = async () => {
    try {
      const response = await vendorsAPI.getById(id!);
      setVendor(response.data.data);
    } catch (error: any) {
      toast.error('Vendor not found');
      navigate('/vendors');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getVendorProducts(id!, { status: 'active' });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popular':
        return (b.totalSales || 0) - (a.totalSales || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">Loading vendor...</div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-red-600">Vendor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header Banner */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-nvm-green-primary to-nvm-green-600 relative overflow-hidden">
        {vendor.banner?.url ? (
          <img 
            src={vendor.banner.url} 
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        {/* Vendor Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-xl overflow-hidden mb-12"
        >
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-nvm-green-primary to-nvm-gold-primary flex items-center justify-center">
                {vendor.logo?.url ? (
                  <img src={vendor.logo.url} alt={vendor.storeName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-20 h-20 text-white" />
                )}
              </div>
            </div>

            <div className="flex-grow pt-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-nvm-dark-900 mb-2">
                    {vendor.storeName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-2">
                    {vendor.address && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vendor.address.city}, {vendor.address.state}
                      </span>
                    )}
                    {vendor.rating > 0 && (
                      <span className="flex items-center text-nvm-gold-primary font-bold">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {vendor.rating.toFixed(1)} ({vendor.totalReviews} reviews)
                      </span>
                    )}
                  </div>
                  {vendor.businessType && (
                    <p className="text-nvm-green-600 font-medium">{vendor.businessType}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-nvm-green-500 hover:bg-nvm-green-50 transition-colors flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              {vendor.description && (
                <div className="prose prose-green max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4 mt-4">
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 hover:text-nvm-green-600">
                    <Mail className="w-4 h-4" />
                    {vendor.email}
                  </a>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 hover:text-nvm-green-600">
                    <Phone className="w-4 h-4" />
                    {vendor.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Decorative Footer Strip */}
          <div className="h-3 bg-gradient-to-r from-nvm-green-primary via-nvm-gold-primary to-nvm-green-600" />
        </motion.div>

        {/* Products Section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-nvm-dark-900">Store Products</h2>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product: any, index: number) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No products available from this vendor yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
