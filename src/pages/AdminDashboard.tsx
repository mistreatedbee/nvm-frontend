import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { formatRands } from '../lib/currency';
import { dashboardAPI } from '../lib/api';
import {
  AlertTriangle,
  BookOpen,
  Clock,
  GraduationCap,
  MessageCircle,
  Newspaper,
  Package,
  RefreshCw,
  Shield,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Users
} from 'lucide-react';

type AdminOverview = {
  stats: {
    vendors: { total: number; active: number; pending: number; suspended: number; rejected: number };
    products: { total: number; published: number; pending: number; draft: number; rejected: number; inactive: number };
    orders: {
      total: number;
      byStatus: { pending: number; processing: number; shipped: number; delivered: number; cancelled: number };
      paidCount: number;
      unpaidCount: number;
    };
    revenue: { gmvTotal: number; gmv7d: number };
  };
  recent: {
    vendors: Array<{ id: string; storeName: string; status: string; createdAt: string }>;
    products: Array<{
      id: string;
      title: string;
      status: string;
      createdAt: string;
      vendor: { id: string; storeName: string } | null;
    }>;
    orders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      total: number;
      createdAt: string;
      customer: { id: string; name: string; email: string } | null;
    }>;
  };
  generatedAt: string;
};

const POLL_MS = 45 * 1000;

function StatSkeleton() {
  return <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse h-[116px]" />;
}

