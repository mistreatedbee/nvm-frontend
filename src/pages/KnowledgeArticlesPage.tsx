import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { knowledgeAPI } from '../lib/api';
import { formatKnowledgeCategory, KNOWLEDGE_CATEGORIES } from '../utils/knowledge';

export function KnowledgeArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const tags = searchParams.get('tags') || '';

  const filters = useMemo(() => ({ q, category, tags }), [q, category, tags]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await knowledgeAPI.getArticles({
          ...filters,
          page: currentPage,
          limit: 12,
        });
        setItems(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load articles');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, currentPage]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Knowledge Articles</h1>

        <div className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => updateParam('q', e.target.value)}
            placeholder="Search by title/content..."
            className="px-3 py-2 border rounded-lg"
          />
          <select value={category} onChange={(e) => updateParam('category', e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">All Categories</option>
            {KNOWLEDGE_CATEGORIES.map((item) => (
              <option key={item} value={item}>{formatKnowledgeCategory(item)}</option>
            ))}
          </select>
          <input
            value={tags}
            onChange={(e) => updateParam('tags', e.target.value)}
            placeholder="Tags (comma-separated)"
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-white border rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">No articles found for your filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((article) => (
              <Link key={article._id} to={`/vendor/knowledge/articles/${article.slug}`} className="bg-white border rounded-xl p-4 hover:shadow-sm">
                <p className="font-semibold mb-1 line-clamp-2">{article.title}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{article.summary || 'No summary provided.'}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{formatKnowledgeCategory(article.category)}</span>
                  <span className="text-xs text-gray-500">{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
}
