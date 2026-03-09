import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { wishlistAPI } from '../lib/api';
import { useAuthStore, useCartStore, useWishlistStore } from '../lib/store';
import { formatRands } from '../lib/currency';
import toast from 'react-hot-toast';

export function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { removeItem: removeFromStore, syncFromServer } = useWishlistStore();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadWishlist = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await wishlistAPI.get({ page: nextPage, limit: 12 });
      setItems(res.data?.data || []);
      setPages(res.data?.pages || 1);
      setTotal(res.data?.total || 0);
      setPage(res.data?.page || nextPage);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    syncFromServer().catch(() => {});
    loadWishlist(1);
  }, [isAuthenticated, navigate, syncFromServer]);

  const handleRemove = async (productId: string) => {
    try {
      await removeFromStore(productId);
      await loadWishlist(page);
      toast.success('Removed from wishlist');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleMoveToCart = async (product: any) => {
    try {
      await addItem({
        productId: product._id,
        name: product.title || product.name,
        price: product.price,
        quantity: 1,
        image: product.images?.[0]?.url || '',
        vendor: {
          id: product.vendor?._id || '',
          name: product.vendor?.storeName || 'Vendor',
        }
      });
      await handleRemove(product._id);
      toast.success('Moved to cart');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to move to cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-nvm-dark-900">My Wishlist</h1>
            <p className="text-gray-600">{total} saved item{total === 1 ? '' : 's'}</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-52 bg-white border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center">
            <Heart className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you like and come back later.</p>
            <Link to="/marketplace" className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-nvm-green-primary text-white rounded-lg hover:bg-nvm-green-600">
              <ShoppingBag className="w-4 h-4" />
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((product: any) => (
                <div key={product._id} className="bg-white border rounded-xl p-4">
                  <Link to={`/product/${product._id}`} className="block">
                    <img
                      src={product.images?.[0]?.url || '/placeholder-product.png'}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-nvm-dark-900 line-clamp-1">{product.title || product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-1">{product.vendor?.storeName || 'Vendor'}</p>
                  <p className="text-lg font-bold text-nvm-gold-primary mt-2">{formatRands(product.price)}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="min-h-[44px] px-3 py-2 bg-nvm-green-primary text-white rounded-lg text-sm font-medium hover:bg-nvm-green-600"
                    >
                      Move to cart
                    </button>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="min-h-[44px] px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => loadWishlist(page - 1)} className="px-3 py-2 border rounded disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => loadWishlist(page + 1)} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
