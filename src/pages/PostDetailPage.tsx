import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { postsAPI } from '../lib/api';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { formatPublicationAudience, formatPublicationType, getPublicationSessionId } from '../utils/publications';

export function PostDetailPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const res = await postsAPI.getPostBySlug(slug);
        const data = res.data.data;
        setPost(data);
        await postsAPI.track({ slug, eventType: 'VIEW', sessionId: getPublicationSessionId() });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const safeHtml = useMemo(() => sanitizeHtml(post?.content || ''), [post?.content]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">
          <div className="h-8 bg-white border rounded animate-pulse" />
          <div className="h-72 bg-white border rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={post?.type === 'ANNOUNCEMENT' ? '/announcements' : '/blog'} className="text-sm text-nvm-green-600">
          &larr; Back to {post?.type === 'ANNOUNCEMENT' ? 'Announcements' : 'Blog'}
        </Link>

        {error ? (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>
        ) : !post ? (
          <div className="mt-4 bg-white border rounded-lg p-6 text-gray-500">Post not found.</div>
        ) : (
          <article className="mt-4 bg-white border rounded-xl overflow-hidden">
            {post.coverImageUrl && <img src={post.coverImageUrl} alt={post.title} className="w-full h-64 object-cover" />}
            <div className="p-6">
              <div className="text-xs text-gray-500 mb-3">
                {formatPublicationType(post.type)} • {formatPublicationAudience(post.audience)} • {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
              </div>
              <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
              {post.excerpt && <p className="text-gray-700 mb-5">{post.excerpt}</p>}
              <div className="leading-7 text-gray-800" dangerouslySetInnerHTML={{ __html: safeHtml }} />
              <div className="mt-6 flex flex-wrap gap-2">
                {(post.tags || []).map((tag: string) => (
                  <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
