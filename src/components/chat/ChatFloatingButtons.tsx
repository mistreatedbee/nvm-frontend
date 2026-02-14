import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { VendorAssistantModal } from './VendorAssistantModal';

const HIDE_ON_PATHS = ['/login', '/register', '/forgot-password'];

export function ChatFloatingButtons() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const hide = useMemo(() => {
    if (!isAuthenticated) return true;
    if (location.pathname.startsWith('/chat')) return true;
    return HIDE_ON_PATHS.some(path => location.pathname.startsWith(path));
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handler = () => setAssistantOpen(true);
    window.addEventListener('nvm:open-assistant', handler as EventListener);
    return () => window.removeEventListener('nvm:open-assistant', handler as EventListener);
  }, []);

  if (hide) {
    return null;
  }

  return (
    <>
      <div className="fixed z-50 right-4 bottom-4 md:right-6 md:bottom-6 flex flex-col gap-3">
        {user?.role === 'vendor' && (
          <button
            onClick={() => setAssistantOpen(true)}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-nvm-gold-primary to-nvm-earth-terracotta text-white px-4 py-3 shadow-xl hover:scale-[1.02] transition"
            aria-label="Open vendor assistant"
          >
            <Bot className="w-5 h-5" />
            <span className="hidden md:inline text-sm font-semibold">AI Assistant</span>
          </button>
        )}

        <button
          onClick={() => navigate('/chat')}
          className="group flex items-center gap-2 rounded-full bg-nvm-green-primary text-white px-4 py-3 shadow-xl hover:scale-[1.02] transition"
          aria-label="Open messages"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden md:inline text-sm font-semibold">Messages</span>
        </button>
      </div>

      {user?.role === 'vendor' && (
        <VendorAssistantModal open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      )}
    </>
  );
}
