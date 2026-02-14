import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, Mail } from 'lucide-react';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function EmailVerification() {
  const navigate = useNavigate();
  const query = useQuery();
  const params = useParams();
  const tokenFromQuery = query.get('token');
  const token = tokenFromQuery || params.token || '';

  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verify = async (token: string) => {
    setIsVerifying(true);
    try {
      await authAPI.verifyEmail(token);
      setIsVerified(true);
      toast.success('Email verified successfully');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (token) {
      verify(token);
    }
  }, [token]);

  const resend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await authAPI.resendVerification(email);
      toast.success('If that email exists, a verification email has been sent');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Unable to resend right now');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-nvm-green-bg flex items-center justify-center">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-nvm-dark-900 mb-2">Email Verified</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nvm-green-bg flex items-center justify-center py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Mail className="w-16 h-16 text-nvm-green-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-nvm-dark-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            {token ? 'Processing your verification link...' : 'Did not get the email? Resend verification.'}
          </p>
        </div>

        {!token && (
          <form onSubmit={resend} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              disabled={isResending}
              className="w-full bg-nvm-green-primary text-white py-3 rounded-lg font-medium hover:bg-nvm-green-600 transition-colors disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>
          </form>
        )}

        {token && isVerifying && <p className="text-center text-sm text-gray-500">Verifying...</p>}
      </motion.div>
    </div>
  );
}
