import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { PaymentProofUpload } from '../components/PaymentProofUpload';
import { helpAPI, invoicesAPI, ordersAPI } from '../lib/api';
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
  const [paymentProofData, setPaymentProofData] = useState<any>(null);
  const [customerInvoice, setCustomerInvoice] = useState<any>(null);
  const [helpSuggestions, setHelpSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (!orderId) return;
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    setError('');
    setHelpSuggestions([]);
    try {
      const response = await ordersAPI.getMyOrderById(orderId!);
      setOrder(response.data.data?.order || null);
      setTimeline(response.data.data?.timeline || []);
      const [proofRes, invoiceRes] = await Promise.all([
        ordersAPI.getMyPaymentProof(orderId!),
        invoicesAPI.getData(orderId!)
      ]);
      setPaymentProofData(proofRes.data?.data || null);
      const customerInv = (invoiceRes.data?.data || []).find((inv: any) => inv.type === 'CUSTOMER') || null;
      setCustomerInvoice(customerInv);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load order tracking';
      setError(message);
      toast.error('Failed to load order tracking');
      try {
        const faqRes = await helpAPI.getFaqs({ q: message, category: 'ORDERS', page: 1, limit: 4 });
        setHelpSuggestions(faqRes.data?.data || []);
      } catch {
        setHelpSuggestions([]);
      }
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
  const firstVendorId = useMemo(() => {
    const first = order?.items?.[0];
    const candidate = first?.vendorId || first?.vendor;
    if (!candidate) return '';
    return typeof candidate === 'string' ? candidate : (candidate._id || '');
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
          {!!helpSuggestions.length && (
            <div className="mb-4 text-left max-w-2xl mx-auto bg-white border border-red-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">Recommended Help</p>
              <div className="space-y-1">
                {helpSuggestions.map((faq) => (
                  <div key={faq._id} className="text-xs text-gray-700">{faq.question}</div>
                ))}
              </div>
              <div className="mt-3 text-xs">
                <Link to="/help" className="text-nvm-green-primary font-semibold underline mr-3">Help Center</Link>
                <Link to="/support" className="text-nvm-green-primary font-semibold underline">Contact Support</Link>
              </div>
            </div>
          )}
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
          <div className="mt-4 flex flex-wrap gap-2">
            {firstVendorId && (
              <button
                onClick={() => navigate(`/chat?vendorId=${firstVendorId}&orderId=${order._id}&type=order`)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
              >
                Chat Vendor
              </button>
            )}
            <Link to={`/disputes?orderId=${order._id}`} className="px-3 py-2 rounded-lg border border-red-200 text-red-700 text-sm hover:bg-red-50">
              Open/View Dispute
            </Link>
            <Link to="/help" className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
              Help Center
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold mb-3">Invoice</h3>
            {customerInvoice ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700">Invoice #{customerInvoice.invoiceNumber}</p>
                <button
                  onClick={async () => {
                    const response = await invoicesAPI.downloadMyPdf(customerInvoice._id);
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${customerInvoice.invoiceNumber}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  }}
                  className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg"
                >
                  Download Invoice
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Invoice not available yet.</p>
            )}
          </div>
          <PaymentProofUpload
            orderId={order._id}
            existingProof={paymentProofData?.proof ? {
              url: paymentProofData.proof.fileUrl,
              uploadedAt: paymentProofData.proof.uploadedAt
            } : undefined}
            paymentStatus={paymentProofData?.paymentStatus || order.paymentStatus}
            rejectionReason={paymentProofData?.rejectionReason || ''}
            onUploadSuccess={() => { void loadOrder(); }}
          />
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
