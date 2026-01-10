import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { productsAPI } from '../lib/api';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { formatRands } from '../lib/currency';

export function AllProducts() {
  const location = useLocation();
  const categoryFromState = location.state?.category;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromState || 'all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFromState) {
      setSelectedCategory(categoryFromState);
    }
  }, [categoryFromState]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100 });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product: any) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || '';
      const matchesCategory = selectedCategory === 'all' || 
                             categoryName.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
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
            All <span className="bg-gradient-to-r from-nvm-green-primary to-nvm-gold-primary bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-lg text-gray-600">
            Browse thousands of products from trusted vendors
          </p>
        </motion.div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Fashion">Fashion & Clothing</option>
              <option value="Electronics">Electronics</option>
              <option value="Home">Home & Garden</option>
              <option value="Health">Health & Beauty</option>
              <option value="Food">Food & Beverages</option>
              <option value="Sports">Sports & Outdoors</option>
              <option value="Books">Books & Media</option>
              <option value="Art">Art & Crafts</option>
              <option value="Services">Services</option>
            </select>

            {/* Price Range */}
            <select
              onChange={(e) => {
                const [min, max] = e.target.value.split('-').map(Number);
                setPriceRange({ min, max });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
            >
              <option value="0-10000">All Prices</option>
              <option value="0-100">Under R100</option>
              <option value="100-500">R100 - R500</option>
              <option value="500-1000">R500 - R1000</option>
              <option value="1000-10000">Over R1000</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nvm-green-primary focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <span className="text-gray-600">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-nvm-green-primary font-medium hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No products found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceRange({ min: 0, max: 10000 });
              }}
              className="text-nvm-green-primary font-medium hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any, index: number) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
