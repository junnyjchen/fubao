/**
 * @fileoverview 百科文章详情页
 */
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';
import { EmptyState, EmptyIcon } from '@/components/ui/empty-state';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  cover_image: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export default function BaikeArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/articles?slug=${slug}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        setArticle(data.data[0]);
      }
    } catch {
      setArticle(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-8 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 bg-muted rounded animate-pulse mb-2" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={<EmptyIcon type="data" />}
          title="文章未找到"
          description="該百科文章不存在或已被删除"
        />
        <div className="text-center mt-4">
          <Link href="/baike" className="text-primary hover:underline">返回百科首頁</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/baike" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回百科
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {article.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {article.view_count || 0} 次閱讀
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {new Date(article.created_at).toLocaleDateString('zh-CN')}
            </span>
          </div>
        </header>

        {article.cover_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img src={article.cover_image} alt={article.title} className="w-full object-cover max-h-80" />
          </div>
        )}

        <RichTextRenderer
          content={article.content || article.summary || ''}
          className="prose prose-sm max-w-none dark:prose-invert"
        />
      </article>
    </div>
  );
}
