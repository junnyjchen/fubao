/**
 * @fileoverview 百科首页
 * @description 玄门文化百科知识库
 */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { EmptyState, EmptyIcon } from '@/components/ui/empty-state';

interface BaikeArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  category: string;
  cover_image: string;
  view_count: number;
  created_at: string;
}

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: 'fuzhou', label: '符咒' },
  { key: 'faqi', label: '法器' },
  { key: 'fengshui', label: '风水' },
  { key: 'zhouyi', label: '周易' },
  { key: 'daojiao', label: '道教' },
  { key: 'fojiao', label: '佛教' },
];

export default function BaikePage() {
  const [articles, setArticles] = useState<BaikeArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchArticles();
  }, [category]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (keyword) params.set('keyword', keyword);
      params.set('limit', '20');
      const res = await fetch(`/api/articles?${params}`);
      const data = await res.json();
      setArticles(Array.isArray(data.data) ? data.data : []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold mb-3">玄門百科</h1>
          <p className="text-muted-foreground mb-8">探索玄門文化知識，了解符咒、法器、风水等傳統智慧</p>
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="搜索百科知識..."
              className="flex-1 px-4 py-2 rounded-lg border bg-background"
            />
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                category === cat.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            icon={<EmptyIcon type="data" />}
            title="暫無百科文章"
            description="敬請期待更多玄門文化知識内容"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <Link
                key={article.id}
                href={`/baike/${article.slug}`}
                className="group block rounded-lg border bg-card overflow-hidden hover:shadow-md transition-all"
              >
                {article.cover_image && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-primary">
                    閱讀更多 <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
