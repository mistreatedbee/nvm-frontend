import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, MessageSquare } from 'lucide-react';
import { PatternOverlay } from './PatternOverlay';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../lib/store';

interface VendorCardProps {
  vendor: any;
  index: number;
}

export function VendorCard({
  vendor,
  index
}: VendorCardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const formatLocation = (locationData: any) => {
    if (!locationData) return '';
    if (typeof locationData === 'string') return locationData;
    if (typeof locationData === 'object') {
      const city = locationData.city || '';
      const state = locationData.state || locationData.province || '';
      const country = locationData.country || '';
      return [city, state, country].filter(Boolean).join(', ');
    }
    return '';
  };

  // Get vendor ID (support both _id and id)
  const vendorId = vendor._id || vendor.id;
  const vendorSlug = vendor.usernameSlug || vendor.slug;
  
  // Get vendor name
  const vendorName = vendor.storeName || vendor.name || 'Vendor';
  
  // Get vendor image/logo
  const vendorImage = vendor.logo?.url || vendor.image || 'https://via.placeholder.com/150';
  
  // Get location
  const addressLocation = vendor.address
    ? [vendor.address.city, vendor.address.state, vendor.address.country].filter(Boolean).join(', ')
    : '';
  const location = addressLocation || formatLocation(vendor.location) || 'South Africa';
  
  // Get specialty/category
  const specialty = vendor.category || vendor.specialty || 'General';
  
  // Get rating
  const rating = vendor.rating || 0;

  return (
    <motion.div 
      initial={{
        opacity: 0,
        y: 20
      }} 
      animate={{
        opacity: 1,
        y: 0
      }} 
      transition={{
        delay: index * 0.1,
        duration: 0.5
      }} 
      whileHover={{
        y: -5
      }} 
      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      {/* Pattern Header */}
      <div className="h-24 bg-nvm-green-primary relative overflow-hidden">
        <PatternOverlay pattern="kente" color="#D4AF37" opacity={0.2} />
      </div>

      {/* Vendor Image */}
      <div className="absolute top-12 left-6">
        <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200">
          <img src={vendorImage} alt={vendorName} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-6 px-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-nvm-green-primary transition-colors">
              {vendorName}
            </h3>
            <p className="text-nvm-earth-ochre font-medium text-sm">
              {specialty}
            </p>
          </div>
          <div className="flex items-center bg-nvm-gold-bg px-2 py-1 rounded-md border border-nvm-gold-primary/20">
            <Star className="w-4 h-4 text-nvm-gold-primary fill-current mr-1" />
            <span className="text-sm font-bold text-gray-800">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mt-4">
          <MapPin className="w-4 h-4 mr-1" />
          {location}
        </div>

        <div className="mt-6 space-y-2">
          <Link to={vendorSlug ? `/vendors/${vendorSlug}` : `/vendor/${vendorId}`}>
            <button className="w-full py-2 border-2 border-nvm-green-primary text-nvm-green-primary rounded-lg font-medium hover:bg-nvm-green-primary hover:text-white transition-all duration-300">
              Visit Store
            </button>
          </Link>
          {isAuthenticated && user?.role !== 'vendor' && (
            <Link to={`/chat?vendorId=${vendorId}&type=general`}>
              <button className="w-full py-2 bg-nvm-green-primary text-white rounded-lg font-medium hover:bg-nvm-green-dark transition-all duration-300 inline-flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat Vendor
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-2 bg-gradient-to-r from-nvm-green-primary via-nvm-gold-primary to-nvm-earth-terracotta" />
    </motion.div>
  );
}
