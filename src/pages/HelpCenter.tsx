import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { helpAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { sanitizeHtml } from '../utils/sanitizeHtml';

type TabType = 'FAQS' | 'GUIDES' | 'VIDEOS';

const categories = ['ALL', 'GENERAL', 'ORDERS', 'PAYMENTS', 'VENDORS', 'PRODUCTS', 'ACCOUNT', 'SECURITY', 'OTHER'];

export function HelpCenter() {
  const [tab, setTab] = useState<TabType>('FAQS');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const { user } = useAuthStore();

  const audience = useMemo(() => {
    if (user?.role === 'vendor') return 'VENDOR';
    if (user?.role === 'customer') return 'CUSTOMER';
    return 'ALL';
  }, [user?.role]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        if (tab === 'FAQS') {
          const response = await helpAPI.getFaqs({
            q: query || undefined,
            category: category !== 'ALL' ? category : undefined,
            audience
          });
          setFaqs(response.data?.data || []);
        } else if (tab === 'GUIDES') {
          const response = await helpAPI.getGuides({
            q: query || undefined,
            audience: audience === 'CUSTOMER' ? 'ALL' : audience
          });
          setGuides(response.data?.data || []);
        } else {
          const response = await helpAPI.getVideos({
            q: query || undefined,
            category: category !== 'ALL' ? category : undefined,
            audience
          });
          setVideos(response.data?.data || []);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load help content');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [tab, query, category, audience]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-display font-bold text-nvm-dark-900">Help Center</h1>
          <Link to="/support" className="px-4 py-2 rounded-lg bg-nvm-green-primary text-white font-semibold">
            Contact Support
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {(['FAQS', 'GUIDES', 'VIDEOS'] as TabType[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === item ? 'bg-nvm-green-primary text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                {item === 'FAQS' ? 'FAQs' : item === 'GUIDES' ? 'Vendor Onboarding' : 'Video Tutorials'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Search help content..."
            />
            {(tab === 'FAQS' || tab === 'VIDEOS') && (
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="border border-gray-300 rounded-lg px-3 py-2">
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {loading && <div className="bg-white border border-gray-200 rounded-xl p-6">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>}

        {!loading && !error && tab === 'FAQS' && (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{faq.category}</span>
                </div>
                <div className="text-gray-700 prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(faq.answer || '') }} />
              </div>
            ))}
            {!faqs.length && <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">No FAQs found.</div>}
          </div>
        )}

        {!loading && !error && tab === 'GUIDES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide) => (
              <Link key={guide._id} to={`/help/guides/${guide.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-nvm-green-primary">
                <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{guide.description || 'No description provided.'}</p>
                <p className="text-xs text-gray-500">{guide.steps?.length || 0} steps</p>
              </Link>
            ))}
            {!guides.length && <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">No guides found.</div>}
          </div>
        )}

        {!loading && !error && tab === 'VIDEOS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <Link key={video._id} to={`/help/videos/${video.slug}`} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-nvm-green-primary">
                <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{video.description || 'No description provided.'}</p>
                <p className="text-xs text-gray-500">{video.videoType}</p>
              </Link>
            ))}
            {!videos.length && <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">No videos found.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
