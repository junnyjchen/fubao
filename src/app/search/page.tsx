/**
 * @fileoverview 搜索结果页面
 * @description 展示商品搜索结果
 * @module app/search/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Package,
  Grid,
  List,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';

/** 商品数据类型 */
interface Goods {
  id: number;
  name: string;
  subtitle: string | null;
  price: string;
  original_price: string | null;
  main_image: string | null;
  sales: number;
  stock: number;
  type: number;
  purpose: string | null;
  is_certified: boolean;
  merchants: {
    id: number;
    name: string;
    certification_level: number | null;
  } | null;
}

/** 商品类型映射 */
const GOODS_TYPE_MAP: Record<number, string> = {
  1: '符箓',
  2: '法器',
  3: '開光物品',
  4: '書籍',
  5: '其他',
};

/** 用途映射 */
const PURPOSE_MAP: Record<string, string> = {
  peace: '平安祈福',
  wealth: '招財進寶',
  health: '健康長壽',
  love: '姻緣和合',
  career: '事業順利',
  study: '學業進步',
  protection: '驅邪避凶',
  other: '其他',
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const typeParam = searchParams.get('type') || '';
  const purposeParam = searchParams.get('purpose') || '';

  const [goods, setGoods] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

  // 筛选条件
  const [filters, setFilters] = useState({
    type: typeParam,
    purpose: purposeParam,
    certified: false,
  });

  // 加载搜索结果
  useEffect(() => {
    if (keyword) {
      searchGoods();
    }
  }, [keyword, filters, sortBy, page]);

  const searchGoods = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('keyword', keyword);
      params.set('limit', pageSize.toString());
      params.set('page', page.toString());

      if (filters.type) params.set('type', filters.type);
      if (filters.purpose) params.set('purpose', filters.purpose);
      if (sortBy !== 'default') {
        if (sortBy === 'price_asc' || sortBy === 'price_desc') {
          params.set('sort', 'price');
          params.set('order', sortBy === 'price_asc' ? 'asc' : 'desc');
        } else if (sortBy === 'sales') {
          params.set('sort', 'sales');
          params.set('order', 'desc');
        }
      }

      const res = await fetch(`/api/goods?${params}`);
      const data = await res.json();

      setGoods(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newKeyword: string) => {
    router.push(`/search?keyword=${encodeURIComponent(newKeyword)}`);
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ type: '', purpose: '', certified: false });
    setPage(1);
  };

  const hasActiveFilters = filters.type || filters.purpose || filters.certified;

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1 max-w-xl">
              <SearchBar
                placeholder="搜索商品、符箓、法器..."
                onSearch={handleSearch}
                showHotSearch={false}
                showHistory={false}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 搜索关键词和结果统计 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            {keyword ? (
              <>
                搜索「<span className="text-primary">{keyword}</span>」
              </>
            ) : (
              '搜索商品'
            )}
          </h1>
          {!loading && total > 0 && (
            <p className="text-muted-foreground">
              共找到 <span className="text-foreground font-medium">{total}</span> 件相關商品
            </p>
          )}
        </div>

        {/* 筛选和排序 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/10' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              篩選
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {(filters.type ? 1 : 0) + (filters.purpose ? 1 : 0) + (filters.certified ? 1 : 0)}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-1" />
                清除篩選
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">綜合排序</SelectItem>
                <SelectItem value="sales">銷量優先</SelectItem>
                <SelectItem value="price_asc">價格升序</SelectItem>
                <SelectItem value="price_desc">價格降序</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden md:flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 筛选面板 */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">商品類型</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!filters.type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('type', '')}
                    >
                      全部
                    </Button>
                    {Object.entries(GOODS_TYPE_MAP).map(([value, label]) => (
                      <Button
                        key={value}
                        variant={filters.type === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('type', value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">用途功效</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!filters.purpose ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('purpose', '')}
                    >
                      全部
                    </Button>
                    {Object.entries(PURPOSE_MAP).map(([value, label]) => (
                      <Button
                        key={value}
                        variant={filters.purpose === value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('purpose', value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">其他篩選</p>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="certified"
                      checked={filters.certified}
                      onCheckedChange={(checked) => handleFilterChange('certified', checked as boolean)}
                    />
                    <label htmlFor="certified" className="text-sm cursor-pointer">
                      僅顯示認證商品
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 搜索结果 */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">搜索中...</p>
          </div>
        ) : goods.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-semibold mb-2">沒有找到相關商品</h2>
              <p className="text-muted-foreground mb-6">
                試試更換關鍵詞或篩選條件
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={clearFilters}>
                  清除篩選
                </Button>
                <Button asChild>
                  <Link href="/shop">瀏覽全部商品</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {goods.map((item) => (
              <Link key={item.id} href={`/goods/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {item.main_image ? (
                      <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {item.is_certified && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        一物一證
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-sm line-clamp-2 mb-1">
                      {item.name}
                    </p>
                    {item.merchants && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.merchants.name}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-primary font-bold">
                        HK${item.price}
                      </span>
                      {item.original_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          HK${item.original_price}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      已售 {item.sales}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {goods.map((item) => (
              <Link key={item.id} href={`/goods/${item.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                        {item.main_image ? (
                          <img
                            src={item.main_image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium line-clamp-1">{item.name}</p>
                            {item.subtitle && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          {item.is_certified && (
                            <Badge className="bg-primary flex-shrink-0">
                              一物一證
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {filters.type === '' && (
                            <Badge variant="outline" className="text-xs">
                              {GOODS_TYPE_MAP[item.type]}
                            </Badge>
                          )}
                          {item.purpose && (
                            <Badge variant="outline" className="text-xs">
                              {PURPOSE_MAP[item.purpose]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-primary font-bold text-lg">
                              HK${item.price}
                            </span>
                            {item.original_price && (
                              <span className="text-sm text-muted-foreground line-through">
                                HK${item.original_price}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            已售 {item.sales}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="icon"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">載入中...</div>}>
      <SearchContent />
    </Suspense>
  );
}
