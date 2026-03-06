import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useCartStore } from '../lib/store';
import { formatRands } from '../lib/currency';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, syncFromServer, syncing } = useCartStore();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    syncFromServer().catch(() => {});
  }, [syncFromServer]);

  const subtotal = getTotal();
  const shipping = items.length > 0 ? 50 : 0;
  const tax = subtotal * 0.15;
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
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Your Cart
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {items.length === 0 ? 'Review your items and checkout' : `You have ${items.length} premium items ready.`}
          </p>
        </header>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm"
          >
            <div className="bg-slate-50 p-6 rounded-full mb-6">
              <ShoppingBag className="w-16 h-16 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Your cart is feeling light</h2>
            <p className="text-slate-500 mt-2 mb-8 text-center max-w-xs">
              Explore our marketplace to find something special for your collection.
            </p>
            <Link
              to="/marketplace"
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
            >
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-xl bg-slate-100 aspect-square w-full sm:w-32 h-32">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-nvm-green-primary transition-colors">
                            {item.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-wider">
                            {item.vendor?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        {/* Modern Stepper */}
                        <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-200">
                          <button
                            onClick={() => adjustQuantity(item.productId, item.quantity, -1)}
                            disabled={loadingIds.has(item.productId) || item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-600 disabled:opacity-30 transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-slate-900">
                            {loadingIds.has(item.productId) ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => adjustQuantity(item.productId, item.quantity, 1)}
                            disabled={loadingIds.has(item.productId)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm text-slate-600 disabled:opacity-30 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-black text-slate-900">
                            {formatRands(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">{formatRands(item.price)} per unit</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4">
                <Link to="/marketplace" className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-2 group transition-all">
                   <span className="group-hover:-translate-x-1 transition-transform">←</span> Continue Shopping
                </Link>
                <button 
                  onClick={() => {}} // Add clear cart function if available
                  className="text-sm text-slate-400 hover:text-red-500 font-medium transition-colors"
                >
                  Clear all items
                </button>
              </div>
            </div>

            {/* Modern Sidebar Summary */}
            <aside className="lg:col-span-4">
              <div className="bg-slate-900 text-white rounded-3xl p-8 sticky top-24 shadow-2xl shadow-slate-200 overflow-hidden relative">
                {/* Visual Accent Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                
                <h2 className="text-2xl font-bold mb-8">Summary</h2>
                
                <div className="space-y-4 text-slate-300">
                  <div className="flex justify-between">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-white font-bold">{formatRands(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 font-medium">
                      Shipping <Truck className="w-4 h-4 text-slate-400" />
                    </span>
                    <span className="text-white font-bold">{formatRands(shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">VAT (15%)</span>
                    <span className="text-white font-bold">{formatRands(tax)}</span>
                  </div>
                  
                  <div className="h-px bg-slate-800 my-6" />
                  
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-bold">Total</span>
                    <div className="text-right">
                      <p className="text-3xl font-black text-white">{formatRands(total)}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full mt-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Secure Checkout <ShieldCheck className="w-5 h-5" />
                </button>

                <div className="mt-8 flex flex-col items-center gap-4 text-slate-400 text-xs">
                  <p className="flex items-center gap-2 italic">
                    <ShieldCheck className="w-3.5 h-3.5" /> 256-bit SSL encrypted payment
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Syncing Indicator */}
      {syncing && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="w-2 h-2 bg-nvm-green-primary rounded-full animate-ping" />
          Updating your cart...
        </div>
      )}
    </div>
  );
}
