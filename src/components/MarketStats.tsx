import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Store, Tags } from 'lucide-react';
import { PatternOverlay } from './PatternOverlay';
import { categoriesAPI, productsAPI, vendorsAPI } from '../lib/api';

type Stat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  pattern: 'kente' | 'mudcloth' | 'ankara' | 'zigzag';
};

export function MarketStats() {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Active Vendors', value: '0', icon: Store, color: 'bg-nvm-earth-terracotta', pattern: 'mudcloth' },
    { label: 'Listed Products', value: '0', icon: Package, color: 'bg-nvm-green-primary', pattern: 'kente' },
    { label: 'Published Products', value: '0', icon: ShoppingBag, color: 'bg-nvm-earth-ochre', pattern: 'ankara' },
    { label: 'Categories', value: '0', icon: Tags, color: 'bg-nvm-accent-indigo', pattern: 'zigzag' }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [vendorsRes, productsRes, publishedRes, categoriesRes] = await Promise.all([
          vendorsAPI.getAll({ limit: 1 }),
          productsAPI.getAll({ limit: 1 }),
          productsAPI.getAll({ status: 'PUBLISHED', limit: 1 }),
          categoriesAPI.getAll()
        ]);

        setStats([
          {
            label: 'Active Vendors',
            value: String(vendorsRes.data?.total || 0),
            icon: Store,
            color: 'bg-nvm-earth-terracotta',
            pattern: 'mudcloth'
          },
          {
            label: 'Listed Products',
            value: String(productsRes.data?.total || 0),
            icon: Package,
            color: 'bg-nvm-green-primary',
            pattern: 'kente'
          },
          {
            label: 'Published Products',
            value: String(publishedRes.data?.total || 0),
            icon: ShoppingBag,
            color: 'bg-nvm-earth-ochre',
            pattern: 'ankara'
          },
          {
            label: 'Categories',
            value: String(Array.isArray(categoriesRes.data?.data) ? categoriesRes.data.data.length : 0),
            icon: Tags,
            color: 'bg-nvm-accent-indigo',
            pattern: 'zigzag'
          }
        ]);
      } catch (_error) {
        // Keep zeros if stats fetch fails.
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${stat.color} rounded-xl p-6 text-white relative overflow-hidden shadow-lg`}
        >
          <PatternOverlay pattern={stat.pattern} color="#ffffff" opacity={0.1} />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-white/80 text-sm font-medium">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
