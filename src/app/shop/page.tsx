/**
 * @fileoverview 商品列表页面
 * @description 商品分类浏览与筛选
 * @module app/shop/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingCart,
  Heart,
  Package,
  Loader2,
  Store,
  Shield,
} from 'lucide-react';

interface Goods {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  category_id: number;
  category_name: string;
  merchant_id: number;
  merchant_name: string;
  merchant_verified?: boolean;
  sales: number;
  rating?: number;
  stock: number;
  has_cert?: boolean;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
  count?: number;
}

export default function ShopPage() {
  const [goods, setGoods] = useState<Goods[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  // 筛选条件
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState('default');
  const [showCertified, setShowCertified] = useState(false);
  const [showInStock, setShowInStock] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadGoods();
  }, [page, selectedCategory, priceRange, sortBy, showCertified, showInStock]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadGoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());
      
      if (keyword) params.set('keyword', keyword);
      if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
      if (sortBy !== 'default') params.set('sort', sortBy);
      if (showCertified) params.set('has_cert', 'true');
      if (showInStock) params.set('in_stock', 'true');
      
      if (priceRange !== 'all') {
        const [min, max] = priceRange.split('-');
        if (min) params.set('min_price', min);
        if (max) params.set('max_price', max);
      }

      const res = await fetch(`/api/goods?${params}`);
      const data = await res.json();
      
      setGoods(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('加载商品失败:', error);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, selectedCategory, priceRange, sortBy, showCertified, showInStock]);

  const handleSearch = () => {
    setPage(1);
    loadGoods();
  };

  const totalPages = Math.ceil(total / pageSize);

  const priceRanges = [
    { value: 'all', label: '全部價格' },
    { value: '0-100', label: 'HK$100 以下' },
    { value: '100-500', label: 'HK$100 - 500' },
    { value: '500-1000', label: 'HK$500 - 1000' },
    { value: '1000-', label: 'HK$1000 以上' },
  ];

  const sortOptions = [
    { value: 'default', label: '默認排序' },
    { value: 'sales', label: '銷量優先' },
    { value: 'price_asc', label: '價格從低到高' },
    { value: 'price_desc', label: '價格從高到低' },
    { value: 'rating', label: '評分優先' },
    { value: 'newest', label: '最新上架' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 搜索栏 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索符箓、法器、書籍..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>搜索</Button>
          </div>

          {/* 分类导航 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              全部
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id.toString())}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 左侧筛选栏 - 桌面端 */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card className="sticky top-28">
              <CardContent className="p-4 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">價格區間</h3>
                  <div className="space-y-2">
                    {priceRanges.map((range) => (
                      <Button
                        key={range.value}
                        variant={priceRange === range.value ? 'default' : 'ghost'}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setPriceRange(range.value)}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">篩選條件</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="certified"
                        checked={showCertified}
                        onCheckedChange={(checked) => setShowCertified(checked as boolean)}
                      />
                      <Label htmlFor="certified" className="text-sm cursor-pointer">
                        <Shield className="w-3 h-3 inline mr-1" />
                        一物一證
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="inStock"
                        checked={showInStock}
                        onCheckedChange={(checked) => setShowInStock(checked as boolean)}
                      />
                      <Label htmlFor="inStock" className="text-sm cursor-pointer">
                        僅顯示有貨
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* 右侧商品列表 */}
          <div className="flex-1">
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>共 {total} 件商品</span>
              </div>
              <div className="flex items-center gap-2">
                {/* 移动端筛选按钮 */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      篩選
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>篩選條件</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 mt-6">
                      <div>
                        <h4 className="font-medium mb-3">價格區間</h4>
                        <div className="space-y-2">
                          {priceRanges.map((range) => (
                            <Button
                              key={range.value}
                              variant={priceRange === range.value ? 'default' : 'ghost'}
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => setPriceRange(range.value)}
                            >
                              {range.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">篩選條件</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="certified-mobile"
                              checked={showCertified}
                              onCheckedChange={(checked) => setShowCertified(checked as boolean)}
                            />
                            <Label htmlFor="certified-mobile" className="text-sm">
                              一物一證
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="inStock-mobile"
                              checked={showInStock}
                              onCheckedChange={(checked) => setShowInStock(checked as boolean)}
                            />
                            <Label htmlFor="inStock-mobile" className="text-sm">
                              僅顯示有貨
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* 排序 */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 视图切换 */}
                <div className="hidden sm:flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* 商品网格 */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : goods.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">暫無符合條件的商品</p>
                <Button variant="outline" className="mt-4" onClick={() => {
                  setKeyword('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                  setShowCertified(false);
                  setShowInStock(false);
                }}>
                  清除篩選
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {goods.map((item) => (
                  <Link key={item.id} href={`/shop/${item.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="aspect-square bg-muted relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {item.has_cert && (
                          <Badge className="absolute top-2 left-2 bg-green-600">
                            <Shield className="w-3 h-3 mr-1" />
                            認證
                          </Badge>
                        )}
                        {item.original_price && item.original_price > item.price && (
                          <Badge className="absolute top-2 right-2 bg-red-600">
                            -{Math.round((1 - item.price / item.original_price) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Store className="w-3 h-3" />
                          <span className="truncate">{item.merchant_name}</span>
                          {item.merchant_verified && (
                            <Badge variant="outline" className="text-[10px] py-0">認證</Badge>
                          )}
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-primary font-bold">HK${item.price}</span>
                            {item.original_price && item.original_price > item.price && (
                              <span className="text-xs text-muted-foreground line-through ml-1">
                                HK${item.original_price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>已售 {item.sales}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {goods.map((item) => (
                  <Link key={item.id} href={`/shop/${item.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="flex">
                        <div className="w-40 h-40 bg-muted flex-shrink-0 relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.has_cert && (
                            <Badge className="absolute top-2 left-2 bg-green-600">
                              <Shield className="w-3 h-3 mr-1" />
                              認證
                            </Badge>
                          )}
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg">{item.name}</h3>
                            <Button variant="ghost" size="icon">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Store className="w-4 h-4" />
                            <span>{item.merchant_name}</span>
                            {item.merchant_verified && (
                              <Badge variant="outline">認證商戶</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            {item.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                {item.rating}
                              </span>
                            )}
                            <span>已售 {item.sales}</span>
                            <span>庫存 {item.stock}</span>
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-primary text-xl font-bold">HK${item.price}</span>
                              {item.original_price && item.original_price > item.price && (
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  HK${item.original_price}
                                </span>
                              )}
                            </div>
                            <Button size="sm">
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              加入購物車
                            </Button>
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
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
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
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
