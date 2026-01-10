import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Truck, HeadphonesIcon } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Your transactions are 100% secure',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Award,
    title: 'Verified Vendors',
    description: 'All vendors are carefully vetted',
    color: 'from-nvm-gold-400 to-yellow-600'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick shipping across South Africa',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Always here to help you',
    color: 'from-purple-500 to-pink-600'
  }
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-gradient-to-r from-nvm-green-primary to-nvm-green-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badge.color} mx-auto mb-4 flex items-center justify-center shadow-xl`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold mb-1">{badge.title}</h3>
                <p className="text-green-100 text-sm">{badge.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
