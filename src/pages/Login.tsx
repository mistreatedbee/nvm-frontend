import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authAPI } from '../lib/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../lib/store';
import { motion } from 'framer-motion';

interface LoginForm {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data);
      const { user, token, message, requiresTwoFactor } = response.data;

      // Backend may return requiresTwoFactor without token/user — do not call setAuth in that case
      if (requiresTwoFactor && !token) {
        toast.error('Enter your 2FA code above and click Sign In again.');
        setIsLoading(false);
        return;
      }

      if (!token || !user) {
        toast.error('Invalid login response. Please try again.');
        setIsLoading(false);
        return;
      }

      setAuth(user, token);
      await Promise.all([
        useCartStore.getState().mergeGuestCartToServer().catch(() => useCartStore.getState().syncFromServer()),
        useWishlistStore.getState().syncFromServer()
      ]);
      
      // Show appropriate success message
      if (user.role === 'admin') {
        toast.success(message || '✅ Admin credentials verified and vetted. Access granted.', {
          duration: 4000,
          icon: '🔐',
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: 'bold',
          },
        });
        // Redirect to admin dashboard
        setTimeout(() => navigate('/admin'), 1000);
      } else if (redirectTo && redirectTo.startsWith('/')) {
        toast.success('Logged in successfully!');
        navigate(redirectTo);
      } else if (user.role === 'vendor') {
        toast.success('Logged in successfully!');
        navigate('/vendor/dashboard');
      } else {
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error: any) {
      const isConnectionError = error?.code === 'ERR_NETWORK' || error?.code === 'ERR_CONNECTION_CLOSED' || error?.code === 'ERR_HTTP2_SERVER_REFUSED_STREAM';
      if (isConnectionError) {
        toast.error('Server is unreachable. If using Render free tier, it may be starting up — please try again in 30–60 seconds.');
      } else {
        toast.error(error.response?.data?.message || 'Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nvm-green-bg flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center">
            <img 
              src="/logo.jpeg" 
              alt="NVM - Ndingoho Vendor Markets" 
              className="h-24 w-auto mb-4 object-contain"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-nvm-green-primary">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-primary ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-primary ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm text-nvm-green-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                2FA code <span className="text-gray-400 font-normal">(if enabled)</span>
              </label>
              <input
                id="twoFactorCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                {...register('twoFactorCode')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-nvm-green-primary text-white py-3 rounded-lg font-medium hover:bg-nvm-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-nvm-green-primary font-medium hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
