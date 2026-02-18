import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { LoadingScreen } from '../components/LoadingScreen';
import { bulkUploadAPI, productsAPI, vendorProductsAdvancedAPI, vendorsAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { DEFAULT_IMAGE_DATA_URI } from '../lib/images';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  TrendingUp,
  Upload,
  Calendar
} from 'lucide-react';

const VENDOR_CAN_UNPUBLISH = String(import.meta.env.VITE_VENDOR_CAN_UNPUBLISH || 'false').toLowerCase() === 'true';
const VENDOR_CAN_REPUBLISH = String(import.meta.env.VITE_VENDOR_CAN_REPUBLISH || 'false').toLowerCase() === 'true';

export function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [processingId, setProcessingId] = useState<string>('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const [scheduleDateByProduct, setScheduleDateByProduct] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, [statusFilter, page]);

  const fetchData = async () => {
    try {
      const [vendorRes, productsRes] = await Promise.all([
        vendorsAPI.getMyProfile(),
        productsAPI.getMyProducts({ limit: 20, page, status: statusFilter })
      ]);
      setVendor(vendorRes.data.data);
      setProducts(productsRes.data.data || []);
      setPages(productsRes.data.pages || 1);
      setTotal(productsRes.data.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;
    
    try {
      toast.loading('Deleting product...');
      await productsAPI.delete(productId);
      toast.dismiss();
      toast.success('Product deleted successfully!');
      fetchData();
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleSubmit = async (productId: string) => {
    try {
      setProcessingId(productId);
      await productsAPI.submitForReview(productId);
      toast.success('Submitted for review');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit for review');
    } finally {
      setProcessingId('');
    }
  };

  const handleTogglePublish = async (product: any) => {
    try {
      setProcessingId(product._id);
      if (product.isActive) {
        await productsAPI.vendorUnpublish(product._id);
        toast.success('Product unpublished');
      } else {
        await productsAPI.vendorRepublish(product._id);
        toast.success('Product republished');
      }
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update publish state');
    } finally {
      setProcessingId('');
    }
  };

  const handleSchedule = async (productId: string) => {
    const scheduledPublishAt = scheduleDateByProduct[productId];
    if (!scheduledPublishAt) {
      toast.error('Select date/time first');
      return;
    }
    try {
      setProcessingId(productId);
      await vendorProductsAdvancedAPI.schedulePublish(productId, new Date(scheduledPublishAt).toISOString());
      toast.success('Publish schedule updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to schedule product');
    } finally {
      setProcessingId('');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await bulkUploadAPI.downloadTemplate();
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vendor-products-template.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      toast.error('Failed to download template');
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error('Select a CSV file');
      return;
    }
    const formData = new FormData();
    formData.append('file', bulkFile);
    setBulkLoading(true);
    try {
      const response = await vendorProductsAdvancedAPI.bulkUpload(formData);
      setBulkResult(response.data?.data || null);
      toast.success('Bulk upload processed');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bulk upload failed');
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingScreen title="Loading your products…" subtitle="Fetching your inventory" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">You need to create a vendor profile first</p>
          <Link
            to="/vendor/setup"
            className="inline-flex items-center px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600"
          >
            Create Vendor Profile
          </Link>
        </div>
      </div>
    );
  }

  if (vendor.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Pending Approval</h2>
            <p className="text-yellow-700">Your vendor profile is pending admin approval. You'll be able to add products once approved.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
              My Products
            </h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border border-gray-300 bg-white hover:bg-gray-50"
            >
              <Upload className="w-5 h-5" />
              Bulk CSV
            </button>
          {products.length >= 2 && (
            <div className="hidden sm:block text-sm text-gray-600">
              Product limit reached (2). Delete a product to add another.
            </div>
          )}
          <Link
            to="/vendor/products/new"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition-all ${
              products.length >= 2
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed pointer-events-none'
                : 'bg-nvm-green-primary text-white hover:bg-nvm-green-dark'
            }`}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-nvm-dark-900">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-nvm-dark-900">
                  {products.filter((p: any) => p.status === 'PUBLISHED').length}
                </div>
                <div className="text-sm text-gray-600">Active Products</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-nvm-gold-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-nvm-dark-900">
                  {formatRands(products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / products.length || 0)}
                </div>
                <div className="text-sm text-gray-600">Avg. Price</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex flex-wrap gap-2">
            {['all', 'DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === status ? 'bg-nvm-green-primary text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No products yet</p>
              <Link
                to="/vendor/products/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-dark"
              >
                <Plus className="w-5 h-5" />
                Add Your First Product
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product: any) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || DEFAULT_IMAGE_DATA_URI}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-nvm-dark-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {typeof product.category === 'string' ? product.category : product.category?.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-nvm-gold-primary">
                          {formatRands(product.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === 'PUBLISHED'
                            ? (product.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')
                            : product.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.status}{product.status === 'PUBLISHED' ? (product.isActive ? ' (Live)' : ' (Hidden)') : ''}
                        </span>
                        {product.status === 'REJECTED' && product.rejectionReason && (
                          <div className="text-xs text-red-600 mt-1 max-w-[220px] truncate">{product.rejectionReason}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="p-2 text-gray-600 hover:text-nvm-green-primary transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/vendor/products/edit/${product._id}`}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id, product.name)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {(product.status === 'DRAFT' || product.status === 'REJECTED') && (
                            <button
                              onClick={() => handleSubmit(product._id)}
                              disabled={processingId === product._id}
                              className="px-2 py-1 text-xs bg-nvm-gold-primary text-white rounded"
                            >
                              Submit
                            </button>
                          )}
                          {product.status === 'PUBLISHED' && ((product.isActive && VENDOR_CAN_UNPUBLISH) || (!product.isActive && VENDOR_CAN_REPUBLISH)) && (
                            <button
                              onClick={() => handleTogglePublish(product)}
                              disabled={processingId === product._id}
                              className="px-2 py-1 text-xs bg-gray-800 text-white rounded"
                            >
                              {product.isActive ? 'Unpublish' : 'Republish'}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <input
                            type="datetime-local"
                            value={scheduleDateByProduct[product._id] || ''}
                            onChange={(e) =>
                              setScheduleDateByProduct((prev) => ({ ...prev, [product._id]: e.target.value }))
                            }
                            className="text-xs border rounded px-2 py-1"
                          />
                          <button
                            onClick={() => handleSchedule(product._id)}
                            disabled={processingId === product._id}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
                          >
                            <Calendar className="w-3 h-3 inline mr-1" />
                            Schedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">Page {page} of {pages} • {total} products</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Bulk Product Upload</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-2 border rounded bg-gray-50 hover:bg-gray-100 text-sm"
              >
                Download CSV Template
              </button>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <button
                onClick={handleBulkUpload}
                disabled={bulkLoading}
                className="px-3 py-2 rounded bg-nvm-green-primary text-white text-sm disabled:opacity-60"
              >
                {bulkLoading ? 'Processing...' : 'Upload CSV'}
              </button>
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkFile(null);
                  setBulkResult(null);
                }}
                className="px-3 py-2 rounded border text-sm"
              >
                Close
              </button>
            </div>

            {bulkResult && (
              <div className="space-y-3">
                <div className="text-sm">Created: <strong>{bulkResult.createdCount || 0}</strong></div>
                <div className="max-h-64 overflow-y-auto border rounded">
                  {(bulkResult.failedRows || []).length === 0 ? (
                    <div className="p-3 text-sm text-green-700">No failed rows</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Row</th>
                          <th className="text-left p-2">Title</th>
                          <th className="text-left p-2">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkResult.failedRows.map((row: any, idx: number) => (
                          <tr key={`${row.rowNumber}-${idx}`} className="border-t">
                            <td className="p-2">{row.rowNumber}</td>
                            <td className="p-2">{row.title}</td>
                            <td className="p-2 text-red-700">{row.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {bulkResult.errorReportCsv && (
                  <button
                    onClick={() => {
                      const blob = new Blob([bulkResult.errorReportCsv], { type: 'text/csv;charset=utf-8;' });
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'bulk-upload-errors.csv';
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="px-3 py-2 text-sm border rounded bg-gray-50 hover:bg-gray-100"
                  >
                    Download Error Report CSV
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
