import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Truck, ShieldCheck, Star, Store, MessageSquare } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ProductReviews } from '../components/ProductReviews';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection';
import { productsAPI, recentlyViewedAPI, trackingAPI } from '../lib/api';
import { handleApiError } from '../lib/errorHandling';
import { ProductCard } from '../components/ProductCard';
import { useCartStore, useWishlistStore, useAuthStore, useLoginPromptStore } from '../lib/store';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';
import { getTrackingSessionId } from '../utils/tracking';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addItem } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id!);
      const productData = response.data.data;
      setProduct(productData);
      setSelectedImageIndex(0);
      productsAPI.getSimilar(productData._id, { limit: 8 }).then((res) => setSimilarProducts(res.data.data || [])).catch(() => {});
      productsAPI.getQuestions(productData._id, { limit: 10 }).then((res) => setQuestions(res.data.data || [])).catch(() => {});
      trackingAPI.trackProductView({
        productId: productData._id,
        source: 'DIRECT',
        sessionId: getTrackingSessionId()
      }).catch(() => {});
      if (isAuthenticated) {
        recentlyViewedAPI.track(productData._id).catch(() => {});
      }
    } catch (error: any) {
      toast.error('Product not found');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (isAddingToCart) return;

    if (!isAuthenticated) {
      useLoginPromptStore.getState().open();
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItem({
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
    } catch (error: any) {
      handleApiError(error, 'Failed to add item to cart');
      return;
    } finally {
      setIsAddingToCart(false);
    }

    trackingAPI.trackAddToCart({
      productId: product._id,
      source: 'DIRECT',
      sessionId: getTrackingSessionId()
    }).catch(() => {});
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save items');
      return;
    }

    if (!product) return;
    
    try {
      const next = await toggleItem(product._id);
      toast.success(next ? 'Added to wishlist!' : 'Removed from wishlist!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleSubmitQuestion = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to ask a question');
      return;
    }
    if (!newQuestion.trim()) {
      toast.error('Question is required');
      return;
    }
    try {
      await productsAPI.askQuestion(product._id, { question: newQuestion.trim() });
      setNewQuestion('');
      const res = await productsAPI.getQuestions(product._id, { limit: 10 });
      setQuestions(res.data.data || []);
      toast.success('Question submitted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit question');
    }
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

  const imageUrls: string[] = Array.isArray(product.images)
    ? product.images.map((img: any) => img?.url || img).filter(Boolean)
    : [];
  const mainImage = imageUrls[selectedImageIndex] || product.images?.[0]?.url || '/placeholder-product.png';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
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
            {/* Product Images */}
            <div className="relative bg-gray-100 flex flex-col gap-4 p-4">
              <div className="relative h-80 sm:h-96 lg:h-[420px] bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-cover" 
                />
              </div>
              {imageUrls.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
                  {imageUrls.map((url, index) => (
                    <button
                      key={url + index}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex ? 'border-nvm-green-primary' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
              {product.category && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-sm font-bold text-gray-800 rounded-full shadow-sm">
                    {product.category.name || product.category}
                  </span>
                </div>
              )}
              {product.status !== 'PUBLISHED' && (
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

              {/* Key Details & Features */}
              <div className="space-y-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-700">
                  <Truck className="w-5 h-5 mr-3 text-nvm-green-600" />
                  <span>
                    {product.shipping?.freeShipping
                      ? 'Free Shipping'
                      : `Shipping from ${formatRands(product.shipping?.shippingCost || 0)} (final fee shown at checkout based on your location)`}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <ShieldCheck className="w-5 h-5 mr-3 text-nvm-green-600" />
                  <span>Authenticity Guaranteed</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.status === 'PUBLISHED' && (!product.trackInventory || product.stock > 0) && (
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
                  disabled={isAddingToCart || product.status !== 'PUBLISHED' || (product.trackInventory && product.stock === 0)}
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
                {isAuthenticated && (
                  <button
                    onClick={() => navigate(`/chat?vendorId=${product.vendor._id}&type=general`)}
                    className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat Vendor
                  </button>
                )}
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
          <ProductReviews productId={product._id} />
        </motion.div>

        {isAuthenticated && (
          <div className="mt-10">
            <RecentlyViewedSection title="Recently Viewed Products" limit={8} excludeProductId={product._id} />
          </div>
        )}

        <div className="mt-10 bg-white border rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">Questions & Answers</h3>
          <div className="flex gap-2 mb-4">
            <input
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask about this product..."
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <button onClick={handleSubmitQuestion} className="px-4 py-2 bg-nvm-green-primary text-white rounded-lg">
              Ask
            </button>
          </div>
          {questions.length === 0 ? (
            <p className="text-sm text-gray-500">No questions yet.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((item: any) => (
                <div key={item._id} className="border rounded-lg p-3">
                  <p className="font-medium text-gray-900">{item.question}</p>
                  <p className="text-xs text-gray-500 mt-1">By {item.userId?.name || 'Customer'}</p>
                  {item.answer ? (
                    <p className="mt-2 text-sm text-gray-700"><span className="font-semibold">Answer:</span> {item.answer.answer}</p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">Awaiting answer</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {similarProducts.length > 0 && (
          <div className="mt-10">
            <h3 className="text-2xl font-display font-bold text-nvm-dark-900 mb-4">Similar Products</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map((item: any, index: number) => (
                <ProductCard key={item._id} product={item} index={index} trackingSource="DIRECT" />
              ))}
            </div>
          </div>
        )}
      </div>

      {product && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 sm:hidden">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 truncate">{product.name}</p>
              <p className="font-bold text-nvm-gold-primary">{formatRands(product.price)}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.status !== 'PUBLISHED' || (product.trackInventory && product.stock === 0)}
              className="px-4 py-3 min-h-[44px] bg-nvm-green-primary text-white rounded-lg font-semibold disabled:opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
