'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/Pagination';
import { Eye, Calendar, ArrowRight } from 'lucide-react';

interface News {
  id: number;
  title: string;
  slug: string | null;
  cover_image: string | null;
  summary: string | null;
  type: number;
  views: number;
  published_at: string | null;
}

export function NewsPage() {
  const { t } = useI18n();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  const typeOptions = [
    { id: 'all', label: '全部' },
    { id: '1', label: t.news.categories.global },
    { id: '2', label: t.news.categories.industry },
    { id: '3', label: t.news.categories.activity },
    { id: '4', label: t.news.categories.interaction },
  ];

  const typeLabels = [t.news.categories.global, t.news.categories.industry, t.news.categories.activity, t.news.categories.interaction];

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', pageSize.toString());
        
        if (activeType !== 'all') {
          params.append('type', activeType);
        }
        
        const res = await fetch(`/api/news?${params.toString()}`);
        const data = await res.json();
        if (data.data) {
          setNews(data.data);
          setTotalItems(data.total || 0);
          setTotalPages(data.total_pages || Math.ceil((data.total || 0) / pageSize));
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [activeType, currentPage]);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.news.title}</h1>
          <p className="text-lg text-muted-foreground">全球玄門最新資訊與活動</p>
        </div>
      </section>

      {/* News List */}
      <section className="container mx-auto px-4 py-8">
        <Tabs value={activeType} onValueChange={(value) => { setActiveType(value); setCurrentPage(1); }}>
          <TabsList className="mb-6">
            {typeOptions.map((opt) => (
              <TabsTrigger key={opt.id} value={opt.id}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeType}>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {t.common.loading}
              </div>
            ) : news.length > 0 ? (
              <div className="space-y-4">
                {news.map((item) => (
                  <Link key={item.id} href={`/news/${item.slug || item.id}`}>
                    <Card className="group flex flex-col md:flex-row gap-4 p-4 hover:shadow-md transition-all duration-300">
                      <div className="relative w-full md:w-48 h-48 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {item.cover_image ? (
                          <Image
                            src={item.cover_image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-4xl text-primary/30">玄</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="flex-1 p-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {typeLabels[item.type - 1] || '資訊'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.views}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {item.summary}
                          </p>
                        )}
                        {item.published_at && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.published_at).toLocaleDateString('zh-TW')}
                          </span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {t.common.noData}
              </div>
            )}
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showTotal
                  total={totalItems}
                  pageSize={pageSize}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
