import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { vendorsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import {
  Store,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Save,
  Shield,
  FileText,
  ClipboardCheck,
  History
} from 'lucide-react';

type VendorTab = 'profile' | 'documents' | 'compliance' | 'activity';

export function AdminVendorManagement() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState<VendorTab>('profile');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState<any>({});
  const [statusForm, setStatusForm] = useState({ accountStatus: 'active', reason: '' });
  const [complianceForm, setComplianceForm] = useState({
    checkType: 'kyc',
    status: 'pending',
    notes: '',
    nextReviewAt: ''
  });
  const [documentForm, setDocumentForm] = useState({
    type: 'business-registration',
    name: '',
    url: ''
  });
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentPages, setDocumentPages] = useState(1);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPages, setActivityPages] = useState(1);
  const [activityLimit] = useState(5);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentLimit] = useState(5);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    fetchVendors();
  }, [filterStatus]);

  const fetchVendors = async () => {
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const response = await vendorsAPI.getAdminAll(params);
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async (vendorId: string, page = 1) => {
    const logsRes = await vendorsAPI.getActivityLogs(vendorId, { page, limit: activityLimit });
    setActivityLogs(logsRes.data.data || []);
    setActivityPage(logsRes.data.currentPage || 1);
    setActivityPages(logsRes.data.pages || 1);
  };

  const loadVendorDocuments = async (vendorId: string, page = 1) => {
    const docsRes = await vendorsAPI.getDocuments(vendorId, { page, limit: documentLimit });
    setDocuments(docsRes.data.data || []);
    setDocumentPage(docsRes.data.currentPage || 1);
    setDocumentPages(docsRes.data.pages || 1);
  };

  const openVendorDetails = async (vendorId: string) => {
    try {
      const [vendorRes, perfRes] = await Promise.all([
        vendorsAPI.getAdminById(vendorId),
        vendorsAPI.getPerformanceOverview(vendorId)
      ]);

      const vendor = vendorRes.data.data;
      setSelectedVendor(vendor);
      setEditForm({
        storeName: vendor.storeName || '',
        description: vendor.description || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        website: vendor.website || '',
        category: vendor.category || 'other',
        businessType: vendor.businessType || 'individual',
        address: {
          street: vendor.address?.street || '',
          city: vendor.address?.city || '',
          state: vendor.address?.state || '',
          country: vendor.address?.country || '',
          zipCode: vendor.address?.zipCode || ''
        }
      });
      setStatusForm({
        accountStatus: vendor.accountStatus || 'pending',
        reason: ''
      });
      setPerformance(perfRes.data.data || null);
      setDocumentPage(1);
      setDocuments([]);
      setActiveTab('profile');
      setShowDetailsModal(true);
      await Promise.all([
        loadActivityLogs(vendorId, 1),
        loadVendorDocuments(vendorId, 1)
      ]);
    } catch (error) {
      toast.error('Failed to load vendor details');
    }
  };

  const refreshSelectedVendor = async () => {
    if (!selectedVendor?._id) return;
    await openVendorDetails(selectedVendor._id);
  };

  useEffect(() => {
    if (showDetailsModal && selectedVendor?._id && activeTab === 'activity') {
      loadActivityLogs(selectedVendor._id, activityPage).catch(() => {
        toast.error('Failed to load activity logs');
      });
    }
  }, [activityPage, activeTab, showDetailsModal]);

  useEffect(() => {
    if (showDetailsModal && selectedVendor?._id && activeTab === 'documents') {
      loadVendorDocuments(selectedVendor._id, documentPage).catch(() => {
        toast.error('Failed to load vendor documents');
      });
    }
  }, [documentPage, activeTab, showDetailsModal]);

  const handleApprove = async (vendorId: string, vendorName: string) => {
    if (!confirm(`Approve ${vendorName}?`)) return;
    try {
      toast.loading('Approving vendor...');
      await vendorsAPI.approve(vendorId);
      toast.dismiss();
      toast.success('Vendor approved successfully');
      fetchVendors();
      if (selectedVendor?._id === vendorId) await refreshSelectedVendor();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to approve vendor');
    }
  };

  const handleReject = async (vendorId: string, vendorName: string) => {
    const reason = prompt(`Enter rejection reason for ${vendorName}:`);
    if (!reason) return;
    try {
      toast.loading('Rejecting vendor...');
      await vendorsAPI.reject(vendorId, { reason });
      toast.dismiss();
      toast.success('Vendor rejected');
      fetchVendors();
      if (selectedVendor?._id === vendorId) await refreshSelectedVendor();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to reject vendor');
    }
  };

  const handleSaveVendorProfile = async () => {
    if (!selectedVendor?._id) return;
    try {
      toast.loading('Saving vendor profile...');
      await vendorsAPI.adminUpdateProfile(selectedVendor._id, editForm);
      toast.dismiss();
      toast.success('Vendor profile updated');
      fetchVendors();
      await refreshSelectedVendor();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to update vendor profile');
    }
  };

  const handleStatusChange = async () => {
    if (!selectedVendor?._id) return;
    try {
      toast.loading('Updating status...');
      await vendorsAPI.updateStatus(selectedVendor._id, statusForm);
      toast.dismiss();
      toast.success('Vendor status updated');
      setShowStatusModal(false);
      fetchVendors();
      await refreshSelectedVendor();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleUploadDocumentByUrl = async () => {
    if (!selectedVendor?._id) return;
    if (!documentForm.name || !documentForm.url) {
      toast.error('Document name and URL are required');
      return;
    }
    try {
      toast.loading('Uploading document...');
      const formData = new FormData();
      formData.append('type', documentForm.type);
      formData.append('name', documentForm.name);
      formData.append('url', documentForm.url);
      await vendorsAPI.uploadDocument(selectedVendor._id, formData);
      toast.dismiss();
      toast.success('Document uploaded');
      setDocumentForm({ type: 'business-registration', name: '', url: '' });
      await loadVendorDocuments(selectedVendor._id, documentPage);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleReviewDocument = async (docId: string, action: 'verify' | 'reject') => {
    if (!selectedVendor?._id) return;
    const reason = action === 'reject' ? prompt('Enter rejection reason:') : '';
    if (action === 'reject' && !reason) return;
    try {
      toast.loading('Reviewing document...');
      await vendorsAPI.reviewDocument(selectedVendor._id, docId, { action, reason });
      toast.dismiss();
      toast.success(`Document ${action === 'verify' ? 'verified' : 'rejected'}`);
      await loadVendorDocuments(selectedVendor._id, documentPage);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to review document');
    }
  };

  const handleAddComplianceCheck = async () => {
    if (!selectedVendor?._id) return;
    try {
      toast.loading('Saving compliance check...');
      await vendorsAPI.addComplianceCheck(selectedVendor._id, complianceForm);
      toast.dismiss();
      toast.success('Compliance check added');
      setComplianceForm({ checkType: 'kyc', status: 'pending', notes: '', nextReviewAt: '' });
      await refreshSelectedVendor();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to save compliance check');
    }
  };

  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      suspended: 'bg-gray-100 text-gray-800 border-gray-300',
      active: 'bg-green-100 text-green-800 border-green-300',
      banned: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const tabs: { id: VendorTab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: Store },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'compliance', label: 'Compliance', icon: ClipboardCheck },
    { id: 'activity', label: 'Activity', icon: History }
  ];

  const paginatedDocuments = documents;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-nvm-accent-indigo rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">Vendor Management</h1>
          </div>
          <p className="text-gray-600">Admin controls for profile, status, documents, compliance, and activity</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12">No vendors found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVendors.map((vendor: any) => (
                <div key={vendor._id} className="p-6 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{vendor.storeName}</h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(vendor.status)}`}>
                        {vendor.status}
                      </span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(vendor.accountStatus)}`}>
                        {vendor.accountStatus || 'pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{vendor.email} | {vendor.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openVendorDetails(vendor._id)}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> Details
                    </button>
                    {vendor.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(vendor._id, vendor.storeName)} className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm">
                          Approve
                        </button>
                        <button onClick={() => handleReject(vendor._id, vendor.storeName)} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDetailsModal && selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-6xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-20 bg-white border-b p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedVendor.storeName}</h2>
                  <p className="text-sm text-gray-600">{selectedVendor.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-3 py-2 bg-amber-500 text-white rounded-lg text-sm flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4" /> Change Status
                  </button>
                  <button onClick={() => setShowDetailsModal(false)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                    Close
                  </button>
                </div>
              </div>

              <div className="p-4 border-b flex gap-2 flex-wrap">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-nvm-accent-indigo text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="border rounded-lg p-2" placeholder="Store Name" value={editForm.storeName || ''} onChange={(e) => setEditForm({ ...editForm, storeName: e.target.value })} />
                      <input className="border rounded-lg p-2" placeholder="Email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                      <input className="border rounded-lg p-2" placeholder="Phone" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                      <input className="border rounded-lg p-2" placeholder="Website" value={editForm.website || ''} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
                    </div>
                    <textarea className="border rounded-lg p-2 w-full" rows={4} placeholder="Description" value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="border rounded-lg p-2" placeholder="Street" value={editForm.address?.street || ''} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, street: e.target.value } })} />
                      <input className="border rounded-lg p-2" placeholder="City" value={editForm.address?.city || ''} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, city: e.target.value } })} />
                      <input className="border rounded-lg p-2" placeholder="State" value={editForm.address?.state || ''} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, state: e.target.value } })} />
                      <input className="border rounded-lg p-2" placeholder="Zip Code" value={editForm.address?.zipCode || ''} onChange={(e) => setEditForm({ ...editForm, address: { ...editForm.address, zipCode: e.target.value } })} />
                    </div>
                    <button onClick={handleSaveVendorProfile} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                      <Save className="w-4 h-4" /> Save Profile Changes
                    </button>

                    {performance && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-600">Products</p>
                          <p className="text-xl font-bold">{performance.metrics?.totalProducts || 0}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-xs text-green-600">Orders</p>
                          <p className="text-xl font-bold">{performance.metrics?.totalOrders || 0}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-xs text-yellow-700">Revenue</p>
                          <p className="text-xl font-bold">{formatRands(performance.metrics?.totalRevenue || 0)}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-xs text-purple-700">Avg Rating</p>
                          <p className="text-xl font-bold">{performance.metrics?.averageRating || 0}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <select className="border rounded-lg p-2" value={documentForm.type} onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}>
                        <option value="business-registration">Business Registration</option>
                        <option value="tax-certificate">Tax Certificate</option>
                        <option value="compliance">Compliance</option>
                        <option value="identity">Identity</option>
                        <option value="bank-proof">Bank Proof</option>
                        <option value="other">Other</option>
                      </select>
                      <input className="border rounded-lg p-2" placeholder="Document name" value={documentForm.name} onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })} />
                      <input className="border rounded-lg p-2" placeholder="Document URL" value={documentForm.url} onChange={(e) => setDocumentForm({ ...documentForm, url: e.target.value })} />
                    </div>
                    <button onClick={handleUploadDocumentByUrl} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Upload Document</button>

                    <div className="space-y-3">
                      {paginatedDocuments.map((doc: any) => (
                        <div key={doc._id} className="border rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{doc.name}</p>
                            <p className="text-sm text-gray-600">{doc.type}</p>
                            <p className={`text-xs font-medium ${doc.status === 'verified' ? 'text-green-700' : doc.status === 'rejected' ? 'text-red-700' : 'text-amber-700'}`}>{doc.status}</p>
                          </div>
                          <div className="flex gap-2">
                            <a href={doc.file?.url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Open</a>
                            <button onClick={() => handleReviewDocument(doc._id, 'verify')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Verify</button>
                            <button onClick={() => handleReviewDocument(doc._id, 'reject')} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Page {documentPage} of {documentPages}</p>
                      <div className="flex gap-2">
                        <button
                          disabled={documentPage <= 1}
                          onClick={() => setDocumentPage((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          disabled={documentPage >= documentPages}
                          onClick={() => setDocumentPage((prev) => Math.min(documentPages, prev + 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'compliance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select className="border rounded-lg p-2" value={complianceForm.checkType} onChange={(e) => setComplianceForm({ ...complianceForm, checkType: e.target.value })}>
                        <option value="kyc">KYC</option>
                        <option value="business-license">Business License</option>
                        <option value="tax">Tax</option>
                        <option value="banking">Banking</option>
                        <option value="policy">Policy</option>
                        <option value="other">Other</option>
                      </select>
                      <select className="border rounded-lg p-2" value={complianceForm.status} onChange={(e) => setComplianceForm({ ...complianceForm, status: e.target.value })}>
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                      <input type="date" className="border rounded-lg p-2" value={complianceForm.nextReviewAt} onChange={(e) => setComplianceForm({ ...complianceForm, nextReviewAt: e.target.value })} />
                      <input className="border rounded-lg p-2" placeholder="Notes" value={complianceForm.notes} onChange={(e) => setComplianceForm({ ...complianceForm, notes: e.target.value })} />
                    </div>
                    <button onClick={handleAddComplianceCheck} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Add Compliance Check</button>
                    <div className="space-y-2">
                      {(selectedVendor.complianceChecks || []).map((check: any) => (
                        <div key={check._id} className="border rounded-lg p-3">
                          <p className="font-semibold">{check.checkType}</p>
                          <p className="text-sm text-gray-600">{check.notes || 'No notes'}</p>
                          <p className="text-xs text-gray-500">Status: {check.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-2">
                    {activityLogs.length === 0 ? (
                      <p className="text-gray-600">No activity logs</p>
                    ) : (
                      activityLogs.map((log: any) => (
                        <div key={log._id} className="border rounded-lg p-3">
                          <p className="font-semibold">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.message || 'No message'}</p>
                          <p className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-gray-600">Page {activityPage} of {activityPages}</p>
                      <div className="flex gap-2">
                        <button
                          disabled={activityPage <= 1}
                          onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          disabled={activityPage >= activityPages}
                          onClick={() => setActivityPage((prev) => Math.min(activityPages, prev + 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Change Vendor Account Status</h3>
              <div className="space-y-3">
                <select
                  className="w-full border rounded-lg p-2"
                  value={statusForm.accountStatus}
                  onChange={(e) => setStatusForm({ ...statusForm, accountStatus: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={4}
                  placeholder="Reason (optional)"
                  value={statusForm.reason}
                  onChange={(e) => setStatusForm({ ...statusForm, reason: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleStatusChange} className="px-4 py-2 bg-amber-600 text-white rounded-lg">Apply</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
