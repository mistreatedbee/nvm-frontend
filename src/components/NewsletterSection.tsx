import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Thank you for subscribing!');
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-nvm-green-primary via-nvm-green-600 to-nvm-gold-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-nvm-gold-primary/20 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Stay Updated with NVM
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new vendor spotlights, and marketplace updates
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="px-8 py-4 bg-white text-nvm-green-primary rounded-xl font-semibold flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all"
              >
                <Send className="w-5 h-5" />
                Subscribe
              </motion.button>
            </div>
          </form>

          {/* Trust Message */}
          <p className="text-sm text-green-200 mt-6">
            🔒 We respect your privacy. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
