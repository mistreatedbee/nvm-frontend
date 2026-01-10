import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { VendorCard } from '../components/VendorCard';
import { vendorsAPI } from '../lib/api';
import { Search, Filter } from 'lucide-react';

export function AllVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll({ status: 'approved' });
      setVendors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((vendor: any) => {
    const matchesSearch = vendor.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-4">
            All <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">Vendors</span>
          </h1>
          <p className="text-lg text-gray-600">
            Discover trusted vendors across South Africa
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="food">Food</option>
            <option value="services">Services</option>
            <option value="health">Health</option>
            <option value="beauty">Beauty</option>
            <option value="home">Home</option>
            <option value="sports">Sports</option>
            <option value="books">Books</option>
            <option value="art">Art</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Showing {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="text-center py-12">Loading vendors...</div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No vendors found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVendors.map((vendor: any, index: number) => (
              <VendorCard key={vendor._id} vendor={vendor} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
