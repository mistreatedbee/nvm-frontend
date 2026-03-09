import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { vendorsAPI } from '../lib/api';
import toast from 'react-hot-toast';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon,
  FileText,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const CATEGORIES = [
  { value: 'fashion', label: 'Fashion & Clothing', icon: '👗' },
  { value: 'electronics', label: 'Electronics', icon: '📱' },
  { value: 'food', label: 'Food & Beverages', icon: '🍔' },
  { value: 'services', label: 'Services', icon: '🛠️' },
  { value: 'health', label: 'Health & Wellness', icon: '💊' },
  { value: 'beauty', label: 'Beauty & Cosmetics', icon: '💄' },
  { value: 'home', label: 'Home & Garden', icon: '🏠' },
  { value: 'sports', label: 'Sports & Outdoors', icon: '⚽' },
  { value: 'books', label: 'Books & Media', icon: '📚' },
  { value: 'art', label: 'Art & Crafts', icon: '🎨' },
  { value: 'other', label: 'Other', icon: '📦' }
];

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual Seller', description: 'I sell products as an individual' },
  { value: 'business', label: 'Registered Business', description: 'I have a registered business' },
  { value: 'freelancer', label: 'Freelancer/Service Provider', description: 'I offer services' }
];

const SOUTH_AFRICAN_CITIES = [
  'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
  'Bloemfontein', 'East London', 'Nelspruit', 'Kimberley', 'Polokwane',
  'Rustenburg', 'Pietermaritzburg', 'George', 'Soweto', 'Midrand'
];

const PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 
  'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'
];

