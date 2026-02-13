import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { productsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  History
} from 'lucide-react';

type ProductTab = 'moderation' | 'reports' | 'activity';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterModeration, setFilterModeration] = useState('all');
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProductTab>('moderation');
  const [auditData, setAuditData] = useState<any>(null);
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [reportsPage, setReportsPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [reportsPages, setReportsPages] = useState(1);
  const [activityPages, setActivityPages] = useState(1);
  const [historyPages, setHistoryPages] = useState(1);
  const [tabPageLimit] = useState(5);

  useEffect(() => {
    fetchProducts();
  }, [filterStatus, filterModeration]);

  const fetchProducts = async () => {
    try {
      const params: any = { limit: 100 };
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterModeration !== 'all') params.moderationStatus = filterModeration;
      const response = await productsAPI.getAdminProducts(params);
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditTrail = async (
    productId: string,
    pageConfig: { reportsPage?: number; activityPage?: number; historyPage?: number } = {}
  ) => {
    const response = await productsAPI.getAuditTrail(productId, {
      reportsPage: pageConfig.reportsPage || reportsPage,
      reportsLimit: tabPageLimit,
      activityPage: pageConfig.activityPage || activityPage,
      activityLimit: tabPageLimit,
      historyPage: pageConfig.historyPage || historyPage,
      historyLimit: tabPageLimit
    });
    setAuditData(response.data.data || null);
    setReportsPages(response.data.data?.pagination?.reports?.pages || 1);
    setActivityPages(response.data.data?.pagination?.activityLogs?.pages || 1);
    setHistoryPages(response.data.data?.pagination?.moderationHistory?.pages || 1);
  };

  const openProductModal = async (product: any) => {
    try {
      setSelectedProduct(product);
      setActiveTab('moderation');
      setReportsPage(1);
      setActivityPage(1);
      setHistoryPage(1);
      await loadAuditTrail(product._id, { reportsPage: 1, activityPage: 1, historyPage: 1 });
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load product audit trail');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    try {
      toast.loading('Deleting product...');
      await productsAPI.delete(productId);
      toast.dismiss();
      toast.success('Product deleted successfully');
      fetchProducts();
      if (selectedProduct?._id === productId) setShowModal(false);
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleModerateProduct = async () => {
    if (!selectedProduct?._id) return;
    try {
      toast.loading('Applying moderation...');
      await productsAPI.moderate(selectedProduct._id, {
        action: moderationAction,
        reason: moderationReason
      });
      toast.dismiss();
      toast.success(`Product ${moderationAction === 'approve' ? 'approved' : 'rejected'}`);
      await fetchProducts();
      await loadAuditTrail(selectedProduct._id, { historyPage: historyPage });
      setModerationReason('');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to moderate product');
    }
  };

  const handleReviewReports = async (action: 'resolve-reports' | 'dismiss-reports') => {
    if (!selectedProduct?._id) return;
    try {
      toast.loading('Updating reports...');
      await productsAPI.moderate(selectedProduct._id, {
        action,
        reason: action === 'resolve-reports' ? 'Reports resolved' : 'Reports dismissed'
      });
      toast.dismiss();
      toast.success('Report statuses updated');
      await fetchProducts();
      await loadAuditTrail(selectedProduct._id, { reportsPage });
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to update reports');
    }
  };

  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.vendor?.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs: { id: ProductTab; label: string; icon: any }[] = [
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'activity', label: 'Activity', icon: History }
  ];

  const reportItems = auditData?.reports || [];
  const paginatedReports = reportItems;

  const activityItems = auditData?.activityLogs || [];
  const paginatedActivity = activityItems;

  const moderationHistoryItems = auditData?.moderationHistory || [];

  useEffect(() => {
    if (!showModal || !selectedProduct?._id) return;

    if (activeTab === 'reports') {
      loadAuditTrail(selectedProduct._id, { reportsPage }).catch(() => {
        toast.error('Failed to load report page');
      });
    } else if (activeTab === 'activity') {
      loadAuditTrail(selectedProduct._id, { activityPage }).catch(() => {
        toast.error('Failed to load activity page');
      });
    } else if (activeTab === 'moderation') {
      loadAuditTrail(selectedProduct._id, { historyPage }).catch(() => {
        toast.error('Failed to load moderation history page');
      });
    }
  }, [activeTab, reportsPage, activityPage, historyPage, showModal, selectedProduct?._id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-nvm-accent-indigo rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">Product Management</h1>
          </div>
          <p className="text-gray-600">Admin moderation, reports, and audit trail</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <select value={filterModeration} onChange={(e) => setFilterModeration(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">All Moderation States</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">No products found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredProducts.map((product: any) => (
                <motion.div key={product._id} whileHover={{ y: -4 }} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-48 object-cover" />
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs bg-white/90">
                      {product.status}
                    </span>
                    <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs ${
                      product.moderationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      product.moderationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.moderationStatus || 'pending'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.vendor?.storeName}</p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-nvm-gold-500">{formatRands(product.price)}</p>
                      <p className="text-sm text-gray-600">Reports: {product.reportCount || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openProductModal(product)} className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" /> Review
                      </button>
                      <button onClick={() => handleDeleteProduct(product._id, product.name)} className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 p-4 flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-600">{selectedProduct.vendor?.storeName}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="px-3 py-2 bg-gray-100 rounded-lg text-sm">Close</button>
              </div>

              <div className="p-4 border-b flex gap-2">
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
                {activeTab === 'moderation' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">Current moderation status</p>
                      <p className="font-semibold">{auditData?.moderationStatus || selectedProduct.moderationStatus}</p>
                      {auditData?.moderationReason && <p className="text-sm text-red-600 mt-1">{auditData.moderationReason}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select value={moderationAction} onChange={(e) => setModerationAction(e.target.value as any)} className="border rounded-lg p-2">
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                      </select>
                      <input
                        className="border rounded-lg p-2"
                        placeholder="Moderation reason"
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                      />
                    </div>
                    <button onClick={handleModerateProduct} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Apply Moderation
                    </button>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Moderation History</h4>
                      {moderationHistoryItems.map((item: any) => (
                        <div key={item._id} className="border rounded-lg p-3">
                          <p className="font-medium">{item.action}</p>
                          <p className="text-sm text-gray-600">{item.reason || 'No reason'}</p>
                          <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-gray-600">Page {historyPage} of {historyPages}</p>
                      <div className="flex gap-2">
                        <button
                          disabled={historyPage <= 1}
                          onClick={() => setHistoryPage((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          disabled={historyPage >= historyPages}
                          onClick={() => setHistoryPage((prev) => Math.min(historyPages, prev + 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleReviewReports('resolve-reports')} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Resolve Open Reports</button>
                      <button onClick={() => handleReviewReports('dismiss-reports')} className="px-3 py-2 bg-gray-700 text-white rounded-lg text-sm">Dismiss Open Reports</button>
                    </div>
                    <div className="space-y-2">
                      {reportItems.length === 0 ? (
                        <p className="text-gray-600">No reports</p>
                      ) : (
                        paginatedReports.map((report: any) => (
                          <div key={report._id} className="border rounded-lg p-3">
                            <p className="font-semibold">{report.reason}</p>
                            <p className="text-sm text-gray-600">{report.details || 'No details'}</p>
                            <p className="text-xs text-gray-500">Status: {report.status}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-gray-600">Page {reportsPage} of {reportsPages}</p>
                      <div className="flex gap-2">
                        <button
                          disabled={reportsPage <= 1}
                          onClick={() => setReportsPage((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button
                          disabled={reportsPage >= reportsPages}
                          onClick={() => setReportsPage((prev) => Math.min(reportsPages, prev + 1))}
                          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-2">
                    {activityItems.length === 0 ? (
                      <p className="text-gray-600">No activity logs</p>
                    ) : (
                      paginatedActivity.map((log: any) => (
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
    </div>
  );
}
