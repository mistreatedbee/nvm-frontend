import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { adminHelpAPI } from '../lib/api';

type Tab = 'FAQS' | 'GUIDES' | 'VIDEOS';

export function AdminHelpCenter() {
  const [tab, setTab] = useState<Tab>('FAQS');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState('');
  const [q, setQ] = useState('');

  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'GENERAL', audience: 'ALL', status: 'DRAFT', featured: false });
  const [guideForm, setGuideForm] = useState({ title: '', description: '', audience: 'VENDOR', status: 'DRAFT', order: 0, stepsJson: '[{"title":"","content":"","checklistKey":""}]' });
  const [videoForm, setVideoForm] = useState({ title: '', description: '', videoType: 'LINK', videoUrl: '', thumbnailUrl: '', category: 'GENERAL', audience: 'ALL', status: 'DRAFT' });

  const load = async () => {
    setLoading(true);
    try {
      let response: any;
      if (tab === 'FAQS') response = await adminHelpAPI.listFaqs({ page: 1, limit: 100, q: q || undefined });
      if (tab === 'GUIDES') response = await adminHelpAPI.listGuides({ page: 1, limit: 100, q: q || undefined });
      if (tab === 'VIDEOS') response = await adminHelpAPI.listVideos({ page: 1, limit: 100, q: q || undefined });
      setItems(response?.data?.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load help content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tab]);

  const resetForms = () => {
    setEditingId('');
    setFaqForm({ question: '', answer: '', category: 'GENERAL', audience: 'ALL', status: 'DRAFT', featured: false });
    setGuideForm({ title: '', description: '', audience: 'VENDOR', status: 'DRAFT', order: 0, stepsJson: '[{"title":"","content":"","checklistKey":""}]' });
    setVideoForm({ title: '', description: '', videoType: 'LINK', videoUrl: '', thumbnailUrl: '', category: 'GENERAL', audience: 'ALL', status: 'DRAFT' });
  };

  const onEdit = (item: any) => {
    setEditingId(item._id);
    if (tab === 'FAQS') {
      setFaqForm({
        question: item.question || '',
        answer: item.answer || '',
        category: item.category || 'GENERAL',
        audience: item.audience || 'ALL',
        status: item.status || 'DRAFT',
        featured: Boolean(item.featured)
      });
    }
    if (tab === 'GUIDES') {
      setGuideForm({
        title: item.title || '',
        description: item.description || '',
        audience: item.audience || 'VENDOR',
        status: item.status || 'DRAFT',
        order: Number(item.order || 0),
        stepsJson: JSON.stringify(item.steps || [], null, 2)
      });
    }
    if (tab === 'VIDEOS') {
      setVideoForm({
        title: item.title || '',
        description: item.description || '',
        videoType: item.videoType || 'LINK',
        videoUrl: item.videoUrl || '',
        thumbnailUrl: item.thumbnailUrl || '',
        category: item.category || 'GENERAL',
        audience: item.audience || 'ALL',
        status: item.status || 'DRAFT'
      });
    }
  };

  const save = async () => {
    try {
      if (tab === 'FAQS') {
        if (editingId) await adminHelpAPI.updateFaq(editingId, faqForm);
        else await adminHelpAPI.createFaq(faqForm);
      }
      if (tab === 'GUIDES') {
        const steps = JSON.parse(guideForm.stepsJson || '[]');
        const payload = { ...guideForm, steps };
        if (editingId) await adminHelpAPI.updateGuide(editingId, payload);
        else await adminHelpAPI.createGuide(payload);
      }
      if (tab === 'VIDEOS') {
        if (editingId) await adminHelpAPI.updateVideo(editingId, videoForm);
        else await adminHelpAPI.createVideo(videoForm);
      }
      toast.success('Saved');
      resetForms();
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save');
    }
  };

  const publish = async (id: string) => {
    try {
      if (tab === 'FAQS') await adminHelpAPI.publishFaq(id);
      if (tab === 'GUIDES') await adminHelpAPI.publishGuide(id);
      if (tab === 'VIDEOS') await adminHelpAPI.publishVideo(id);
      toast.success('Published');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not publish');
    }
  };

  const unpublish = async (id: string) => {
    try {
      if (tab === 'FAQS') await adminHelpAPI.unpublishFaq(id);
      if (tab === 'GUIDES') await adminHelpAPI.unpublishGuide(id);
      if (tab === 'VIDEOS') await adminHelpAPI.unpublishVideo(id);
      toast.success('Unpublished');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not unpublish');
    }
  };

  const archive = async (id: string) => {
    try {
      if (tab === 'FAQS') await adminHelpAPI.deleteFaq(id);
      if (tab === 'GUIDES') await adminHelpAPI.deleteGuide(id);
      if (tab === 'VIDEOS') await adminHelpAPI.deleteVideo(id);
      toast.success('Archived');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not archive');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-nvm-dark-900 mb-5">Admin Help Center</h1>

        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex flex-wrap gap-2">
          {(['FAQS', 'GUIDES', 'VIDEOS'] as Tab[]).map((item) => (
            <button key={item} onClick={() => { setTab(item); resetForms(); }} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === item ? 'bg-nvm-green-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
              {item}
            </button>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 ml-auto" placeholder="Search..." />
          <button onClick={load} className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold">Refresh</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            {tab === 'FAQS' && (
              <>
                <input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="Question" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} placeholder="Answer" className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[140px]" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2">
                    {['GENERAL', 'ORDERS', 'PAYMENTS', 'VENDORS', 'PRODUCTS', 'ACCOUNT', 'SECURITY', 'OTHER'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <select value={faqForm.audience} onChange={(e) => setFaqForm({ ...faqForm, audience: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2">
                    {['ALL', 'VENDOR', 'CUSTOMER'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={faqForm.featured} onChange={(e) => setFaqForm({ ...faqForm, featured: e.target.checked })} /> Featured</label>
              </>
            )}

            {tab === 'GUIDES' && (
              <>
                <input value={guideForm.title} onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })} placeholder="Title" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <textarea value={guideForm.description} onChange={(e) => setGuideForm({ ...guideForm, description: e.target.value })} placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={guideForm.audience} onChange={(e) => setGuideForm({ ...guideForm, audience: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2">
                    {['VENDOR', 'ALL'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <input type="number" value={guideForm.order} onChange={(e) => setGuideForm({ ...guideForm, order: Number(e.target.value || 0) })} className="border border-gray-300 rounded-lg px-3 py-2" placeholder="Order" />
                </div>
                <textarea value={guideForm.stepsJson} onChange={(e) => setGuideForm({ ...guideForm, stepsJson: e.target.value })} placeholder='[{"title":"...","content":"..."}]' className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[180px] font-mono text-xs" />
              </>
            )}

            {tab === 'VIDEOS' && (
              <>
                <input value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} placeholder="Title" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <textarea value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} placeholder="Description" className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[90px]" />
                <input value={videoForm.videoUrl} onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })} placeholder="Video URL" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <input value={videoForm.thumbnailUrl} onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })} placeholder="Thumbnail URL" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={videoForm.videoType} onChange={(e) => setVideoForm({ ...videoForm, videoType: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2">
                    {['YOUTUBE', 'VIMEO', 'LINK', 'UPLOAD'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <select value={videoForm.category} onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2">
                    {['GENERAL', 'ORDERS', 'PAYMENTS', 'VENDORS', 'PRODUCTS', 'ACCOUNT', 'SECURITY', 'OTHER'].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={save} className="px-4 py-2 rounded-lg bg-nvm-green-primary text-white font-semibold">{editingId ? 'Update' : 'Create'}</button>
              <button onClick={resetForms} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold">Reset</button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 max-h-[760px] overflow-auto">
            {loading && <p className="text-sm text-gray-500 p-2">Loading...</p>}
            {!loading && items.map((item) => (
              <div key={item._id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{item.title || item.question}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.status}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button onClick={() => onEdit(item)} className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700">Edit</button>
                  <button onClick={() => publish(item._id)} className="px-3 py-1.5 text-xs rounded-lg bg-green-100 text-green-700">Publish</button>
                  <button onClick={() => unpublish(item._id)} className="px-3 py-1.5 text-xs rounded-lg bg-yellow-100 text-yellow-700">Unpublish</button>
                  <button onClick={() => archive(item._id)} className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-700">Archive</button>
                </div>
              </div>
            ))}
            {!loading && !items.length && <p className="text-sm text-gray-500 p-2">No content available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
