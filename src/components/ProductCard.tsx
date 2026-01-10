import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore, useWishlistStore } from '../lib/store';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    name: string;
    price: number;
    image?: string;
    images?: any[];
    category: string | any;
    vendor?: any;
    vendorId?: string;
  };
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  
  const productId = product._id || product.id || '';
  const productImage = product.image || product.images?.[0]?.url || 'https://via.placeholder.com/400';
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Product';
  const inWishlist = isInWishlist(productId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: productImage,
      vendor: {
        id: product.vendor?._id || product.vendorId || '',
        name: product.vendor?.storeName || 'Vendor',
      },
    });
    toast.success('Added to cart!');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(productId);
      toast.success('Added to wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={productImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="p-3 bg-white rounded-full text-nvm-green-primary shadow-lg hover:bg-nvm-green-primary hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleWishlist}
            className={`p-3 bg-white rounded-full shadow-lg transition-colors ${
              inWishlist
                ? 'text-nvm-red-primary bg-nvm-red-primary/10'
                : 'text-nvm-red-primary hover:bg-nvm-red-primary hover:text-white'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-800 rounded-md shadow-sm">
            {categoryName}
          </span>
        </div>
      </div>

      <div className="p-4">
        <Link to={`/product/${productId}`} className="block">
          <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-nvm-green-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-nvm-gold-primary">
            R {product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 font-medium">In Stock</span>
        </div>
      </div>
    </motion.div>
  );
}