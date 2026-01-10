import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { vendorsAPI } from '../lib/api';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Store,
  Mail,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';

export function VendorApprovalStatus() {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorStatus();
  }, []);

  const fetchVendorStatus = async () => {
    try {
      const response = await vendorsAPI.getMyProfile();
      setVendor(response.data.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No vendor profile exists
        navigate('/vendor/register');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (vendor?.status) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'suspended':
        return <AlertCircle className="w-16 h-16 text-orange-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (vendor?.status) {
      case 'approved':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'suspended':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getStatusMessage = () => {
    switch (vendor?.status) {
      case 'approved':
        return {
          title: 'Vendor Approved! 🎉',
          message: 'Congratulations! Your vendor application has been approved. You can now start selling on NVM Marketplace.',
          action: 'Go to Dashboard',
          actionLink: '/vendor/dashboard'
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          message: vendor?.rejectionReason || 'Your vendor application has been rejected. Please contact support for more information.',
          action: 'Contact Support',
          actionLink: '/contact'
        };
      case 'suspended':
        return {
          title: 'Account Suspended',
          message: 'Your vendor account has been temporarily suspended. Please contact support for assistance.',
          action: 'Contact Support',
          actionLink: '/contact'
        };
      default:
        return {
          title: 'Application Under Review',
          message: 'Your vendor application is currently being reviewed by our admin team. We will notify you once a decision has been made.',
          action: 'Refresh Status',
          actionLink: null
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nvm-green-primary"></div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className={`p-8 border-b-4 ${getStatusColor()}`}>
            <div className="flex flex-col items-center text-center">
              {getStatusIcon()}
              <h1 className="text-3xl font-bold mt-4 mb-2">{statusInfo.title}</h1>
              <p className="text-lg">{statusInfo.message}</p>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-nvm-dark-900 mb-6 flex items-center gap-2">
              <Store className="w-6 h-6" />
              Your Application Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Store Name</p>
                  <p className="font-medium text-gray-900">{vendor.storeName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{vendor.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{vendor.phone}</p>
                </div>
              </div>

              {vendor.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {vendor.address.street}, {vendor.address.city}, {vendor.address.state}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Application Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(vendor.createdAt).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {vendor.approvedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Approval Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(vendor.approvedAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {vendor.status === 'rejected' && vendor.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-red-700">{vendor.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-center">
              {statusInfo.actionLink ? (
                <button
                  onClick={() => navigate(statusInfo.actionLink)}
                  className="px-8 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium"
                >
                  {statusInfo.action}
                </button>
              ) : (
                <button
                  onClick={fetchVendorStatus}
                  className="flex items-center gap-2 px-8 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  {statusInfo.action}
                </button>
              )}
            </div>

            {/* Help Text */}
            {vendor.status === 'pending' && (
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong>
                  <br />
                  Our admin team typically reviews applications within 24-48 hours. You will receive an email notification once a decision has been made.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

