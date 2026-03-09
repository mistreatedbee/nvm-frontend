import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { adminOrdersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';

const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [vendorId, setVendorId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadOrders();
  }, [status, paymentStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 30 };
      if (status !== 'all') params.status = status;
      if (paymentStatus !== 'all') params.paymentStatus = paymentStatus;
      if (query.trim()) params.q = query.trim();
      if (vendorId.trim()) params.vendorId = vendorId.trim();
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const response = await adminOrdersAPI.getOrders(params);
      setOrders(response.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const openOrder = async (orderId: string) => {
    try {
      const response = await adminOrdersAPI.getById(orderId);
      setSelectedOrder(response.data.data?.order || null);
      setTimeline(response.data.data?.timeline || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load order details');
    }
  };

  const handleStatusOverride = async () => {
    if (!selectedOrder?._id) return;
    const nextStatus = prompt(`Enter status (${ORDER_STATUSES.join(', ')})`, selectedOrder.orderStatus || 'PENDING');
    if (!nextStatus) return;
    const reason = prompt('Reason for override') || '';
    try {
      await adminOrdersAPI.updateStatus(selectedOrder._id, { status: nextStatus, reason });
      toast.success('Order status updated');
      await openOrder(selectedOrder._id);
      await loadOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to override order status');
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder?._id) return;
    const reason = prompt('Cancellation reason');
    if (!reason) return;
    try {
      await adminOrdersAPI.cancel(selectedOrder._id, { reason });
      toast.success('Order cancellation applied');
      await openOrder(selectedOrder._id);
      await loadOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-nvm-dark-900">Admin Orders Oversight</h1>
          <p className="text-gray-600">Full order visibility with status and cancellation controls</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order/customer..."
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
            <option value="all">All payment</option>
            <option value="PENDING">PENDING</option>
            <option value="PAID">PAID</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="AWAITING-CONFIRMATION">AWAITING-CONFIRMATION</option>
          </select>
          <input
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="Vendor ID"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button onClick={loadOrders} className="px-3 py-2 bg-nvm-green-primary text-white rounded-lg">Apply</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-600">No orders found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.customerId?.name || '-'}</td>
                    <td className="px-4 py-3">{formatRands(order.totals?.total || order.total || 0)}</td>
                    <td className="px-4 py-3">{order.paymentStatus}</td>
                    <td className="px-4 py-3">{order.orderStatus}</td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => openOrder(order._id)} className="px-3 py-1 border border-gray-300 rounded-lg">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedOrder && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold">Order #{selectedOrder.orderNumber}</h2>
              <div className="flex gap-2">
                <button onClick={handleStatusOverride} className="px-3 py-2 bg-blue-500 text-white rounded-lg">Override Status</button>
                <button onClick={handleCancel} className="px-3 py-2 bg-red-500 text-white rounded-lg">Cancel Order</button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item: any) => (
                    <div key={`${item.productId}-${item.vendorId}`} className="p-3 border border-gray-100 rounded-lg text-sm">
                      <p className="font-medium">{item.titleSnapshot || item.name}</p>
                      <p>Vendor: {item.vendorId?.storeName || item.vendor?.storeName || item.vendorId}</p>
                      <p>Qty: {item.qty || item.quantity} • Status: {item.status}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Status Timeline</h3>
                {timeline.length === 0 ? (
                  <p className="text-sm text-gray-500">No timeline entries yet.</p>
                ) : (
                  <div className="space-y-2">
                    {timeline.map((entry) => (
                      <div key={entry._id} className="p-3 border border-gray-100 rounded-lg text-sm">
                        <p className="font-medium">{entry.level}: {entry.fromStatus || 'START'} {'->'} {entry.toStatus}</p>
                        <p className="text-gray-600">{entry.note || 'No note'}</p>
                        <p className="text-gray-500">{new Date(entry.createdAt).toLocaleString('en-ZA')} • {entry.actorRole}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
