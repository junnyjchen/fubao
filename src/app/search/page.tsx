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
  ChevronLeft,
  Eye,
  ThumbsUp,
  Shield,
  X,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { SearchSkeleton } from '@/components/common/PageSkeletons';
import { useI18n } from '@/lib/i18n';

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
  const { t, isRTL } = useI18n();
  const sp = t.searchPage;
  
  const keywordParam = searchParams.get('q') || '';
  
  const [keyword, setKeyword] = useState(keywordParam);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 0 });
  const [counts, setCounts] = useState({ goods: 0, wiki: 0, videos: 0, merchants: 0 });
  const pageSize = 20;

  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

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
      console.error('Search failed:', error);
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

  // 热门搜索 - 使用翻译中的关键词
  const hotKeywords = [
    t.categories.fu, t.categories.qi, t.home.features.certificate, t.baike.categories.intro, t.nav.about,
    '八卦鏡', t.home.features.wiki, t.shop.filter.practice, '道家養生', '經典誦讀',
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 搜索栏 */}
      <header className="bg-background border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex-1 relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={sp.placeholder}
                className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} h-12`}
              />
              {keyword && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${isRTL ? 'left-3' : 'right-3'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="lg">{sp.searchButton}</Button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!results && !loading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{sp.emptyTitle}</h2>
            <p className="text-muted-foreground mb-6">{sp.emptyDesc}</p>
            
            <div className={`max-w-md mx-auto ${isRTL ? 'text-end' : 'text-left'}`}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{sp.hotSearch}</h3>
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

        {loading && <SearchSkeleton />}

        {results && !loading && (
          <>
            <div className="mb-6">
              <p className={`text-muted-foreground ${isRTL ? 'text-end' : ''}`}>
                {sp.resultCount.replace('{count}', String(totalCount)).replace('{keyword}', keyword)}
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  {sp.tabs.all} ({totalCount})
                </TabsTrigger>
                <TabsTrigger value="goods">
                  <Package className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {sp.tabs.goods} ({results.goods.length})
                </TabsTrigger>
                <TabsTrigger value="wiki">
                  <BookOpen className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {sp.tabs.wiki} ({results.wiki.length})
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <Video className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {sp.tabs.videos} ({results.videos.length})
                </TabsTrigger>
                <TabsTrigger value="merchants">
                  <Store className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {sp.tabs.merchants} ({results.merchants.length})
                </TabsTrigger>
              </TabsList>

              {/* 全部结果 */}
              <TabsContent value="all" className="space-y-6">
                {results.goods.length > 0 && (
                  <section>
                    <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h2 className={`font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Package className="w-4 h-4" />
                        {sp.sections.goods}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('goods')}>
                        {sp.viewAll}
                        <NextIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {results.goods.slice(0, 4).map((item) => (
                        <Link key={item.id} href={`/shop/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-square bg-muted relative">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              {item.has_cert && (
                                <Badge className={`absolute top-2 bg-green-600 ${isRTL ? 'right-2' : 'left-2'}`}>
                                  <Shield className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                  {sp.badge.certified}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className={`text-sm font-medium line-clamp-2 ${isRTL ? 'text-end' : ''}`}>
                                <HighlightText text={item.name} keyword={keyword} />
                              </h3>
                              <p className={`text-primary font-bold mt-1 ${isRTL ? 'text-end' : ''}`}>HK${item.price}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.wiki.length > 0 && (
                  <section>
                    <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h2 className={`font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <BookOpen className="w-4 h-4" />
                        {sp.sections.wiki}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('wiki')}>
                        {sp.viewAll}
                        <NextIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {results.wiki.slice(0, 3).map((item) => (
                        <Link key={item.id} href={`/wiki/${item.slug}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className={`p-4 flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {item.cover_image && (
                                <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : ''}`}>
                                <h3 className="font-medium line-clamp-1">
                                  <HighlightText text={item.title} keyword={keyword} />
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                                <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                  <Badge variant="outline">{item.category_name}</Badge>
                                  <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                    <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h2 className={`font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Video className="w-4 h-4" />
                        {sp.sections.videos}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('videos')}>
                        {sp.viewAll}
                        <NextIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      {results.videos.slice(0, 3).map((item) => (
                        <Link key={item.id} href={`/videos/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted relative">
                              <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                              <div className={`absolute bottom-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded ${isRTL ? 'left-2' : 'right-2'}`}>
                                {formatDuration(item.duration)}
                              </div>
                              {item.is_free && (
                                <Badge className={`absolute top-2 bg-green-500 ${isRTL ? 'right-2' : 'left-2'}`}>{sp.badge.free}</Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className="text-sm font-medium line-clamp-2">
                                <HighlightText text={item.title} keyword={keyword} />
                              </h3>
                              <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-end' : ''}`}>{sp.info.instructor}：{item.author}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {results.merchants.length > 0 && (
                  <section>
                    <div className={`flex items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <h2 className={`font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Store className="w-4 h-4" />
                        {sp.sections.merchants}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => handleTabChange('merchants')}>
                        {sp.viewAll}
                        <NextIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.merchants.slice(0, 2).map((item) => (
                        <Link key={item.id} href={`/merchant/${item.id}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className={`p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
                                {item.logo ? (
                                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  '符'
                                )}
                              </div>
                              <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : ''}`}>
                                <h3 className="font-medium">{item.name}</h3>
                                <div className={`flex items-center gap-2 mt-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                  <span className="text-sm text-yellow-600">⭐ {item.rating}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {sp.info.sales} {item.total_sales}
                                  </span>
                                </div>
                              </div>
                              {item.verified && (
                                <Badge className="bg-green-600">{sp.badge.certified}</Badge>
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
                    {sp.empty.goods}
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
                                <Badge className={`absolute top-2 bg-green-600 ${isRTL ? 'right-2' : 'left-2'}`}>
                                  <Shield className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{sp.badge.certified}
                                </Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className={`text-sm font-medium line-clamp-2 ${isRTL ? 'text-end' : ''}`}>
                                <HighlightText text={item.name} keyword={keyword} />
                              </h3>
                              <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-end' : ''}`}>{item.merchant_name}</p>
                              <div className={`flex items-end justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <p className="text-primary font-bold">HK${item.price}</p>
                                <p className="text-xs text-muted-foreground">{sp.info.sold} {item.sales}</p>
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
                    {sp.empty.wiki}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {results.wiki.map((item) => (
                        <Link key={item.id} href={`/wiki/${item.slug}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className={`p-4 flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              {item.cover_image && (
                                <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : ''}`}>
                                <Badge variant="outline" className="mb-2">{item.category_name}</Badge>
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.summary}</p>
                                <div className={`flex items-center gap-4 mt-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                  <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                    {sp.empty.videos}
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      {results.videos.map((item) => (
                        <Link key={item.id} href={`/videos/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-muted relative">
                              <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                              <div className={`absolute bottom-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded ${isRTL ? 'left-2' : 'right-2'}`}>
                                {formatDuration(item.duration)}
                              </div>
                              {item.is_free && (
                                <Badge className={`absolute top-2 bg-green-500 ${isRTL ? 'right-2' : 'left-2'}`}>{sp.badge.free}</Badge>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <h3 className={`font-medium line-clamp-2 ${isRTL ? 'text-end' : ''}`}>{item.title}</h3>
                              <div className={`flex items-center justify-between mt-2 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span>{sp.info.instructor}：{item.author}</span>
                                <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                    {sp.empty.merchants}
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      {results.merchants.map((item) => (
                        <Link key={item.id} href={`/merchant/${item.id}`}>
                          <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className={`p-4 flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl">
                                {item.logo ? (
                                  <img src={item.logo} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  '符'
                                )}
                              </div>
                              <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : ''}`}>
                                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                  <h3 className="font-medium">{item.name}</h3>
                                  {item.verified && (
                                    <Badge className="bg-green-600">{sp.badge.certified}</Badge>
                                  )}
                                </div>
                                <div className={`flex items-center gap-4 mt-2 text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                                  <span className="text-yellow-600">⭐ {item.rating}</span>
                                  <span>{sp.info.sales} {item.total_sales}</span>
                                </div>
                              </div>
                              <NextIcon className="w-5 h-5 text-muted-foreground" />
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
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
