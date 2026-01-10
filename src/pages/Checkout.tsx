import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Navbar } from '../components/Navbar';
import { useCartStore, useAuthStore } from '../lib/store';
import { ordersAPI } from '../lib/api';
import { formatRands } from '../lib/currency';
import { CreditCard, MapPin, Package, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  paymentMethod: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getTotal();
  const shipping = 50;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutForm) => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country || 'South Africa',
          zipCode: data.zipCode,
        },
        paymentMethod: data.paymentMethod,
      };

      const response = await ordersAPI.create(orderData);
      
      clearCart();
      setStep('success');
      toast.success('Order placed successfully!');
      
      setTimeout(() => {
        navigate('/customer/dashboard');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-white rounded-2xl shadow-xl max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-nvm-dark-900 mb-4">Order Successful!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. You'll receive an order confirmation email shortly.
          </p>
          <button
            onClick={() => navigate('/customer/dashboard')}
            className="px-8 py-3 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-colors"
          >
            View Orders
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">Complete your order</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Shipping Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-nvm-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-nvm-green-600" />
                  </div>
                  <h2 className="text-xl font-display font-bold">Shipping Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      {...register('fullName', { required: 'Name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="John Doe"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="+27 12 345 6789"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      {...register('street', { required: 'Address is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="123 Main Street"
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="Johannesburg"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province
                    </label>
                    <input
                      type="text"
                      {...register('state', { required: 'Province is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="Gauteng"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      {...register('zipCode', { required: 'Postal code is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-nvm-green-500"
                      placeholder="2000"
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Payment Method */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-nvm-gold-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-nvm-gold-600" />
                  </div>
                  <h2 className="text-xl font-display font-bold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-nvm-green-500 transition-colors">
                    <input
                      type="radio"
                      value="stripe"
                      {...register('paymentMethod', { required: true })}
                      className="w-5 h-5 text-nvm-green-500"
                    />
                    <div className="ml-4">
                      <p className="font-semibold">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-nvm-green-500 transition-colors">
                    <input
                      type="radio"
                      value="cash-on-delivery"
                      {...register('paymentMethod', { required: true })}
                      className="w-5 h-5 text-nvm-green-500"
                    />
                    <div className="ml-4">
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when you receive</p>
                    </div>
                  </label>
                </div>
              </motion.div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : `Place Order - ${formatRands(total)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-display font-bold text-nvm-dark-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-nvm-gold-primary">
                        {formatRands(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatRands(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold">{formatRands(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (15%)</span>
                  <span className="font-semibold">{formatRands(tax)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-nvm-dark-900">Total</span>
                    <span className="text-2xl font-bold text-nvm-gold-primary">
                      {formatRands(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
