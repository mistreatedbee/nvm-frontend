import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { notificationsAPI } from '../lib/api';
import { Link } from 'react-router-dom';

type NotificationType = 'ORDER' | 'APPROVAL' | 'ACCOUNT' | 'CHAT_ESCALATION' | 'SYSTEM' | 'PAYOUT' | 'REVIEW' | 'SECURITY';

interface AppNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export function Notifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getAll({ page: 1, limit: 100 });
      setItems(res.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAsRead = async (id: string) => {
    await notificationsAPI.markAsRead(id);
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const markAll = async () => {
    await notificationsAPI.markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <button onClick={markAll} className="text-sm font-medium text-nvm-green-primary hover:text-nvm-green-600">
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border p-6 text-gray-500">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border p-6 text-gray-500">No notifications available.</div>
        ) : (
          <div className="bg-white rounded-xl border divide-y">
            {items.map((item) => (
              <div key={item._id} className={`p-4 ${item.isRead ? 'bg-white' : 'bg-emerald-50'}`}>
                <p className="text-xs text-gray-400 mb-1">{new Date(item.createdAt).toLocaleString()}</p>
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                <div className="mt-3 flex items-center gap-3">
                  {!item.isRead && (
                    <button onClick={() => markAsRead(item._id)} className="text-sm font-medium text-nvm-green-primary hover:text-nvm-green-600">
                      Mark as read
                    </button>
                  )}
                  {item.linkUrl && (
                    <Link to={item.linkUrl} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Open
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
