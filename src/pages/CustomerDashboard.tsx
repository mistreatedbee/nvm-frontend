import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../lib/store';
import { ordersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { 
  Package, 
  Heart, 
  User, 
  Settings, 
  ShoppingBag, 
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

export function CustomerDashboard() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders({ limit: 5 });
      const ordersData = response.data.data || [];
      setOrders(ordersData);
      
      // Calculate stats
      const stats = {
        totalOrders: ordersData.length,
        pendingOrders: ordersData.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
        completedOrders: ordersData.filter((o: any) => o.status === 'delivered').length,
        totalSpent: ordersData.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'delivered') return <CheckCircle className="w-4 h-4" />;
    if (status === 'cancelled') return <XCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
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
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">Manage your orders, wishlist, and account settings</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-nvm-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-nvm-green-500" />
              </div>
              <span className="text-2xl font-bold text-nvm-dark-900">{stats.totalOrders}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-2xl font-bold text-nvm-dark-900">{stats.pendingOrders}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-nvm-dark-900">{stats.completedOrders}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-nvm-gold-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-nvm-gold-500" />
              </div>
              <span className="text-2xl font-bold text-nvm-dark-900">{formatRands(stats.totalSpent)}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">Total Spent</p>
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
                  to="/marketplace"
                  className="flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-nvm-green-500 hover:bg-nvm-green-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-nvm-green-100 rounded-lg flex items-center justify-center group-hover:bg-nvm-green-500 transition-colors">
                    <ShoppingBag className="w-5 h-5 text-nvm-green-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-nvm-dark-900">Browse Products</p>
                    <p className="text-sm text-gray-500">Discover amazing items</p>
                  </div>
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-red-400 hover:bg-red-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors">
                    <Heart className="w-5 h-5 text-red-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-nvm-dark-900">My Wishlist</p>
                    <p className="text-sm text-gray-500">Saved items</p>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  className="flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <User className="w-5 h-5 text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-nvm-dark-900">My Profile</p>
                    <p className="text-sm text-gray-500">Edit your details</p>
                  </div>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center p-4 rounded-lg border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <Settings className="w-5 h-5 text-purple-600 group-hover:text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-nvm-dark-900">Settings</p>
                    <p className="text-sm text-gray-500">Account preferences</p>
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-nvm-dark-900">Recent Orders</h2>
                <Link to="/orders" className="text-nvm-green-500 hover:text-nvm-green-600 font-medium text-sm">
                  View All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link
                    to="/marketplace"
                    className="inline-flex items-center px-6 py-3 bg-nvm-green-500 text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: any) => (
                    <motion.div
                      key={order._id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-nvm-dark-900">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-bold text-nvm-gold-500">{formatRands(order.total)}</p>
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
