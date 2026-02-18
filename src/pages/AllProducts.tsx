import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { ProductCard } from '../components/ProductCard';
import { categoriesAPI, searchAPI } from '../lib/api';
import { Search } from 'lucide-react';

export function AllProducts() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromState = location.state?.category;

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || (categoryFromState || '');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || 'newest';
  const brand = searchParams.get('brand') || '';
  const locationFilter = searchParams.get('location') || '';
  const minRating = searchParams.get('minRating') || '';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data.data || []);
      } catch (_error) {}
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryFromState && !searchParams.get('category')) {
      const next = new URLSearchParams(searchParams);
      next.set('category', categoryFromState);
      setSearchParams(next);
    }
  }, [categoryFromState]);

  const queryParams = useMemo(
    () => ({
      q: q || undefined,
      category: category || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      brand: brand || undefined,
      location: locationFilter || undefined,
      minRating: minRating || undefined,
      sort,
      page,
      limit: 16
    }),
    [q, category, minPrice, maxPrice, brand, locationFilter, minRating, sort, page]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await searchAPI.products(queryParams);
        setProducts(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [queryParams]);

  useEffect(() => {
    const handle = setTimeout(async () => {
      if (!q || q.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await searchAPI.autocomplete(q, 10);
        const values = (res.data.data || []).map((item: any) => item.value).filter((value: any) => Boolean(value)) as string[];
        setSuggestions(Array.from(new Set(values)).slice(0, 10) as string[]);
      } catch (_error) {
        setSuggestions([]);
      }
    }, 180);

    return () => clearTimeout(handle);
  }, [q]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-nvm-dark-900 mb-3">Search & Discover Products</h1>
          <p className="text-lg text-gray-600">Find products with advanced filters and sorting</p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => updateParam('q', e.target.value)}
              placeholder="Search by keyword..."
              list="product-autocomplete"
              className="w-full pl-9 pr-3 py-3 min-h-[44px] border border-gray-300 rounded-lg"
            />
            <datalist id="product-autocomplete">
              {suggestions.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </div>
          <select value={category} onChange={(e) => updateParam('category', e.target.value)} className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg">
            <option value="">All categories</option>
            {categories.map((c: any) => (
              <option key={c._id} value={c.slug || c._id}>{c.name}</option>
            ))}
          </select>
          <input value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} placeholder="Min price" type="number" min={0} className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg" />
          <input value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} placeholder="Max price" type="number" min={0} className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg" />
          <input value={brand} onChange={(e) => updateParam('brand', e.target.value)} placeholder="Brand" className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg" />
          <input value={locationFilter} onChange={(e) => updateParam('location', e.target.value)} placeholder="Location" className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg" />
          <select value={minRating} onChange={(e) => updateParam('minRating', e.target.value)} className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg">
            <option value="">Any rating</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
            <option value="2">2+ stars</option>
          </select>
          <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="px-3 py-3 min-h-[44px] border border-gray-300 rounded-lg md:col-span-2 lg:col-span-1">
            <option value="relevance">Relevance</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Top Rated</option>
            <option value="best_selling">Best Selling</option>
          </select>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <span className="text-gray-600">{loading ? 'Loading...' : `Showing ${products.length} of ${total} results`}</span>
          <button
            onClick={() => {
              setSearchParams(new URLSearchParams());
              setPage(1);
            }}
            className="text-nvm-green-primary text-sm hover:underline min-h-[44px] px-2"
          >
            Clear filters
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-64 bg-white rounded-lg border animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border rounded-lg py-14 text-center">
            <p className="text-gray-600 mb-2">No products found</p>
            <p className="text-sm text-gray-500">Try adjusting search terms, category, or price range.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any, index: number) => (
                <ProductCard key={product._id} product={product} index={index} trackingSource="SEARCH" />
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-2 border rounded disabled:opacity-50">Previous</button>
              <span className="text-sm text-gray-600">Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
