import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useCartStore } from '../lib/store';
import { formatRands } from '../lib/currency';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotal, syncFromServer, syncing } = useCartStore();
  
  // Track which items are currently "in flight" to the server
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    syncFromServer().catch(() => {});
  }, [syncFromServer]);

  const subtotal = getTotal();
  const shipping = items.length > 0 ? 50 : 0;
  const tax = subtotal * 0.15;
  const total = subtotal + shipping + tax;

  // IMPROVED: Direct, clean logic for quantity changes
  const adjustQuantity = async (productId: string, currentQty: number, adjustment: number) => {
    const newQty = currentQty + adjustment;

    // 1. Safety check: Don't go below 1
    if (newQty < 1) return;
    
    // 2. Prevent double-clicks while updating
    if (loadingIds.has(productId)) return;

    // 3. Set loading state for this specific item
    setLoadingIds(prev => new Set(prev).add(productId));

    try {
      await updateQuantity(productId, newQty);
    } catch (error: any) {
      toast.error('Could not update quantity');
      console.error(error);
    } finally {
      // 4. Remove loading state
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <Link to="/marketplace" className="text-nvm-green-primary font-semibold">Start Shopping →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode='popLayout'>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white p-6 rounded-xl shadow-sm flex gap-6 items-center"
                  >
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.vendor?.name}</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border rounded-lg bg-gray-50">
                          {/* MINUS BUTTON */}
                          <button
                            onClick={() => adjustQuantity(item.productId, item.quantity, -1)}
                            disabled={loadingIds.has(item.productId) || item.quantity <= 1}
                            className="p-2 hover:text-nvm-green-primary disabled:opacity-30"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <span className="w-8 text-center font-medium">
                            {loadingIds.has(item.productId) ? '...' : item.quantity}
                          </span>
                          
                          {/* PLUS BUTTON */}
                          <button
                            onClick={() => adjustQuantity(item.productId, item.quantity, 1)}
                            disabled={loadingIds.has(item.productId)}
                            className="p-2 hover:text-nvm-green-primary disabled:opacity-30"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-bold text-nvm-gold-primary">{formatRands(item.price * item.quantity)}</p>
                          <button 
                            onClick={() => removeItem(item.productId)}
                            className="text-xs text-red-500 hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* SUMMARY SIDEBAR */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 pb-6 border-bottom">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatRands(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{formatRands(shipping)}</span></div>
                <div className="flex justify-between"><span>VAT (15%)</span><span>{formatRands(tax)}</span></div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t">
                  <span>Total</span><span className="text-nvm-gold-primary">{formatRands(total)}</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-nvm-green-primary text-white py-4 rounded-lg font-bold mt-4 hover:bg-opacity-90 transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
