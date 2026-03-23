/**
 * @fileoverview 百科文章详情组件
 * @description 展示文章内容和相关信息
 * @module components/wiki/WikiArticlePage
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Eye,
  Share2,
  ChevronRight,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

/** 文章数据类型 */
interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  author: string;
  view_count: number;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

/** 相关文章类型 */
interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  view_count: number;
}

interface WikiArticlePageProps {
  slug: string;
}

/**
 * 百科文章详情组件
 * @returns 文章详情页面
 */
export function WikiArticlePage({ slug }: WikiArticlePageProps) {
  const router = useRouter();
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  /**
   * 加载文章详情
   */
  const loadArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wiki/articles?slug=${slug}&is_published=true`);
      const data = await res.json();

      if (data.data?.[0]) {
        const articleData = data.data[0];
        setArticle(articleData);

        // 加载相关文章
        if (articleData.category_id) {
          loadRelatedArticles(articleData.category_id, articleData.id);
        }

        // 增加浏览量
        incrementViewCount(articleData.id);
      }
    } catch (error) {
      console.error('加載文章失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载相关文章
   */
  const loadRelatedArticles = async (categoryId: number, currentId: number) => {
    try {
      const res = await fetch(
        `/api/wiki/articles?category_id=${categoryId}&limit=6&is_published=true`
      );
      const data = await res.json();
      setRelatedArticles(
        (data.data || [])
          .filter((a: RelatedArticle) => a.id !== currentId)
          .slice(0, 5)
      );
    } catch (error) {
      console.error('加載相關文章失敗:', error);
    }
  };

  /**
   * 增加浏览量
   */
  const incrementViewCount = async (articleId: number) => {
    try {
      await fetch(`/api/wiki/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incrementView: true }),
      });
    } catch (error) {
      console.error('更新瀏覽量失敗:', error);
    }
  };

  /**
   * 分享文章
   */
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url,
        });
      } catch (error) {
        // 用户取消分享
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('鏈接已複製到剪貼板');
    }
  };

  /**
   * 渲染Markdown内容（简单处理）
   */
  const renderContent = (content: string) => {
    // 简单的Markdown渲染
    const html = content
      // 标题
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // 列表
      .replace(/^- (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // 段落
      .replace(/\n\n/g, '</p><p class="my-4 leading-relaxed">')
      // 换行
      .replace(/\n/g, '<br />');

    return `<div class="prose prose-sm max-w-none"><p class="my-4 leading-relaxed">${html}</p></div>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 animate-pulse" />
          <p className="mt-4 text-muted-foreground">載入中...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">文章不存在</h2>
          <p className="text-muted-foreground mb-6">該文章可能已被刪除或尚未發布</p>
          <Button asChild>
            <Link href="/wiki">返回百科首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 面包屑 */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">首頁</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/wiki" className="hover:text-foreground">玄門百科</Link>
          {article.category && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/wiki?category=${article.category.id}`}
                className="hover:text-foreground"
              >
                {article.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 文章内容 */}
          <article className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 md:p-8">
                {/* 标题区 */}
                <header className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {article.category && (
                      <Badge variant="outline">
                        {article.category.name}
                      </Badge>
                    )}
                    {article.is_featured && (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Star className="w-3 h-3 mr-1" />
                        推薦
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">
                    {article.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{article.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.view_count} 次閱讀
                    </span>
                  </div>
                </header>

                <Separator className="my-6" />

                {/* 摘要 */}
                {article.summary && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 text-muted-foreground italic">
                    {article.summary}
                  </div>
                )}

                {/* 正文 */}
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
                />

                {/* 标签 */}
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-2">標籤：</p>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </article>

          {/* 侧边栏 */}
          <aside className="space-y-6">
            {/* 相关文章 */}
            {relatedArticles.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    相關文章
                  </h3>
                  <div className="space-y-3">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        href={`/wiki/${related.slug}`}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <p className="text-sm font-medium line-clamp-2">
                          {related.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {related.view_count} 次閱讀
                        </p>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 返回列表 */}
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/wiki">
                    <BookOpen className="w-4 h-4 mr-2" />
                    查看更多文章
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