export function VendorProfileSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Store Information
    storeName: '',
    description: '',
    category: '',
    businessType: 'individual',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    
    // Address (Multiple Locations Support)
    address: {
      street: '',
      city: '',
      state: '',
      country: 'South Africa',
      zipCode: ''
    },
    
    // Additional Locations
    additionalLocations: [] as any[],
    
    // Social Media
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    
    // Banking Information
    bankDetails: {
      accountName: '',
      accountNumber: '',
      bankName: '',
      swiftCode: ''
    },
    
    // Business Documents
    taxId: '',
    businessLicense: '',
    
    // Settings
    settings: {
      returnPolicy: '',
      shippingPolicy: '',
      termsAndConditions: ''
    }
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev as any)[parent],
        [field]: value
      }
    }));
  };

  const addLocation = () => {
    setFormData(prev => ({
      ...prev,
      additionalLocations: [
        ...prev.additionalLocations,
        { street: '', city: '', state: '', country: 'South Africa', zipCode: '' }
      ]
    }));
  };

  const removeLocation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalLocations: prev.additionalLocations.filter((_, i) => i !== index)
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.storeName && formData.description && formData.category && formData.businessType;
      case 2:
        return formData.email && formData.phone && formData.address.street && formData.address.city;
      case 3:
        return true; // Social media is optional
      case 4:
        return formData.bankDetails.accountName && formData.bankDetails.accountNumber && formData.bankDetails.bankName;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await vendorsAPI.create(formData);
      toast.success('Vendor profile submitted! Awaiting admin approval.');
      navigate('/vendor/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create vendor profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nvm-green-bg via-white to-nvm-gold-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-nvm-green-primary rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold text-nvm-green-primary mb-3">
            Become a Vendor
          </h1>
          <p className="text-gray-600 text-lg">
            Join NVM Marketplace and start selling to customers across South Africa
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step >= s 
                    ? 'bg-nvm-green-primary text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div className={`flex-1 h-1 mx-2 transition-all ${
                    step > s ? 'bg-nvm-green-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-600">
            <span>Store Info</span>
            <span>Contact</span>
            <span>Social</span>
            <span>Banking</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Step 1: Store Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-nvm-green-primary mb-6">Store Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                  placeholder="My Amazing Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                  placeholder="Tell customers about your store and what makes it special..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {BUSINESS_TYPES.map((type) => (
                    <div
                      key={type.value}
                      onClick={() => handleInputChange('businessType', type.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.businessType === type.value
                          ? 'border-nvm-green-primary bg-nvm-green-bg'
                          : 'border-gray-200 hover:border-nvm-green-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{type.label}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.value}
                      onClick={() => handleInputChange('category', cat.value)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        formData.category === cat.value
                          ? 'border-nvm-green-primary bg-nvm-green-bg'
                          : 'border-gray-200 hover:border-nvm-green-primary/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{cat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-nvm-green-primary mb-6">Contact & Location</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="store@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="+27 xx xxx xxxx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                  placeholder="https://www.yourwebsite.com"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-nvm-green-primary" />
                  Primary Location <span className="text-red-500 ml-1">*</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        value={formData.address.city}
                        onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                      >
                        <option value="">Select City</option>
                        {SOUTH_AFRICAN_CITIES.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                      <select
                        value={formData.address.state}
                        onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                      >
                        <option value="">Select Province</option>
                        {PROVINCES.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => handleNestedChange('address', 'zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                        placeholder="0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value="South Africa"
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Locations */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Locations (Optional)</h3>
                  <button
                    type="button"
                    onClick={addLocation}
                    className="px-4 py-2 bg-nvm-gold-primary text-white rounded-lg hover:bg-nvm-gold-dark transition-colors text-sm font-medium"
                  >
                    + Add Location
                  </button>
                </div>
                
                {formData.additionalLocations.map((loc, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg mb-3">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Location {index + 2}</span>
                      <button
                        type="button"
                        onClick={() => removeLocation(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={loc.street}
                        onChange={(e) => {
                          const newLocs = [...formData.additionalLocations];
                          newLocs[index].street = e.target.value;
                          handleInputChange('additionalLocations', newLocs);
                        }}
                        placeholder="Street"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        value={loc.city}
                        onChange={(e) => {
                          const newLocs = [...formData.additionalLocations];
                          newLocs[index].city = e.target.value;
                          handleInputChange('additionalLocations', newLocs);
                        }}
                        placeholder="City"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Social Media */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-nvm-green-primary mb-6">Social Media (Optional)</h2>
              <p className="text-gray-600 mb-6">Connect your social media profiles to boost credibility</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleNestedChange('socialMedia', 'linkedin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Banking Information */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Secure Banking Information</h3>
                    <p className="text-sm text-blue-700">
                      Your banking details are encrypted and stored securely. This information is required for payouts.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-nvm-green-primary mb-6">
                <CreditCard className="w-6 h-6 inline mr-2" />
                Banking Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountName}
                    onChange={(e) => handleNestedChange('bankDetails', 'accountName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => handleNestedChange('bankDetails', 'accountNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                  >
                    <option value="">Select Bank</option>
                    <option value="ABSA">ABSA</option>
                    <option value="Standard Bank">Standard Bank</option>
                    <option value="FNB">First National Bank (FNB)</option>
                    <option value="Nedbank">Nedbank</option>
                    <option value="Capitec">Capitec Bank</option>
                    <option value="African Bank">African Bank</option>
                    <option value="Investec">Investec</option>
                    <option value="Discovery Bank">Discovery Bank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SWIFT Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.swiftCode}
                    onChange={(e) => handleNestedChange('bankDetails', 'swiftCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="ABSA ZAJJ XXX"
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Business Documents (If Applicable)</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID / VAT Number
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License Number
                  </label>
                  <input
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-nvm-green-primary mb-6">Review Your Information</h2>
              
              <div className="space-y-4">
                <div className="bg-nvm-green-bg border border-nvm-green-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-nvm-green-primary mb-2">Store Information</h3>
                  <p className="text-sm text-gray-700"><strong>Name:</strong> {formData.storeName}</p>
                  <p className="text-sm text-gray-700"><strong>Category:</strong> {CATEGORIES.find(c => c.value === formData.category)?.label}</p>
                  <p className="text-sm text-gray-700"><strong>Type:</strong> {BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Contact & Location</h3>
                  <p className="text-sm text-gray-700"><strong>Email:</strong> {formData.email}</p>
                  <p className="text-sm text-gray-700"><strong>Phone:</strong> {formData.phone}</p>
                  <p className="text-sm text-gray-700"><strong>Location:</strong> {formData.address.city}, {formData.address.state}</p>
                  {formData.additionalLocations.length > 0 && (
                    <p className="text-sm text-gray-700"><strong>Additional Locations:</strong> {formData.additionalLocations.length}</p>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Admin Approval Required</h3>
                      <p className="text-sm text-yellow-700">
                        Your vendor profile will be reviewed by our admin team. You'll receive an email notification once approved. This usually takes 1-2 business days.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Next Steps After Approval:</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                    <li>Upload your store logo and banner</li>
                    <li>Add your first products</li>
                    <li>Set up your store policies</li>
                    <li>Start receiving orders!</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-nvm-green-primary border-gray-300 rounded focus:ring-nvm-green-primary"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  I agree to NVM's <a href="#" className="text-nvm-green-primary underline">Terms of Service</a>, <a href="#" className="text-nvm-green-primary underline">Vendor Agreement</a>, and <a href="#" className="text-nvm-green-primary underline">Privacy Policy</a>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="ml-auto px-8 py-3 bg-nvm-green-primary text-white rounded-lg font-medium hover:bg-nvm-green-dark transition-colors shadow-lg"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-nvm-gold-primary text-white rounded-lg font-medium hover:bg-nvm-gold-dark transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit for Approval
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
