import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { adminControlAPI, productsAPI, reviewsAPI, vendorsAPI } from '../lib/api';
import toast from 'react-hot-toast';

const tabs = ['activity', 'compliance', 'products', 'reviews', 'audit'] as const;
type Tab = (typeof tabs)[number];

function Pagination({ page, pages, onPrev, onNext }: { page: number; pages: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="text-sm text-gray-600">Page {page} of {pages || 1}</span>
      <div className="flex gap-2">
        <button onClick={onPrev} disabled={page <= 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <button onClick={onNext} disabled={page >= pages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}

export function AdminControlCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('activity');

  const [loading, setLoading] = useState(false);

  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPages, setActivityPages] = useState(1);
  const [activityFilters, setActivityFilters] = useState<any>({ action: '', role: '', q: '' });

  const [complianceRows, setComplianceRows] = useState<any[]>([]);
  const [compliancePage, setCompliancePage] = useState(1);
  const [compliancePages, setCompliancePages] = useState(1);
  const [complianceFilters, setComplianceFilters] = useState<any>({ q: '', severity: '', vendorStatus: '', flagStatus: 'OPEN' });

  const [productRows, setProductRows] = useState<any[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [productFilters, setProductFilters] = useState<any>({ status: 'PENDING', q: '' });

  const [reviewRows, setReviewRows] = useState<any[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewPages, setReviewPages] = useState(1);
  const [reviewFilters, setReviewFilters] = useState<any>({ status: 'REPORTED', q: '' });

  const [auditRows, setAuditRows] = useState<any[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPages, setAuditPages] = useState(1);
  const [auditFilters, setAuditFilters] = useState<any>({ actionType: '', targetType: '' });

  const loadActivity = async (page = activityPage) => {
    setLoading(true);
    try {
      const res = await adminControlAPI.getActivity({ page, limit: 20, ...activityFilters });
      setActivityRows(res.data.data || []);
      setActivityPage(res.data.page || page);
      setActivityPages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const loadCompliance = async (page = compliancePage) => {
    setLoading(true);
    try {
      const res = await adminControlAPI.getVendorsCompliance({ page, limit: 20, ...complianceFilters });
      setComplianceRows(res.data.data || []);
      setCompliancePage(res.data.page || page);
      setCompliancePages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load compliance');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (page = productPage) => {
    setLoading(true);
    try {
      const res = await productsAPI.getAdminProducts({ page, limit: 20, ...productFilters });
      setProductRows(res.data.data || []);
      setProductPage(res.data.currentPage || page);
      setProductPages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load products queue');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (page = reviewPage) => {
    setLoading(true);
    try {
      const res = await reviewsAPI.adminList({ page, limit: 20, ...reviewFilters, reportedOnly: reviewFilters.status === 'REPORTED' ? true : undefined });
      setReviewRows(res.data.data || []);
      setReviewPage(res.data.currentPage || page);
      setReviewPages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const loadAudit = async (page = auditPage) => {
    setLoading(true);
    try {
      const res = await adminControlAPI.getAuditLogs({ page, limit: 25, ...auditFilters });
      setAuditRows(res.data.data || []);
      setAuditPage(res.data.page || page);
      setAuditPages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') void loadActivity(1);
    if (activeTab === 'compliance') void loadCompliance(1);
    if (activeTab === 'products') void loadProducts(1);
    if (activeTab === 'reviews') void loadReviews(1);
    if (activeTab === 'audit') void loadAudit(1);
  }, [activeTab]);

  const handleProductAction = async (productId: string, action: 'approve' | 'reject' | 'unpublish' | 'republish' | 'flag') => {
    try {
      if (action === 'approve') {
        const ok = window.confirm('Approve this product?');
        if (!ok) return;
        await productsAPI.adminApprove(productId);
      }
      if (action === 'reject') {
        const ok = window.confirm('Reject this product?');
        if (!ok) return;
        const reason = window.prompt('Reason required for reject:');
        if (!reason) return;
        await productsAPI.adminReject(productId, { reason });
      }
      if (action === 'unpublish') {
        const ok = window.confirm('Unpublish this product?');
        if (!ok) return;
        const reason = window.prompt('Reason required for unpublish:');
        if (!reason) return;
        await productsAPI.adminUnpublish(productId, { reason });
      }
      if (action === 'republish') {
        const ok = window.confirm('Republish this product?');
        if (!ok) return;
        await productsAPI.adminRepublish(productId);
      }
      if (action === 'flag') {
        const ok = window.confirm('Flag this product?');
        if (!ok) return;
        const reason = window.prompt('Flag reason:');
        if (!reason) return;
        await productsAPI.adminFlag(productId, { reason, severity: 'MEDIUM' });
      }
      toast.success('Product action completed');
      await loadProducts(productPage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Action failed');
    }
  };

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'reject' | 'hide' | 'delete') => {
    try {
      if (action === 'approve') {
        const ok = window.confirm('Approve this review?');
        if (!ok) return;
        await reviewsAPI.adminApprove(reviewId);
      }
      if (action === 'reject') {
        const ok = window.confirm('Reject this review?');
        if (!ok) return;
        const reason = window.prompt('Reason required for reject:');
        if (!reason) return;
        await reviewsAPI.adminReject(reviewId, { reason });
      }
      if (action === 'hide') {
        const ok = window.confirm('Hide this review?');
        if (!ok) return;
        const reason = window.prompt('Reason required for hide:');
        if (!reason) return;
        await reviewsAPI.adminHide(reviewId, { reason });
      }
      if (action === 'delete') {
        const ok = window.confirm('Delete this review permanently?');
        if (!ok) return;
        const reason = window.prompt('Delete reason (optional):') || undefined;
        await reviewsAPI.adminDelete(reviewId, reason ? { reason } : undefined);
      }
      toast.success('Review action completed');
      await loadReviews(reviewPage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Action failed');
    }
  };

  const createFlag = async (vendorId: string) => {
    const type = window.prompt('Flag type (KYC_MISSING, DOC_EXPIRED, PROHIBITED_ITEM, TOO_MANY_REPORTS, PAYMENT_RISK, OTHER):', 'OTHER');
    if (!type) return;
    const severity = window.prompt('Severity (LOW, MEDIUM, HIGH):', 'MEDIUM');
    if (!severity) return;
    const note = window.prompt('Note (optional):', '') || '';

    try {
      await adminControlAPI.createComplianceFlag(vendorId, { type, severity: severity as any, note });
      toast.success('Compliance flag created');
      await loadCompliance(compliancePage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create compliance flag');
    }
  };

  const resolveFlag = async (flagId: string) => {
    const note = window.prompt('Resolution note (optional):', '') || '';
    try {
      await adminControlAPI.resolveComplianceFlag(flagId, { note });
      toast.success('Compliance flag resolved');
      await loadCompliance(compliancePage);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resolve flag');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-nvm-dark-900 mb-2">Admin Control Center</h1>
        <p className="text-gray-600 mb-6">Activity monitoring, compliance checks, moderation queue, and audit timeline.</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-nvm-green-primary text-white' : 'bg-white border'}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border p-4 min-h-[400px]">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="h-10 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : null}

          {!loading && activeTab === 'activity' && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <input className="border rounded px-3 py-2" placeholder="Search" value={activityFilters.q} onChange={(e) => setActivityFilters({ ...activityFilters, q: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="Action" value={activityFilters.action} onChange={(e) => setActivityFilters({ ...activityFilters, action: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="Role" value={activityFilters.role} onChange={(e) => setActivityFilters({ ...activityFilters, role: e.target.value })} />
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => loadActivity(1)}>Apply</button>
              </div>
              <div className="space-y-2">
                {activityRows.map((row) => (
                  <div key={row._id} className="border rounded p-3">
                    <div className="font-medium">{row.action} • {row.role}</div>
                    <div className="text-sm text-gray-600">{row.userId?.name || '-'} ({row.userId?.email || '-'})</div>
                    <div className="text-xs text-gray-500">{new Date(row.createdAt).toLocaleString()} • {row.entityType} • {row.ipAddress || '-'}</div>
                  </div>
                ))}
                {!activityRows.length && <p className="text-gray-500">No activity logs found.</p>}
              </div>
              <Pagination page={activityPage} pages={activityPages} onPrev={() => loadActivity(activityPage - 1)} onNext={() => loadActivity(activityPage + 1)} />
            </>
          )}

          {!loading && activeTab === 'compliance' && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <input className="border rounded px-3 py-2" placeholder="Search vendor" value={complianceFilters.q} onChange={(e) => setComplianceFilters({ ...complianceFilters, q: e.target.value })} />
                <select className="border rounded px-3 py-2" value={complianceFilters.vendorStatus} onChange={(e) => setComplianceFilters({ ...complianceFilters, vendorStatus: e.target.value })}>
                  <option value="">All vendor statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <select className="border rounded px-3 py-2" value={complianceFilters.flagStatus} onChange={(e) => setComplianceFilters({ ...complianceFilters, flagStatus: e.target.value })}>
                  <option value="">All flag statuses</option>
                  <option value="OPEN">OPEN</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
                <select className="border rounded px-3 py-2" value={complianceFilters.severity} onChange={(e) => setComplianceFilters({ ...complianceFilters, severity: e.target.value })}>
                  <option value="">All severities</option>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => loadCompliance(1)}>Apply</button>
              </div>
              <div className="space-y-2">
                {complianceRows.map((row) => (
                  <div key={row.vendor._id} className="border rounded p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{row.vendor.storeName}</div>
                        <div className="text-sm text-gray-600">{row.vendor.email || '-'} • {row.vendor.vendorStatus} • {row.vendor.verificationStatus}</div>
                        <div className="text-xs text-gray-500">Docs: A:{row.docs.APPROVED || 0} / P:{row.docs.UPLOADED || 0} / R:{row.docs.REJECTED || 0} • Open flags: {row.flags.openCount || 0} ({row.flags.highestSeverity || 'LOW'})</div>
                        {!!row.openFlags?.length && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {row.openFlags.slice(0, 3).map((flag: any) => (
                              <button
                                key={flag._id}
                                onClick={() => resolveFlag(flag._id)}
                                className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded text-xs border border-yellow-300"
                              >
                                Resolve {flag.type} ({flag.severity})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 bg-amber-600 text-white rounded text-sm" onClick={() => createFlag(row.vendor._id)}>Flag</button>
                        <button className="px-3 py-2 bg-red-700 text-white rounded text-sm" onClick={async () => {
                          const reason = window.prompt('Suspension reason:');
                          if (!reason) return;
                          await vendorsAPI.adminSuspend(row.vendor._id, { reason });
                          toast.success('Vendor suspended');
                          await loadCompliance(compliancePage);
                        }}>Suspend</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!complianceRows.length && <p className="text-gray-500">No compliance rows found.</p>}
              </div>
              <Pagination page={compliancePage} pages={compliancePages} onPrev={() => loadCompliance(compliancePage - 1)} onNext={() => loadCompliance(compliancePage + 1)} />
            </>
          )}

          {!loading && activeTab === 'products' && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <select className="border rounded px-3 py-2" value={productFilters.status} onChange={(e) => setProductFilters({ ...productFilters, status: e.target.value })}>
                  <option value="PENDING">PENDING</option>
                  <option value="FLAGGED">FLAGGED</option>
                  <option value="UNPUBLISHED">UNPUBLISHED</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
                <input className="border rounded px-3 py-2" placeholder="Search" value={productFilters.q} onChange={(e) => setProductFilters({ ...productFilters, q: e.target.value })} />
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => loadProducts(1)}>Apply</button>
              </div>
              <div className="space-y-2">
                {productRows.map((row) => (
                  <div key={row._id} className="border rounded p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-sm text-gray-600">{row.vendor?.storeName || '-'} • {row.status} • visible: {row.isActive ? 'yes' : 'no'} • reports: {row.reportCount || 0}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleProductAction(row._id, 'approve')} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                        <button onClick={() => handleProductAction(row._id, 'reject')} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                        <button onClick={() => handleProductAction(row._id, 'flag')} className="px-2 py-1 bg-amber-600 text-white rounded text-xs">Flag</button>
                        <button onClick={() => handleProductAction(row._id, 'unpublish')} className="px-2 py-1 bg-orange-700 text-white rounded text-xs">Unpublish</button>
                        <button onClick={() => handleProductAction(row._id, 'republish')} className="px-2 py-1 bg-blue-700 text-white rounded text-xs">Republish</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!productRows.length && <p className="text-gray-500">No products found.</p>}
              </div>
              <Pagination page={productPage} pages={productPages} onPrev={() => loadProducts(productPage - 1)} onNext={() => loadProducts(productPage + 1)} />
            </>
          )}

          {!loading && activeTab === 'reviews' && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <select className="border rounded px-3 py-2" value={reviewFilters.status} onChange={(e) => setReviewFilters({ ...reviewFilters, status: e.target.value })}>
                  <option value="REPORTED">REPORTED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="HIDDEN">HIDDEN</option>
                  <option value="APPROVED">APPROVED</option>
                </select>
                <input className="border rounded px-3 py-2" placeholder="Search" value={reviewFilters.q} onChange={(e) => setReviewFilters({ ...reviewFilters, q: e.target.value })} />
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => loadReviews(1)}>Apply</button>
              </div>
              <div className="space-y-2">
                {reviewRows.map((row) => (
                  <div key={row._id} className="border rounded p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{row.title || '(no title)'}</div>
                        <div className="text-sm text-gray-600">{row.status} • reports: {row.reportedCount || 0} • rating: {row.rating}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleReviewAction(row._id, 'approve')} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                        <button onClick={() => handleReviewAction(row._id, 'hide')} className="px-2 py-1 bg-yellow-600 text-white rounded text-xs">Hide</button>
                        <button onClick={() => handleReviewAction(row._id, 'reject')} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Reject</button>
                        <button onClick={() => handleReviewAction(row._id, 'delete')} className="px-2 py-1 bg-gray-800 text-white rounded text-xs">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {!reviewRows.length && <p className="text-gray-500">No reviews found.</p>}
              </div>
              <Pagination page={reviewPage} pages={reviewPages} onPrev={() => loadReviews(reviewPage - 1)} onNext={() => loadReviews(reviewPage + 1)} />
            </>
          )}

          {!loading && activeTab === 'audit' && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <input className="border rounded px-3 py-2" placeholder="ActionType" value={auditFilters.actionType} onChange={(e) => setAuditFilters({ ...auditFilters, actionType: e.target.value })} />
                <input className="border rounded px-3 py-2" placeholder="TargetType" value={auditFilters.targetType} onChange={(e) => setAuditFilters({ ...auditFilters, targetType: e.target.value })} />
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={() => loadAudit(1)}>Apply</button>
              </div>
              <div className="space-y-2">
                {auditRows.map((row) => (
                  <div key={row._id} className="border rounded p-3">
                    <div className="font-medium">{row.actionType || row.action}</div>
                    <div className="text-sm text-gray-600">{row.targetType || row.entityType} • {row.actorAdminId?.name || 'Admin'} • {new Date(row.createdAt).toLocaleString()}</div>
                    {row.reason ? <div className="text-sm text-gray-700 mt-1">Reason: {row.reason}</div> : null}
                  </div>
                ))}
                {!auditRows.length && <p className="text-gray-500">No audit logs found.</p>}
              </div>
              <Pagination page={auditPage} pages={auditPages} onPrev={() => loadAudit(auditPage - 1)} onNext={() => loadAudit(auditPage + 1)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}


