import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { disputesAPI, ordersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { connectChatSocket } from '../lib/chatSocket';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import {
  Package, 
  Search,
  Filter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MessageCircle
} from 'lucide-react';

export function Orders() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const lastToastRef = useRef(0);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, page]);

  useEffect(() => {
    if (!token) return;
    const socket = connectChatSocket(token);
    if (!socket) return;

    const onDisputeListUpdate = (payload: { disputeId?: string; event?: string }) => {
      const now = Date.now();
      if (now - lastToastRef.current > 2500) {
        lastToastRef.current = now;
        toast('Dispute activity updated');
      }
      fetchOrders();
      if (payload?.disputeId) {
        // no-op route hint point; user can open disputes from the list action
      }
    };

    socket.on('dispute:list-updated', onDisputeListUpdate);
    return () => {
      socket.off('dispute:list-updated', onDisputeListUpdate);
    };
  }, [token, filterStatus, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      params.page = page;
      params.limit = 10;
      const response = await ordersAPI.getMyOrders(params);
      setOrders(response.data.data || []);
      setPages(response.data.pages || 1);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      await ordersAPI.reorder(orderId);
      toast.success('Items added to cart');
      navigate('/cart');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to reorder');
    }
  };

  const handleOpenDispute = async (order: any) => {
    const reason = window.prompt('Dispute reason (short):');
    if (!reason) return;
    const description = window.prompt('Describe the issue in detail:');
    if (!description) return;
    try {
      const created = await disputesAPI.create({ orderId: order._id, reason, description });
      toast.success('Dispute opened successfully');
      const disputeId = created?.data?.data?._id;
      navigate(disputeId ? `/disputes?disputeId=${disputeId}` : '/disputes');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to open dispute');
    }
  };

  const resolveOrderVendorId = (order: any) => {
    const first = order?.items?.[0];
    const candidate = first?.vendorId || first?.vendor;
    if (!candidate) return '';
    return typeof candidate === 'string' ? candidate : (candidate._id || '');
  };

  const filteredOrders = orders.filter((order: any) =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string = '') => {
    const colors: any = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      PARTIALLY_SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      PARTIALLY_DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      DELIVERED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-nvm-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-nvm-green-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">
              My Orders
            </h1>
          </div>
          <p className="text-gray-600">Track and manage your orders</p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              >
                <option value="all">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="PARTIALLY_SHIPPED">Partially Shipped</option>
                <option value="SHIPPED">Shipped</option>
                <option value="PARTIALLY_DELIVERED">Partially Delivered</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No orders found</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-6 py-3 bg-nvm-green-500 text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-nvm-dark-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {String(order.orderStatus || 'PENDING').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/orders/${order._id}/track`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      View Tracking
                    </Link>
                    <button
                      onClick={() => {
                        const vendorId = resolveOrderVendorId(order);
                        if (!vendorId) return toast.error('Vendor chat is unavailable for this order');
                        navigate(`/chat?vendorId=${vendorId}&orderId=${order._id}&type=order`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat Vendor
                    </button>
                    <button
                      onClick={() => handleReorder(order._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-black transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reorder
                    </button>
                    <button
                      onClick={() => handleOpenDispute(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Open Dispute
                    </button>
                    <Link
                      to="/disputes"
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Disputes
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items?.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <img
                        src={item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-nvm-dark-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm text-nvm-gold-primary">
                        {formatRands(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Order Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                      <p>
                        Payment: <span className={`font-semibold ${
                        order.paymentStatus === 'PAID' ? 'text-green-600' :
                        order.paymentStatus === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-nvm-gold-primary">
                      {formatRands(order.total)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
