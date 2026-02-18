import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { helpAPI } from '../lib/api';
import { sanitizeHtml } from '../utils/sanitizeHtml';

function toEmbedUrl(type: string, url: string) {
  if (!url) return '';
  if (type === 'YOUTUBE') {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
  if (type === 'VIMEO') {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match?.[1] ? `https://player.vimeo.com/video/${match[1]}` : url;
  }
  return url;
}

export function HelpVideoDetail() {
  const { slug = '' } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await helpAPI.getVideoBySlug(slug);
        setVideo(response.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Could not load video');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  const embedUrl = useMemo(() => toEmbedUrl(video?.videoType, video?.videoUrl || ''), [video?.videoType, video?.videoUrl]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/help" className="text-sm text-nvm-green-primary font-medium">Back to Help Center</Link>

        {loading && <div className="bg-white border border-gray-200 rounded-xl p-6 mt-3">Loading video...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-3">{error}</div>}

        {!loading && !error && video && (
          <div className="space-y-4 mt-3">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h1 className="text-2xl font-display font-bold mb-2">{video.title}</h1>
              <div className="text-gray-600 prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(video.description || '') }} />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              {(video.videoType === 'YOUTUBE' || video.videoType === 'VIMEO' || video.videoType === 'LINK') && (
                <iframe src={embedUrl} title={video.title} className="w-full h-[420px] rounded-lg border" allowFullScreen />
              )}
              {video.videoType === 'UPLOAD' && (
                <video controls className="w-full rounded-lg border">
                  <source src={video.videoUrl} />
                </video>
              )}
              <a href={video.videoUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-nvm-green-primary">
                Open source link
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
