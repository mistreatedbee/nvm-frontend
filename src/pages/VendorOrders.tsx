import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorOrdersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const getAllowedNextStatuses = (status: string) => {
  const flow: Record<string, string[]> = {
    PENDING: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['PACKING', 'CANCELLED'],
    PACKING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'CANCELLED']
  };
  return flow[status] || [];
};

export function VendorOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState('');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const response = await vendorOrdersAPI.getOrders(params);
      setOrders(response.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load vendor orders');
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (orderId: string, productId: string, nextStatus: string) => {
    const key = `${orderId}:${productId}:status`;
    setUpdatingKey(key);
    try {
      await vendorOrdersAPI.updateItemStatus(orderId, productId, { status: nextStatus });
      toast.success('Item status updated');
      await loadOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update item status');
    } finally {
      setUpdatingKey('');
    }
  };

  const updateTracking = async (orderId: string, productId: string) => {
    const carrier = prompt('Carrier name') || '';
    const trackingNumber = prompt('Tracking number') || '';
    const trackingUrl = prompt('Tracking URL (optional)') || '';
    if (!carrier && !trackingNumber && !trackingUrl) return;

    const key = `${orderId}:${productId}:tracking`;
    setUpdatingKey(key);
    try {
      await vendorOrdersAPI.updateItemTracking(orderId, productId, { carrier, trackingNumber, trackingUrl });
      toast.success('Tracking updated');
      await loadOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update tracking');
    } finally {
      setUpdatingKey('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-nvm-dark-900">Vendor Fulfilment</h1>
            <p className="text-gray-600">Manage only your order items</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All</option>
            {['PENDING', 'ACCEPTED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-600">Loading vendor orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-600">No orders found</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="font-semibold text-nvm-dark-900">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('en-ZA')}</p>
                    <p className="text-sm text-gray-600">Order status: {order.orderStatus}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>Customer: {order.customerId?.name || 'N/A'}</p>
                    <p>Total: <span className="font-semibold">{formatRands(order.totals?.total || order.total || 0)}</span></p>
                  </div>
                </div>

                {order.deliveryAddress && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="font-medium">Delivery</p>
                    <p>{order.deliveryAddress.fullName} • {order.deliveryAddress.phone}</p>
                    <p>{order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {order.items.map((item: any) => {
                    const productId = item.productId?._id || item.productId || item.product;
                    const status = item.status;
                    return (
                      <div key={`${order._id}:${productId}`} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{item.titleSnapshot || item.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty {item.qty || item.quantity} • {formatRands(item.priceSnapshot || item.price)}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">Status: {status}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-nvm-gold-primary">{formatRands(item.lineTotal || item.subtotal)}</p>
                          </div>
                        </div>

                        {item.tracking?.trackingNumber && (
                          <p className="text-sm text-gray-600 mt-2">
                            Tracking: {item.tracking.carrier || 'Carrier'} • {item.tracking.trackingNumber}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-3">
                          {getAllowedNextStatuses(status).map((candidate) => (
                            <button
                              key={candidate}
                              disabled={!!updatingKey}
                              onClick={() => updateItemStatus(order._id, productId, candidate)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
                            >
                              {candidate === 'ACCEPTED' ? <CheckCircle className="w-4 h-4 inline mr-1" /> : null}
                              {candidate === 'SHIPPED' ? <Truck className="w-4 h-4 inline mr-1" /> : null}
                              {candidate === 'CANCELLED' ? <XCircle className="w-4 h-4 inline mr-1" /> : null}
                              {candidate}
                            </button>
                          ))}
                          <button
                            disabled={!!updatingKey}
                            onClick={() => updateTracking(order._id, productId)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm disabled:opacity-50"
                          >
                            <Package className="w-4 h-4 inline mr-1" />
                            Update Tracking
                          </button>
                        </div>

                        {updatingKey && updatingKey.startsWith(`${order._id}:${productId}`) && (
                          <p className="text-xs text-gray-500 mt-2">Updating...</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
