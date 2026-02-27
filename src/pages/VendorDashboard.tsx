import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuthStore } from '../lib/store';
import { vendorsAPI, productsAPI, ordersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { DEFAULT_IMAGE_DATA_URI } from '../lib/images';
import { 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Star,
  Store,
  MessageSquare,
  Bot,
  BookOpen,
  Wrench,
  Wallet,
  Megaphone,
  Boxes
} from 'lucide-react';

export function VendorDashboard() {
  const { user } = useAuthStore();
  const [vendor, setVendor] = useState<any>(null);
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    rating: 0,
    totalReviews: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      // Fetch vendor profile first so backend can auto-create one for vendor users who don't have a profile yet
      const vendorRes = await vendorsAPI.getMyProfile();
      const vendorData = vendorRes.data.data;
      setVendor(vendorData);

      if (!vendorData?._id) {
        setLoading(false);
        return;
      }

      const isActiveVendor =
        String(vendorData?.vendorStatus || '').toUpperCase() === 'ACTIVE' ||
        (String(vendorData?.status || '').toLowerCase() === 'approved' &&
          String(vendorData?.accountStatus || '').toLowerCase() === 'active');

      // Products/orders endpoints require an active vendor account.
      if (isActiveVendor) {
        const [productsRes, ordersRes] = await Promise.all([
          productsAPI.getMyProducts({ limit: 5 }),
          ordersAPI.getVendorOrders({ limit: 5 })
        ]);
        setProducts(productsRes.data.data || []);
        setOrders(ordersRes.data.data || []);
      } else {
        setProducts([]);
        setOrders([]);
      }

      const analyticsRes = await vendorsAPI.getAnalytics(vendorData._id);
      const raw = analyticsRes.data.data;
      setAnalytics({
        totalProducts: raw?.products?.total ?? 0,
        activeProducts: raw?.products?.active ?? 0,
        totalSales: raw?.overview?.totalItemsSold ?? 0,
        totalRevenue: raw?.overview?.totalRevenue ?? 0,
        rating: raw?.reviews?.averageRating ?? vendorData?.rating ?? 0,
        totalReviews: raw?.reviews?.total ?? vendorData?.totalReviews ?? 0
      });
    } catch (error: any) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingScreen title="Loading your dashboard…" subtitle="Fetching your store, products, orders, and analytics" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Vendor Profile Found</h2>
            <p className="text-gray-600 mb-6">You need to create a vendor profile first</p>
            <Link
              to="/vendor/setup"
              className="inline-flex items-center px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition"
            >
              Create Vendor Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
                {vendor.storeName}
              </h1>
              <p className="text-gray-600">Manage your store, products, and orders</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(vendor.status)}`}>
              {vendor.status}
            </span>
          </div>
        </motion.div>

        {/* Status Alert */}
        {vendor.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8"
          >
            <p className="text-yellow-800">
              <strong>Pending Approval:</strong> Your vendor application is being reviewed. You'll be notified once approved.
            </p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-nvm-green-500 to-nvm-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{analytics.totalProducts}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Products</p>
            <p className="text-xs opacity-75 mt-1">{analytics.activeProducts} active</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-nvm-gold-400 to-nvm-gold-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{analytics.totalSales}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Sales</p>
            <p className="text-xs opacity-75 mt-1">All time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold">{formatRands(analytics.totalRevenue)}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Revenue</p>
            <p className="text-xs opacity-75 mt-1">Lifetime earnings</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <span className="text-3xl font-bold">{Number(analytics.rating || 0).toFixed(1)}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Store Rating</p>
            <p className="text-xs opacity-75 mt-1">{analytics.totalReviews} reviews</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/vendor/products/new"
                className={`w-full flex items-center p-4 rounded-lg border-2 transition-all group ${
                  analytics.totalProducts >= 2
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'border-nvm-green-200 bg-nvm-green-50 hover:bg-nvm-green-100'
                }`}
                >
                  <div className="w-10 h-10 bg-nvm-green-500 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Add Product</p>
                  <p className="text-sm text-gray-500">
                    {analytics.totalProducts >= 2 ? 'Limit reached (2 products)' : 'List new item'}
                  </p>
                  </div>
                </Link>

                <Link
                  to="/vendor/products"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Package className="w-5 h-5 text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">My Products</p>
                    <p className="text-sm text-gray-500">Manage inventory</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/orders"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <ShoppingBag className="w-5 h-5 text-purple-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Orders</p>
                    <p className="text-sm text-gray-500">Process orders</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/inventory"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-lime-400 hover:bg-lime-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center group-hover:bg-lime-500 transition-colors">
                    <Boxes className="w-5 h-5 text-lime-700 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Inventory</p>
                    <p className="text-sm text-gray-500">Alerts, SKUs, barcodes</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/analytics"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-orange-400 hover:bg-orange-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <BarChart3 className="w-5 h-5 text-orange-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Analytics</p>
                    <p className="text-sm text-gray-500">View insights</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/marketing"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-pink-400 hover:bg-pink-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                    <Megaphone className="w-5 h-5 text-pink-700 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Marketing</p>
                    <p className="text-sm text-gray-500">Coupons, flash sales, ads</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/wallet"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Wallet className="w-5 h-5 text-emerald-700 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Wallet</p>
                    <p className="text-sm text-gray-500">Balance and payouts</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/reviews"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-500 transition-colors">
                    <Star className="w-5 h-5 text-yellow-700 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Reviews</p>
                    <p className="text-sm text-gray-500">Reply and moderation</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/knowledge"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                    <BookOpen className="w-5 h-5 text-cyan-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Knowledge Hub</p>
                    <p className="text-sm text-gray-500">Guides and resources</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/toolkit"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                    <Wrench className="w-5 h-5 text-indigo-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Toolkit</p>
                    <p className="text-sm text-gray-500">Insights and playbook</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/store-profile"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-teal-400 hover:bg-teal-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-500 transition-colors">
                    <Store className="w-5 h-5 text-teal-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">My Store Profile</p>
                    <p className="text-sm text-gray-500">Edit public storefront</p>
                  </div>
                </Link>

                <Link
                  to="/vendor/documents"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-rose-400 hover:bg-rose-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                    <Store className="w-5 h-5 text-rose-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Verification Docs</p>
                    <p className="text-sm text-gray-500">Upload and track compliance</p>
                  </div>
                </Link>

                <Link
                  to="/chat"
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <MessageSquare className="w-5 h-5 text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">Customer Chats</p>
                    <p className="text-sm text-gray-500">Order and inquiry messages</p>
                  </div>
                </Link>

                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('nvm:open-assistant'))}
                  className="w-full flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-amber-500 hover:bg-amber-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <Bot className="w-5 h-5 text-amber-700 group-hover:text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold text-nvm-dark-900">AI Assistant</p>
                    <p className="text-sm text-gray-500">Get instant vendor help</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent Products */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-nvm-dark-900">Recent Products</h2>
                <Link to="/vendor/products" className="text-nvm-green-500 hover:text-nvm-green-600 font-medium text-sm">
                  View All
                </Link>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No products yet</p>
                  <Link
                    to="/vendor/products/new"
                    className="inline-flex items-center px-6 py-3 bg-nvm-green-500 text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Product
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product: any) => (
                    <motion.div
                      key={product._id}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <img
                        src={product.images?.[0]?.url || DEFAULT_IMAGE_DATA_URI}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-nvm-dark-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-nvm-gold-500">R {Number(product.price ?? 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{Number(product.stock ?? 0)} in stock</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/product/${product._id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-5 h-5 text-gray-600" />
                        </Link>
                        <Link to={`/vendor/products/edit/${product._id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-5 h-5 text-gray-600" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
