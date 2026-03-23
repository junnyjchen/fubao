'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, ArrowLeft, ChevronRight, Share2 } from 'lucide-react';

interface RelatedNews {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  type: number;
  views: number;
}

interface NewsDetail {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  content: string | null;
  type: number;
  source: string | null;
  views: number;
  published_at: string | null;
  relatedNews: RelatedNews[];
}

const typeLabels = ['全球新聞', '行業資訊', '平台活動', '用戶互動'];

export function NewsDetailPage() {
  const params = useParams();
  const { t } = useI18n();
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/news/${params.slug}`);
        const data = await res.json();
        if (data.data) {
          setNews(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.slug) {
      fetchNews();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">新聞不存在</p>
        <Button className="mt-4" asChild>
          <Link href="/news">返回動態</Link>
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
          <Link href="/news" className="hover:text-foreground">{t.nav.news}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground line-clamp-1">{news.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Cover */}
                {news.cover && (
                  <div className="relative aspect-video rounded-t-lg overflow-hidden">
                    <Image src={news.cover} alt={news.title} fill className="object-cover" />
                  </div>
                )}

                {/* Header */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge>{typeLabels[news.type - 1]}</Badge>
                    {news.source && (
                      <span className="text-sm text-muted-foreground">{news.source}</span>
                    )}
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl font-bold mb-4">{news.title}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {news.views}
                    </span>
                    {news.published_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(news.published_at).toLocaleDateString('zh-TW')}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-6">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>
                  </div>

                  <div className="h-px bg-border" />
                </div>

                {/* Content */}
                <div className="px-6 pb-8">
                  {news.summary && (
                    <p className="text-lg text-muted-foreground mb-6 italic">
                      {news.summary}
                    </p>
                  )}
                  
                  {news.content ? (
                    <div className="prose prose-sm max-w-none whitespace-pre-line">
                      {news.content}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">暫無內容</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/news">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回新聞列表
              </Link>
            </Button>

            {news.relatedNews.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">相關新聞</h3>
                  <div className="space-y-3">
                    {news.relatedNews.map((related) => (
                      <Link
                        key={related.id}
                        href={`/news/${related.slug || related.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                            {related.cover ? (
                              <Image src={related.cover} alt="" fill className="object-cover" />
                            ) : (
                              <div className="flex items-center justify-center w-full h-full bg-primary/10">
                                <span className="text-lg text-primary/30">玄</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
