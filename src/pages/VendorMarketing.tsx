import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorMarketingAPI } from '../lib/api';
import toast from 'react-hot-toast';

export function VendorMarketing() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ coupons: [], bundles: [], flashSales: [], promotedListings: [] });
  const [coupon, setCoupon] = useState({
    code: '',
    discountType: 'PERCENT',
    amount: 10,
    minSpend: 0,
    startAt: '',
    endAt: '',
    maxUses: 0,
    active: true
  });

  const [bundle, setBundle] = useState({ title: '', productIds: '', bundlePrice: '', discountPercent: '', active: true });
  const [flashSale, setFlashSale] = useState({ productIds: '', discount: 15, startAt: '', endAt: '', active: true });
  const [promoted, setPromoted] = useState({ productId: '', placement: 'HOMEPAGE', startAt: '', endAt: '', status: 'ACTIVE' });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await vendorMarketingAPI.getAll();
      setData(response.data?.data || { coupons: [], bundles: [], flashSales: [], promotedListings: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createCoupon = async () => {
    if (!coupon.code.trim()) return toast.error('Coupon code is required');
    try {
      await vendorMarketingAPI.createCoupon({
        ...coupon,
        startAt: coupon.startAt || undefined,
        endAt: coupon.endAt || undefined
      });
      toast.success('Coupon created');
      setCoupon({ code: '', discountType: 'PERCENT', amount: 10, minSpend: 0, startAt: '', endAt: '', maxUses: 0, active: true });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const createBundle = async () => {
    if (!bundle.title.trim()) return toast.error('Bundle title is required');
    const productIds = bundle.productIds.split(',').map((v) => v.trim()).filter(Boolean);
    if (!productIds.length) return toast.error('Enter at least one product ID');
    try {
      await vendorMarketingAPI.createBundle({
        title: bundle.title,
        productIds,
        bundlePrice: bundle.bundlePrice ? Number(bundle.bundlePrice) : undefined,
        discountPercent: bundle.discountPercent ? Number(bundle.discountPercent) : undefined,
        active: bundle.active
      });
      toast.success('Bundle created');
      setBundle({ title: '', productIds: '', bundlePrice: '', discountPercent: '', active: true });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create bundle');
    }
  };

  const createFlashSale = async () => {
    const productIds = flashSale.productIds.split(',').map((v) => v.trim()).filter(Boolean);
    if (!productIds.length || !flashSale.startAt || !flashSale.endAt) {
      return toast.error('Products, start, and end are required');
    }
    try {
      await vendorMarketingAPI.createFlashSale({
        productIds,
        discount: Number(flashSale.discount),
        startAt: flashSale.startAt,
        endAt: flashSale.endAt,
        active: flashSale.active
      });
      toast.success('Flash sale created');
      setFlashSale({ productIds: '', discount: 15, startAt: '', endAt: '', active: true });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create flash sale');
    }
  };

  const createPromoted = async () => {
    if (!promoted.productId || !promoted.startAt || !promoted.endAt) return toast.error('Product, start, and end are required');
    try {
      await vendorMarketingAPI.createPromotedListing(promoted);
      toast.success('Promoted listing created');
      setPromoted({ productId: '', placement: 'HOMEPAGE', startAt: '', endAt: '', status: 'ACTIVE' });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create promoted listing');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Marketing Tools</h1>
        <p className="text-gray-600 mb-6">Manage coupons, bundles, flash sales, and promoted listings.</p>

        {loading ? <div className="bg-white border rounded-xl p-6">Loading marketing data...</div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">Create Coupon</h2>
            <div className="grid grid-cols-2 gap-2">
              <input className="border rounded p-2" placeholder="Code" value={coupon.code} onChange={(e) => setCoupon((p) => ({ ...p, code: e.target.value }))} />
              <select className="border rounded p-2" value={coupon.discountType} onChange={(e) => setCoupon((p) => ({ ...p, discountType: e.target.value }))}>
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed</option>
              </select>
              <input className="border rounded p-2" type="number" placeholder="Amount" value={coupon.amount} onChange={(e) => setCoupon((p) => ({ ...p, amount: Number(e.target.value) }))} />
              <input className="border rounded p-2" type="number" placeholder="Min Spend" value={coupon.minSpend} onChange={(e) => setCoupon((p) => ({ ...p, minSpend: Number(e.target.value) }))} />
              <input className="border rounded p-2" type="datetime-local" value={coupon.startAt} onChange={(e) => setCoupon((p) => ({ ...p, startAt: e.target.value }))} />
              <input className="border rounded p-2" type="datetime-local" value={coupon.endAt} onChange={(e) => setCoupon((p) => ({ ...p, endAt: e.target.value }))} />
              <input className="border rounded p-2" type="number" placeholder="Max Uses" value={coupon.maxUses} onChange={(e) => setCoupon((p) => ({ ...p, maxUses: Number(e.target.value) }))} />
            </div>
            <button onClick={createCoupon} className="mt-3 px-4 py-2 bg-nvm-green-primary text-white rounded">Create Coupon</button>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">Create Bundle</h2>
            <div className="grid grid-cols-1 gap-2">
              <input className="border rounded p-2" placeholder="Title" value={bundle.title} onChange={(e) => setBundle((p) => ({ ...p, title: e.target.value }))} />
              <input className="border rounded p-2" placeholder="Product IDs (comma separated)" value={bundle.productIds} onChange={(e) => setBundle((p) => ({ ...p, productIds: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded p-2" type="number" placeholder="Bundle Price" value={bundle.bundlePrice} onChange={(e) => setBundle((p) => ({ ...p, bundlePrice: e.target.value }))} />
                <input className="border rounded p-2" type="number" placeholder="Discount %" value={bundle.discountPercent} onChange={(e) => setBundle((p) => ({ ...p, discountPercent: e.target.value }))} />
              </div>
            </div>
            <button onClick={createBundle} className="mt-3 px-4 py-2 bg-nvm-green-primary text-white rounded">Create Bundle</button>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">Create Flash Sale</h2>
            <div className="grid grid-cols-1 gap-2">
              <input className="border rounded p-2" placeholder="Product IDs (comma separated)" value={flashSale.productIds} onChange={(e) => setFlashSale((p) => ({ ...p, productIds: e.target.value }))} />
              <input className="border rounded p-2" type="number" placeholder="Discount %" value={flashSale.discount} onChange={(e) => setFlashSale((p) => ({ ...p, discount: Number(e.target.value) }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded p-2" type="datetime-local" value={flashSale.startAt} onChange={(e) => setFlashSale((p) => ({ ...p, startAt: e.target.value }))} />
                <input className="border rounded p-2" type="datetime-local" value={flashSale.endAt} onChange={(e) => setFlashSale((p) => ({ ...p, endAt: e.target.value }))} />
              </div>
            </div>
            <button onClick={createFlashSale} className="mt-3 px-4 py-2 bg-nvm-green-primary text-white rounded">Create Flash Sale</button>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-3">Create Promoted Listing</h2>
            <div className="grid grid-cols-1 gap-2">
              <input className="border rounded p-2" placeholder="Product ID" value={promoted.productId} onChange={(e) => setPromoted((p) => ({ ...p, productId: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <select className="border rounded p-2" value={promoted.placement} onChange={(e) => setPromoted((p) => ({ ...p, placement: e.target.value }))}>
                  <option value="HOMEPAGE">Homepage</option>
                  <option value="SEARCH">Search</option>
                  <option value="CATEGORY">Category</option>
                </select>
                <select className="border rounded p-2" value={promoted.status} onChange={(e) => setPromoted((p) => ({ ...p, status: e.target.value }))}>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="ENDED">Ended</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded p-2" type="datetime-local" value={promoted.startAt} onChange={(e) => setPromoted((p) => ({ ...p, startAt: e.target.value }))} />
                <input className="border rounded p-2" type="datetime-local" value={promoted.endAt} onChange={(e) => setPromoted((p) => ({ ...p, endAt: e.target.value }))} />
              </div>
            </div>
            <button onClick={createPromoted} className="mt-3 px-4 py-2 bg-nvm-green-primary text-white rounded">Create Listing</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Coupons</h3>
            <div className="space-y-2 text-sm">
              {(data.coupons || []).length === 0 ? <div className="text-gray-500">No coupons yet</div> : null}
              {(data.coupons || []).map((item: any) => (
                <div key={item._id} className="border rounded p-2 flex justify-between">
                  <span>{item.code} - {item.discountType} {item.amount}</span>
                  <span className={item.active ? 'text-green-600' : 'text-gray-500'}>{item.active ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-3">Flash Sales</h3>
            <div className="space-y-2 text-sm">
              {(data.flashSales || []).length === 0 ? <div className="text-gray-500">No flash sales yet</div> : null}
              {(data.flashSales || []).map((item: any) => (
                <div key={item._id} className="border rounded p-2 flex justify-between">
                  <span>{item.discount}% off ({(item.productIds || []).length} products)</span>
                  <span className={item.active ? 'text-green-600' : 'text-gray-500'}>{item.active ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

