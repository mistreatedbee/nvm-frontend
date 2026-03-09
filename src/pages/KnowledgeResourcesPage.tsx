import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileDown } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { knowledgeAPI } from '../lib/api';
import { formatKnowledgeCategory, getKnowledgeSessionId, KNOWLEDGE_CATEGORIES, RESOURCE_TYPES } from '../utils/knowledge';

export function KnowledgeResourcesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const params = useMemo(() => ({ category, type, q, page, limit: 12 }), [category, type, q, page]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await knowledgeAPI.getResources(params);
        setItems(res.data.data || []);
        setPages(res.data.pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params]);

  const trackResource = async (id: string) => {
    try {
      await knowledgeAPI.trackView({
        contentType: 'RESOURCE',
        contentId: id,
        sessionId: getKnowledgeSessionId(),
      });
    } catch (_error) {
      // Ignore view tracking failures to avoid interrupting UX.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Knowledge Resources</h1>

        <div className="bg-white border rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search resources..." className="px-3 py-2 border rounded-lg" />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg">
            <option value="">All Categories</option>
            {KNOWLEDGE_CATEGORIES.map((item) => <option key={item} value={item}>{formatKnowledgeCategory(item)}</option>)}
          </select>
          <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-lg">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 bg-white border rounded-lg animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center text-gray-500">No resources found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((resource) => (
              <div key={resource._id} className="bg-white border rounded-xl p-4">
                <p className="font-semibold mb-1">{resource.title}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{resource.description || 'No description provided.'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{resource.type}</span>
                  <span>{formatKnowledgeCategory(resource.category)}</span>
                </div>
                <div className="mt-4">
                  {resource.externalUrl ? (
                    <a
                      href={resource.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackResource(resource._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {resource.type === 'VIDEO' ? 'Watch' : 'Open Link'}
                    </a>
                  ) : resource.fileUrl ? (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackResource(resource._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <FileDown className="w-4 h-4" />
                      Download
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">No file or link attached.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-2 border rounded disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
