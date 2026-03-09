import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Store, TrendingUp } from 'lucide-react';

// South African cities coordinates
const SA_CITIES = {
  'Johannesburg': { lat: -26.2041, lng: 28.0473 },
  'Cape Town': { lat: -33.9249, lng: 18.4241 },
  'Durban': { lat: -29.8587, lng: 31.0218 },
  'Pretoria': { lat: -25.7479, lng: 28.2293 },
  'Port Elizabeth': { lat: -33.9608, lng: 25.6022 },
  'Bloemfontein': { lat: -29.0852, lng: 26.1596 },
  'East London': { lat: -33.0153, lng: 27.9116 },
  'Nelspruit': { lat: -25.4745, lng: 30.9703 },
  'Polokwane': { lat: -23.9045, lng: 29.4689 },
  'Kimberley': { lat: -28.7282, lng: 24.7499 },
  'Rustenburg': { lat: -25.6672, lng: 27.2420 },
  'Pietermaritzburg': { lat: -29.6170, lng: 30.3951 },
  'George': { lat: -33.9630, lng: 22.4616 },
  'Soweto': { lat: -26.2678, lng: 27.8585 },
  'Midrand': { lat: -25.9890, lng: 28.1229 }
};

interface VendorMapProps {
  vendors?: any[];
}

export function VendorMap({ vendors = [] }: VendorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Group vendors by city
  const vendorsByCity = vendors.reduce((acc: any, vendor: any) => {
    const city = vendor.address?.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(vendor);
    return acc;
  }, {});

  // Calculate stats
  const totalCities = Object.keys(vendorsByCity).length;
  const mostActiveCity = Object.entries(vendorsByCity).sort((a: any, b: any) => b[1].length - a[1].length)[0];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-display font-bold text-nvm-dark-900">
            Vendor Locations
          </h2>
          <p className="text-sm text-gray-500 mt-1">Geographic distribution across South Africa</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-nvm-green-bg rounded-lg">
          <MapPin className="w-4 h-4 text-nvm-green-primary" />
          <span className="text-sm font-medium text-nvm-green-primary">{totalCities} Cities</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden mb-6" style={{ height: '400px' }}>
        {/* South Africa Map SVG Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <svg viewBox="0 0 800 600" className="w-full h-full">
            <path
              d="M 100 300 Q 150 250 200 280 T 300 300 Q 400 320 500 280 T 700 300 L 700 500 Q 600 450 500 480 T 300 500 Q 200 520 100 500 Z"
              fill="currentColor"
              className="text-nvm-green-primary"
            />
          </svg>
        </div>

        {/* Interactive City Markers */}
        <div className="absolute inset-0 p-8">
          {Object.entries(vendorsByCity).map(([city, cityVendors]: [string, any], index) => {
            const coords = SA_CITIES[city as keyof typeof SA_CITIES];
            if (!coords) return null;

            // Calculate position (simplified projection)
            const x = ((coords.lng - 16) / (33 - 16)) * 100;
            const y = ((coords.lat + 35) / (-22 + 35)) * 100;

            return (
              <motion.div
                key={city}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute group cursor-pointer"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Pulse Effect */}
                <motion.div
                  className="absolute inset-0 bg-nvm-green-primary rounded-full opacity-20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  style={{ width: '40px', height: '40px', marginLeft: '-8px', marginTop: '-8px' }}
                />

                {/* Marker */}
                <div className="relative z-10">
                  <div className="w-6 h-6 bg-nvm-green-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-nvm-dark-900 text-white px-3 py-2 rounded-lg shadow-xl whitespace-nowrap text-xs">
                      <div className="font-bold mb-1">{city}</div>
                      <div className="text-gray-300">
                        {cityVendors.length} {cityVendors.length === 1 ? 'vendor' : 'vendors'}
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-nvm-dark-900" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vendor Count Badge */}
                {cityVendors.length > 1 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-nvm-gold-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg z-20">
                    {cityVendors.length}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-nvm-green-primary rounded-full" />
              <span className="text-gray-700">Vendor Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-nvm-gold-primary rounded-full" />
              <span className="text-gray-700">Multiple</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{totalCities}</div>
              <div className="text-xs text-blue-700">Active Cities</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nvm-green-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">{vendors.length}</div>
              <div className="text-xs text-green-700">Total Vendors</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gold-50 to-yellow-100 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nvm-gold-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-900 truncate">
                {mostActiveCity ? mostActiveCity[0] : 'N/A'}
              </div>
              <div className="text-xs text-yellow-700">Most Active</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* City List */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Vendor Distribution by City</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(vendorsByCity)
            .sort((a: any, b: any) => b[1].length - a[1].length)
            .slice(0, 9)
            .map(([city, cityVendors]: [string, any]) => (
              <div
                key={city}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-nvm-green-primary" />
                  <span className="text-sm font-medium text-gray-700">{city}</span>
                </div>
                <span className="text-sm font-bold text-nvm-green-primary">
                  {cityVendors.length}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
