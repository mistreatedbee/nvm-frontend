import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star } from 'lucide-react';
import { PatternOverlay } from './PatternOverlay';
import { Link } from 'react-router-dom';
interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    specialty: string;
    location: string;
    image: string;
    rating: number;
  };
  index: number;
}
export function VendorCard({
  vendor,
  index
}: VendorCardProps) {
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: index * 0.1,
    duration: 0.5
  }} whileHover={{
    y: -5
  }} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      {/* Pattern Header */}
      <div className="h-24 bg-nvm-green-primary relative overflow-hidden">
        <PatternOverlay pattern="kente" color="#D4AF37" opacity={0.2} />
      </div>

      {/* Vendor Image */}
      <div className="absolute top-12 left-6">
        <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-gray-200">
          <img src={vendor.image} alt={vendor.name} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="pt-16 pb-6 px-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-nvm-green-primary transition-colors">
              {vendor.name}
            </h3>
            <p className="text-nvm-earth-ochre font-medium text-sm">
              {vendor.specialty}
            </p>
          </div>
          <div className="flex items-center bg-nvm-gold-bg px-2 py-1 rounded-md border border-nvm-gold-primary/20">
            <Star className="w-4 h-4 text-nvm-gold-primary fill-current mr-1" />
            <span className="text-sm font-bold text-gray-800">
              {vendor.rating}
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mt-4">
          <MapPin className="w-4 h-4 mr-1" />
          {vendor.location}
        </div>

        <div className="mt-6">
          <Link to={`/vendor/${vendor.id}`}>
            <button className="w-full py-2 border-2 border-nvm-green-primary text-nvm-green-primary rounded-lg font-medium hover:bg-nvm-green-primary hover:text-white transition-all duration-300">
              Visit Store
            </button>
          </Link>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-2 bg-gradient-to-r from-nvm-green-primary via-nvm-gold-primary to-nvm-earth-terracotta" />
    </motion.div>;
}