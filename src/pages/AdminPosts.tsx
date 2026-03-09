import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart3, Plus, RefreshCcw } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { adminPostsAPI } from '../lib/api';
import { formatPublicationAudience, formatPublicationType, PUBLICATION_AUDIENCES, PUBLICATION_STATUS, PUBLICATION_TYPES } from '../utils/publications';

type Tab = 'ANNOUNCEMENT' | 'BLOG' | 'ANALYTICS';

const emptyForm = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  type: 'ANNOUNCEMENT',
  status: 'DRAFT',
  featured: false,
  coverImageUrl: '',
  tags: '',
  audience: 'ALL',
  meta: {
    metaTitle: '',
    metaDescription: '',
    ogImageUrl: ''
  }
};

export function AdminPosts() {
  const [tab, setTab] = useState<Tab>('ANNOUNCEMENT');
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({ totalViews: 0, viewsByDay: [], topPosts: [], viewsByAudience: [], featuredPostPerformance: [] });
  const [form, setForm] = useState<any>(emptyForm);
  const [filters, setFilters] = useState({ status: '', audience: '', q: '' });

  const editing = useMemo(() => Boolean(form.id), [form.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const listType = tab === 'ANALYTICS' ? undefined : tab;
      const [postsRes, analyticsRes] = await Promise.all([
        adminPostsAPI.listPosts({ type: listType, ...filters, limit: 100 }),
        adminPostsAPI.getAnalytics(tab === 'ANALYTICS' ? {} : { type: tab })
      ]);
      setPosts(postsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || { totalViews: 0, viewsByDay: [], topPosts: [], viewsByAudience: [], featuredPostPerformance: [] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab, filters.status, filters.audience, filters.q]);

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: String(form.tags || '').split(',').map((tag: string) => tag.trim()).filter(Boolean),
      };
      if (editing) await adminPostsAPI.updatePost(form.id, payload);
      else await adminPostsAPI.createPost(payload);
      toast.success(`Post ${editing ? 'updated' : 'created'}`);
      setForm({ ...emptyForm, type: tab === 'ANALYTICS' ? 'ANNOUNCEMENT' : tab });
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    }
  };

  const togglePublish = async (post: any) => {
    try {
      if (post.status === 'PUBLISHED') await adminPostsAPI.unpublishPost(post._id, { status: 'DRAFT' });
      else await adminPostsAPI.publishPost(post._id);
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update post status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Posts / Publications</h1>
          <button onClick={loadData} className="px-3 py-2 border rounded-lg flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('ANNOUNCEMENT')} className={`px-4 py-2 rounded-lg border ${tab === 'ANNOUNCEMENT' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Announcements</button>
          <button onClick={() => setTab('BLOG')} className={`px-4 py-2 rounded-lg border ${tab === 'BLOG' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Blog</button>
          <button onClick={() => setTab('ANALYTICS')} className={`px-4 py-2 rounded-lg border ${tab === 'ANALYTICS' ? 'bg-nvm-green-600 text-white border-nvm-green-600' : 'bg-white'}`}>Analytics</button>
        </div>

        {loading ? (
          <div className="h-44 bg-white border rounded-xl animate-pulse" />
        ) : tab === 'ANALYTICS' ? (
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-xl mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" />Post Analytics</h2>
            <p className="mb-6 text-gray-700">Total Views: <strong>{analytics.totalViews}</strong></p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Top Posts</h3>
                <div className="space-y-2">
                  {(analytics.topPosts || []).map((item: any) => (
                    <div key={item.postId} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.type}</p>
                      </div>
                      <p className="font-semibold">{item.views}</p>
                    </div>
                  ))}
                  {(analytics.topPosts || []).length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Views By Audience</h3>
                <div className="space-y-2">
                  {(analytics.viewsByAudience || []).map((item: any) => (
                    <div key={item.role} className="border rounded-lg p-3 flex items-center justify-between">
                      <p>{item.role}</p>
                      <p className="font-semibold">{item.views}</p>
                    </div>
                  ))}
                  {(analytics.viewsByAudience || []).length === 0 && <p className="text-sm text-gray-500">No audience data yet.</p>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={savePost} className="bg-white border rounded-xl p-5 space-y-3">
              <h2 className="font-semibold text-xl flex items-center gap-2"><Plus className="w-4 h-4" />{editing ? 'Edit Post' : 'Create Post'}</h2>
              <input value={form.title} onChange={(e) => setForm((s: any) => ({ ...s, title: e.target.value }))} placeholder="Title" className="w-full px-3 py-2 border rounded-lg" required />
              <input value={form.slug} onChange={(e) => setForm((s: any) => ({ ...s, slug: e.target.value }))} placeholder="Slug (optional)" className="w-full px-3 py-2 border rounded-lg" />
              <textarea value={form.excerpt} onChange={(e) => setForm((s: any) => ({ ...s, excerpt: e.target.value }))} placeholder="Excerpt" className="w-full px-3 py-2 border rounded-lg h-20" />
              <textarea value={form.content} onChange={(e) => setForm((s: any) => ({ ...s, content: e.target.value }))} placeholder="Content (HTML/Markdown)" className="w-full px-3 py-2 border rounded-lg h-40" required />
              <div className="grid grid-cols-3 gap-3">
                <select value={form.type} onChange={(e) => setForm((s: any) => ({ ...s, type: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  {PUBLICATION_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={form.status} onChange={(e) => setForm((s: any) => ({ ...s, status: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  {PUBLICATION_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={form.audience} onChange={(e) => setForm((s: any) => ({ ...s, audience: e.target.value }))} className="px-3 py-2 border rounded-lg">
                  {PUBLICATION_AUDIENCES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <input value={form.coverImageUrl} onChange={(e) => setForm((s: any) => ({ ...s, coverImageUrl: e.target.value }))} placeholder="Cover Image URL" className="w-full px-3 py-2 border rounded-lg" />
              <input value={form.tags} onChange={(e) => setForm((s: any) => ({ ...s, tags: e.target.value }))} placeholder="Tags (comma-separated)" className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-1 gap-3">
                <input value={form.meta.metaTitle} onChange={(e) => setForm((s: any) => ({ ...s, meta: { ...s.meta, metaTitle: e.target.value } }))} placeholder="Meta Title" className="w-full px-3 py-2 border rounded-lg" />
                <input value={form.meta.metaDescription} onChange={(e) => setForm((s: any) => ({ ...s, meta: { ...s.meta, metaDescription: e.target.value } }))} placeholder="Meta Description" className="w-full px-3 py-2 border rounded-lg" />
                <input value={form.meta.ogImageUrl} onChange={(e) => setForm((s: any) => ({ ...s, meta: { ...s.meta, ogImageUrl: e.target.value } }))} placeholder="OG Image URL" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((s: any) => ({ ...s, featured: e.target.checked }))} />
                Featured
              </label>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-nvm-green-600 text-white rounded-lg">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setForm({ ...emptyForm, type: tab })} className="px-4 py-2 border rounded-lg">Clear</button>
              </div>
            </form>

            <div className="bg-white border rounded-xl p-5">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <select value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))} className="px-2 py-2 border rounded-lg text-sm">
                  <option value="">All Status</option>
                  {PUBLICATION_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={filters.audience} onChange={(e) => setFilters((s) => ({ ...s, audience: e.target.value }))} className="px-2 py-2 border rounded-lg text-sm">
                  <option value="">All Audience</option>
                  {PUBLICATION_AUDIENCES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <input value={filters.q} onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))} placeholder="Search title" className="px-2 py-2 border rounded-lg text-sm" />
              </div>

              <div className="space-y-3 max-h-[780px] overflow-auto pr-1">
                {posts.map((item) => (
                  <div key={item._id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {formatPublicationType(item.type)} • {item.status} • {formatPublicationAudience(item.audience)} • {item.viewCount || 0} views
                        </p>
                      </div>
                      <button onClick={() => togglePublish(item)} className="text-xs px-2 py-1 border rounded">
                        {item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() =>
                          setForm({
                            ...item,
                            id: item._id,
                            tags: (item.tags || []).join(', '),
                            meta: {
                              metaTitle: item.meta?.metaTitle || '',
                              metaDescription: item.meta?.metaDescription || '',
                              ogImageUrl: item.meta?.ogImageUrl || ''
                            }
                          })
                        }
                        className="text-xs px-2 py-1 border rounded"
                      >
                        Edit
                      </button>
                      <button onClick={async () => { await adminPostsAPI.deletePost(item._id); await loadData(); }} className="text-xs px-2 py-1 border rounded text-red-600">
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && <div className="text-sm text-gray-500">No posts found.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
