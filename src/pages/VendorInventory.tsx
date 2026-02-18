import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { productsAPI, vendorInventoryAPI, vendorProductsAdvancedAPI } from '../lib/api';
import toast from 'react-hot-toast';

export function VendorInventory() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [thresholdByProduct, setThresholdByProduct] = useState<Record<string, number>>({});
  const [reservation, setReservation] = useState({ productId: '', sku: '', qty: 1, minutes: 15 });
  const [processing, setProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, alertsRes] = await Promise.all([
        productsAPI.getMyProducts({ limit: 100 }),
        vendorInventoryAPI.listAlerts()
      ]);
      const rows = productsRes.data?.data || [];
      setProducts(rows);
      setAlerts(alertsRes.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const upsertAlert = async (productId: string) => {
    const threshold = Number(thresholdByProduct[productId] || 5);
    try {
      await vendorInventoryAPI.upsertAlert({ productId, threshold, active: true });
      toast.success('Stock alert saved');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save alert');
    }
  };

  const reserveStock = async () => {
    if (!reservation.productId || reservation.qty <= 0) {
      toast.error('Select product and valid quantity');
      return;
    }
    try {
      setProcessing(true);
      await vendorInventoryAPI.reserveStock({
        productId: reservation.productId,
        sku: reservation.sku || undefined,
        qty: reservation.qty,
        minutes: reservation.minutes
      });
      toast.success('Stock reserved');
      setReservation({ productId: '', sku: '', qty: 1, minutes: 15 });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reserve stock');
    } finally {
      setProcessing(false);
    }
  };

  const printBarcode = async (productId: string, sku?: string) => {
    try {
      const response = await vendorProductsAdvancedAPI.barcode(productId, sku);
      const blob = new Blob([response.data], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        toast.error('Popup blocked. Please allow popups.');
        return;
      }
      setTimeout(() => {
        win.print();
      }, 400);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate barcode');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Inventory Management</h1>
        <p className="text-gray-600 mb-6">Manage stock alerts, SKU barcodes, and reservations.</p>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Stock Reservation</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              className="border rounded-lg p-2"
              value={reservation.productId}
              onChange={(e) => setReservation((prev) => ({ ...prev, productId: e.target.value }))}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              className="border rounded-lg p-2"
              placeholder="SKU (optional)"
              value={reservation.sku}
              onChange={(e) => setReservation((prev) => ({ ...prev, sku: e.target.value }))}
            />
            <input
              className="border rounded-lg p-2"
              type="number"
              min={1}
              value={reservation.qty}
              onChange={(e) => setReservation((prev) => ({ ...prev, qty: Number(e.target.value) }))}
            />
            <input
              className="border rounded-lg p-2"
              type="number"
              min={1}
              max={120}
              value={reservation.minutes}
              onChange={(e) => setReservation((prev) => ({ ...prev, minutes: Number(e.target.value) }))}
            />
            <button
              onClick={reserveStock}
              disabled={processing}
              className="bg-nvm-green-primary text-white rounded-lg px-3 py-2 disabled:opacity-60"
            >
              Reserve
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b font-semibold">Inventory by Product</div>
          {loading ? (
            <div className="p-6 text-gray-600">Loading inventory...</div>
          ) : products.length === 0 ? (
            <div className="p-6 text-gray-600">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">SKU</th>
                    <th className="p-3 text-left">Stock</th>
                    <th className="p-3 text-left">Variants</th>
                    <th className="p-3 text-left">Stock Alert</th>
                    <th className="p-3 text-right">Barcode</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: any) => (
                    <tr key={product._id} className="border-t align-top">
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.sku || '-'}</td>
                      <td className="p-3">{product.stock ?? 0}</td>
                      <td className="p-3 text-sm text-gray-700">
                        {(product.variants || []).length === 0 ? (
                          <span>-</span>
                        ) : (
                          <div className="space-y-1">
                            {product.variants.map((variant: any, index: number) => (
                              <div key={`${variant.sku || index}`} className="flex items-center gap-2">
                                <span>{variant.sku || 'No SKU'}</span>
                                <span className="text-gray-500">({variant.stock || 0})</span>
                                {variant.sku && (
                                  <button
                                    onClick={() => printBarcode(product._id, variant.sku)}
                                    className="text-xs border rounded px-2 py-0.5 hover:bg-gray-50"
                                  >
                                    Print
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            className="w-20 border rounded p-1 text-sm"
                            placeholder={String(alerts.find((a: any) => a.productId === product._id)?.threshold || 5)}
                            value={thresholdByProduct[product._id] ?? ''}
                            onChange={(e) =>
                              setThresholdByProduct((prev) => ({ ...prev, [product._id]: Number(e.target.value) }))
                            }
                          />
                          <button
                            onClick={() => upsertAlert(product._id)}
                            className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => printBarcode(product._id)}
                          className="text-xs border rounded px-2 py-1 hover:bg-gray-50"
                        >
                          Print Barcode
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

