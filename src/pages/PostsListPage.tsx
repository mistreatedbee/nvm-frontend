import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { postsAPI } from '../lib/api';
import { formatPublicationType } from '../utils/publications';

interface PostsListPageProps {
  type: 'ANNOUNCEMENT' | 'BLOG';
}

export function PostsListPage({ type }: PostsListPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const q = searchParams.get('q') || '';
  const tags = searchParams.get('tags') || '';

  const queryParams = useMemo(() => ({ type, q, tags, page: currentPage, limit: 12 }), [type, q, tags, currentPage]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await postsAPI.getPosts(queryParams);
        setItems(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || `Failed to load ${type.toLowerCase()}s`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [queryParams, type]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
    setCurrentPage(1);
  };

  const title = type === 'ANNOUNCEMENT' ? 'Announcements' : 'Blog';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        <div className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            value={tags}
            onChange={(e) => updateParam('tags', e.target.value)}
            placeholder="Filter by tags (comma-separated)"
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-48 bg-white border rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">No {title.toLowerCase()} available right now.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <Link key={item._id} to={`/posts/${item.slug}`} className="bg-white border rounded-xl overflow-hidden hover:shadow-sm transition">
                  {item.coverImageUrl && (
                    <img src={item.coverImageUrl} alt={item.title} className="w-full h-40 object-cover" />
                  )}
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-2">{formatPublicationType(item.type)} • {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}</p>
                    <h2 className="font-semibold text-lg line-clamp-2 mb-2">{item.title}</h2>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.excerpt || 'No excerpt available.'}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(item.tags || []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
