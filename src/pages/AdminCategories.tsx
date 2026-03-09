import React, { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { adminSuiteAPI } from '../lib/api';
import toast from 'react-hot-toast';

export function AdminCategories() {
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [active, setActive] = useState('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ name: '', description: '', imageUrl: '', isActive: true, isFeatured: false, sortOrder: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filters = useMemo(() => ({ page, limit: 20, q: q || undefined, active: active === 'all' ? undefined : active === 'true' }), [page, q, active]);

  const load = async (nextPage = page) => {
    setLoading(true);
    try {
      const res = await adminSuiteAPI.categories.list({ ...filters, page: nextPage });
      setRows(res.data.data || []);
      setPage(res.data.page || nextPage);
      setPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(1); }, [q, active]);

  const save = async () => {
    if (!form.name?.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || '',
        imageUrl: form.imageUrl || '',
        isActive: Boolean(form.isActive),
        isFeatured: Boolean(form.isFeatured),
        sortOrder: Number(form.sortOrder || 0)
      };
      if (editingId) await adminSuiteAPI.categories.update(editingId, payload);
      else await adminSuiteAPI.categories.create(payload);

      toast.success(editingId ? 'Category updated' : 'Category created');
      setForm({ name: '', description: '', imageUrl: '', isActive: true, isFeatured: false, sortOrder: 0 });
      setEditingId(null);
      await load(page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const reordered = [...rows];
    const [item] = reordered.splice(index, 1);
    reordered.splice(target, 0, item);

    setRows(reordered);
    try {
      await adminSuiteAPI.categories.reorder(reordered.map((row) => row._id));
      toast.success('Order updated');
      await load(page);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Reorder failed');
      await load(page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-nvm-dark-900">Admin Categories</h1>
          <p className="text-gray-600">Create, feature, reorder, and activate/deactivate categories.</p>
        </div>

        <div className="bg-white rounded-xl border p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          <input type="number" className="border rounded px-3 py-2" placeholder="Sort" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value || 0) })} />
          <button disabled={saving} onClick={save} className="px-3 py-2 bg-nvm-green-primary text-white rounded disabled:opacity-60">{editingId ? 'Update' : 'Create'}</button>
          <textarea className="border rounded px-3 py-2 md:col-span-5" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} /> Featured</label>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <input className="border rounded px-3 py-2" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="border rounded px-3 py-2" value={active} onChange={(e) => setActive(e.target.value)}>
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button onClick={() => load(1)} className="px-3 py-2 bg-blue-600 text-white rounded">Apply</button>
            <span className="text-sm text-gray-500 self-center">{total} total</span>
          </div>

          {loading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, idx) => <div key={idx} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {rows.map((row, index) => (
                <div key={row._id} className="border rounded p-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{row.name}</div>
                    <div className="text-sm text-gray-600">{row.slug} • sort {row.sortOrder ?? row.order ?? 0}</div>
                    <div className="text-xs text-gray-500">active: {row.isActive ? 'yes' : 'no'} • featured: {row.isFeatured ? 'yes' : 'no'}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-2 py-1 border rounded text-xs" onClick={() => move(index, -1)}>Up</button>
                    <button className="px-2 py-1 border rounded text-xs" onClick={() => move(index, 1)}>Down</button>
                    <button
                      className="px-2 py-1 border rounded text-xs"
                      onClick={() => {
                        setEditingId(row._id);
                        setForm({
                          name: row.name || '',
                          description: row.description || '',
                          imageUrl: row.imageUrl || row.image?.url || '',
                          isActive: row.isActive,
                          isFeatured: row.isFeatured,
                          sortOrder: row.sortOrder ?? row.order ?? 0
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className="px-2 py-1 border rounded text-xs" onClick={async () => { await adminSuiteAPI.categories.feature(row._id, !row.isFeatured); await load(page); }}>Feature</button>
                    <button className="px-2 py-1 border rounded text-xs" onClick={async () => { await adminSuiteAPI.categories.deactivate(row._id, !row.isActive); await load(page); }}>{row.isActive ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </div>
              ))}
              {!rows.length && <p className="text-gray-500">No categories found.</p>}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">Page {page} of {pages || 1}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button disabled={page >= pages} onClick={() => load(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

