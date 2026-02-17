import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ordersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, Package, Truck } from 'lucide-react';

export function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ordersAPI.getMyOrderById(orderId!);
      setOrder(response.data.data?.order || null);
      setTimeline(response.data.data?.timeline || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order tracking');
      toast.error('Failed to load order tracking');
    } finally {
      setLoading(false);
    }
  };

  const groupedByVendor = useMemo(() => {
    const map = new Map<string, { name: string; items: any[] }>();
    (order?.items || []).forEach((item: any) => {
      const key = item.vendorId?._id || item.vendorId || item.vendor || 'unknown';
      const name = item.vendorId?.storeName || item.vendor?.storeName || 'Vendor';
      if (!map.has(String(key))) {
        map.set(String(key), { name, items: [] });
      }
      map.get(String(key))?.items.push(item);
    });
    return [...map.values()];
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-600">Loading tracking...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <p className="text-red-600 mb-4">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-5 py-2 bg-nvm-green-primary text-white rounded-lg"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-gray-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-nvm-dark-900">Order #{order.orderNumber}</h1>
              <p className="text-sm text-gray-600">
                Placed {new Date(order.createdAt).toLocaleString('en-ZA')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold">{String(order.orderStatus || 'PENDING').replace(/_/g, ' ')}</p>
              <p className="text-sm text-gray-500">Payment: {order.paymentStatus}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Items by Vendor</h2>
              {groupedByVendor.map((group) => (
                <div key={group.name} className="mb-5 last:mb-0">
                  <h3 className="font-medium text-gray-800 mb-2">{group.name}</h3>
                  <div className="space-y-3">
                    {group.items.map((item: any) => (
                      <div key={`${item.productId}-${item.vendorId}`} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.titleSnapshot || item.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty {item.qty || item.quantity} • {formatRands(item.priceSnapshot || item.price)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Status: {String(item.status).replace(/_/g, ' ')}</p>
                          </div>
                          <p className="font-semibold text-nvm-gold-primary">
                            {formatRands(item.lineTotal || item.subtotal)}
                          </p>
                        </div>
                        {item.tracking?.trackingNumber && (
                          <div className="mt-2 text-sm">
                            <p>Carrier: {item.tracking.carrier || 'N/A'}</p>
                            <p>Tracking: {item.tracking.trackingNumber}</p>
                            {item.tracking.trackingUrl && (
                              <a className="text-blue-600 underline" href={item.tracking.trackingUrl} target="_blank" rel="noreferrer">
                                Open tracking link
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Timeline</h2>
              {timeline.length === 0 ? (
                <p className="text-gray-500">No updates yet.</p>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event: any) => (
                    <div key={event._id} className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                        {event.toStatus?.includes('SHIPPED') ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.level}: {event.fromStatus || 'START'} {'->'} {event.toStatus}
                        </p>
                        {event.note ? <p className="text-sm text-gray-600">{event.note}</p> : null}
                        <p className="text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(event.createdAt).toLocaleString('en-ZA')} • {event.actorRole}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatRands(order.totals?.subtotal || order.subtotal || 0)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{formatRands(order.totals?.delivery || order.deliveryFee || 0)}</span></div>
                <div className="flex justify-between"><span>Discount</span><span>-{formatRands(order.totals?.discount || 0)}</span></div>
                <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatRands(order.totals?.total || order.total || 0)}</span></div>
              </div>
            </div>

            {order.deliveryAddress && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="font-semibold mb-3">Delivery Address</h3>
                <p className="text-sm text-gray-700">{order.deliveryAddress.fullName}</p>
                <p className="text-sm text-gray-700">{order.deliveryAddress.street}</p>
                <p className="text-sm text-gray-700">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p className="text-sm text-gray-700">{order.deliveryAddress.country} {order.deliveryAddress.zipCode}</p>
                <p className="text-sm text-gray-700 mt-1">{order.deliveryAddress.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
