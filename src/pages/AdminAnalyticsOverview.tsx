import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { adminSuiteAPI } from '../lib/api';
import { formatRands } from '../lib/currency';

export function AdminAnalyticsOverview() {
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('30d');
  const [data, setData] = useState<any>(null);

  const load = async (nextRange = range) => {
    setLoading(true);
    try {
      const res = await adminSuiteAPI.analytics.overview({ range: nextRange });
      setData(res.data.data || null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(range); }, [range]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-nvm-dark-900">Admin Analytics</h1>
            <p className="text-gray-600">Real GMV/revenue and top performers from paid orders.</p>
          </div>
          <select className="border rounded px-3 py-2" value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 10 }).map((_, idx) => <div key={idx} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">GMV</div><div className="text-xl font-bold">{formatRands(data?.gmvTotal || 0)}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Revenue</div><div className="text-xl font-bold">{formatRands(data?.revenue || 0)}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Orders</div><div className="text-xl font-bold">{data?.orderCount || 0}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Paid Orders</div><div className="text-xl font-bold">{data?.paidOrderCount || 0}</div></div>
              <div className="bg-white border rounded-xl p-4"><div className="text-xs text-gray-500">Avg Order Value</div><div className="text-xl font-bold">{formatRands(data?.avgOrderValue || 0)}</div></div>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">GMV by Day</h2>
              <div className="space-y-1">
                {(data?.gmvByDay || []).map((row: any) => (
                  <div key={row.date} className="text-sm text-gray-700">{row.date}: {formatRands(row.total || 0)}</div>
                ))}
                {!data?.gmvByDay?.length && <p className="text-gray-500">No daily records in this range.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Top Vendors</h3>
                <div className="space-y-2">
                  {(data?.topVendors || []).map((row: any) => (
                    <div key={row.vendorId || row.storeName} className="text-sm border rounded p-2">{row.storeName} • {formatRands(row.revenue || 0)} • {row.orders || 0} orders</div>
                  ))}
                  {!data?.topVendors?.length && <p className="text-gray-500">No vendor data.</p>}
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Top Categories</h3>
                <div className="space-y-2">
                  {(data?.topCategories || []).map((row: any) => (
                    <div key={row.categoryId || row.name} className="text-sm border rounded p-2">{row.name} • {formatRands(row.revenue || 0)} • {row.orders || 0} orders</div>
                  ))}
                  {!data?.topCategories?.length && <p className="text-gray-500">No category data.</p>}
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4">
                <h3 className="font-semibold mb-2">Top Products</h3>
                <div className="space-y-2">
                  {(data?.topProducts || []).map((row: any) => (
                    <div key={row.productId || row.title} className="text-sm border rounded p-2">{row.title} • {formatRands(row.revenue || 0)} • {row.units || 0} units</div>
                  ))}
                  {!data?.topProducts?.length && <p className="text-gray-500">No product data.</p>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