function getStatusBadge(status: string | undefined) {
  const value = String(status || '').toLowerCase();
  if (value.includes('active') || value.includes('published') || value.includes('delivered') || value.includes('paid')) {
    return 'bg-green-100 text-green-800';
  }
  if (value.includes('pending') || value.includes('processing') || value.includes('draft')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (value.includes('reject') || value.includes('cancel') || value.includes('suspend') || value.includes('unpaid')) {
    return 'bg-red-100 text-red-800';
  }
  if (value.includes('ship')) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-700';
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const fetchOverview = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const response = await dashboardAPI.getAdminOverview();
      const payload = response.data?.data;
      if (payload) {
        setOverview(payload);
      }
      setWarning(null);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Dashboard refresh failed. Showing last known data.';
      setWarning(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(false);
    const intervalId = setInterval(() => {
      fetchOverview(true);
    }, POLL_MS);

    return () => clearInterval(intervalId);
  }, [fetchOverview]);

  const statsCards = useMemo(() => {
    if (!overview) return [];

    return [
      {
        label: 'Total Vendors',
        value: overview.stats.vendors.total,
        sub: `${overview.stats.vendors.active} active, ${overview.stats.vendors.pending} pending`,
        icon: Store,
        cardClass: 'from-blue-500 to-blue-600'
      },
      {
        label: 'Total Products',
        value: overview.stats.products.total,
        sub: `${overview.stats.products.published} published, ${overview.stats.products.pending} pending`,
        icon: Package,
        cardClass: 'from-emerald-500 to-emerald-600'
      },
      {
        label: 'Total Orders',
        value: overview.stats.orders.total,
        sub: `${overview.stats.orders.byStatus.pending} pending, ${overview.stats.orders.byStatus.processing} processing`,
        icon: ShoppingBag,
        cardClass: 'from-indigo-500 to-indigo-600'
      },
      {
        label: 'GMV Total (Paid)',
        value: formatRands(overview.stats.revenue.gmvTotal),
        sub: `Last 7 days: ${formatRands(overview.stats.revenue.gmv7d)}`,
        icon: TrendingUp,
        cardClass: 'from-amber-500 to-amber-600'
      }
    ];
  }, [overview]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-nvm-accent-indigo rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold text-nvm-dark-900">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">Live platform overview from MongoDB</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Last updated: {overview?.generatedAt ? formatDate(overview.generatedAt) : 'Not available'}
              </span>
              <button
                onClick={() => fetchOverview(true)}
                disabled={refreshing}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/admin/vendors" className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600 font-semibold flex items-center gap-2"><Store className="w-4 h-4" />Manage Vendors</Link>
            <Link to="/admin/users" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><Users className="w-4 h-4" />Manage Users</Link>
            <Link to="/admin/products" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><Package className="w-4 h-4" />Manage Products</Link>
            <Link to="/admin/orders" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><ShoppingBag className="w-4 h-4" />Manage Orders</Link>
            <Link to="/admin/reviews" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><Star className="w-4 h-4" />Moderate Reviews</Link>
            <Link to="/admin/knowledge" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4" />Knowledge Hub</Link>
            <Link to="/admin/help" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><BookOpen className="w-4 h-4" />Help Center</Link>
            <Link to="/admin/posts" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><Newspaper className="w-4 h-4" />Publications</Link>
            <Link to="/admin/playbook" className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-nvm-green-primary hover:text-nvm-green-primary font-semibold flex items-center gap-2"><GraduationCap className="w-4 h-4" />Playbook</Link>
            <Link to="/admin/control-center" className="px-4 py-2 bg-indigo-50 border-2 border-indigo-200 text-indigo-700 rounded-lg hover:border-indigo-300 hover:bg-indigo-100 font-semibold flex items-center gap-2"><Shield className="w-4 h-4" />Control Center</Link>
            <Link to="/admin/chats" className="px-4 py-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg hover:border-red-300 hover:bg-red-100 font-semibold flex items-center gap-2"><MessageCircle className="w-4 h-4" />Support Chats</Link>
            <Link to="/admin/support" className="px-4 py-2 bg-red-50 border-2 border-red-200 text-red-700 rounded-lg hover:border-red-300 hover:bg-red-100 font-semibold flex items-center gap-2"><MessageCircle className="w-4 h-4" />Support Inbox</Link>
          </div>

          {warning && (
            <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {warning}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading && !overview
            ? Array.from({ length: 4 }).map((_, idx) => <StatSkeleton key={idx} />)
            : statsCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className={`bg-gradient-to-br ${card.cardClass} rounded-xl shadow-lg p-6 text-white`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <card.icon className="w-7 h-7" />
                    <span className="text-2xl font-bold">{card.value}</span>
                  </div>
                  <p className="text-sm font-medium opacity-95">{card.label}</p>
                  <p className="text-xs opacity-80 mt-1">{card.sub}</p>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-bold text-nvm-dark-900">Recently Added Vendors</h2>
              <Link to="/admin/vendors" className="text-sm text-nvm-green-primary font-medium">View all</Link>
            </div>

            {loading && !overview ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}</div>
            ) : overview?.recent.vendors?.length ? (
              <div className="space-y-3">
                {overview.recent.vendors.map((vendor) => (
                  <Link key={vendor.id} to={`/admin/vendors?vendorId=${vendor.id}`} className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">{vendor.storeName}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(vendor.status)}`}>{vendor.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(vendor.createdAt)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No vendors found.</p>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-bold text-nvm-dark-900">Recently Added Products</h2>
              <Link to="/admin/products" className="text-sm text-nvm-green-primary font-medium">View all</Link>
            </div>

            {loading && !overview ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}</div>
            ) : overview?.recent.products?.length ? (
              <div className="space-y-3">
                {overview.recent.products.map((product) => (
                  <Link key={product.id} to={`/admin/products?productId=${product.id}`} className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">{product.title}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(product.status)}`}>{product.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{product.vendor?.storeName || 'Unknown vendor'} • {formatDate(product.createdAt)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products found.</p>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-bold text-nvm-dark-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-nvm-green-primary font-medium">View all</Link>
            </div>

            {loading && !overview ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-14 rounded-lg bg-gray-100 animate-pulse" />)}</div>
            ) : overview?.recent.orders?.length ? (
              <div className="space-y-3">
                {overview.recent.orders.map((order) => (
                  <Link key={order.id} to={`/admin/orders?orderId=${order.id}`} className="block border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">#{order.orderNumber}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{order.customer?.name || order.customer?.email || 'Unknown customer'} • {formatRands(order.total || 0)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No orders found.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
