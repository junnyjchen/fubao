'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, ArrowLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';

interface RelatedArticle {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  views: number;
}

interface ArticleDetail {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  content: string | null;
  category_id: number | null;
  author: string | null;
  views: number;
  likes: number;
  published_at: string | null;
  relatedArticles: RelatedArticle[];
}

export function ArticleDetailPage() {
  const params = useParams();
  const { t } = useI18n();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/articles/${params.slug}`);
        const data = await res.json();
        if (data.data) {
          setArticle(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchArticle();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">文章不存在</p>
        <Button className="mt-4" asChild>
          <Link href="/baike">返回百科</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">首頁</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/baike" className="hover:text-foreground">{t.nav.baike}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Cover */}
                {article.cover && (
                  <div className="relative aspect-video rounded-t-lg overflow-hidden">
                    <Image src={article.cover} alt={article.title} fill className="object-cover" />
                  </div>
                )}

                {/* Header */}
                <div className="p-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    {article.author && (
                      <span>作者：{article.author}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.views}
                    </span>
                    {article.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.published_at).toLocaleDateString('zh-TW')}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mb-6">
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      {article.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>
                  </div>

                  <div className="h-px bg-border" />
                </div>

                {/* Content */}
                <div className="px-6 pb-8">
                  {article.summary && (
                    <p className="text-lg text-muted-foreground mb-6 italic">
                      {article.summary}
                    </p>
                  )}
                  
                  {article.content ? (
                    <RichTextRenderer content={article.content} className="text-base leading-relaxed" />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暫無內容</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Back Button */}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/baike">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回百科列表
              </Link>
            </Button>

            {/* Related Articles */}
            {article.relatedArticles.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">相關文章</h3>
                  <div className="space-y-3">
                    {article.relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        href={`/baike/${related.slug || related.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                            {related.cover ? (
                              <Image src={related.cover} alt="" fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-primary/10">
                                <span className="text-lg text-primary/30">文</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm line-clamp-2 group-hover:text-primary transition-colors">
                              {related.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {related.views} 閱讀
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">文章分類</h3>
                <div className="flex flex-wrap gap-2">
                  <Link href="/baike?category=1">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      符箓入門
                    </Badge>
                  </Link>
                  <Link href="/baike?category=2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      符箓圖鑑
                    </Badge>
                  </Link>
                  <Link href="/baike?category=3">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      法器圖鑑
                    </Badge>
                  </Link>
                  <Link href="/baike?category=4">
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                      玄門常識
                    </Badge>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
