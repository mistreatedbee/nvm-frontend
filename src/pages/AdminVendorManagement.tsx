import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { vendorsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'performance' | 'documents' | 'audit';

export function AdminVendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [verified, setVerified] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);

  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState<any>({});

  const [docPage, setDocPage] = useState(1);
  const [docPages, setDocPages] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPages, setAuditPages] = useState(1);

  const queryParams = useMemo(() => {
    const params: any = { page, limit };
    if (status !== 'all') params.status = status;
    if (verified !== 'all') params.verified = verified;
    if (search.trim()) params.q = search.trim();
    return params;
  }, [page, limit, status, verified, search]);

  useEffect(() => {
    fetchVendors();
  }, [queryParams]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await vendorsAPI.adminList(queryParams);
      setVendors(res.data.data || []);
      setPages(res.data.pages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const loadVendorDocuments = async (vendorId: string, pageNumber = 1) => {
    const res = await vendorsAPI.adminGetVendorDocuments(vendorId, { page: pageNumber, limit: 10 });
    setDocuments(res.data.data || []);
    setDocPage(res.data.page || 1);
    setDocPages(res.data.pages || 1);
  };

  const loadVendorAudit = async (vendorId: string, pageNumber = 1) => {
    const res = await vendorsAPI.adminGetAuditLogs({ vendorId, page: pageNumber, limit: 20 });
    setAuditLogs(res.data.data || []);
    setAuditPage(res.data.page || 1);
    setAuditPages(res.data.pages || 1);
  };

  const openDetails = async (vendorId: string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setActiveTab('overview');
    try {
      const [vendorRes, metricsRes] = await Promise.all([
        vendorsAPI.adminGetById(vendorId),
        vendorsAPI.adminGetVendorMetrics(vendorId)
      ]);

      const vendor = vendorRes.data.data;
      setSelectedVendor(vendor);
      setMetrics(metricsRes.data.data);
      setProfileForm({
        storeName: vendor.storeName || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        location: vendor.location || {},
        description: vendor.description || ''
      });

      await Promise.all([loadVendorDocuments(vendorId, 1), loadVendorAudit(vendorId, 1)]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load vendor details');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshSelectedVendor = async () => {
    if (!selectedVendor?._id) return;
    await openDetails(selectedVendor._id);
    await fetchVendors();
  };

  const applyAction = async (run: () => Promise<any>, successMessage: string) => {
    setActionLoading(true);
    try {
      await run();
      toast.success(successMessage);
      await refreshSelectedVendor();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (vendorId: string) =>
    applyAction(() => vendorsAPI.adminApprove(vendorId), 'Vendor approved');

  const handleReject = (vendorId: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    applyAction(() => vendorsAPI.adminReject(vendorId, { reason }), 'Vendor rejected');
  };

  const handleSuspend = (vendorId: string) => {
    const reason = prompt('Suspension reason:');
    if (!reason) return;
    applyAction(() => vendorsAPI.adminSuspend(vendorId, { reason }), 'Vendor suspended');
  };

  const handleUnsuspend = (vendorId: string) =>
    applyAction(() => vendorsAPI.adminUnsuspend(vendorId), 'Vendor unsuspended');

  const handleSaveProfile = () => {
    if (!selectedVendor?._id) return;
    applyAction(
      () => vendorsAPI.adminUpdateVendorProfile(selectedVendor._id, profileForm),
      'Vendor profile updated'
    );
  };

  const handleDocApprove = (docId: string) =>
    applyAction(() => vendorsAPI.adminApproveDocument(docId), 'Document approved');

  const handleDocReject = (docId: string) => {
    const note = prompt('Rejection note (optional):') || '';
    applyAction(() => vendorsAPI.adminRejectDocument(docId, { note }), 'Document rejected');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Vendor Management</h1>

        <div className="bg-white rounded-lg border p-4 grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Search store/email/phone"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
          <select className="border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="PENDING">PENDING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <select className="border rounded px-3 py-2" value={verified} onChange={(e) => setVerified(e.target.value)}>
            <option value="all">All Verification</option>
            <option value="UNVERIFIED">UNVERIFIED</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <button className="border rounded px-3 py-2 bg-gray-100" onClick={fetchVendors}>Refresh</button>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center">No vendors found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Store/Vendor</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Vendor Status</th>
                  <th className="text-left p-3">Verification</th>
                  <th className="text-left p-3">Created</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-t">
                    <td className="p-3">
                      <div className="font-semibold">{vendor.storeName}</div>
                      <div className="text-gray-500">{vendor.user?.name || 'N/A'}</div>
                    </td>
                    <td className="p-3">{vendor.email || '-'}</td>
                    <td className="p-3">{vendor.phone || '-'}</td>
                    <td className="p-3">{vendor.vendorStatus || '-'}</td>
                    <td className="p-3">{vendor.verificationStatus || '-'}</td>
                    <td className="p-3">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => openDetails(vendor._id)}>
                          View
                        </button>
                        <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => handleApprove(vendor._id)}>
                          Approve
                        </button>
                        <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => handleReject(vendor._id)}>
                          Reject
                        </button>
                        {(vendor.vendorStatus === 'SUSPENDED') ? (
                          <button className="px-2 py-1 bg-teal-600 text-white rounded" onClick={() => handleUnsuspend(vendor._id)}>
                            Unsuspend
                          </button>
                        ) : (
                          <button className="px-2 py-1 bg-amber-600 text-white rounded" onClick={() => handleSuspend(vendor._id)}>
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {detailsOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedVendor?.storeName || 'Vendor Details'}</h2>
              <button className="px-3 py-1 border rounded" onClick={() => setDetailsOpen(false)}>Close</button>
            </div>

            {detailsLoading ? (
              <div className="p-8 text-center">Loading details...</div>
            ) : (
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <button className={`px-3 py-1 rounded ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('overview')}>Overview</button>
                  <button className={`px-3 py-1 rounded ${activeTab === 'performance' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('performance')}>Performance</button>
                  <button className={`px-3 py-1 rounded ${activeTab === 'documents' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('documents')}>Documents</button>
                  <button className={`px-3 py-1 rounded ${activeTab === 'audit' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`} onClick={() => setActiveTab('audit')}>Audit Log</button>
                </div>

                {activeTab === 'overview' && (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <input className="border rounded px-3 py-2" placeholder="Store Name" value={profileForm.storeName || ''} onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })} />
                      <input className="border rounded px-3 py-2" placeholder="Email" value={profileForm.email || ''} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
                      <input className="border rounded px-3 py-2" placeholder="Phone" value={profileForm.phone || ''} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                      <input className="border rounded px-3 py-2" placeholder="City" value={profileForm.location?.city || ''} onChange={(e) => setProfileForm({ ...profileForm, location: { ...(profileForm.location || {}), city: e.target.value } })} />
                    </div>
                    <textarea className="w-full border rounded px-3 py-2" rows={4} placeholder="Description" value={profileForm.description || ''} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
                    <button className="px-4 py-2 bg-blue-700 text-white rounded disabled:opacity-60" disabled={actionLoading} onClick={handleSaveProfile}>
                      {actionLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="grid md:grid-cols-4 gap-3">
                    <div className="border rounded p-3"><p className="text-xs text-gray-500">Total Orders</p><p className="text-xl font-bold">{metrics?.totalOrders || 0}</p></div>
                    <div className="border rounded p-3"><p className="text-xs text-gray-500">Total Sales</p><p className="text-xl font-bold">{formatRands(metrics?.totalSales || 0)}</p></div>
                    <div className="border rounded p-3"><p className="text-xs text-gray-500">Total Reviews</p><p className="text-xl font-bold">{metrics?.totalReviews || 0}</p></div>
                    <div className="border rounded p-3"><p className="text-xs text-gray-500">Avg Rating</p><p className="text-xl font-bold">{metrics?.avgRating || 0}</p></div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <p className="text-gray-600">No documents</p>
                    ) : (
                      documents.map((doc) => (
                        <div key={doc._id} className="border rounded p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{doc.fileName}</p>
                            <p className="text-sm text-gray-600">{doc.docType} | {doc.status}</p>
                            {doc.reviewNote ? <p className="text-sm text-red-700">Note: {doc.reviewNote}</p> : null}
                          </div>
                          <div className="flex gap-2">
                            <a className="px-3 py-1 border rounded" target="_blank" rel="noreferrer" href={doc.fileUrl}>View</a>
                            <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => handleDocApprove(doc._id)}>Approve</button>
                            <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => handleDocReject(doc._id)}>Reject</button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Page {docPage} of {docPages}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={docPage <= 1} onClick={async () => selectedVendor?._id && loadVendorDocuments(selectedVendor._id, docPage - 1)}>Prev</button>
                        <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={docPage >= docPages} onClick={async () => selectedVendor?._id && loadVendorDocuments(selectedVendor._id, docPage + 1)}>Next</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-2">
                    {auditLogs.length === 0 ? (
                      <p className="text-gray-600">No audit logs</p>
                    ) : (
                      auditLogs.map((log) => (
                        <div key={log._id} className="border rounded p-3">
                          <p className="font-semibold">{log.actionType || log.action}</p>
                          <p className="text-sm text-gray-600">{new Date(log.createdAt).toLocaleString()}</p>
                          {log.metadata ? <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(log.metadata, null, 2)}</pre> : null}
                        </div>
                      ))
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Page {auditPage} of {auditPages}</span>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={auditPage <= 1} onClick={async () => selectedVendor?._id && loadVendorAudit(selectedVendor._id, auditPage - 1)}>Prev</button>
                        <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={auditPage >= auditPages} onClick={async () => selectedVendor?._id && loadVendorAudit(selectedVendor._id, auditPage + 1)}>Next</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
