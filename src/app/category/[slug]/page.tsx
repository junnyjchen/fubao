/**
 * @fileoverview 商品分类页面
 * @description 按分类浏览商品
 * @module app/category/[slug]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Grid3X3,
  List,
  Star,
  Shield,
  ChevronRight,
  Loader2,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

/** 分类信息 */
interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parent_id?: number;
}

/** 子分类 */
interface SubCategory {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

/** 商品 */
interface Goods {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  main_image: string | null;
  sales: number;
  rating?: number;
  is_certified: boolean;
  merchants?: {
    id: number;
    name: string;
    verified?: boolean;
  };
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

function CategoryPageContent({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [goods, setGoods] = useState<Goods[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('default');
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const pageSize = 20;

  useEffect(() => {
    loadCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      loadGoods();
    }
  }, [category, page, sortBy, selectedSubId]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      // 获取分类信息
      const catRes = await fetch(`/api/categories/slug/${slug}`);
      const catData = await catRes.json();
      
      if (catData.data) {
        setCategory(catData.data);
        
        // 获取子分类
        const subRes = await fetch(`/api/categories?parentId=${catData.data.id}`);
        const subData = await subRes.json();
        setSubCategories(subData.data || []);
        
        // 加载商品
        await loadGoodsInternal(catData.data.id, null);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoods = async () => {
    if (!category) return;
    await loadGoodsInternal(category.id, selectedSubId);
  };

  const loadGoodsInternal = async (categoryId: number, subId: number | null) => {
    try {
      const effectiveCategoryId = subId || categoryId;
      const res = await fetch(
        `/api/goods?category_id=${effectiveCategoryId}&page=${page}&limit=${pageSize}&sort=${sortBy}`
      );
      const data = await res.json();
      
      if (data.data) {
        setGoods(data.data);
        setTotal(data.pagination?.total || data.total || 0);
        setTotalPages(data.pagination?.total_pages || 0);
      }
    } catch (error) {
      console.error('加载商品失败:', error);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSubCategoryClick = (subId: number | null) => {
    setSelectedSubId(subId);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">分類不存在</h2>
            <Button asChild className="mt-4">
              <Link href="/shop">返回商城</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 面包屑 */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">首頁</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-foreground">商城</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* 分类头部 */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-primary-foreground/80">{category.description}</p>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 子分类标签 */}
        {subCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">子分類</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubId === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSubCategoryClick(null)}
              >
                全部
              </Button>
              {subCategories.map((sub) => (
                <Button
                  key={sub.id}
                  variant={selectedSubId === sub.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSubCategoryClick(sub.id)}
                >
                  {sub.name}
                  {sub.count !== undefined && (
                    <span className="ml-1 text-xs opacity-70">({sub.count})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-6 bg-background rounded-lg p-3 border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              共 {total} 件商品
            </span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">默認排序</SelectItem>
                <SelectItem value="sales">銷量優先</SelectItem>
                <SelectItem value="price_asc">價格升序</SelectItem>
                <SelectItem value="price_desc">價格降序</SelectItem>
                <SelectItem value="newest">最新上架</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 商品列表 */}
        {goods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無商品</p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {goods.map((item) => (
                <Link key={item.id} href={`/shop/${item.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      {item.main_image ? (
                        <img
                          src={item.main_image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      {item.is_certified && (
                        <Badge className="absolute top-2 left-2 bg-green-600">
                          <Shield className="w-3 h-3 mr-1" />
                          認證
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-bold">
                          HK${item.price.toFixed(2)}
                        </span>
                        {item.original_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            HK${item.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>已售 {item.sales}</span>
                        {item.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {item.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {goods.map((item) => (
              <Link key={item.id} href={`/shop/${item.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.main_image ? (
                        <img
                          src={item.main_image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {item.is_certified && (
                        <Badge className="absolute top-1 left-1 text-xs bg-green-600">
                          <Shield className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1 group-hover:text-primary">
                        {item.name}
                      </h3>
                      {item.merchants && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.merchants.name}
                          {item.merchants.verified && (
                            <Badge variant="secondary" className="ml-2 text-xs">認證</Badge>
                          )}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-primary">
                            HK${item.price.toFixed(2)}
                          </span>
                          {item.original_price && (
                            <span className="text-sm text-muted-foreground line-through">
                              HK${item.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          已售 {item.sales}
                          {item.rating && (
                            <span className="ml-2 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {item.rating.toFixed(1)}
                            </span>
                          )}
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
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              showTotal
              total={total}
              pageSize={pageSize}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  return <CategoryPageContent slug={slug} />;
}
