import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { toolkitAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { sanitizeHtml } from '../utils/sanitizeHtml';

type Tab = 'INSIGHTS' | 'PRODUCTS' | 'PLAYBOOK';

export function VendorToolkit() {
  const [tab, setTab] = useState<Tab>('INSIGHTS');
  const [range, setRange] = useState('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sort, setSort] = useState('bestSelling');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [moduleDetail, setModuleDetail] = useState<any>(null);
  const [lessonDetail, setLessonDetail] = useState<any>(null);

  const queryParams = useMemo(() => {
    if (range !== 'custom') return { range };
    return { range, from: customFrom || undefined, to: customTo || undefined };
  }, [range, customFrom, customTo]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [summaryRes, productsRes, modulesRes] = await Promise.all([
          toolkitAPI.getSummary(queryParams),
          toolkitAPI.getProducts({ ...queryParams, sort }),
          toolkitAPI.getPlaybookModules()
        ]);
        setSummary(summaryRes.data.data);
        setProducts(productsRes.data.data || []);
        setModules(modulesRes.data.data || []);
        if (!moduleDetail && (modulesRes.data.data || []).length > 0) {
          const firstModule = modulesRes.data.data[0];
          const moduleRes = await toolkitAPI.getPlaybookModule(firstModule.slug);
          setModuleDetail(moduleRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load toolkit');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [queryParams, sort]);

  const openModule = async (slug: string) => {
    try {
      const res = await toolkitAPI.getPlaybookModule(slug);
      setModuleDetail(res.data.data);
      setLessonDetail(null);
      setTab('PLAYBOOK');
    } catch (_error) {}
  };

  const openLesson = async (slug: string) => {
    try {
      const res = await toolkitAPI.getPlaybookLesson(slug);
      setLessonDetail(res.data.data);
    } catch (_error) {}
  };

  const updateChecklist = async (lessonId: string, nextChecklist: Record<string, boolean>, completed?: boolean) => {
    try {
      await toolkitAPI.updateProgress({ lessonId, checklistUpdates: nextChecklist, completed });
      if (lessonDetail?.lesson?._id === lessonId) {
        setLessonDetail((prev: any) => ({ ...prev, progress: { ...prev.progress, checklistState: nextChecklist, ...(typeof completed === 'boolean' ? { completed } : {}) } }));
      }
      if (moduleDetail?.module?.slug) {
        const refresh = await toolkitAPI.getPlaybookModule(moduleDetail.module.slug);
        setModuleDetail(refresh.data.data);
      }
    } catch (_error) {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Toolkit</h1>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setTab('INSIGHTS')} className={`px-4 py-2 rounded-lg border ${tab === 'INSIGHTS' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Sales Insights</button>
          <button onClick={() => setTab('PRODUCTS')} className={`px-4 py-2 rounded-lg border ${tab === 'PRODUCTS' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Product Performance</button>
          <button onClick={() => setTab('PLAYBOOK')} className={`px-4 py-2 rounded-lg border ${tab === 'PLAYBOOK' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Creator Playbook</button>
        </div>

        <div className="bg-white border rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom</option>
          </select>
          {range === 'custom' && (
            <>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-3 py-2 border rounded-lg" />
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-3 py-2 border rounded-lg" />
            </>
          )}
          {tab === 'PRODUCTS' && (
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 border rounded-lg">
              <option value="bestSelling">Best Selling</option>
              <option value="mostViewed">Most Viewed</option>
              <option value="highestRevenue">Highest Revenue</option>
              <option value="bestConversion">Best Conversion</option>
              <option value="lowestConversion">Lowest Conversion</option>
            </select>
          )}
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="space-y-3">
            <div className="h-16 bg-white border rounded-lg animate-pulse" />
            <div className="h-60 bg-white border rounded-lg animate-pulse" />
          </div>
        ) : tab === 'INSIGHTS' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Revenue</p><p className="text-xl font-bold">{formatRands(summary?.totalRevenue || 0)}</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-bold">{summary?.totalOrders || 0}</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Units Sold</p><p className="text-xl font-bold">{summary?.totalUnitsSold || 0}</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Avg Order Value</p><p className="text-xl font-bold">{formatRands(summary?.avgOrderValue || 0)}</p></div>
              <div className="bg-white border rounded-lg p-4"><p className="text-xs text-gray-500">Repeat Customers</p><p className="text-xl font-bold">{summary?.repeatCustomersCount || 0}</p></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-4">
                <h2 className="font-semibold mb-3">Revenue By Day</h2>
                {(summary?.revenueByDay || []).length === 0 ? <p className="text-sm text-gray-500">No sales yet.</p> : (
                  <div className="space-y-2">
                    {(summary?.revenueByDay || []).map((d: any) => (
                      <div key={d.date} className="flex items-center justify-between border rounded px-3 py-2">
                        <p className="text-sm">{d.date}</p>
                        <p className="text-sm font-semibold">{formatRands(d.revenue)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white border rounded-lg p-4">
                <h2 className="font-semibold mb-3">Top Products</h2>
                {(summary?.topProducts || []).length === 0 ? <p className="text-sm text-gray-500">No top products yet.</p> : (
                  <div className="space-y-2">
                    {(summary?.topProducts || []).map((p: any) => (
                      <div key={p.productId} className="flex items-center justify-between border rounded px-3 py-2">
                        <p className="text-sm">{p.name || 'Product'}</p>
                        <p className="text-sm font-semibold">{formatRands(p.revenue || 0)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : tab === 'PRODUCTS' ? (
          <div className="bg-white border rounded-lg overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Product</th>
                  <th className="text-left px-3 py-2">Views</th>
                  <th className="text-left px-3 py-2">Clicks</th>
                  <th className="text-left px-3 py-2">Add-to-cart</th>
                  <th className="text-left px-3 py-2">Purchases</th>
                  <th className="text-left px-3 py-2">Conversion</th>
                  <th className="text-left px-3 py-2">Revenue</th>
                  <th className="text-left px-3 py-2">Units</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={8} className="px-3 py-6 text-center text-gray-500">No product analytics yet.</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.productId} className="border-t">
                      <td className="px-3 py-2">
                        <button onClick={async () => {
                          const detail = await toolkitAPI.getProductDetail(p.productId, queryParams);
                          alert(`Traffic Sources\n${(detail.data.data.trafficSources || []).map((s: any) => `${s.source}: ${s.count}`).join('\n') || 'No data'}`);
                        }} className="text-nvm-green-700 hover:underline">{p.name}</button>
                      </td>
                      <td className="px-3 py-2">{p.viewsCount}</td>
                      <td className="px-3 py-2">{p.clicksCount}</td>
                      <td className="px-3 py-2">{p.addToCartCount}</td>
                      <td className="px-3 py-2">{p.purchasesCount}</td>
                      <td className="px-3 py-2">{p.conversionRate}%</td>
                      <td className="px-3 py-2">{formatRands(p.revenue)}</td>
                      <td className="px-3 py-2">{p.unitsSold}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Modules</h2>
              <div className="space-y-2">
                {modules.map((module) => (
                  <button key={module._id} onClick={() => openModule(module.slug)} className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50">
                    <p className="font-medium">{module.title}</p>
                    <p className="text-xs text-gray-500">{module.completionPercent || 0}% complete</p>
                  </button>
                ))}
                {modules.length === 0 && <p className="text-sm text-gray-500">No playbook modules published yet.</p>}
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Lessons</h2>
              {!moduleDetail ? <p className="text-sm text-gray-500">Select a module.</p> : (
                <div className="space-y-2">
                  {(moduleDetail.lessons || []).map((lesson: any) => (
                    <button key={lesson._id} onClick={() => openLesson(lesson.slug)} className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50">
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{lesson.progress?.completed ? 'Completed' : 'Not completed'}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h2 className="font-semibold mb-3">Lesson Detail</h2>
              {!lessonDetail ? <p className="text-sm text-gray-500">Select a lesson.</p> : (
                <div className="space-y-4">
                  <h3 className="font-semibold">{lessonDetail.lesson.title}</h3>
                  <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeHtml(lessonDetail.lesson.content || '') }} />
                  {(lessonDetail.lesson.checklistItems || []).length > 0 && (
                    <div className="space-y-2">
                      {(lessonDetail.lesson.checklistItems || []).map((item: any) => {
                        const checked = Boolean(lessonDetail.progress?.checklistState?.[item.key]);
                        return (
                          <label key={item.key} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const next = { ...(lessonDetail.progress?.checklistState || {}), [item.key]: e.target.checked };
                                updateChecklist(lessonDetail.lesson._id, next);
                              }}
                            />
                            {item.text}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const next = { ...(lessonDetail.progress?.checklistState || {}) };
                      updateChecklist(lessonDetail.lesson._id, next, !lessonDetail.progress?.completed);
                    }}
                    className="px-3 py-2 rounded-lg border"
                  >
                    {lessonDetail.progress?.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
