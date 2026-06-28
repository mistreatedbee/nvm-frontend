import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useCartStore } from '../lib/store';
import { formatRands, TAX_RATE } from '../lib/currency';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

// Animation variants for the list items
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, syncFromServer, syncing } = useCartStore();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    syncFromServer().catch(() => {});
  }, [syncFromServer]);

  const subtotal = getTotal();
  const shipping = items.length > 0 ? 50 : 0;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const adjustQuantity = async (productId: string, currentQty: number, adjustment: number) => {
    const newQty = currentQty + adjustment;
    if (newQty < 1 || loadingIds.has(productId)) return;

    setLoadingIds(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQty);
    } catch (error: any) {
      toast.error('Could not update quantity');
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with entrance animation */}
        <motion.header 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-end gap-4 mb-12"
        >
          <h1 className="text-4xl font-bold text-nvm-dark-900">My Cart</h1>
          <div className="h-8 w-px bg-gray-200 mb-1" />
          <span className="text-gray-500 mb-1 font-medium">{items.length} Items</span>
        </motion.header>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 rounded-3xl bg-gray-50 border border-gray-100"
          >
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
            <Link
              to="/marketplace"
              className="mt-6 flex items-center gap-2 px-8 py-3 bg-nvm-green-primary text-white rounded-full font-bold hover:shadow-lg transition-all active:scale-95"
            >
              Back to Marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Products List */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-8 space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    className="relative group bg-white border-b border-gray-100 pb-8 flex flex-col sm:flex-row gap-6 items-center"
                  >
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-2xl shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      {loadingIds.has(item.productId) && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-nvm-green-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-nvm-dark-900">{item.name}</h3>
                          <p className="text-nvm-green-primary font-medium text-sm">{item.vendor?.name}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        {/* Custom Animated Stepper */}
                        <div className="flex items-center bg-gray-50 rounded-xl p-1">
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => adjustQuantity(item.productId, item.quantity, -1)}
                            disabled={loadingIds.has(item.productId) || item.quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-nvm-dark-900 disabled:opacity-20"
                          >
                            <Minus className="w-4 h-4" />
                          </motion.button>
                          
                          <motion.span 
                            key={item.quantity}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-8 text-center font-bold text-nvm-dark-900"
                          >
                            {item.quantity}
                          </motion.span>

                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => adjustQuantity(item.productId, item.quantity, 1)}
                            disabled={loadingIds.has(item.productId)}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-nvm-dark-900 disabled:opacity-20"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-nvm-gold-primary leading-none">
                            {formatRands(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">Subtotal</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Sidebar Summary */}
            <motion.aside 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-4"
            >
              <div className="bg-gray-50/50 backdrop-blur-md rounded-[32px] p-8 border border-gray-100 sticky top-24">
                <div className="flex items-center gap-2 mb-8">
                  <Sparkles className="w-5 h-5 text-nvm-gold-primary" />
                  <h2 className="text-2xl font-bold text-nvm-dark-900">Order Summary</h2>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Subtotal</span>
                    <span>{formatRands(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Shipping</span>
                    <span>{formatRands(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>VAT ({TAX_RATE * 100}%)</span>
                    <span>{formatRands(tax)}</span>
                  </div>
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-end">
                      <span className="text-gray-900 font-bold">Total Amount</span>
                      <span className="text-3xl font-black text-nvm-gold-primary">
                        {formatRands(total)}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/checkout')}
                  className="w-full py-5 bg-nvm-green-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-nvm-green-primary/20 hover:bg-nvm-green-600 transition-all flex items-center justify-center gap-3"
                >
                  Checkout Now <CreditCard className="w-5 h-5" />
                </motion.button>

                <p className="mt-6 text-center text-xs text-gray-400 font-medium px-4">
                  Shipping costs are calculated based on your location and will be finalized at checkout.
                </p>
              </div>
            </motion.aside>
          </div>
        )}
      </main>

      {/* Floating Sync State */}
      <AnimatePresence>
        {syncing && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-8 bg-nvm-dark-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl z-50"
          >
            <div className="w-2 h-2 bg-nvm-green-primary rounded-full animate-ping" />
            <span className="text-sm font-bold tracking-wide">Syncing your cart...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
