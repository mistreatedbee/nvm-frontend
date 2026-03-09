import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, FileText, Search, Video } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { knowledgeAPI } from '../lib/api';
import { formatKnowledgeCategory } from '../utils/knowledge';

export function KnowledgeHubHome() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [featuredResources, setFeaturedResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [articlesRes, resourcesRes] = await Promise.all([
          knowledgeAPI.getArticles({ featured: true, limit: 6 }),
          knowledgeAPI.getResources({ featured: true, limit: 6 }),
        ]);
        setFeaturedArticles(articlesRes.data.data || []);
        setFeaturedResources(resourcesRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load knowledge hub');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/vendor/knowledge/articles?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-nvm-green-600 to-nvm-green-500 text-white rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Knowledge Hub</h1>
          <p className="opacity-90 mb-6">Guides, best practices, and downloadable resources to grow your store.</p>
          <form onSubmit={submitSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles and resources..."
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button type="submit" className="px-5 py-3 rounded-lg bg-white text-nvm-green-700 font-semibold flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link to="/vendor/knowledge/articles" className="bg-white border rounded-xl p-5 hover:shadow transition">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-nvm-green-600" />
              <h2 className="font-semibold text-lg">Browse Articles</h2>
            </div>
            <p className="text-gray-600">Getting started guides, policies, and best practices.</p>
          </Link>
          <Link to="/vendor/knowledge/resources" className="bg-white border rounded-xl p-5 hover:shadow transition">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-lg">Browse Resources</h2>
            </div>
            <p className="text-gray-600">PDFs, video links, and downloadable templates.</p>
          </Link>
        </div>

        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl">Featured Articles</h3>
              <Link to="/vendor/knowledge/articles" className="text-sm text-nvm-green-600">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white border rounded-lg animate-pulse" />)}</div>
            ) : featuredArticles.length === 0 ? (
              <div className="bg-white border rounded-lg p-6 text-gray-500">No featured articles available yet.</div>
            ) : (
              <div className="space-y-3">
                {featuredArticles.map((article) => (
                  <Link key={article._id} to={`/vendor/knowledge/articles/${article.slug}`} className="block bg-white border rounded-lg p-4 hover:shadow-sm">
                    <p className="font-semibold">{article.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatKnowledgeCategory(article.category)}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-xl">Featured Resources</h3>
              <Link to="/vendor/knowledge/resources" className="text-sm text-nvm-green-600">View all</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-white border rounded-lg animate-pulse" />)}</div>
            ) : featuredResources.length === 0 ? (
              <div className="bg-white border rounded-lg p-6 text-gray-500">No featured resources available yet.</div>
            ) : (
              <div className="space-y-3">
                {featuredResources.map((resource) => (
                  <div key={resource._id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{resource.title}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatKnowledgeCategory(resource.category)}</p>
                      </div>
                      {resource.type === 'VIDEO' ? <Video className="w-5 h-5 text-red-500" /> : <FileText className="w-5 h-5 text-blue-500" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
