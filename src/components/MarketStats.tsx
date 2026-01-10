import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { PatternOverlay } from './PatternOverlay';
const stats = [{
  label: 'Total Revenue',
  value: '$124,500',
  change: '+12%',
  icon: DollarSign,
  color: 'bg-nvm-green-primary',
  pattern: 'kente'
}, {
  label: 'Active Vendors',
  value: '542',
  change: '+5%',
  icon: Users,
  color: 'bg-nvm-earth-terracotta',
  pattern: 'mudcloth'
}, {
  label: 'Products Sold',
  value: '12,840',
  change: '+18%',
  icon: ShoppingBag,
  color: 'bg-nvm-earth-ochre',
  pattern: 'ankara'
}, {
  label: 'Market Growth',
  value: '24%',
  change: '+2%',
  icon: TrendingUp,
  color: 'bg-nvm-accent-indigo',
  pattern: 'zigzag'
}];
export function MarketStats() {
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => <motion.div key={stat.label} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: index * 0.1
    }} className={`${stat.color} rounded-xl p-6 text-white relative overflow-hidden shadow-lg`}>
          <PatternOverlay pattern={stat.pattern as any} color="#ffffff" opacity={0.1} />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full flex items-center">
                {stat.change}
              </span>
            </div>

            <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
            <p className="text-white/80 text-sm font-medium">{stat.label}</p>
          </div>
        </motion.div>)}
    </div>;
}