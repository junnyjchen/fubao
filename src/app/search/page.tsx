/**
 * @fileoverview 搜索结果页面
 * @description 全站搜索功能
 * @module app/search/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightText } from '@/components/search/HighlightText';
import {
  Search,
  Package,
  BookOpen,
  Video,
  Store,
  ChevronRight,
  Eye,
  ThumbsUp,
  Shield,
  Loader2,
  X,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

interface SearchResult {
  goods: Array<{
    id: number;
    name: string;
    price: number;
    original_price?: number;
    image: string;
    merchant_name: string;
    sales: number;
    has_cert: boolean;
  }>;
  wiki: Array<{
    id: number;
    title: string;
    slug: string;
    summary: string;
    cover_image?: string;
    category_name: string;
    views: number;
  }>;
  videos: Array<{
    id: number;
    title: string;
    cover_image: string;
    duration: number;
    author: string;
    views: number;
    is_free: boolean;
  }>;
  merchants: Array<{
    id: number;
    name: string;
    logo?: string;
    type: number;
    rating: number;
    total_sales: number;
    verified: boolean;
  }>;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('q') || '';
  
  const [keyword, setKeyword] = useState(keywordParam);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [counts, setCounts] = useState({ goods: 0, wiki: 0, videos: 0, merchants: 0 });
  const pageSize = 20;

  useEffect(() => {
    if (keywordParam) {
      search();
    }
  }, [keywordParam, currentPage, activeTab]);

  const search = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    try {
      const type = activeTab === 'all' ? 'all' : activeTab;
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}&type=${type}&page=${currentPage}&limit=${pageSize}`);
      const data = await res.json();
      setResults(data.data || { goods: [], wiki: [], videos: [], merchants: [] });
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, total_pages: 0 });
      setCounts(data.counts || { goods: 0, wiki: 0, videos: 0, merchants: 0 });
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // 更新URL
    const url = new URL(window.location.href);
    url.searchParams.set('q', keyword);
    window.history.pushState({}, '', url);
    search();
  };

  const clearSearch = () => {
    setKeyword('');
    setResults(null);
  };

  // Tab切换时重置页码
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // 根据当前Tab计算总数
  const totalCount = activeTab === 'all' 
    ? (results ? results.goods.length + results.wiki.length + results.videos.length + results.merchants.length : 0)
    : counts[activeTab as keyof typeof counts] || 0;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 热门搜索
  const hotKeywords = [
    '平安符', '桃木劍', '開光', '符咒入門', '道教文化',
    '八卦鏡', '風水', '法器', '道家養生', '經典誦讀',
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 搜索栏 */}
      <header className="bg-background border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索商品、百科、視頻..."
                className="pl-10 pr-10 h-12"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="lg">搜索</Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!results && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">搜索您需要的內容</h2>
            <p className="text-muted-foreground mb-6">輸入關鍵詞搜索商品、百科文章、視頻課程等</p>
            
            <div className="text-left max-w-md mx-auto">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">熱門搜索</h3>
              <div className="flex flex-wrap gap-2">
                {hotKeywords.map((kw) => (
                  <Badge
                    key={kw}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setKeyword(kw);
                      // 自动触发搜索
                      setTimeout(() => {
                        const url = new URL(window.location.href);
                        url.searchParams.set('q', kw);
                        window.history.pushState({}, '', url);
                        search();
                      }, 0);
                    }}
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {results && !loading && (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                找到 <span className="font-semibold text-foreground">{totalCount}</span> 個與「
                <span className="font-semibold text-foreground">{keyword}</span>」相關的結果
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  全部 ({totalCount})
                </TabsTrigger>
                <TabsTrigger value="goods">
                  <Package className="w-4 h-4 mr-1" />
                  商品 ({results.goods.length})
                </TabsTrigger>
                <TabsTrigger value="wiki">
                  <BookOpen className="w-4 h-4 mr-1" />
                  百科 ({results.wiki.length})
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <Video className="w-4 h-4 mr-1" />
                  視頻 ({results.videos.length})
                </TabsTrigger>
                <TabsTrigger value="merchants">
                  <Store className="w-4 h-4 mr-1" />
                  商戶 ({results.merchants.length})
                </TabsTrigger>
              </TabsList>

              {/* 全部结果 */}
              <TabsContent value="all" className="space-y-6">
                {results.goods.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        商品
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('goods')}>
                        查看全部
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {results.goods.slice(0, 4).map((item) => (
                        <Link key={item.id} href={`/shop/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-muted relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              {item.has_cert && (
                                <Badge className="absolute top-2 left-2 bg-green-600">
                                  <Shield className="w-3 h-3 mr-1" />
                                  認證
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="text-sm font-medium line-clamp-2">
                                <HighlightText text={item.name} keyword={keyword} />
                              </h3>
                              <p className="text-primary font-bold mt-1">HK${item.price}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.wiki.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        百科文章
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('wiki')}>
                        查看全部
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {results.wiki.slice(0, 3).map((item) => (
                        <Link key={item.id} href={`/wiki/${item.slug}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex gap-4">
                              {item.cover_image && (
                                <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium line-clamp-1">
                                  <HighlightText text={item.title} keyword={keyword} />
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                  <Badge variant="outline">{item.category_name}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {item.views}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.videos.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        視頻課程
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('videos')}>
                        查看全部
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {results.videos.slice(0, 3).map((item) => (
                        <Link key={item.id} href={`/videos/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted relative">
                              <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                {formatDuration(item.duration)}
                              </div>
                              {item.is_free && (
                                <Badge className="absolute top-2 left-2 bg-green-500">免費</Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="text-sm font-medium line-clamp-2">
                                <HighlightText text={item.title} keyword={keyword} />
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">講師：{item.author}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.merchants.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold flex items-center gap-2">
                        <Store className="w-4 h-4" />
                        商戶
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('merchants')}>
                        查看全部
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.merchants.slice(0, 2).map((item) => (
                        <Link key={item.id} href={`/merchant/${item.id}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
                                {item.logo ? (
                                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  '符'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium">{item.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-yellow-600">⭐ {item.rating}</span>
                                  <span className="text-sm text-muted-foreground">
                                    銷量 {item.total_sales}
                                  </span>
                                </div>
                              </div>
                              {item.verified && (
                                <Badge className="bg-green-600">認證</Badge>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* 商品结果 */}
              <TabsContent value="goods">
                {results.goods.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暫無相關商品
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {results.goods.map((item) => (
                        <Link key={item.id} href={`/shop/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-muted relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              {item.has_cert && (
                                <Badge className="absolute top-2 left-2 bg-green-600">
                                  <Shield className="w-3 h-3 mr-1" />認證
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="text-sm font-medium line-clamp-2">
                                <HighlightText text={item.name} keyword={keyword} />
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">{item.merchant_name}</p>
                              <div className="flex items-end justify-between mt-2">
                                <p className="text-primary font-bold">HK${item.price}</p>
                                <p className="text-xs text-muted-foreground">已售 {item.sales}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.total_pages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </TabsContent>

              {/* 百科结果 */}
              <TabsContent value="wiki">
                {results.wiki.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暫無相關百科文章
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {results.wiki.map((item) => (
                        <Link key={item.id} href={`/wiki/${item.slug}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex gap-4">
                              {item.cover_image && (
                                <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <Badge variant="outline" className="mb-2">{item.category_name}</Badge>
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3 h-3" />
                                    {item.views}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.total_pages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </TabsContent>

              {/* 视频结果 */}
              <TabsContent value="videos">
                {results.videos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暫無相關視頻
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      {results.videos.map((item) => (
                        <Link key={item.id} href={`/videos/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted relative">
                              <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                {formatDuration(item.duration)}
                              </div>
                              {item.is_free && (
                                <Badge className="absolute top-2 left-2 bg-green-500">免費</Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="font-medium line-clamp-2">{item.title}</h3>
                              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                <span>講師：{item.author}</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {item.views}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.total_pages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </TabsContent>

              {/* 商户结果 */}
              <TabsContent value="merchants">
                {results.merchants.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    暫無相關商戶
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.merchants.map((item) => (
                        <Link key={item.id} href={`/merchant/${item.id}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-4 flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
                                {item.logo ? (
                                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  '符'
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{item.name}</h3>
                                  {item.verified && (
                                    <Badge className="bg-green-600">認證</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="text-yellow-600">⭐ {item.rating}</span>
                                  <span>銷量 {item.total_sales}</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.total_pages}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
