import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { vendorsAPI } from '../lib/api';
import { Navbar } from '../components/Navbar';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  CreditCard,
  Building2,
  User,
  Globe,
  Upload,
  CheckCircle
} from 'lucide-react';

interface VendorRegistrationForm {
  // Business Information
  storeName: string;
  description: string;
  category: string;
  businessType: string;
  taxId?: string;
  
  // Contact Information
  email: string;
  phone: string;
  website?: string;
  
  // Address
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  
  // Banking Details
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    branchCode: string;
    accountType: string;
  };
  
  // Social Media
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export function VendorRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm<VendorRegistrationForm>({
    mode: 'onChange' // Enable validation on change
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: VendorRegistrationForm) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Add all form fields
      formData.append('storeName', data.storeName);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('businessType', data.businessType);
      if (data.taxId) formData.append('taxId', data.taxId);
      
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      if (data.website) formData.append('website', data.website);
      
      formData.append('address[street]', data.street);
      formData.append('address[city]', data.city);
      formData.append('address[state]', data.state);
      formData.append('address[country]', data.country);
      formData.append('address[zipCode]', data.zipCode);
      
      formData.append('bankDetails[accountHolderName]', data.bankDetails.accountHolderName);
      formData.append('bankDetails[accountNumber]', data.bankDetails.accountNumber);
      formData.append('bankDetails[bankName]', data.bankDetails.bankName);
      formData.append('bankDetails[branchCode]', data.bankDetails.branchCode);
      formData.append('bankDetails[accountType]', data.bankDetails.accountType);
      
      if (data.facebook) formData.append('socialMedia[facebook]', data.facebook);
      if (data.instagram) formData.append('socialMedia[instagram]', data.instagram);
      if (data.twitter) formData.append('socialMedia[twitter]', data.twitter);
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await vendorsAPI.create(formData);
      
      toast.success('Vendor registration submitted successfully! Awaiting admin approval.');
      navigate('/vendor/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 4;

  // Validate current step before moving to next
  const validateStep = async (step: number) => {
    let fieldsToValidate: any[] = [];
    
    switch (step) {
      case 1: // Business Information
        fieldsToValidate = ['storeName', 'description', 'category', 'businessType'];
        break;
      case 2: // Contact Information
        fieldsToValidate = ['email', 'phone'];
        break;
      case 3: // Address
        fieldsToValidate = ['street', 'city', 'state', 'zipCode', 'country'];
        break;
      case 4: // Banking Details
        fieldsToValidate = [
          'bankDetails.accountHolderName',
          'bankDetails.bankName',
          'bankDetails.accountType',
          'bankDetails.accountNumber',
          'bankDetails.branchCode'
        ];
        break;
    }
    
    const result = await trigger(fieldsToValidate as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill in all required fields before continuing');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
            Become a Vendor
          </h1>
          <p className="text-gray-600">
            Complete the registration form to start selling on NVM Marketplace
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step
                    ? 'bg-nvm-green-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-nvm-green-primary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">Business Info</span>
            <span className="text-xs text-gray-600">Contact</span>
            <span className="text-xs text-gray-600">Address</span>
            <span className="text-xs text-gray-600">Banking</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-nvm-dark-900 mb-6 flex items-center gap-2">
                  <Store className="w-6 h-6" />
                  Business Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      {...register('storeName', { required: 'Store name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="Your Store Name"
                    />
                    {errors.storeName && (
                      <p className="mt-1 text-sm text-red-600">{errors.storeName.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Description *
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="Tell customers about your business..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="fashion">Fashion</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food & Beverages</option>
                      <option value="services">Services</option>
                      <option value="health">Health & Wellness</option>
                      <option value="beauty">Beauty & Cosmetics</option>
                      <option value="home">Home & Garden</option>
                      <option value="sports">Sports & Fitness</option>
                      <option value="books">Books & Media</option>
                      <option value="art">Art & Crafts</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      {...register('businessType', { required: 'Business type is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    >
                      <option value="">Select type</option>
                      <option value="individual">Individual</option>
                      <option value="business">Business</option>
                      <option value="freelancer">Freelancer</option>
                    </select>
                    {errors.businessType && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID (Optional)
                    </label>
                    <input
                      type="text"
                      {...register('taxId')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="VAT/Tax Registration Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store Logo
                    </label>
                    <div className="flex items-center gap-4">
                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-nvm-dark-900 mb-6 flex items-center gap-2">
                  <Phone className="w-6 h-6" />
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="vendor@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone number is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="+27 XX XXX XXXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      type="url"
                      {...register('website')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook (Optional)
                    </label>
                    <input
                      type="url"
                      {...register('facebook')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram (Optional)
                    </label>
                    <input
                      type="url"
                      {...register('instagram')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Address */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-nvm-dark-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Business Address
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      {...register('street', { required: 'Street address is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="Johannesburg"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province/State *
                    </label>
                    <input
                      type="text"
                      {...register('state', { required: 'Province/State is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="Gauteng"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      {...register('zipCode', { required: 'Postal code is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="2000"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      {...register('country', { required: 'Country is required' })}
                      defaultValue="South Africa"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    />
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Banking Details */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
                  <p className="text-green-800 font-bold">✅ YOU ARE NOW ON STEP 4 - BANKING DETAILS</p>
                  <p className="text-sm text-green-700">All 5 fields should be visible below</p>
                </div>

                <h2 className="text-xl font-bold text-nvm-dark-900 mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Banking Details (For EFT Payments)
                </h2>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Your banking details will be displayed on invoices for customers
                    who choose EFT payment. Ensure all information is accurate.
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4 mb-4">
                  <p className="font-bold text-blue-800">🔹 FIELD 1 of 5: ACCOUNT HOLDER NAME</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name *
                    </label>
                    <input
                      type="text"
                      {...register('bankDetails.accountHolderName', {
                        required: 'Account holder name is required'
                      })}
                      className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="Full name as it appears on bank account"
                    />
                    {errors.bankDetails?.accountHolderName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankDetails.accountHolderName.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                    <p className="font-bold text-blue-800 mb-2">🔹 FIELD 2 of 5: BANK NAME</p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name *
                    </label>
                    <select
                      {...register('bankDetails.bankName', { required: 'Bank name is required' })}
                      className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    >
                      <option value="">Select bank</option>
                      <option value="ABSA">ABSA</option>
                      <option value="Standard Bank">Standard Bank</option>
                      <option value="FNB">First National Bank (FNB)</option>
                      <option value="Nedbank">Nedbank</option>
                      <option value="Capitec">Capitec</option>
                      <option value="Discovery Bank">Discovery Bank</option>
                      <option value="TymeBank">TymeBank</option>
                      <option value="Investec">Investec</option>
                      <option value="African Bank">African Bank</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.bankDetails?.bankName && (
                      <p className="mt-1 text-sm text-red-600">{errors.bankDetails.bankName.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                    <p className="font-bold text-blue-800 mb-2">🔹 FIELD 3 of 5: ACCOUNT TYPE</p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Type *
                    </label>
                    <select
                      {...register('bankDetails.accountType', { required: 'Account type is required' })}
                      className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                    >
                      <option value="">Select account type</option>
                      <option value="savings">Savings</option>
                      <option value="current">Current/Cheque</option>
                      <option value="business">Business</option>
                    </select>
                    {errors.bankDetails?.accountType && (
                      <p className="mt-1 text-sm text-red-600">{errors.bankDetails.accountType.message}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                    <p className="font-bold text-blue-800 mb-2">🔹 FIELD 4 of 5: ACCOUNT NUMBER</p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      {...register('bankDetails.accountNumber', {
                        required: 'Account number is required',
                        pattern: {
                          value: /^[0-9]+$/,
                          message: 'Account number must contain only numbers'
                        }
                      })}
                      className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="Enter account number"
                    />
                    {errors.bankDetails?.accountNumber && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.bankDetails.accountNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                    <p className="font-bold text-blue-800 mb-2">🔹 FIELD 5 of 5: BRANCH CODE</p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch Code *
                    </label>
                    <input
                      type="text"
                      {...register('bankDetails.branchCode', {
                        required: 'Branch code is required',
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: 'Branch code must be 6 digits'
                        }
                      })}
                      className="w-full px-4 py-3 border-2 border-red-500 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
                      placeholder="6-digit branch code"
                      maxLength={6}
                    />
                    {errors.bankDetails?.branchCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.bankDetails.branchCode.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Previous
                </button>
              )}
              {currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium ml-auto"
                >
                  Next
                </button>
              )}
              {currentStep === totalSteps && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

