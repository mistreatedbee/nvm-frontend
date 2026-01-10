import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useCartStore } from '../lib/store';
import { formatRands } from '../lib/currency';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  const subtotal = getTotal();
  const shipping = items.length > 0 ? 50 : 0; // R50 standard shipping
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

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
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-8 py-4 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl"
            >
              Continue Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-6">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-nvm-dark-900 mb-1">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.vendor.name}</p>
                          </div>
                          <button
                            onClick={() => {
                              removeItem(item.productId);
                              toast.success('Removed from cart');
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          >
                            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-nvm-green-500 hover:bg-nvm-green-50 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-nvm-green-500 hover:bg-nvm-green-50 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-nvm-gold-primary">
                              {formatRands(item.price * item.quantity)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRands(item.price)} each
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="w-full py-3 text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Clear Cart
              </button>
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
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-nvm-dark-900">Total</span>
                      <span className="text-2xl font-bold text-nvm-gold-primary">
                        {formatRands(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  to="/marketplace"
                  className="block w-full py-3 text-center text-nvm-green-primary font-medium hover:text-nvm-green-600 transition-colors mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
