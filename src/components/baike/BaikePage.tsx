'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Calendar, ArrowRight } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string | null;
  cover: string | null;
  summary: string | null;
  category_id: number | null;
  views: number;
  published_at: string | null;
}

const categoryIcons = ['📜', '🗡️', '🪷', '📖', '🏛️'];

export function BaikePage() {
  const { t } = useI18n();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: '全部' },
    { id: '1', label: t.baike.categories.intro },
    { id: '2', label: t.baike.categories.fu },
    { id: '3', label: t.baike.categories.qi },
    { id: '4', label: t.baike.categories.knowledge },
    { id: '5', label: t.baike.categories.temples },
  ];

  useEffect(() => {
    async function fetchArticles() {
      try {
        const url = activeCategory === 'all' 
          ? '/api/articles?limit=20' 
          : `/api/articles?category_id=${activeCategory}&limit=20`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.data) setArticles(data.data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Page Header */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{t.baike.title}</h1>
            <p className="text-lg text-muted-foreground">{t.baike.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container mx-auto px-4 py-8 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(1).map((cat, index) => (
            <Card 
              key={cat.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeCategory === cat.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <span className="text-3xl mb-2">{categoryIcons[index]}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 py-8">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory}>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {t.common.loading}
              </div>
            ) : articles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link key={article.id} href={`/baike/${article.slug || article.id}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                      <div className="relative aspect-video bg-muted">
                        {article.cover ? (
                          <Image
                            src={article.cover}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="text-5xl text-primary/30">📖</span>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        {article.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </span>
                          {article.published_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.published_at).toLocaleDateString('zh-TW')}
                            </span>
                          )}
                        </div>
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
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
