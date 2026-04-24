/**
 * @fileoverview 百科列表页面
 * @description 玄门文化百科知识库
 * @module app/wiki/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Search,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { WikiSkeleton } from '@/components/common/PageSkeletons';
import { useI18n } from '@/lib/i18n';

interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_image?: string;
  category_id: number;
  category_name: string;
  author?: string;
  views: number;
  likes: number;
  is_featured: boolean;
  tags?: string[];
  created_at: string;
}

interface WikiCategory {
  id: number;
  name: string;
  description?: string;
  article_count: number;
  icon?: string;
}

export default function WikiPage() {
  const { t, isRTL } = useI18n();
  const wiki = t.wikiPage;
  
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [categories, setCategories] = useState<WikiCategory[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    loadData();
  }, [selectedCategory, sortBy, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载分类和文章
      const [catRes, articlesRes] = await Promise.all([
        fetch('/api/wiki/categories'),
        fetch(`/api/wiki/articles?${buildParams()}`),
      ]);

      const catData = await catRes.json();
      const articlesData = await articlesRes.json();

      setCategories(catData.data || []);
      setArticles(articlesData.data || []);
      setFeaturedArticles(articlesData.data?.filter((a: WikiArticle) => a.is_featured).slice(0, 3) || []);
      setTotalItems(articlesData.total || 0);
      setTotalPages(articlesData.total_pages || 0);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildParams = () => {
    const params = new URLSearchParams();
    params.set('limit', pageSize.toString());
    params.set('offset', ((currentPage - 1) * pageSize).toString());
    if (keyword) params.set('keyword', keyword);
    if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
    if (sortBy) params.set('sort', sortBy);
    return params.toString();
  };

  const handleSearch = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{wiki.title}</h1>
          <p className="text-lg opacity-80 mb-8">
            {wiki.subtitle}
          </p>
          
          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto relative">
            <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={wiki.searchPlaceholder}
              className={`${isRTL ? 'pr-12' : 'pl-12'} h-12 bg-primary-foreground text-foreground`}
            />
            <Button className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2`} onClick={handleSearch}>
              {wiki.search}
            </Button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 热门标签 */}
        <section className="mb-8">
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold">{wiki.hotTags}</h2>
          </div>
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
            {wiki.hotTagsList.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  setKeyword(tag);
                  handleSearch();
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <div className={`grid lg:grid-cols-4 gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
          {/* 左侧分类 */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{wiki.categories}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <Link
                    href="/wiki"
                    className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
                      selectedCategory === 'all' ? 'bg-primary/5 text-primary' : ''
                    }`}
                    onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                  >
                    <span>{wiki.allArticles}</span>
                    <Badge variant="secondary">
                      {categories.reduce((sum, c) => sum + c.article_count, 0)}
                    </Badge>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/wiki?category=${cat.id}`}
                      className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors ${
                        selectedCategory === cat.id.toString() ? 'bg-primary/5 text-primary' : ''
                      }`}
                      onClick={() => { setSelectedCategory(cat.id.toString()); setCurrentPage(1); }}
                    >
                      <span>{cat.name}</span>
                      <Badge variant="secondary">{cat.article_count}</Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* 右侧内容 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 精选文章 */}
            {featuredArticles.length > 0 && (
              <section>
                <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-lg">{wiki.featured}</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {featuredArticles.map((article) => (
                    <Link key={article.id} href={`/wiki/${article.slug}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                        {article.cover_image && (
                          <div className="aspect-video bg-muted overflow-hidden">
                            <img
                              src={article.cover_image}
                              alt={article.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2">{article.category_name}</Badge>
                          <h3 className="font-medium line-clamp-2">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className={`flex items-center gap-4 mt-3 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {article.views} {wiki.info.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {article.likes} {wiki.info.likes}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 文章列表 */}
            <section>
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className="font-semibold text-lg">{wiki.articleList}</h2>
                <Select value={sortBy} onValueChange={(value) => { setSortBy(value); setCurrentPage(1); }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{wiki.sort.newest}</SelectItem>
                    <SelectItem value="popular">{wiki.sort.popular}</SelectItem>
                    <SelectItem value="likes">{wiki.sort.likes}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <WikiSkeleton />
              ) : articles.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{wiki.noArticles}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <Link key={article.id} href={`/wiki/${article.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <div className={`flex flex-col md:flex-row ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                          {article.cover_image && (
                            <div className="md:w-48 h-32 md:h-auto bg-muted flex-shrink-0 overflow-hidden">
                              <img
                                src={article.cover_image}
                                alt={article.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <CardContent className="flex-1 p-4">
                            <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <Badge variant="outline">{article.category_name}</Badge>
                              {article.is_featured && (
                                <Badge className="bg-orange-500">{wiki.featuredBadge}</Badge>
                              )}
                            </div>
                            <h3 className="font-medium text-lg mb-2">{article.title}</h3>
                            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                              {article.summary}
                            </p>
                            <div className={`flex items-center justify-between text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(article.created_at).toLocaleDateString('zh-TW')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {article.likes}
                                </span>
                              </div>
                              <span className={`flex items-center text-primary ${isRTL ? 'flex-row-reverse' : ''}`}>
                                {t.common.readMore}
                                <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                              </span>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  ))}
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
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
