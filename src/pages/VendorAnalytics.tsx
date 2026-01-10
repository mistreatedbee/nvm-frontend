import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { analyticsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Package,
  Star,
  Calendar,
  Download
} from 'lucide-react';

export function VendorAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (dateRange === '7days') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === '30days') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (dateRange === '90days') {
        startDate.setDate(startDate.getDate() - 90);
      } else if (dateRange === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
      
      const response = await analyticsAPI.getVendorAnalytics({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvm-green-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

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
                Store Analytics
              </h1>
              <p className="text-gray-600">Track your store's performance and insights</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
              <button className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-nvm-green-500 to-nvm-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8" />
              <div className="text-right">
                <p className="text-3xl font-bold">{formatRands(analytics?.overview?.totalRevenue || 0)}</p>
                <p className="text-sm opacity-90">Total Revenue</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Avg: {formatRands(analytics?.overview?.averageOrderValue || 0)}/order</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8" />
              <div className="text-right">
                <p className="text-3xl font-bold">{analytics?.overview?.totalOrders || 0}</p>
                <p className="text-sm opacity-90">Total Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4" />
              <span>{analytics?.overview?.totalItemsSold || 0} items sold</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <div className="text-right">
                <p className="text-3xl font-bold">{analytics?.products?.total || 0}</p>
                <p className="text-sm opacity-90">Total Products</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{analytics?.products?.active || 0} active</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Star className="w-8 h-8 fill-current" />
              <div className="text-right">
                <p className="text-3xl font-bold">{analytics?.reviews?.averageRating || '0.0'}</p>
                <p className="text-sm opacity-90">Average Rating</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4" />
              <span>{analytics?.reviews?.total || 0} reviews</span>
            </div>
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8"
        >
          <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">Revenue Over Time</h2>
          <div className="space-y-3">
            {analytics?.revenueByDay?.map((day: any, index: number) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600">{day._id}</div>
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-nvm-green-500 to-nvm-green-600 h-full rounded-full flex items-center justify-end px-3 text-white text-sm font-medium"
                      style={{
                        width: `${Math.min((day.revenue / Math.max(...analytics.revenueByDay.map((d: any) => d.revenue))) * 100, 100)}%`
                      }}
                    >
                      {formatRands(day.revenue)}
                    </div>
                  </div>
                </div>
                <div className="w-20 text-right text-sm text-gray-600">{day.orders} orders</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">Top Selling Products</h2>
            <div className="space-y-4">
              {analytics?.topProducts?.map((product: any, index: number) => (
                <div key={product._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-nvm-green-100 rounded-full flex items-center justify-center text-nvm-green-600 font-bold">
                    {index + 1}
                  </div>
                  <img
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/60'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-nvm-gold-500">{formatRands(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">Order Status</h2>
            <div className="space-y-4">
              {analytics?.ordersByStatus?.map((status: any) => (
                <div key={status._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">{status._id}</span>
                    <span className="text-sm font-bold text-gray-900">{status.count}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        status._id === 'delivered' ? 'bg-green-500' :
                        status._id === 'processing' ? 'bg-blue-500' :
                        status._id === 'shipped' ? 'bg-purple-500' :
                        status._id === 'cancelled' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{
                        width: `${(status.count / analytics.ordersByStatus.reduce((sum: number, s: any) => sum + s.count, 0)) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Review Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">Review Distribution</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics?.reviews?.distribution?.[rating] || 0;
                const total = analytics?.reviews?.total || 1;
                const percentage = (count / total) * 100;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{rating}</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-yellow-500 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm text-gray-600">{count}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

