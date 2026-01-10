import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderManagementAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, X, CheckCircle, FileImage, Loader2 } from 'lucide-react';

interface PaymentProofUploadProps {
  orderId: string;
  existingProof?: {
    url: string;
    uploadedAt: string;
  };
  paymentStatus: string;
  onUploadSuccess: () => void;
}

export function PaymentProofUpload({ 
  orderId, 
  existingProof, 
  paymentStatus,
  onUploadSuccess 
}: PaymentProofUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);

      await orderManagementAPI.uploadPaymentProof(orderId, formData);

      toast.success('Payment proof uploaded successfully!');
      setSelectedFile(null);
      setPreview('');
      setShowUploadForm(false);
      onUploadSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview('');
    setShowUploadForm(false);
  };

  // Show existing proof
  if (existingProof && paymentStatus === 'awaiting-confirmation') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <FileImage className="w-8 h-8 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 mb-2">
              Payment Proof Submitted
            </h3>
            <p className="text-sm text-orange-700 mb-4">
              Your payment proof has been uploaded and is awaiting vendor confirmation.
            </p>
            <a
              href={existingProof.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              <FileImage className="w-4 h-4" />
              View Uploaded Proof
            </a>
            <p className="text-xs text-orange-600 mt-2">
              Uploaded: {new Date(existingProof.uploadedAt).toLocaleString('en-ZA')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show confirmation if payment is confirmed
  if (paymentStatus === 'paid') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900 mb-1">
              Payment Confirmed
            </h3>
            <p className="text-sm text-green-700">
              Your payment has been verified and confirmed by the vendor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show upload interface for pending payments
  if (paymentStatus === 'pending' || paymentStatus === 'failed') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Payment Proof
          </h3>
          <p className="text-sm text-yellow-700">
            After making your EFT payment, upload proof of payment (screenshot or receipt) for verification.
          </p>
        </div>

        <AnimatePresence>
          {!showUploadForm ? (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              Upload Payment Proof
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Payment Proof Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-nvm-green-primary transition-colors">
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 text-center">
                          Click to select or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative"
                >
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        Selected File: {selectedFile?.name}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreview('');
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={preview}
                      alt="Payment proof preview"
                      className="w-full max-h-64 object-contain rounded border border-gray-200"
                    />
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Proof
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

