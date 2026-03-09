import React from 'react';
import { motion } from 'framer-motion';

export function LoadingScreen({
  title = 'Loading…',
  subtitle = 'Please wait a moment',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-nvm-green-primary to-nvm-green-600 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="w-9 h-9 rounded-full border-4 border-white/30 border-t-white"
            />
          </div>

          <h2 className="text-xl font-display font-bold text-nvm-dark-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-2">{subtitle}</p>

          <div className="mt-6 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-nvm-green-primary/60"
                animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

