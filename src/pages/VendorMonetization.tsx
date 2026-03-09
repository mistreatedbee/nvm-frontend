import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { monetizationAPI, subscriptionsAPI } from '../lib/api';

export function VendorMonetization() {
  const [plans, setPlans] = useState<any[]>([]);
  const [mySubscription, setMySubscription] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [codeForm, setCodeForm] = useState<any>({
    code: '',
    rewardType: 'CREDIT',
    rewardValue: 0,
    active: true
  });

  const load = async () => {
    try {
      const [plansRes, subRes, limitsRes] = await Promise.all([
        monetizationAPI.listPlans({ page: 1, limit: 50 }),
        subscriptionsAPI.getMySubscription(),
        subscriptionsAPI.checkLimits()
      ]);
      setPlans(plansRes.data?.data || []);
      setMySubscription(subRes.data?.data || null);
      setLimits(limitsRes.data?.data || null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load monetization data');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-nvm-dark-900">Vendor Monetization</h1>

        <div className="bg-white border rounded-xl p-4 space-y-2">
          <h2 className="font-semibold">Current Subscription</h2>
          {!mySubscription ? (
            <p className="text-sm text-gray-600">No active subscription data.</p>
          ) : (
            <div className="text-sm text-gray-700">
              <div>Status: {mySubscription.subscription?.status || mySubscription.status}</div>
              <div>Plan: {mySubscription.subscription?.plan || mySubscription.plan || '-'}</div>
            </div>
          )}
          {limits ? (
            <div className="text-sm text-gray-700">
              <div>Products: {limits.productsUsed} / {limits.productsLimit}</div>
              <div>Promoted listings: {limits.featuredUsed} / {limits.featuredLimit}</div>
            </div>
          ) : null}
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-2">
          <h2 className="font-semibold">Available Plans</h2>
          <div className="space-y-2">
            {plans.map((plan) => (
              <div key={plan._id} className="border rounded p-3 flex items-center justify-between">
                <div className="text-sm">{plan.name} - R {plan.priceMonthly}/month</div>
                <button className="border rounded px-2 py-1 text-xs" onClick={() => subscriptionsAPI.subscribe({ planName: plan.name, billingCycle: 'monthly', paymentMethod: 'bank-transfer' }).then(() => { toast.success('Subscription updated'); return load(); })}>Choose</button>
              </div>
            ))}
            {!plans.length ? <p className="text-sm text-gray-500">No plans available.</p> : null}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Referral Code</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input className="border rounded p-2" placeholder="Code" value={codeForm.code} onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} />
            <select className="border rounded p-2" value={codeForm.rewardType} onChange={(e) => setCodeForm({ ...codeForm, rewardType: e.target.value })}>
              <option value="CREDIT">CREDIT</option>
              <option value="PERCENT">PERCENT</option>
              <option value="FIXED">FIXED</option>
            </select>
            <input className="border rounded p-2" type="number" placeholder="Reward value" value={codeForm.rewardValue} onChange={(e) => setCodeForm({ ...codeForm, rewardValue: Number(e.target.value) })} />
            <button className="bg-nvm-green-primary text-white rounded px-3 py-2" onClick={async () => {
              if (!codeForm.code) return toast.error('Code is required');
              await monetizationAPI.createReferralCode(codeForm);
              toast.success('Referral code created');
            }}>Create Code</button>
          </div>
        </div>
      </div>
    </div>
  );
}
