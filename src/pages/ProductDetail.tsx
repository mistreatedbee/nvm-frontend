import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import { PatternOverlay } from '../components/PatternOverlay';
import { Button } from '../components/ui/Button';
import { products, vendors } from '../utils/mockData';
export function ProductDetail() {
  const {
    id
  } = useParams();
  const product = products.find(p => p.id === id) || products[0];
  const vendor = vendors.find(v => v.id === product.vendorId);
  return <div className="min-h-screen bg-nvm-green-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-nvm-green-primary mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Market
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Product Image Side */}
            <div className="relative h-96 md:h-auto bg-gray-100">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-sm font-bold text-gray-800 rounded-full shadow-sm">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Info Side */}
            <div className="p-8 md:p-12 relative">
              <PatternOverlay pattern="diamonds" color="#E07A5F" opacity={0.05} />

              <div className="relative z-10">
                <div className="mb-6">
                  <Link to={`/vendor/${vendor?.id}`} className="text-nvm-earth-ochre font-medium hover:underline mb-2 block">
                    Sold by {vendor?.name}
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                    {product.name}
                  </h1>
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-nvm-green-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded">
                      In Stock
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {product.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-gray-600">
                    <Truck className="w-5 h-5 mr-3 text-nvm-earth-terracotta" />
                    <span>Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ShieldCheck className="w-5 h-5 mr-3 text-nvm-earth-terracotta" />
                    <span>Authenticity Guaranteed</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                  <Button size="lg" className="flex-1">
                    <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
                  </Button>
                  <Button variant="outline" size="lg">
                    <Heart className="w-5 h-5 mr-2" /> Save for Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products (Mock) */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.slice(0, 4).map((p, i) => <div key={p.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-square bg-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">
                    {p.name}
                  </h3>
                  <p className="text-nvm-gold-primary font-bold mt-1">
                    ${p.price.toFixed(2)}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
}