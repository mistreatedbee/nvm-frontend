import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { VendorOrderTracking } from '../components/VendorOrderTracking';
import { orderManagementAPI, ordersAPI, invoicesAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import {
  Package,
  CheckCircle,
  XCircle,
  FileImage,
  Download,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Truck,
  ArrowLeft,
  Clock
} from 'lucide-react';

export function VendorOrderManagement() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(orderId!);
      setOrder(response.data.data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!confirm('Confirm that you have received this payment?')) return;

    setActionLoading(true);
    try {
      await orderManagementAPI.confirmPayment(orderId!);
      toast.success('Payment confirmed successfully!');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    const reason = prompt('Enter reason for rejecting payment:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await orderManagementAPI.rejectPayment(orderId!, { reason });
      toast.success('Payment rejected');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      await orderManagementAPI.updateStatus(orderId!, { status: newStatus });
      toast.success('Order status updated!');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await invoicesAPI.download(orderId!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded!');
    } catch (error) {
      toast.error('Failed to download invoice');
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <button
            onClick={() => navigate('/vendor/orders')}
            className="px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      'awaiting-confirmation': 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/vendor/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  Payment: {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Proof Section */}
            {order.paymentMethod === 'eft' || order.paymentMethod === 'bank-transfer' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                  <FileImage className="w-6 h-6" />
                  Payment Proof
                </h2>

                {order.paymentProof ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <img
                        src={order.paymentProof.url}
                        alt="Payment proof"
                        className="w-full max-h-96 object-contain rounded"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Uploaded: {new Date(order.paymentProof.uploadedAt).toLocaleString('en-ZA')}
                      </p>
                    </div>

                    {order.paymentStatus === 'awaiting-confirmation' && (
                      <div className="flex gap-3">
                        <button
                          onClick={handleConfirmPayment}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Confirm Payment Received
                        </button>
                        <button
                          onClick={handleRejectPayment}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject Payment
                        </button>
                      </div>
                    )}

                    {order.paymentStatus === 'paid' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">Payment Confirmed</span>
                        </div>
                        {order.paymentConfirmedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Confirmed on: {new Date(order.paymentConfirmedAt).toLocaleString('en-ZA')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">Awaiting Payment Proof</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-1">
                      Customer has not uploaded payment proof yet.
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Order Tracking Component */}
            <VendorOrderTracking
              orderId={orderId!}
              orderStatus={order.status}
              fulfillmentMethod={order.fulfillmentMethod || 'delivery'}
              onUpdate={fetchOrder}
            />

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-nvm-dark-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                    <img
                      src={item.image || 'https://via.placeholder.com/80'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-nvm-gold-500">{formatRands(item.price)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-nvm-gold-500">{formatRands(item.subtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatRands(order.subtotal)}</span>
                  </div>
                  {order.shippingCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{formatRands(order.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-nvm-gold-500">{formatRands(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Customer Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Name</p>
                  <p className="font-medium">{order.shippingAddress?.fullName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="font-medium">{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
              <div className="text-sm space-y-2">
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.zipCode}</p>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleDownloadInvoice}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

