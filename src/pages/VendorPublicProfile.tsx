import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { vendorsAPI, productsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Package,
  Facebook,
  Instagram,
  Twitter,
  Navigation,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';

export function VendorPublicProfile() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (vendorId) {
      fetchVendorData();
    }
  }, [vendorId]);

  const fetchVendorData = async () => {
    try {
      const [vendorRes, productsRes] = await Promise.all([
        vendorsAPI.getById(vendorId!),
        productsAPI.getVendorProducts(vendorId!, { limit: 12, status: 'active' })
      ]);

      setVendor(vendorRes.data.data);
      setProducts(productsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvm-green-primary"></div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
          <Link
            to="/marketplace"
            className="inline-block px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Banner */}
      {vendor.banner?.url && (
        <div className="w-full h-64 overflow-hidden">
          <img
            src={vendor.banner.url}
            alt={vendor.storeName}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Vendor Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 -mt-20 relative z-10 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {vendor.logo?.url ? (
                <img
                  src={vendor.logo.url}
                  alt={vendor.storeName}
                  className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-nvm-green-primary to-nvm-gold-primary flex items-center justify-center border-4 border-white shadow-lg">
                  <Store className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">
                    {vendor.storeName}
                  </h1>
                  <p className="text-gray-600 capitalize">{vendor.category} • {vendor.businessType}</p>
                </div>
                
                {/* Rating */}
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-xl font-bold">{vendor.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <p className="text-sm text-gray-500">{vendor.totalReviews || 0} reviews</p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{vendor.description}</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-900">{vendor.totalProducts || 0}</p>
                  <p className="text-sm text-blue-700">Products</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-900">{vendor.totalSales || 0}</p>
                  <p className="text-sm text-green-700">Sales</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-900">{formatRands(vendor.totalRevenue || 0)}</p>
                  <p className="text-sm text-purple-700">Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-nvm-dark-900 mb-6">Products</h2>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map((product: any) => (
                    <Link
                      key={product._id}
                      to={`/products/${product._id}`}
                      className="group"
                    >
                      <motion.div
                        whileHover={{ y: -5 }}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                      >
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-nvm-green-primary transition-colors">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-nvm-gold-500">
                              {formatRands(product.price)}
                            </p>
                            {product.stock > 0 ? (
                              <span className="text-xs text-green-600">In Stock</span>
                            ) : (
                              <span className="text-xs text-red-600">Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Contact & Location */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${vendor.email}`} className="font-medium text-nvm-green-primary hover:underline">
                      {vendor.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${vendor.phone}`} className="font-medium text-nvm-green-primary hover:underline">
                      {vendor.phone}
                    </a>
                  </div>
                </div>

                {vendor.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Website</p>
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-nvm-green-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {vendor.address && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                
                {/* Map Placeholder */}
                <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Navigation className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Map Coming Soon</p>
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  <p className="font-medium">{vendor.address.street}</p>
                  <p>{vendor.address.city}, {vendor.address.state}</p>
                  <p>{vendor.address.zipCode}, {vendor.address.country}</p>
                </div>
              </div>
            )}

            {/* Social Media */}
            {(vendor.socialMedia?.facebook || vendor.socialMedia?.instagram || vendor.socialMedia?.twitter) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {vendor.socialMedia?.facebook && (
                    <a
                      href={vendor.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {vendor.socialMedia?.instagram && (
                    <a
                      href={vendor.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {vendor.socialMedia?.twitter && (
                    <a
                      href={vendor.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-400 text-white rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

