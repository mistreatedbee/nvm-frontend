import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Truck, ShieldCheck, Star, Store } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ProductReviews } from '../components/ProductReviews';
import { productsAPI } from '../lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '../lib/store';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id!);
      setProduct(response.data.data);
    } catch (error: any) {
      toast.error('Product not found');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      image: product.images[0]?.url || '/placeholder-product.png',
      vendor: {
        id: product.vendor._id,
        name: product.vendor.storeName
      }
    });

    toast.success('Added to cart!');
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save items');
      return;
    }

    if (!product) return;
    
    addToWishlist(product._id);
    toast.success('Added to wishlist!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-red-600">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          to="/marketplace" 
          className="inline-flex items-center text-gray-600 hover:text-nvm-green-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Marketplace
        </Link>

        {/* Product Detail Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative h-96 lg:h-auto bg-gray-100">
              <img 
                src={product.images[0]?.url || '/placeholder-product.png'} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
              {product.category && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-sm font-bold text-gray-800 rounded-full shadow-sm">
                    {product.category.name || product.category}
                  </span>
                </div>
              )}
              {product.status !== 'active' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="px-6 py-3 bg-red-500 text-white font-bold rounded-lg">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-8 lg:p-12">
              <div className="mb-6">
                <Link 
                  to={`/vendor/${product.vendor._id}`} 
                  className="inline-flex items-center gap-2 text-nvm-green-600 font-medium hover:underline mb-3"
                >
                  <Store className="w-4 h-4" />
                  {product.vendor.storeName}
                </Link>
                
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-nvm-dark-900 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(product.rating)
                              ? 'text-nvm-gold-primary fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {product.rating.toFixed(1)} ({product.totalReviews} reviews)
                    </span>
                  </div>
                )}

                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold text-nvm-gold-primary">
                    {formatRands(product.price)}
                  </span>
                  {product.trackInventory && (
                    <span className={`text-sm font-medium px-3 py-1 rounded ${
                      product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Features */}
              <div className="space-y-3 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <Truck className="w-5 h-5 mr-3 text-nvm-green-600" />
                  <span>{product.shipping?.freeShipping ? 'Free Shipping' : `Shipping: ${formatRands(product.shipping?.shippingCost || 0)}`}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ShieldCheck className="w-5 h-5 mr-3 text-nvm-green-600" />
                  <span>Authenticity Guaranteed</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.status === 'active' && (!product.trackInventory || product.stock > 0) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-nvm-green-500 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-300 hover:border-nvm-green-500 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status !== 'active' || (product.trackInventory && product.stock === 0)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-nvm-green-primary text-white rounded-lg font-semibold hover:bg-nvm-green-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleAddToWishlist}
                  className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-nvm-green-primary text-nvm-green-primary rounded-lg font-semibold hover:bg-nvm-green-50 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product._id) ? 'Saved' : 'Save for Later'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProductReviews productId={product._id} vendorId={product.vendor._id} />
        </motion.div>
      </div>
    </div>
  );
}
