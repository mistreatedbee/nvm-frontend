import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../lib/api';

interface AppNotification {
  _id: string;
  type: 'ORDER' | 'APPROVAL' | 'ACCOUNT' | 'CHAT_ESCALATION' | 'SYSTEM' | 'PAYOUT' | 'REVIEW' | 'SECURITY';
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

const POLL_MS = 30000;

export function NotificationBell() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        notificationsAPI.getAll({ page: 1, limit: 8 }),
        notificationsAPI.getUnreadCount()
      ]);

      setNotifications(listRes.data?.data || []);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, POLL_MS);
    return () => clearInterval(timer);
  }, []);

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notifications]
  );

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_error) {
      // noop
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_error) {
      // noop
    }
  };

  const removeNotification = async (id: string) => {
    const item = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (item && !item.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationsAPI.delete(id);
    } catch (_error) {
      loadNotifications();
    }
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-0 mt-2 w-[24rem] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-nvm-green-primary hover:text-nvm-green-600 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loading && sorted.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">Loading...</div>
                ) : sorted.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">No notifications yet.</div>
                ) : (
                  sorted.map((item) => (
                    <div
                      key={item._id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${item.isRead ? '' : 'bg-emerald-50'}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {item.linkUrl ? (
                            <Link
                              to={item.linkUrl}
                              onClick={() => {
                                markAsRead(item._id);
                                setShowDropdown(false);
                              }}
                              className="block"
                            >
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTime(item.createdAt)}</p>
                            </Link>
                          ) : (
                            <button
                              onClick={() => markAsRead(item._id)}
                              className="text-left w-full"
                            >
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTime(item.createdAt)}</p>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => removeNotification(item._id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowDropdown(false)}
                  className="text-sm text-nvm-green-primary hover:text-nvm-green-600 font-medium"
                >
                  Open notification center
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
