'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatPrice, formatCount } from '@/lib/format';
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Filter,
  Grid3X3,
  List,
  Search,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface Goods {
  id: number;
  name: string;
  subtitle?: string;
  cover_image: string;
  images?: string[];
  price: number;
  original_price?: number;
  sales: number;
  stock: number;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  is_hot?: boolean;
  is_new?: boolean;
  merchant_name?: string;
  category_name?: string;
  tags?: string[];
}

interface GoodsListProps {
  goods: Goods[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onFavorite?: (id: number) => Promise<void>;
  onAddCart?: (id: number) => Promise<void>;
}

export function GoodsList({
  goods,
  loading = false,
  onLoadMore,
  hasMore = false,
  onFavorite,
  onAddCart,
}: GoodsListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriting, setFavoriting] = useState<number | null>(null);
  const { success } = useToast();

  const handleFavorite = async (id: number) => {
    if (!onFavorite) return;
    setFavoriting(id);
    try {
      await onFavorite(id);
      success('已添加到收藏');
    } catch (err) {
      // handled by toast
    } finally {
      setFavoriting(null);
    }
  };

  if (loading && goods.length === 0) {
    return viewMode === 'grid' ? (
      <GoodsGridSkeleton count={8} />
    ) : (
      <GoodsListSkeleton count={4} />
    );
  }

  if (goods.length === 0) {
    return (
      <EmptyState
        icon={<Search className="w-12 h-12" />}
        title="暂无商品"
        description="没有找到符合条件的商品"
      />
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          共{goods.length}件商品
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(viewMode === 'grid' && 'bg-muted')}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(viewMode === 'list' && 'bg-muted')}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {goods.map((item) => (
            <GoodsCard
              key={item.id}
              goods={item}
              favoriting={favoriting === item.id}
              onFavorite={() => handleFavorite(item.id)}
              onAddCart={onAddCart}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {goods.map((item) => (
            <GoodsListItem
              key={item.id}
              goods={item}
              favoriting={favoriting === item.id}
              onFavorite={() => handleFavorite(item.id)}
              onAddCart={onAddCart}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-8">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            加载更多
          </Button>
        </div>
      )}
    </>
  );
}

// Grid Card
interface GoodsCardProps {
  goods: Goods;
  favoriting?: boolean;
  onFavorite?: () => void;
  onAddCart?: (id: number) => Promise<void>;
}

export function GoodsCard({ goods, favoriting, onFavorite, onAddCart }: GoodsCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleAddCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddCart) {
      await onAddCart(goods.id);
    }
  };

  return (
    <Link href={`/goods/${goods.id}`}>
      <Card
        className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={goods.cover_image}
            alt={goods.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {goods.is_new && (
              <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                新品
              </Badge>
            )}
            {goods.is_hot && (
              <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                <Flame className="w-3 h-3 mr-1" />
                热销
              </Badge>
            )}
            {goods.is_featured && (
              <Badge variant="secondary" className="bg-purple-500 text-white text-xs">
                精选
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div
            className={cn(
              'absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0'
            )}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavorite?.();
              }}
              disabled={favoriting}
              className="w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
            >
              <Heart
                className={cn('w-4 h-4', goods.is_featured && 'fill-red-500 text-red-500')}
              />
            </button>
          </div>

          {/* Stock Warning */}
          {goods.stock < 10 && goods.stock > 0 && (
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-orange-500/90 text-white text-xs px-2 py-1 rounded text-center">
                仅剩{goods.stock}件
              </div>
            </div>
          )}

          {/* Out of Stock */}
          {goods.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">已售罄</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
            {goods.name}
          </h3>

          {goods.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{goods.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({formatCount(goods.review_count || 0)})
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-red-500">
                {formatPrice(goods.price)}
              </span>
              {goods.original_price && goods.original_price > goods.price && (
                <span className="text-xs text-muted-foreground line-through ml-1">
                  {formatPrice(goods.original_price)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddCart}
              disabled={goods.stock === 0}
              className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>

          {goods.sales > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              已售{formatCount(goods.sales)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// List Item
interface GoodsListItemProps {
  goods: Goods;
  favoriting?: boolean;
  onFavorite?: () => void;
  onAddCart?: (id: number) => Promise<void>;
}

export function GoodsListItem({ goods, favoriting, onFavorite, onAddCart }: GoodsListItemProps) {
  const handleAddCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddCart) {
      await onAddCart(goods.id);
    }
  };

  return (
    <Link href={`/goods/${goods.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="flex">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-muted overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={goods.cover_image}
              alt={goods.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {goods.is_new && (
                <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                  新品
                </Badge>
              )}
              {goods.is_hot && (
                <Badge variant="secondary" className="bg-red-500 text-white text-xs">
                  热销
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-medium line-clamp-2 mb-1">{goods.name}</h3>
              {goods.subtitle && (
                <p className="text-sm text-muted-foreground line-clamp-1">{goods.subtitle}</p>
              )}

              {goods.tags && goods.tags.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {goods.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-muted rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-red-500">
                    {formatPrice(goods.price)}
                  </span>
                  {goods.original_price && goods.original_price > goods.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(goods.original_price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {goods.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {goods.rating}
                    </span>
                  )}
                  <span>已售{formatCount(goods.sales)}</span>
                  <span>库存{goods.stock}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddCart}
                  disabled={goods.stock === 0}
                  className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFavorite?.();
                  }}
                  disabled={favoriting}
                  className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

// Skeleton
export function GoodsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="aspect-square rounded-none" />
          <CardContent className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function GoodsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <div className="flex">
            <Skeleton className="w-32 h-32 sm:w-40 sm:h-40 shrink-0" />
            <CardContent className="flex-1 p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      ))}
    </div>
  );
}
