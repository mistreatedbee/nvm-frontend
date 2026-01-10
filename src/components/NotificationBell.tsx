import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, CheckCircle, XCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'order' | 'payment' | 'status' | 'approval';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // TODO: Connect to Socket.IO for real-time notifications
  useEffect(() => {
    // Mock notifications for demonstration
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'order',
        title: 'New Order',
        message: 'You have received a new order #NVM231234',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        link: '/vendor/orders'
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Confirmed',
        message: 'Payment for order #NVM231230 has been confirmed',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        link: '/vendor/orders'
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const handleRemove = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const notif = notifications.find(n => n.id === notificationId);
    if (notif && !notif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'status':
        return <Bell className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-nvm-green-primary hover:text-nvm-green-600 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notif.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {notif.link ? (
                            <Link
                              to={notif.link}
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                setShowDropdown(false);
                              }}
                              className="block"
                            >
                              <p className="font-medium text-gray-900 mb-1">
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notif.timestamp)}
                              </p>
                            </Link>
                          ) : (
                            <>
                              <p className="font-medium text-gray-900 mb-1">
                                {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {notif.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notif.timestamp)}
                              </p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemove(notif.id)}
                          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <button className="w-full text-sm text-nvm-green-primary hover:text-nvm-green-600 font-medium text-center">
                    View All Notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

