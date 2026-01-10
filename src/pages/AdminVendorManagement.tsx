import React, { useState, useEffect } from 'react';
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
  MapPin,
  Phone,
  Mail,
  Globe,
  CreditCard,
  Building2,
  User,
  X,
  Calendar,
  TrendingUp,
  Package
} from 'lucide-react';

export function AdminVendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, [filterStatus]);

  const fetchVendors = async () => {
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      const response = await vendorsAPI.getAll(params);
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (vendorId: string) => {
    try {
      const response = await vendorsAPI.getById(vendorId);
      setSelectedVendor(response.data.data);
      setShowDetailsModal(true);
    } catch (error: any) {
      toast.error('Failed to load vendor details');
    }
  };

  const handleApprove = async (vendorId: string, vendorName: string) => {
    if (!confirm(`Approve ${vendorName}?`)) return;

    try {
      toast.loading('Approving vendor...');
      await vendorsAPI.approve(vendorId);
      toast.dismiss();
      toast.success('Vendor approved successfully!');
      fetchVendors();
      if (selectedVendor?._id === vendorId) {
        setShowDetailsModal(false);
        setSelectedVendor(null);
      }
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
      if (selectedVendor?._id === vendorId) {
        setShowDetailsModal(false);
        setSelectedVendor(null);
      }
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Failed to reject vendor');
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
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-nvm-accent-indigo rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">
              Vendor Management
            </h1>
          </div>
          <p className="text-gray-600">Review and approve vendor applications</p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name, email, or category..."
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
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No vendors found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredVendors.map((vendor: any) => (
                <motion.div
                  key={vendor._id}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                  className="p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      {vendor.logo?.url ? (
                        <img
                          src={vendor.logo.url}
                          alt={vendor.storeName}
                          className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-nvm-green-primary to-nvm-gold-primary flex items-center justify-center">
                          <Store className="w-10 h-10 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-nvm-dark-900">
                            {vendor.storeName}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {vendor.description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            {vendor.phone}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="w-4 h-4" />
                            {vendor.category}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Package className="w-4 h-4" />
                            {vendor.totalProducts} Products
                          </div>
                        </div>

                        {vendor.address && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                              {vendor.address.street}, {vendor.address.city}, {vendor.address.state}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(vendor._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      {vendor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(vendor._id, vendor.storeName)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(vendor._id, vendor.storeName)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vendor Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  {selectedVendor.logo?.url && (
                    <img
                      src={selectedVendor.logo.url}
                      alt={selectedVendor.storeName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-nvm-dark-900">
                      {selectedVendor.storeName}
                    </h2>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border mt-1 ${getStatusColor(selectedVendor.status)}`}>
                      {selectedVendor.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Business Information */}
                <div>
                  <h3 className="text-lg font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Business Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Store Name</p>
                        <p className="font-medium">{selectedVendor.storeName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium capitalize">{selectedVendor.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business Type</p>
                        <p className="font-medium capitalize">{selectedVendor.businessType}</p>
                      </div>
                      {selectedVendor.taxId && (
                        <div>
                          <p className="text-sm text-gray-500">Tax ID</p>
                          <p className="font-medium">{selectedVendor.taxId}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">{selectedVendor.description}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedVendor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">{selectedVendor.phone}</p>
                        </div>
                      </div>
                      {selectedVendor.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Website</p>
                            <a 
                              href={selectedVendor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {selectedVendor.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedVendor.address && (
                  <div>
                    <h3 className="text-lg font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Business Address
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-medium">{selectedVendor.address.street}</p>
                      <p className="text-gray-700">
                        {selectedVendor.address.city}, {selectedVendor.address.state} {selectedVendor.address.zipCode}
                      </p>
                      <p className="text-gray-700">{selectedVendor.address.country}</p>
                    </div>
                  </div>
                )}

                {/* Banking Details */}
                {selectedVendor.bankDetails && (
                  <div>
                    <h3 className="text-lg font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Banking Details (For EFT Payments)
                    </h3>
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2 text-sm text-yellow-800 mb-3">
                        <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">
                          This information will be displayed on invoices for customers making EFT payments
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Account Holder Name</p>
                          <p className="font-semibold text-gray-900">{selectedVendor.bankDetails.accountHolderName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bank Name</p>
                          <p className="font-semibold text-gray-900">{selectedVendor.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-semibold text-gray-900">{selectedVendor.bankDetails.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Branch Code</p>
                          <p className="font-semibold text-gray-900">{selectedVendor.bankDetails.branchCode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Type</p>
                          <p className="font-semibold text-gray-900 capitalize">{selectedVendor.bankDetails.accountType}</p>
                        </div>
                        {selectedVendor.bankDetails.swiftCode && (
                          <div>
                            <p className="text-sm text-gray-600">Swift Code</p>
                            <p className="font-semibold text-gray-900">{selectedVendor.bankDetails.swiftCode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-600 mb-1">Products</p>
                      <p className="text-2xl font-bold text-blue-900">{selectedVendor.totalProducts || 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600 mb-1">Sales</p>
                      <p className="text-2xl font-bold text-green-900">{selectedVendor.totalSales || 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-purple-600 mb-1">Revenue</p>
                      <p className="text-2xl font-bold text-purple-900">{formatRands(selectedVendor.totalRevenue || 0)}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-sm text-yellow-600 mb-1">Rating</p>
                      <p className="text-2xl font-bold text-yellow-900">{selectedVendor.rating?.toFixed(1) || '0.0'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-nvm-dark-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Important Dates
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registered</span>
                      <span className="font-medium">
                        {new Date(selectedVendor.createdAt).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {selectedVendor.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Approved</span>
                        <span className="font-medium">
                          {new Date(selectedVendor.approvedAt).toLocaleDateString('en-ZA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {selectedVendor.rejectionReason && (
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Rejection Reason:</span>
                        <p className="font-medium text-red-600 mt-1">{selectedVendor.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              {selectedVendor.status === 'pending' && (
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
                  <button
                    onClick={() => handleReject(selectedVendor._id, selectedVendor.storeName)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Vendor
                  </button>
                  <button
                    onClick={() => handleApprove(selectedVendor._id, selectedVendor.storeName)}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Approve Vendor
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

