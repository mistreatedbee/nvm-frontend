import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Navbar } from '../components/Navbar';
import { helpAPI } from '../lib/api';
import { useAuthStore } from '../lib/store';
import { sanitizeHtml } from '../utils/sanitizeHtml';

export function HelpGuideDetail() {
  const { slug = '' } = useParams();
  const { user } = useAuthStore();
  const [guide, setGuide] = useState<any>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canTrack = useMemo(() => user?.role === 'vendor', [user?.role]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await helpAPI.getGuideBySlug(slug);
        const item = response.data?.data;
        setGuide(item);

        if (canTrack) {
          const progressResponse = await helpAPI.getGuideProgress(slug);
          setCompletedSteps(progressResponse.data?.data?.completedSteps || []);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load guide');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug, canTrack]);

  const progress = useMemo(() => {
    const total = guide?.steps?.length || 0;
    if (!total) return 0;
    return Math.round((completedSteps.length / total) * 100);
  }, [guide?.steps?.length, completedSteps.length]);

  const toggleStep = async (index: number) => {
    if (!canTrack) return;
    const next = completedSteps.includes(index) ? completedSteps.filter((value) => value !== index) : [...completedSteps, index];
    setCompletedSteps(next);
    setSaving(true);
    try {
      await helpAPI.updateGuideProgress(slug, { completedSteps: next });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/help" className="text-sm text-nvm-green-primary font-medium">Back to Help Center</Link>

        {loading && <div className="bg-white border border-gray-200 rounded-xl p-6 mt-3">Loading guide...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-3">{error}</div>}

        {!loading && !error && guide && (
          <div className="space-y-4 mt-3">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h1 className="text-2xl font-display font-bold mb-2">{guide.title}</h1>
              <p className="text-gray-600">{guide.description || 'Vendor onboarding guide'}</p>
              {canTrack && (
                <p className="text-sm text-gray-500 mt-3">
                  Progress: {progress}% {saving ? '• Saving...' : ''}
                </p>
              )}
            </div>

            {(guide.steps || []).map((step: any, index: number) => (
              <div key={`${guide._id}-${index}`} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h2 className="font-semibold">Step {index + 1}: {step.title}</h2>
                  {canTrack && (
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={completedSteps.includes(index)} onChange={() => toggleStep(index)} />
                      Done
                    </label>
                  )}
                </div>
                <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: sanitizeHtml(step.content || '') }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
