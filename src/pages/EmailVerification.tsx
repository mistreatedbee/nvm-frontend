import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, Mail } from 'lucide-react';

export function EmailVerification() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [code, setCode] = useState('');
  const [useCode, setUseCode] = useState(false);

  const handleVerifyWithToken = async () => {
    if (!token) return;
    
    setIsVerifying(true);
    try {
      await authAPI.verifyEmail(token);
      setIsVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsVerifying(true);
    try {
      await authAPI.verifyEmailWithCode({ code });
      setIsVerified(true);
      toast.success('Email verified successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setIsVerifying(false);
    }
  };

  React.useEffect(() => {
    if (token && !useCode) {
      handleVerifyWithToken();
    }
  }, [token]);

  if (isVerified) {
    return (
      <div className="min-h-screen bg-nvm-green-bg flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-nvm-dark-900 mb-2">
            Email Verified!
          </h2>
          <p className="text-gray-600">Redirecting you to the homepage...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nvm-green-bg flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 text-nvm-green-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-nvm-dark-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            {useCode 
              ? 'Enter the 6-digit code sent to your email'
              : 'Verifying your email address...'}
          </p>
        </div>

        {useCode ? (
          <form onSubmit={handleVerifyWithCode} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying || code.length !== 6}
              className="w-full bg-nvm-green-primary text-white py-3 rounded-lg font-medium hover:bg-nvm-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setUseCode(true)}
              className="text-nvm-green-primary hover:underline"
            >
              Use verification code instead
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

