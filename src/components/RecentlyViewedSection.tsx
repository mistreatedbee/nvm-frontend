import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock3 } from 'lucide-react';
import { recentlyViewedAPI } from '../lib/api';
import { ProductCard } from './ProductCard';

interface RecentlyViewedSectionProps {
  title?: string;
  limit?: number;
  excludeProductId?: string;
}

export function RecentlyViewedSection({
  title = 'Recently Viewed',
  limit = 8,
  excludeProductId
}: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await recentlyViewedAPI.get({ page: 1, limit });
        const rows = (res.data?.data || [])
          .map((row: any) => row.product)
          .filter((product: any) => product && String(product._id) !== String(excludeProductId || ''));
        setItems(rows);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load recently viewed products');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [limit, excludeProductId]);

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-display font-bold text-nvm-dark-900 flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-nvm-green-primary" />
          {title}
        </h2>
        <Link to="/wishlist" className="text-sm text-nvm-green-primary hover:underline">Wishlist</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-60 rounded-lg border bg-white animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500 bg-white border rounded-lg p-4">No recently viewed products yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product: any, index: number) => (
            <ProductCard key={product._id} product={product} index={index} trackingSource="DIRECT" />
          ))}
        </div>
      )}
    </section>
  );
}
