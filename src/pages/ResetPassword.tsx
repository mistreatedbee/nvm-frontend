import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch('password');

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword(token, { password: data.password });
      const { user, token: authToken } = response.data;
      setAuth(user, authToken);
      toast.success('Password reset successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img 
              src="/logo.jpeg" 
              alt="NVM" 
              className="h-24 w-auto mb-4 mx-auto object-contain"
            />
          </Link>
          <Lock className="w-16 h-16 text-nvm-green-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-nvm-green-primary">Reset Password</h2>
          <p className="mt-2 text-gray-600">Enter your new password</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
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
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-primary ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-nvm-green-primary text-white py-3 rounded-lg font-medium hover:bg-nvm-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

