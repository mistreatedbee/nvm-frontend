import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { monetizationAPI, vendorsAPI, productsAPI } from '../lib/api';

export function AdminMonetization() {
  const [settings, setSettings] = useState<any>({ defaultCommissionPercent: 10 });
  const [plans, setPlans] = useState<any[]>([]);
  const [promoted, setPromoted] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [referralEvents, setReferralEvents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [planForm, setPlanForm] = useState<any>({ name: '', priceMonthly: 0, featuresJson: '{}', isActive: true });
  const [promotedForm, setPromotedForm] = useState<any>({ vendorId: '', productId: '', placement: 'HOMEPAGE', startAt: '', endAt: '', status: 'ACTIVE' });
  const [featuredForm, setFeaturedForm] = useState<any>({ vendorId: '', isFeatured: true, featuredStartAt: '', featuredEndAt: '', sortOrder: 0 });
  const [subForm, setSubForm] = useState<any>({ vendorId: '', planId: '', status: 'ACTIVE', startAt: '', endAt: '', autoRenew: true });

  const load = async () => {
    try {
      const [settingsRes, plansRes, promotedRes, featuredRes, subscriptionsRes, eventsRes, vendorsRes, productsRes] = await Promise.all([
        monetizationAPI.getPlatformSettings(),
        monetizationAPI.listPlans({ page: 1, limit: 100 }),
        monetizationAPI.listPromotedListings({ page: 1, limit: 100 }),
        monetizationAPI.listAdminFeaturedVendors({ page: 1, limit: 100 }),
        monetizationAPI.listVendorSubscriptions({ page: 1, limit: 100 }),
        monetizationAPI.listReferralEvents({ page: 1, limit: 100 }),
        vendorsAPI.getAdminAll({ page: 1, limit: 100 }),
        productsAPI.getAdminProducts({ page: 1, limit: 100 })
      ]);
      setSettings(settingsRes.data?.data || { defaultCommissionPercent: 10 });
      setPlans(plansRes.data?.data || []);
      setPromoted(promotedRes.data?.data || []);
      setFeatured(featuredRes.data?.data || []);
      setSubscriptions(subscriptionsRes.data?.data || []);
      setReferralEvents(eventsRes.data?.data || []);
      setVendors(vendorsRes.data?.data || []);
      setProducts(productsRes.data?.data || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load monetization');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateSettings = async () => {
    try {
      await monetizationAPI.updatePlatformSettings({
        defaultCommissionPercent: Number(settings.defaultCommissionPercent || 0),
        perCategoryCommission: settings.perCategoryCommission || {},
        perVendorCommission: settings.perVendorCommission || {}
      });
      toast.success('Commission settings updated');
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-nvm-dark-900">Admin Monetization</h1>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Platform Commission</h2>
          <div className="flex flex-wrap gap-2">
            <input className="border rounded p-2" type="number" placeholder="Default commission %" value={settings.defaultCommissionPercent ?? 10} onChange={(e) => setSettings({ ...settings, defaultCommissionPercent: e.target.value })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={updateSettings}>Save</button>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Subscription Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="border rounded p-2" placeholder="Name" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Monthly price" value={planForm.priceMonthly} onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })} />
            <input className="border rounded p-2 md:col-span-2" placeholder='Features JSON: {"maxProducts":100}' value={planForm.featuresJson} onChange={(e) => setPlanForm({ ...planForm, featuresJson: e.target.value })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={async () => {
              try {
                await monetizationAPI.createPlan({
                  name: planForm.name,
                  priceMonthly: Number(planForm.priceMonthly || 0),
                  features: JSON.parse(planForm.featuresJson || '{}'),
                  isActive: !!planForm.isActive
                });
                setPlanForm({ name: '', priceMonthly: 0, featuresJson: '{}', isActive: true });
                toast.success('Plan created');
                await load();
              } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Failed to create plan');
              }
            }}>Create Plan</button>
          </div>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan._id} className="border rounded p-3 flex items-center justify-between text-sm">
                <div>{plan.name} - R {plan.priceMonthly}/month</div>
                <button className="border rounded px-2 py-1 text-xs" onClick={() => monetizationAPI.updatePlan(plan._id, { isActive: !plan.isActive }).then(load)}>Toggle Active</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Vendor Subscription Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <select className="border rounded p-2" value={subForm.vendorId} onChange={(e) => setSubForm({ ...subForm, vendorId: e.target.value })}>
              <option value="">Select vendor</option>
              {vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.storeName || vendor.email}</option>)}
            </select>
            <select className="border rounded p-2" value={subForm.planId} onChange={(e) => setSubForm({ ...subForm, planId: e.target.value })}>
              <option value="">Select plan</option>
              {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
            </select>
            <input className="border rounded p-2" type="datetime-local" value={subForm.startAt} onChange={(e) => setSubForm({ ...subForm, startAt: e.target.value })} />
            <input className="border rounded p-2" type="datetime-local" value={subForm.endAt} onChange={(e) => setSubForm({ ...subForm, endAt: e.target.value })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={async () => {
              if (!subForm.vendorId || !subForm.planId) return toast.error('Vendor and plan are required');
              await monetizationAPI.assignVendorSubscription(subForm);
              toast.success('Subscription assigned');
              await load();
            }}>Assign</button>
          </div>
          <div className="space-y-2">
            {subscriptions.map((subscription) => (
              <div key={subscription._id} className="border rounded p-3 text-sm">
                {subscription.vendorId?.storeName || subscription.vendorId} - {subscription.planId?.name || subscription.planId} ({subscription.status})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Promoted Listings + Featured Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <select className="border rounded p-2" value={promotedForm.vendorId} onChange={(e) => setPromotedForm({ ...promotedForm, vendorId: e.target.value })}>
              <option value="">Select vendor</option>
              {vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.storeName || vendor.email}</option>)}
            </select>
            <select className="border rounded p-2" value={promotedForm.productId} onChange={(e) => setPromotedForm({ ...promotedForm, productId: e.target.value })}>
              <option value="">Select product</option>
              {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
            </select>
            <select className="border rounded p-2" value={promotedForm.placement} onChange={(e) => setPromotedForm({ ...promotedForm, placement: e.target.value })}>
              <option value="HOMEPAGE">HOMEPAGE</option>
              <option value="SEARCH">SEARCH</option>
              <option value="CATEGORY">CATEGORY</option>
            </select>
            <input className="border rounded p-2" type="datetime-local" value={promotedForm.startAt} onChange={(e) => setPromotedForm({ ...promotedForm, startAt: e.target.value })} />
            <input className="border rounded p-2" type="datetime-local" value={promotedForm.endAt} onChange={(e) => setPromotedForm({ ...promotedForm, endAt: e.target.value })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={async () => {
              if (!promotedForm.vendorId || !promotedForm.productId || !promotedForm.startAt || !promotedForm.endAt) {
                return toast.error('Vendor, product and date range are required');
              }
              await monetizationAPI.createPromotedListing(promotedForm);
              toast.success('Promoted listing created');
              await load();
            }}>Create Promoted</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <select className="border rounded p-2" value={featuredForm.vendorId} onChange={(e) => setFeaturedForm({ ...featuredForm, vendorId: e.target.value })}>
              <option value="">Select vendor</option>
              {vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.storeName || vendor.email}</option>)}
            </select>
            <input className="border rounded p-2" type="datetime-local" value={featuredForm.featuredStartAt} onChange={(e) => setFeaturedForm({ ...featuredForm, featuredStartAt: e.target.value })} />
            <input className="border rounded p-2" type="datetime-local" value={featuredForm.featuredEndAt} onChange={(e) => setFeaturedForm({ ...featuredForm, featuredEndAt: e.target.value })} />
            <input className="border rounded p-2" type="number" placeholder="Sort order" value={featuredForm.sortOrder} onChange={(e) => setFeaturedForm({ ...featuredForm, sortOrder: Number(e.target.value) })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={async () => {
              if (!featuredForm.vendorId || !featuredForm.featuredStartAt || !featuredForm.featuredEndAt) return toast.error('Vendor and date range are required');
              await monetizationAPI.setFeaturedVendor(featuredForm);
              toast.success('Featured vendor updated');
              await load();
            }}>Set Featured</button>
          </div>
          <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <h3 className="font-medium mb-2">Promoted Listings</h3>
              {promoted.map((row) => <div key={row._id} className="border rounded p-2 mb-2">{row.productId?.name || row.productId} - {row.status}</div>)}
            </div>
            <div>
              <h3 className="font-medium mb-2">Featured Vendors</h3>
              {featured.map((row) => <div key={row._id} className="border rounded p-2 mb-2">{row.vendorId?.storeName || row.vendorId} - {row.isFeatured ? 'FEATURED' : 'OFF'}</div>)}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-2">
          <h2 className="font-semibold">Referral Events</h2>
          {referralEvents.map((event) => (
            <div key={event._id} className="border rounded p-3 flex items-center justify-between text-sm">
              <div>{event.code} - {event.status}</div>
              {event.status !== 'REWARDED' ? (
                <button className="border rounded px-2 py-1 text-xs" onClick={() => monetizationAPI.approveReferralReward(event._id).then(load)}>Approve Reward</button>
              ) : <span className="text-green-700">Rewarded</span>}
            </div>
          ))}
          {!referralEvents.length ? <p className="text-sm text-gray-500">No referral events yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
