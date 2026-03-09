import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../lib/store';
import { authAPI, vendorsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  Store,
  Building,
  FileText,
  CreditCard
} from 'lucide-react';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface VendorForm {
  storeName: string;
  businessType: string;
  businessRegistrationNumber: string;
  taxNumber: string;
  businessAddress: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchCode: string;
}

export function Profile() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'vendor'>('personal');

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm<ProfileForm>();

  const {
    register: registerVendor,
    handleSubmit: handleSubmitVendor,
    formState: { errors: vendorErrors },
    reset: resetVendor
  } = useForm<VendorForm>();

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });

      if (user.role === 'vendor') {
        fetchVendorProfile();
      }
    }
  }, [user]);

  const fetchVendorProfile = async () => {
    try {
      const response = await vendorsAPI.getMyProfile();
      const vendor = response.data.data;
      setVendorProfile(vendor);
      resetVendor({
        storeName: vendor.storeName || '',
        businessType: vendor.businessType || '',
        businessRegistrationNumber: vendor.businessRegistrationNumber || '',
        taxNumber: vendor.taxNumber || '',
        businessAddress: vendor.businessAddress || '',
        bankName: vendor.bankDetails?.bankName || '',
        accountNumber: vendor.bankDetails?.accountNumber || '',
        accountHolderName: vendor.bankDetails?.accountHolderName || '',
        branchCode: vendor.bankDetails?.branchCode || ''
      });
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  const onSubmitProfile = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.data;
      
      // Update auth store
      setAuth(updatedUser, localStorage.getItem('token') || '');
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitVendor = async (data: VendorForm) => {
    setLoading(true);
    try {
      const vendorData = {
        storeName: data.storeName,
        businessType: data.businessType,
        businessRegistrationNumber: data.businessRegistrationNumber,
        taxNumber: data.taxNumber,
        businessAddress: data.businessAddress,
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName,
          branchCode: data.branchCode
        }
      };

      await vendorsAPI.update(vendorProfile._id, vendorData);
      toast.success('Vendor details updated successfully!');
      fetchVendorProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-nvm-green-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-nvm-green-600" />
            </div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">
              My Profile
            </h1>
          </div>
          <p className="text-gray-600">Manage your account information</p>
        </motion.div>

        {/* Tabs */}
        {user?.role === 'vendor' && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'personal'
                  ? 'bg-nvm-green-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('vendor')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'vendor'
                  ? 'bg-nvm-green-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Store className="w-5 h-5 inline-block mr-2" />
              Business Details
            </button>
          </div>
        )}

        {/* Personal Information Form */}
        {activeTab === 'personal' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">
              Personal Information
            </h2>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline-block mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  {...registerProfile('name', { required: 'Name is required' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                  placeholder="John Doe"
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline-block mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                  placeholder="john@example.com"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline-block mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...registerProfile('phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                  placeholder="+27 12 345 6789"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Vendor Details Form */}
        {activeTab === 'vendor' && user?.role === 'vendor' && vendorProfile && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">
              Business Details
            </h2>

            <form onSubmit={handleSubmitVendor(onSubmitVendor)} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      {...registerVendor('storeName', { required: 'Store name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="My Awesome Store"
                    />
                    {vendorErrors.storeName && (
                      <p className="mt-1 text-sm text-red-600">{vendorErrors.storeName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <input
                      type="text"
                      {...registerVendor('businessType')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="e.g., Sole Proprietor, LLC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline-block mr-2" />
                      Business Registration Number
                    </label>
                    <input
                      type="text"
                      {...registerVendor('businessRegistrationNumber')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="REG123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Number / VAT Number
                    </label>
                    <input
                      type="text"
                      {...registerVendor('taxNumber')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="VAT123456"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline-block mr-2" />
                      Business Address
                    </label>
                    <textarea
                      {...registerVendor('businessAddress')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="123 Business Street, City, Province, Postal Code"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="space-y-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Banking Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      {...registerVendor('bankName')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="e.g., Standard Bank"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      {...registerVendor('accountHolderName')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      {...registerVendor('accountNumber')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      {...registerVendor('branchCode')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="123456"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Business Details'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
