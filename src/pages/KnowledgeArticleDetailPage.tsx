import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { knowledgeAPI } from '../lib/api';
import { formatKnowledgeCategory, getKnowledgeSessionId } from '../utils/knowledge';
import { sanitizeHtml } from '../utils/sanitizeHtml';

export function KnowledgeArticleDetailPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      setError('');
      try {
        const res = await knowledgeAPI.getArticleBySlug(slug);
        const item = res.data.data;
        setArticle(item);
        await knowledgeAPI.trackView({
          contentType: 'ARTICLE',
          contentId: item._id,
          sessionId: getKnowledgeSessionId(),
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const safeHtml = useMemo(() => sanitizeHtml(article?.content || ''), [article?.content]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/vendor/knowledge/articles" className="text-sm text-nvm-green-600">&larr; Back to articles</Link>
        {loading ? (
          <div className="space-y-3 mt-4">
            <div className="h-8 bg-white border rounded animate-pulse" />
            <div className="h-64 bg-white border rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>
        ) : !article ? (
          <div className="mt-4 bg-white border rounded-lg p-6 text-gray-500">Article not found.</div>
        ) : (
          <article className="mt-4 bg-white border rounded-xl p-6">
            <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
            <div className="text-sm text-gray-500 mb-6 flex gap-3">
              <span>{formatKnowledgeCategory(article.category)}</span>
              <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
            </div>
            {article.summary && <p className="text-gray-700 mb-5">{article.summary}</p>}
            <div className="leading-7 text-gray-800" dangerouslySetInnerHTML={{ __html: safeHtml }} />
          </article>
        )}
      </div>
    </div>
  );
}
