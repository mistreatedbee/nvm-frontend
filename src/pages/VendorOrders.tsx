import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { LoadingScreen } from '../components/LoadingScreen';
import { ordersAPI, vendorsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { DEFAULT_IMAGE_DATA_URI } from '../lib/images';
import toast from 'react-hot-toast';
import { 
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Filter
} from 'lucide-react';

export function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [vendor, setVendor] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [vendorRes, ordersRes] = await Promise.all([
        vendorsAPI.getMyProfile(),
        ordersAPI.getVendorOrders(statusFilter !== 'all' ? { status: statusFilter } : {})
      ]);
      setVendor(vendorRes.data.data);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      toast.loading('Updating order status...');
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.dismiss();
      toast.success('Order status updated successfully!');
      fetchData();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Package className="w-4 h-4" /> },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Truck className="w-4 h-4" /> },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
    };
    return badges[status] || badges.pending;
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: any = {
      pending: 'processing',
      processing: 'shipped',
      shipped: 'delivered',
    };
    return statusFlow[currentStatus];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingScreen title="Loading orders…" subtitle="Fetching your latest orders" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">You need to create a vendor profile first</p>
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">
              My Orders
            </h1>
          </div>
          <p className="text-gray-600">Manage your incoming orders</p>
        </motion.div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            orders.map((order: any) => {
              const badge = getStatusBadge(order.status);
              const nextStatus = getNextStatus(order.status);
              
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-nvm-dark-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('en-ZA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text} flex items-center gap-1`}>
                        {badge.icon}
                        {order.status}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-nvm-gold-primary text-lg">
                          {formatRands(order.total)}
                        </div>
                        <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Customer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>{' '}
                        <span className="font-medium">{order.user?.name || order.shippingAddress?.fullName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>{' '}
                        <span className="font-medium">{order.user?.email || 'N/A'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Address:</span>{' '}
                        <span className="font-medium">
                          {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                          {order.shippingAddress?.zipCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product?.images?.[0]?.url || item.image || DEFAULT_IMAGE_DATA_URI}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-nvm-gold-primary">
                            {formatRands(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {nextStatus && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <button
                        onClick={() => handleUpdateOrderStatus(order._id, nextStatus)}
                        className="w-full md:w-auto px-6 py-2 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-dark transition-colors font-semibold"
                      >
                        Mark as {nextStatus}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
