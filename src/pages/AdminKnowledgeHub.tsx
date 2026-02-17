import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, FileUp, Plus, RefreshCcw } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { adminKnowledgeAPI } from '../lib/api';
import { formatKnowledgeCategory, KNOWLEDGE_CATEGORIES, RESOURCE_TYPES } from '../utils/knowledge';

type Tab = 'ARTICLES' | 'RESOURCES' | 'ANALYTICS';

const emptyArticle = {
  id: '',
  title: '',
  slug: '',
  summary: '',
  content: '',
  category: 'GETTING_STARTED',
  audience: 'VENDOR',
  status: 'DRAFT',
  featured: false,
  tags: '',
  coverImageUrl: '',
};

const emptyResource = {
  id: '',
  title: '',
  slug: '',
  description: '',
  type: 'PDF',
  category: 'GETTING_STARTED',
  audience: 'VENDOR',
  status: 'DRAFT',
  featured: false,
  externalUrl: '',
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  mimeType: '',
  storageKey: '',
  thumbnailUrl: '',
};

export function AdminKnowledgeHub() {
  const [tab, setTab] = useState<Tab>('ARTICLES');
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ totalViews: number; viewsPerDay: any[]; topContent: any[] }>({
    totalViews: 0,
    viewsPerDay: [],
    topContent: [],
  });
  const [articleForm, setArticleForm] = useState<any>(emptyArticle);
  const [resourceForm, setResourceForm] = useState<any>(emptyResource);
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  const isEditingArticle = useMemo(() => Boolean(articleForm.id), [articleForm.id]);
  const isEditingResource = useMemo(() => Boolean(resourceForm.id), [resourceForm.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [articlesRes, resourcesRes, analyticsRes] = await Promise.all([
        adminKnowledgeAPI.listArticles({ limit: 50 }),
        adminKnowledgeAPI.listResources({ limit: 50 }),
        adminKnowledgeAPI.getAnalytics(),
      ]);
      setArticles(articlesRes.data.data || []);
      setResources(resourcesRes.data.data || []);
      setAnalytics(analyticsRes.data.data || { totalViews: 0, viewsPerDay: [], topContent: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load knowledge data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...articleForm,
        tags: articleForm.tags.split(',').map((item: string) => item.trim()).filter(Boolean),
      };
      if (isEditingArticle) await adminKnowledgeAPI.updateArticle(articleForm.id, payload);
      else await adminKnowledgeAPI.createArticle(payload);
      toast.success(`Article ${isEditingArticle ? 'updated' : 'created'}`);
      setArticleForm(emptyArticle);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save article');
    }
  };

  const saveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let uploadMeta: any = {};
      if (resourceFile) {
        const formData = new FormData();
        formData.append('file', resourceFile);
        const uploadRes = await adminKnowledgeAPI.uploadResourceFile(formData);
        uploadMeta = uploadRes.data.data || {};
      }

      const payload = {
        ...resourceForm,
        ...uploadMeta,
      };

      if (isEditingResource) await adminKnowledgeAPI.updateResource(resourceForm.id, payload);
      else await adminKnowledgeAPI.createResource(payload);

      toast.success(`Resource ${isEditingResource ? 'updated' : 'created'}`);
      setResourceForm(emptyResource);
      setResourceFile(null);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save resource');
    }
  };

  const togglePublishArticle = async (item: any) => {
    try {
      if (item.status === 'PUBLISHED') await adminKnowledgeAPI.unpublishArticle(item._id, { status: 'DRAFT' });
      else await adminKnowledgeAPI.publishArticle(item._id);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update article status');
    }
  };

  const togglePublishResource = async (item: any) => {
    try {
      if (item.status === 'PUBLISHED') await adminKnowledgeAPI.unpublishResource(item._id, { status: 'DRAFT' });
      else await adminKnowledgeAPI.publishResource(item._id);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update resource status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Content / Knowledge Hub</h1>
          <button onClick={loadData} className="px-3 py-2 border rounded-lg flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('ARTICLES')} className={`px-4 py-2 rounded-lg border ${tab === 'ARTICLES' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Articles</button>
          <button onClick={() => setTab('RESOURCES')} className={`px-4 py-2 rounded-lg border ${tab === 'RESOURCES' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Resources</button>
          <button onClick={() => setTab('ANALYTICS')} className={`px-4 py-2 rounded-lg border ${tab === 'ANALYTICS' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Analytics</button>
        </div>

        {loading ? (
          <div className="h-40 bg-white border rounded-xl animate-pulse" />
        ) : tab === 'ARTICLES' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={saveArticle} className="bg-white border rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-xl flex items-center gap-2"><Plus className="w-4 h-4" />{isEditingArticle ? 'Edit Article' : 'Create Article'}</h2>
              <input value={articleForm.title} onChange={(e) => setArticleForm((s: any) => ({ ...s, title: e.target.value }))} placeholder="Title" className="w-full px-3 py-2 border rounded-lg" required />
              <input value={articleForm.slug} onChange={(e) => setArticleForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="Slug (optional)" className="w-full px-3 py-2 border rounded-lg" />
              <textarea value={articleForm.summary} onChange={(e) => setArticleForm((s: any) => ({ ...s, summary: e.target.value }))} placeholder="Summary" className="w-full px-3 py-2 border rounded-lg h-20" />
              <textarea value={articleForm.content} onChange={(e) => setArticleForm((s: any) => ({ ...s, content: e.target.value }))} placeholder="Content (HTML/Markdown)" className="w-full px-3 py-2 border rounded-lg h-40" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={articleForm.category} onChange={(e) => setArticleForm((s: any) => ({ ...s, category: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  {KNOWLEDGE_CATEGORIES.map((item) => <option key={item} value={item}>{formatKnowledgeCategory(item)}</option>)}
                </select>
                <select value={articleForm.status} onChange={(e) => setArticleForm((s: any) => ({ ...s, status: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <input value={articleForm.tags} onChange={(e) => setArticleForm((s: any) => ({ ...s, tags: e.target.value }))} placeholder="Tags (comma-separated)" className="w-full px-3 py-2 border rounded-lg" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={articleForm.featured} onChange={(e) => setArticleForm((s: any) => ({ ...s, featured: e.target.checked }))} />
                Featured
              </label>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-nvm-green-600 text-white rounded-lg">{isEditingArticle ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setArticleForm(emptyArticle)} className="px-4 py-2 border rounded-lg">Clear</button>
              </div>
            </form>

            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-xl mb-4">Articles</h2>
              <div className="space-y-3 max-h-[680px] overflow-auto pr-1">
                {articles.map((item) => (
                  <div key={item._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.status} • {formatKnowledgeCategory(item.category)}</p>
                      </div>
                      <button onClick={() => togglePublishArticle(item)} className="text-xs px-2 py-1 border rounded">
                        {item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setArticleForm({ ...item, id: item._id, tags: (item.tags || []).join(', ') })} className="text-xs px-2 py-1 border rounded">Edit</button>
                      <button onClick={async () => { await adminKnowledgeAPI.deleteArticle(item._id); await loadData(); }} className="text-xs px-2 py-1 border rounded text-red-600">Archive</button>
                    </div>
                  </div>
                ))}
                {articles.length === 0 && <div className="text-sm text-gray-500">No articles yet.</div>}
              </div>
            </div>
          </div>
        ) : tab === 'RESOURCES' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={saveResource} className="bg-white border rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-xl flex items-center gap-2"><FileUp className="w-4 h-4" />{isEditingResource ? 'Edit Resource' : 'Create Resource'}</h2>
              <input value={resourceForm.title} onChange={(e) => setResourceForm((s: any) => ({ ...s, title: e.target.value }))} placeholder="Title" className="w-full px-3 py-2 border rounded-lg" required />
              <input value={resourceForm.slug} onChange={(e) => setResourceForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="Slug (optional)" className="w-full px-3 py-2 border rounded-lg" />
              <textarea value={resourceForm.description} onChange={(e) => setResourceForm((s: any) => ({ ...s, description: e.target.value }))} placeholder="Description" className="w-full px-3 py-2 border rounded-lg h-24" />
              <div className="grid grid-cols-2 gap-3">
                <select value={resourceForm.type} onChange={(e) => setResourceForm((s: any) => ({ ...s, type: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  {RESOURCE_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={resourceForm.category} onChange={(e) => setResourceForm((s: any) => ({ ...s, category: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  {KNOWLEDGE_CATEGORIES.map((item) => <option key={item} value={item}>{formatKnowledgeCategory(item)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={resourceForm.status} onChange={(e) => setResourceForm((s: any) => ({ ...s, status: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  <option value="DRAFT">DRAFT</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
                <input value={resourceForm.externalUrl} onChange={(e) => setResourceForm((s: any) => ({ ...s, externalUrl: e.target.value }))} placeholder="External URL (video/link)" className="px-3 py-2 border rounded-lg" />
              </div>
              <input value={resourceForm.thumbnailUrl} onChange={(e) => setResourceForm((s: any) => ({ ...s, thumbnailUrl: e.target.value }))} placeholder="Thumbnail URL (optional)" className="w-full px-3 py-2 border rounded-lg" />
              <label className="block text-sm text-gray-600">Upload file (PDF/DOCX/JPG/PNG/MP4)</label>
              <input type="file" onChange={(e) => setResourceFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-lg" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={resourceForm.featured} onChange={(e) => setResourceForm((s: any) => ({ ...s, featured: e.target.checked }))} />
                Featured
              </label>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-nvm-green-600 text-white rounded-lg">{isEditingResource ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setResourceForm(emptyResource); setResourceFile(null); }} className="px-4 py-2 border rounded-lg">Clear</button>
              </div>
            </form>

            <div className="bg-white border rounded-xl p-5">
              <h2 className="font-semibold text-xl mb-4">Resources</h2>
              <div className="space-y-3 max-h-[680px] overflow-auto pr-1">
                {resources.map((item) => (
                  <div key={item._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.status} • {item.type} • {formatKnowledgeCategory(item.category)}</p>
                      </div>
                      <button onClick={() => togglePublishResource(item)} className="text-xs px-2 py-1 border rounded">
                        {item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setResourceForm({ ...item, id: item._id })} className="text-xs px-2 py-1 border rounded">Edit</button>
                      <button onClick={async () => { await adminKnowledgeAPI.deleteResource(item._id); await loadData(); }} className="text-xs px-2 py-1 border rounded text-red-600">Archive</button>
                    </div>
                  </div>
                ))}
                {resources.length === 0 && <div className="text-sm text-gray-500">No resources yet.</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" />Engagement Analytics</h2>
            <p className="text-gray-700 mb-6">Total Views: <strong>{analytics.totalViews}</strong></p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Top Content</h3>
                <div className="space-y-2">
                  {analytics.topContent?.map((item: any) => (
                    <div key={`${item.contentType}-${item.contentId}`} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.contentType}</p>
                      </div>
                      <p className="font-semibold">{item.views}</p>
                    </div>
                  ))}
                  {analytics.topContent?.length === 0 && <p className="text-sm text-gray-500">No view data yet.</p>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Views By Day</h3>
                <div className="space-y-2">
                  {analytics.viewsPerDay?.map((item: any, idx: number) => (
                    <div key={`${item.date}-${item.contentType}-${idx}`} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.date}</p>
                        <p className="text-xs text-gray-500">{item.contentType}</p>
                      </div>
                      <p className="font-semibold">{item.views}</p>
                    </div>
                  ))}
                  {analytics.viewsPerDay?.length === 0 && <p className="text-sm text-gray-500">No daily metrics yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
