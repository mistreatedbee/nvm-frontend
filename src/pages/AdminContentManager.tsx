import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { adminSuiteAPI } from '../lib/api';

type Tab = 'pages' | 'banners' | 'sections';

export function AdminContentManager() {
  const [tab, setTab] = useState<Tab>('pages');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'pages') {
        const res = await adminSuiteAPI.cms.listPages({ page: 1, limit: 100 });
        setRows(res.data.data || []);
      }
      if (tab === 'banners') {
        const res = await adminSuiteAPI.cms.listBanners({ page: 1, limit: 100 });
        setRows(res.data.data || []);
      }
      if (tab === 'sections') {
        const res = await adminSuiteAPI.cms.listHomepageSections({ page: 1, limit: 100 });
        setRows(res.data.data || []);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRows([]);
    setForm({});
    setEditingId(null);
    void load();
  }, [tab]);

  const save = async () => {
    try {
      if (tab === 'pages') {
        const payload = {
          title: form.title || '',
          slug: form.slug || '',
          content: form.content || '',
          status: form.status || 'DRAFT',
          audience: form.audience || 'ALL'
        };
        if (!payload.title || !payload.slug) return toast.error('title and slug are required');
        if (editingId) await adminSuiteAPI.cms.updatePage(editingId, payload);
        else await adminSuiteAPI.cms.createPage(payload);
      }
      if (tab === 'banners') {
        const payload = {
          title: form.title || '',
          imageUrl: form.imageUrl || '',
          linkUrl: form.linkUrl || '',
          placement: form.placement || 'OTHER',
          isActive: form.isActive !== false,
          sortOrder: Number(form.sortOrder || 0)
        };
        if (!payload.title || !payload.imageUrl) return toast.error('title and imageUrl are required');
        if (editingId) await adminSuiteAPI.cms.updateBanner(editingId, payload);
        else await adminSuiteAPI.cms.createBanner(payload);
      }
      if (tab === 'sections') {
        const payload = {
          key: form.key || 'CUSTOM',
          title: form.title || '',
          isActive: form.isActive !== false,
          sortOrder: Number(form.sortOrder || 0),
          config: form.configJson ? JSON.parse(form.configJson) : {}
        };
        if (!payload.title) return toast.error('title is required');
        if (editingId) await adminSuiteAPI.cms.updateHomepageSection(editingId, payload);
        else await adminSuiteAPI.cms.createHomepageSection(payload);
      }

      toast.success(editingId ? 'Updated' : 'Created');
      setForm({});
      setEditingId(null);
      await load();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-nvm-dark-900">Admin Content Manager</h1>
          <p className="text-gray-600">Manage CMS pages, banners, and homepage sections.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab('pages')} className={`px-3 py-2 rounded ${tab === 'pages' ? 'bg-nvm-green-primary text-white' : 'bg-white border'}`}>CMS Pages</button>
          <button onClick={() => setTab('banners')} className={`px-3 py-2 rounded ${tab === 'banners' ? 'bg-nvm-green-primary text-white' : 'bg-white border'}`}>Banners</button>
          <button onClick={() => setTab('sections')} className={`px-3 py-2 rounded ${tab === 'sections' ? 'bg-nvm-green-primary text-white' : 'bg-white border'}`}>Homepage Sections</button>
        </div>

        <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Title" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          {tab === 'pages' && <input className="border rounded px-3 py-2" placeholder="Slug" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />}
          {tab === 'banners' && <input className="border rounded px-3 py-2" placeholder="Image URL" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />}
          {tab === 'banners' && <input className="border rounded px-3 py-2" placeholder="Link URL" value={form.linkUrl || ''} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />}
          {tab === 'sections' && <input className="border rounded px-3 py-2" placeholder="Config JSON" value={form.configJson || ''} onChange={(e) => setForm({ ...form, configJson: e.target.value })} />}
          <input type="number" className="border rounded px-3 py-2" placeholder="Sort Order" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value || 0) })} />
          {tab === 'pages' && (
            <select className="border rounded px-3 py-2" value={form.audience || 'ALL'} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="ALL">ALL</option>
              <option value="VENDOR">VENDOR</option>
              <option value="CUSTOMER">CUSTOMER</option>
            </select>
          )}
          {tab === 'pages' && <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Content" value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} />}
          {tab === 'banners' && (
            <select className="border rounded px-3 py-2" value={form.placement || 'OTHER'} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
              <option value="HOMEPAGE_TOP">HOMEPAGE_TOP</option>
              <option value="HOMEPAGE_MID">HOMEPAGE_MID</option>
              <option value="CATEGORY">CATEGORY</option>
              <option value="VENDOR_DASHBOARD">VENDOR_DASHBOARD</option>
              <option value="OTHER">OTHER</option>
            </select>
          )}
          {tab === 'sections' && (
            <select className="border rounded px-3 py-2" value={form.key || 'CUSTOM'} onChange={(e) => setForm({ ...form, key: e.target.value })}>
              <option value="FEATURED_PRODUCTS">FEATURED_PRODUCTS</option>
              <option value="TRENDING">TRENDING</option>
              <option value="NEW_ARRIVALS">NEW_ARRIVALS</option>
              <option value="FEATURED_VENDORS">FEATURED_VENDORS</option>
              <option value="CUSTOM">CUSTOM</option>
            </select>
          )}
          <div className="flex items-center gap-3">
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            {tab === 'pages' && (
              <select className="border rounded px-3 py-2" value={form.status || 'DRAFT'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
              </select>
            )}
          </div>
          <button onClick={save} className="px-3 py-2 bg-nvm-green-primary text-white rounded">{editingId ? 'Update' : 'Create'}</button>
        </div>

        <div className="bg-white rounded-xl border p-4">
          {loading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-12 bg-gray-100 animate-pulse rounded" />)}</div>
          ) : (
            <div className="space-y-2">
              {rows.map((item) => (
                <div key={item._id} className="border rounded p-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{item.title || item.key}</div>
                    <div className="text-sm text-gray-600">{item.slug || item.placement || item.key || '-'} • sort {item.sortOrder ?? 0}</div>
                    <div className="text-xs text-gray-500">status: {item.status || (item.isActive ? 'ACTIVE' : 'INACTIVE')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded text-xs" onClick={() => {
                      setEditingId(item._id);
                      setForm({
                        title: item.title || '',
                        slug: item.slug || '',
                        content: item.content || '',
                        status: item.status || 'DRAFT',
                        audience: item.audience || 'ALL',
                        imageUrl: item.imageUrl || '',
                        linkUrl: item.linkUrl || '',
                        placement: item.placement || 'OTHER',
                        key: item.key || 'CUSTOM',
                        sortOrder: item.sortOrder || 0,
                        isActive: item.isActive !== false,
                        configJson: item.config ? JSON.stringify(item.config) : ''
                      });
                    }}>Edit</button>
                    {tab === 'pages' && (
                      <button className="px-2 py-1 border rounded text-xs" onClick={async () => { if (item.status === 'PUBLISHED') await adminSuiteAPI.cms.unpublishPage(item._id); else await adminSuiteAPI.cms.publishPage(item._id); await load(); }}>{item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</button>
                    )}
                    <button className="px-2 py-1 border rounded text-xs text-red-600" onClick={async () => {
                      if (tab === 'pages') await adminSuiteAPI.cms.deletePage(item._id);
                      if (tab === 'banners') await adminSuiteAPI.cms.deleteBanner(item._id);
                      if (tab === 'sections') await adminSuiteAPI.cms.deleteHomepageSection(item._id);
                      await load();
                    }}>Delete</button>
                  </div>
                </div>
              ))}
              {!rows.length && <p className="text-gray-500">No records found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

