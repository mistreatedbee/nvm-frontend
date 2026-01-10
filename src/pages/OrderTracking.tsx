import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { orderManagementAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import {
  MapPin,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Navigation,
  Phone,
  Mail,
  Calendar,
  ArrowLeft
} from 'lucide-react';

export function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      const response = await orderManagementAPI.getTracking(orderId!);
      setTracking(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load tracking information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6" />;
      case 'confirmed':
      case 'processing':
        return <Package className="w-6 h-6" />;
      case 'shipped':
        return <Truck className="w-6 h-6" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      'awaiting-confirmation': 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find tracking information for this order.</p>
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">
                Track Order #{tracking.orderNumber}
              </h1>
              <p className="text-gray-600">
                {tracking.fulfillmentMethod === 'delivery' ? 'Delivery Order' : 'Collection Order'}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(tracking.status)}`}>
                {tracking.status.toUpperCase()}
              </span>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(tracking.paymentStatus)}`}>
                  Payment: {tracking.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder (For future map integration) */}
            {tracking.fulfillmentMethod === 'delivery' && tracking.currentLocation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Current Location
                </h2>
                
                {/* Map Placeholder */}
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Map Integration Coming Soon</p>
                    <p className="text-sm text-gray-500">Install React-Leaflet to display map</p>
                  </div>
                </div>

                {tracking.currentLocation.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-nvm-green-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Current Position</p>
                      <p className="text-gray-600">{tracking.currentLocation.address}</p>
                      <p className="text-sm text-gray-500">
                        Updated: {new Date(tracking.currentLocation.updatedAt).toLocaleString('en-ZA')}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Collection Point Info */}
            {tracking.fulfillmentMethod === 'collection' && tracking.collectionPoint && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Collection Point
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-blue-700">Location Name</p>
                    <p className="font-medium text-blue-900">{tracking.collectionPoint.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Address</p>
                    <p className="font-medium text-blue-900">{tracking.collectionPoint.address}</p>
                  </div>
                  {tracking.collectionPoint.phone && (
                    <div>
                      <p className="text-sm text-blue-700">Phone</p>
                      <p className="font-medium text-blue-900">{tracking.collectionPoint.phone}</p>
                    </div>
                  )}
                  {tracking.collectionPoint.instructions && (
                    <div>
                      <p className="text-sm text-blue-700">Collection Instructions</p>
                      <p className="font-medium text-blue-900">{tracking.collectionPoint.instructions}</p>
                    </div>
                  )}
                </div>
                
                {/* Collection Status Indicator */}
                {tracking.status === 'shipped' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Ready for Collection!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your order is ready to be collected from the location above.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tracking Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-nvm-dark-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Tracking History
              </h2>

              <div className="space-y-6">
                {tracking.trackingHistory && tracking.trackingHistory.length > 0 ? (
                  tracking.trackingHistory
                    .slice()
                    .reverse()
                    .map((event: any, index: number) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-nvm-green-primary text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {getStatusIcon(event.status)}
                          </div>
                          {index < tracking.trackingHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="font-semibold text-gray-900 capitalize">{event.status}</p>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          {event.location?.address && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-4 h-4" />
                              {event.location.address}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(event.timestamp).toLocaleString('en-ZA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No tracking updates available yet
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-medium">
                    {new Date(tracking.createdAt).toLocaleDateString('en-ZA')}
                  </span>
                </div>
                {tracking.confirmedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confirmed</span>
                    <span className="font-medium">
                      {new Date(tracking.confirmedAt).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}
                {tracking.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipped</span>
                    <span className="font-medium">
                      {new Date(tracking.shippedAt).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}
                {tracking.estimatedDelivery && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Delivery</span>
                    <span className="font-medium text-nvm-green-primary">
                      {new Date(tracking.estimatedDelivery).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Shipping Details */}
            {tracking.shippingAddress && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Delivery Address</h3>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{tracking.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{tracking.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {tracking.shippingAddress.city}, {tracking.shippingAddress.state}
                  </p>
                  <p className="text-gray-600">
                    {tracking.shippingAddress.zipCode}, {tracking.shippingAddress.country}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600">{tracking.shippingAddress.phone}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tracking Number */}
            {tracking.trackingNumber && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-nvm-green-50 border border-nvm-green-200 rounded-xl p-6"
              >
                <h3 className="font-semibold text-nvm-green-900 mb-2">Tracking Number</h3>
                <p className="text-lg font-mono font-bold text-nvm-green-700">
                  {tracking.trackingNumber}
                </p>
                {tracking.carrier && (
                  <p className="text-sm text-nvm-green-600 mt-1">Carrier: {tracking.carrier}</p>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

