import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X, Lock } from 'lucide-react';
import { useLoginPromptStore } from '../lib/store';

export function LoginRequiredModal() {
  const navigate = useNavigate();
  const { isOpen, close } = useLoginPromptStore();

  if (!isOpen) return null;

  const goTo = (path: string) => {
    close();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-nvm-gold-primary" />
            <p className="font-semibold text-lg">Login Required to Checkout</p>
          </div>
          <button onClick={close} aria-label="Close" className="text-white/90 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-gray-600 leading-relaxed mb-6">
            You need to be logged in to complete your purchase. Please log in to your account or create a new account to continue.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => goTo('/login')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-nvm-green-primary text-white rounded-xl font-semibold hover:bg-nvm-green-dark transition-colors shadow-md"
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
            <button
              onClick={() => goTo('/register')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-nvm-gold-primary text-nvm-gold-dark rounded-xl font-semibold hover:bg-nvm-gold-bg transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </button>
            <button
              onClick={close}
              className="w-full px-5 py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
