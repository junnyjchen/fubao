'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Package,
  ShoppingCart,
  Heart,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface SearchResult {
  id: number;
  type: 'goods' | 'article';
  name: string;
  subtitle?: string;
  price?: string;
  image?: string;
  sales?: number;
  views?: number;
  category?: string;
  merchant_name?: string;
  is_certified?: boolean;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState(keyword);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'goods' | 'article'>('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (keyword) {
      handleSearch();
    }
  }, [keyword, searchType, sortBy, currentPage]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        keyword: searchQuery.trim(),
        type: searchType,
        sort: sortBy,
        page: currentPage.toString(),
        limit: '12',
      });

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (data.results) {
        setResults(data.results);
        setTotalResults(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToCart = async (goodsId: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goodsId, quantity: 1 }),
      });

      const data = await res.json();
      if (data.message) {
        alert('已加入購物車');
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
    }
  };

  const formatPrice = (price?: string) => {
    if (!price) return '';
    return `HK$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Search Header */}
      <section className="bg-background border-b py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">首頁</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">搜索結果</span>
          </nav>

          {/* Search Box */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.common.search}
                className="pl-12 h-12"
              />
            </div>
            <Button className="h-12 px-8" onClick={handleSearch}>
              搜索
            </Button>
          </div>

          {/* Search Info */}
          {keyword && (
            <p className="text-muted-foreground">
              搜索「<span className="text-foreground font-medium">{keyword}</span>」
              {totalResults > 0 && (
                <span className="ml-2">找到 {totalResults} 個結果</span>
              )}
            </p>
          )}
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">篩選：</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={searchType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSearchType('all'); setCurrentPage(1); }}
            >
              全部
            </Button>
            <Button
              variant={searchType === 'goods' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSearchType('goods'); setCurrentPage(1); }}
            >
              <Package className="w-4 h-4 mr-1" />
              商品
            </Button>
            <Button
              variant={searchType === 'article' ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setSearchType('article'); setCurrentPage(1); }}
            >
              <FileText className="w-4 h-4 mr-1" />
              文章
            </Button>
          </div>

          <div className="ml-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">相關度</SelectItem>
                <SelectItem value="sales">銷量</SelectItem>
                <SelectItem value="price_asc">價格升序</SelectItem>
                <SelectItem value="price_desc">價格降序</SelectItem>
                <SelectItem value="newest">最新發布</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            搜索中...
          </div>
        ) : results.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">未找到相關結果</h2>
              <p className="text-muted-foreground mb-6">
                嘗試使用其他關鍵詞或調整篩選條件
              </p>
              <Button variant="outline" asChild>
                <Link href="/shop">瀏覽全部商品</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Goods Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {results.map((item) => (
                <Card key={`${item.type}-${item.id}`} className="group overflow-hidden">
                  <Link href={item.type === 'goods' ? `/shop/${item.id}` : `/baike/${item.id}`}>
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === 'goods' ? (
                            <Package className="w-12 h-12 text-muted-foreground/50" />
                          ) : (
                            <FileText className="w-12 h-12 text-muted-foreground/50" />
                          )}
                        </div>
                      )}
                      {item.is_certified && (
                        <Badge className="absolute top-2 left-2 bg-green-600">
                          已認證
                        </Badge>
                      )}
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <Link href={item.type === 'goods' ? `/shop/${item.id}` : `/baike/${item.id}`}>
                      <h3 className="font-medium truncate group-hover:text-primary mb-1">
                        {item.name}
                      </h3>
                    </Link>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {item.subtitle}
                      </p>
                    )}
                    
                    {item.type === 'goods' ? (
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-lg font-semibold text-primary">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span>銷量 {item.sales || 0}</span>
                          {item.merchant_name && (
                            <span className="truncate max-w-[100px]">{item.merchant_name}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleAddToCart(item.id)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            購物車
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.category}</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {item.views || 0} 瀏覽
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一頁
                </Button>
                <span className="text-sm text-muted-foreground">
                  第 {currentPage} / {totalPages} 頁
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一頁
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Hot Searches */}
        <section className="mt-12">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">熱門搜索</h3>
              <div className="flex flex-wrap gap-2">
                {['平安符', '招財符', '太歲符', '文昌符', '桃木劍', '銅錢劍', '八卦鏡', '羅盤'].map((term) => (
                  <Link key={term} href={`/search?keyword=${encodeURIComponent(term)}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      {term}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
