import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { notificationsAPI } from '../lib/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

type NotificationType = 'ORDER' | 'VENDOR_APPROVAL' | 'ACCOUNT_STATUS' | 'SYSTEM';

interface AppNotification {
  _id: string;
  type: NotificationType;
  subType?: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export function Notifications() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [type, setType] = useState<'' | NotificationType>('');

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationsAPI.getAll({
        page,
        limit: 20,
        unreadOnly: unreadOnly ? 'true' : undefined,
        type: type || undefined
      });
      const countRes = await notificationsAPI.getUnreadCount();
      setItems(res.data?.data || []);
      setPages(res.data?.pages || 1);
      setUnreadCount(countRes.data?.unreadCount || 0);
    } catch (_error) {
      toast.error('Failed to load notifications');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, unreadOnly, type]);

  const markAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAll = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Marked all as read');
    } catch (_error) {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            <p className="text-sm text-gray-500">Unread: {unreadCount}</p>
          </div>
          <button onClick={markAll} className="text-sm font-medium text-nvm-green-primary hover:text-nvm-green-600">
            Mark all as read
          </button>
        </div>

        <div className="bg-white rounded-xl border p-4 mb-4 flex flex-wrap gap-2">
          <select
            value={unreadOnly ? 'unread' : 'all'}
            onChange={(e) => { setUnreadOnly(e.target.value === 'unread'); setPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
          </select>
          <select
            value={type}
            onChange={(e) => { setType(e.target.value as '' | NotificationType); setPage(1); }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="ORDER">Order</option>
            <option value="VENDOR_APPROVAL">Vendor Approval</option>
            <option value="ACCOUNT_STATUS">Account Status</option>
            <option value="SYSTEM">System</option>
          </select>
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
                <p className="text-xs text-gray-500 mb-1">{item.type}{item.subType ? ` • ${item.subType}` : ''}</p>
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                <div className="mt-3 flex items-center gap-3">
                  {!item.isRead && (
                    <button onClick={() => void markAsRead(item._id)} className="text-sm font-medium text-nvm-green-primary hover:text-nvm-green-600">
                      Mark as read
                    </button>
                  )}
                  {item.linkUrl && (
                    <Link
                      to={item.linkUrl}
                      onClick={() => {
                        if (!item.isRead) {
                          void markAsRead(item._id);
                        }
                      }}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Open
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && pages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">Page {page} of {pages}</div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
                disabled={page >= pages}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
