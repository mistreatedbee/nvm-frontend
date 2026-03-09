import React from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Truck, ThumbsUp } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse Products',
    description: 'Explore thousands of products from verified vendors across South Africa',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShoppingCart,
    title: 'Add to Cart',
    description: 'Select your favorite items and add them to your shopping cart',
    color: 'from-nvm-green-500 to-emerald-500'
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Secure checkout and quick delivery right to your doorstep',
    color: 'from-nvm-gold-400 to-yellow-500'
  },
  {
    icon: ThumbsUp,
    title: 'Leave Review',
    description: 'Share your experience and help others make informed decisions',
    color: 'from-nvm-orange-500 to-red-500'
  }
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-4">
            How <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">It Works</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Shopping on NVM is simple and secure. Get started in 4 easy steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection Lines (Desktop) */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-nvm-green-200 via-nvm-gold-200 to-red-200 -z-10" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                {/* Step Number Circle */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10`}
                >
                  <Icon className="w-10 h-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center font-bold text-sm text-gray-700">
                    {index + 1}
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold text-nvm-dark-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
