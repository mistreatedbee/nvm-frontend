import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { VendorMap } from '../components/VendorMap';
import { vendorsAPI, productsAPI, ordersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import { 
  Users, 
  ShoppingBag, 
  Package, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  Shield
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [vendorsRes, productsRes, ordersRes] = await Promise.all([
        vendorsAPI.getAll({ status: 'pending' }),
        productsAPI.getAll({ limit: 100 }),
        ordersAPI.getAll({ limit: 10 })
      ]);

      const allVendorsRes = await vendorsAPI.getAll({});
      
      setPendingVendors(vendorsRes.data.data || []);
      setAllVendors(allVendorsRes.data.data || []);
      setRecentOrders(ordersRes.data.data || []);

      setStats({
        totalVendors: allVendorsRes.data.total || 0,
        pendingVendors: vendorsRes.data.total || 0,
        totalProducts: productsRes.data.total || 0,
        totalOrders: ordersRes.data.total || 0,
        totalRevenue: (ordersRes.data.data || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      toast.loading('Approving vendor...');
      await vendorsAPI.approve(vendorId);
      toast.dismiss();
      toast.success('Vendor approved successfully!');
      fetchAdminData();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to approve vendor');
      console.error('Error approving vendor:', error);
    }
  };

  const handleRejectVendor = async (vendorId: string, vendorName: string) => {
    const reason = prompt(`Enter rejection reason for ${vendorName}:`, 'Does not meet requirements');
    if (!reason) return;
    
    try {
      toast.loading('Rejecting vendor...');
      await vendorsAPI.reject(vendorId, { reason });
      toast.dismiss();
      toast.success('Vendor rejected');
      fetchAdminData();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to reject vendor');
      console.error('Error rejecting vendor:', error);
    }
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-nvm-accent-indigo rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold text-nvm-dark-900">
                  Admin Dashboard
                </h1>
              </div>
              <p className="text-gray-600">Platform management and oversight</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/vendors"
                className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-all font-semibold flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Manage Vendors
              </Link>
              <Link
                to="/admin/users"
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary transition-all font-semibold flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Manage Users
              </Link>
              <Link
                to="/admin/products"
                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary transition-all font-semibold flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Manage Products
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Store className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalVendors}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Vendors</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.pendingVendors}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Pending Approval</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-nvm-green-500 to-nvm-green-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalProducts}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Products</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalOrders}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-nvm-gold-400 to-nvm-gold-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8" />
              <span className="text-2xl font-bold">{formatRands(stats.totalRevenue)}</span>
            </div>
            <p className="text-sm font-medium opacity-90">Total Revenue</p>
          </motion.div>
        </div>

        {/* Vendor Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <VendorMap vendors={allVendors} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Vendor Approvals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">
                Pending Vendor Approvals
              </h2>

              {pendingVendors.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVendors.map((vendor: any) => (
                    <motion.div
                      key={vendor._id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-3">
                          {vendor.logo?.url && (
                            <img
                              src={vendor.logo.url}
                              alt={vendor.storeName}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-nvm-dark-900">{vendor.storeName}</h3>
                            <p className="text-sm text-gray-500">{vendor.category}</p>
                            <p className="text-xs text-gray-400">{vendor.email}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveVendor(vendor._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectVendor(vendor._id, vendor.storeName)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">
                Recent Orders
              </h2>

              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <motion.div
                      key={order._id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-nvm-dark-900">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
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
