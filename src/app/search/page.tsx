/**
 * @fileoverview 搜索结果页面
 * @description 全局搜索结果展示
 * @module app/search/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Package,
  FileText,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface GoodsResult {
  id: number;
  name: string;
  price: string;
  main_image: string | null;
  sales: number;
  type: number;
  purpose: string | null;
}

interface NewsResult {
  id: number;
  title: string;
  summary: string | null;
  cover_image: string | null;
  created_at: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  
  const [searchValue, setSearchValue] = useState(keyword);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    goods: GoodsResult[];
    news: NewsResult[];
    total: number;
  }>({
    goods: [],
    news: [],
    total: 0,
  });

  useEffect(() => {
    if (keyword) {
      doSearch(keyword);
    }
  }, [keyword]);

  const doSearch = async (kw: string) => {
    if (!kw.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(kw)}&limit=20`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(searchValue.trim())}`;
    }
  };

  const getTypeLabel = (type: number) => {
    const types: Record<number, string> = {
      1: '符箓',
      2: '法器',
      3: '開光物品',
      4: '書籍',
      5: '其他',
    };
    return types[type] || '其他';
  };

  const getPurposeLabel = (purpose: string | null) => {
    if (!purpose) return null;
    const purposes: Record<string, string> = {
      peace: '平安祈福',
      wealth: '招財進寶',
      health: '健康長壽',
      love: '姻緣和合',
      career: '事業順利',
      study: '學業進步',
      protection: '驅邪避凶',
    };
    return purposes[purpose] || purpose;
  };

  const filteredGoods = results.goods;
  const filteredNews = results.news;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder="搜索商品、資訊..."
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : keyword && results.total === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">未找到相關結果</h2>
            <p className="text-muted-foreground">
              沒有找到與「{keyword}」相關的內容
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              試試其他關鍵詞或瀏覽分類
            </p>
          </div>
        ) : !keyword ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">輸入關鍵詞開始搜索</h2>
            <p className="text-muted-foreground">
              搜索商品、資訊等內容
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground mb-4">
              找到 {results.total} 個與「{keyword}」相關的結果
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  全部 ({results.total})
                </TabsTrigger>
                <TabsTrigger value="goods">
                  <Package className="w-4 h-4 mr-1" />
                  商品 ({results.goods.length})
                </TabsTrigger>
                <TabsTrigger value="news">
                  <FileText className="w-4 h-4 mr-1" />
                  資訊 ({results.news.length})
                </TabsTrigger>
              </TabsList>

              {/* 全部结果 */}
              <TabsContent value="all" className="space-y-6">
                {filteredGoods.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      商品
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredGoods.slice(0, 4).map(item => (
                        <Link key={item.id} href={`/goods/${item.id}`}>
                          <Card className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="aspect-square bg-muted">
                              {item.main_image ? (
                                <img
                                  src={item.main_image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Package className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <p className="font-medium truncate text-sm">{item.name}</p>
                              <p className="text-primary font-semibold mt-1">HK${item.price}</p>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    {filteredGoods.length > 4 && (
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setActiveTab('goods')}
                      >
                        查看全部 {filteredGoods.length} 個商品
                      </Button>
                    )}
                  </div>
                )}

                {filteredNews.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      資訊
                    </h3>
                    <div className="space-y-4">
                      {filteredNews.slice(0, 3).map(item => (
                        <Link key={item.id} href={`/news/${item.id}`}>
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 flex gap-4">
                              {item.cover_image && (
                                <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.cover_image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium line-clamp-1">{item.title}</h4>
                                {item.summary && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {item.summary}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                    {filteredNews.length > 3 && (
                      <Button
                        variant="link"
                        className="mt-2"
                        onClick={() => setActiveTab('news')}
                      >
                        查看全部 {filteredNews.length} 篇資訊
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* 商品结果 */}
              <TabsContent value="goods">
                {filteredGoods.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暫無相關商品
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredGoods.map(item => (
                      <Link key={item.id} href={`/goods/${item.id}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-muted relative">
                            {item.main_image ? (
                              <img
                                src={item.main_image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Package className="w-12 h-12" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <p className="font-medium truncate text-sm">{item.name}</p>
                            {item.purpose && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {getPurposeLabel(item.purpose)}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-primary font-semibold">HK${item.price}</p>
                              <p className="text-xs text-muted-foreground">
                                銷量 {item.sales}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 资讯结果 */}
              <TabsContent value="news">
                {filteredNews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暫無相關資訊
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredNews.map(item => (
                      <Link key={item.id} href={`/news/${item.id}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex gap-4">
                            {item.cover_image && (
                              <div className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={item.cover_image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium line-clamp-1">{item.title}</h4>
                              {item.summary && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {item.summary}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(item.created_at).toLocaleDateString('zh-TW')}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
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
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
