/**
 * @fileoverview 百科首页组件
 * @description 展示百科分类和文章列表
 * @module components/wiki/WikiHomePage
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Search,
  ChevronRight,
  Clock,
  Eye,
  TrendingUp,
  Star,
} from 'lucide-react';

/** 百科分类类型 */
interface WikiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  article_count?: number;
}

/** 百科文章类型 */
interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  cover_image: string | null;
  author: string;
  view_count: number;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

/**
 * 百科首页组件
 * @returns 百科首页
 */
export function WikiHomePage() {
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, articlesRes, featuredRes] = await Promise.all([
        fetch('/api/wiki/categories'),
        fetch('/api/wiki/articles?limit=12&is_published=true'),
        fetch('/api/wiki/articles?limit=5&is_published=true&is_featured=true'),
      ]);

      const [catData, articlesData, featuredData] = await Promise.all([
        catRes.json(),
        articlesRes.json(),
        featuredRes.json(),
      ]);

      setCategories(catData.data || []);
      setArticles(articlesData.data || []);
      setFeaturedArticles(featuredData.data || []);
    } catch (error) {
      console.error('加載數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 筛选文章
   */
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchTerm ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || article.category?.id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/90 to-primary text-primary-foreground py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              玄門百科
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              探索玄門文化知識寶庫，了解符籙、法器、道教文化的深厚內涵
            </p>
          </div>

          {/* 搜索框 */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="搜索百科文章..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-background text-foreground"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            載入中...
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* 侧边栏 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 分类列表 */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    百科分類
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1 px-3 pb-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === null
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      全部分類
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCategory === category.id
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span>{category.name}</span>
                        {category.article_count !== undefined && (
                          <span className="text-xs text-muted-foreground">
                            {category.article_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* 热门文章 */}
              {featuredArticles.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500" />
                      推薦閱讀
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {featuredArticles.map((article) => (
                        <Link
                          key={article.id}
                          href={`/wiki/${article.slug}`}
                          className="block px-4 py-3 hover:bg-muted/50 transition-colors"
                        >
                          <p className="text-sm font-medium line-clamp-2">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {article.view_count} 次閱讀
                          </p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 主内容区 */}
            <div className="lg:col-span-3">
              {/* 当前分类标题 */}
              {selectedCategory && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {categories.find((c) => c.id === selectedCategory)?.description}
                  </p>
                </div>
              )}

              {/* 文章列表 */}
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">暫無文章</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? '未找到相關文章' : '該分類下暫無文章'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredArticles.map((article) => (
                    <Link key={article.id} href={`/wiki/${article.slug}`}>
                      <Card className="h-full hover:shadow-md transition-shadow group">
                        {article.cover_image && (
                          <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              封面圖片
                            </div>
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            {article.category && (
                              <Badge variant="outline" className="text-xs">
                                {article.category.name}
                              </Badge>
                            )}
                            {article.is_featured && (
                              <Badge className="bg-amber-100 text-amber-700 text-xs">
                                推薦
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          {article.summary && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {article.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.view_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(article.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}

              {/* 标签云 */}
              {articles.length > 0 && (
                <Card className="mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      熱門標籤
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(articles.flatMap((a) => a.tags || [])))
                        .slice(0, 20)
                        .map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
