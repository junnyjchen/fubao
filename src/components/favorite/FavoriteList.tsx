'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  Trash2, 
  ShoppingCart, 
  MoveRight,
  Loader2,
} from 'lucide-react';

interface FavoriteItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  price: number;
  original_price?: number;
  merchant_name?: string;
  created_at: string;
}

interface FavoriteListProps {
  items: FavoriteItem[];
  loading?: boolean;
  onRemove: (id: number) => Promise<void>;
  onAddToCart?: (item: FavoriteItem) => Promise<void>;
}

export function FavoriteList({
  items,
  loading = false,
  onRemove,
  onAddToCart,
}: FavoriteListProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addingCartId, setAddingCartId] = useState<number | null>(null);
  const { success, error } = useToast();

  const handleRemove = useCallback(async (id: number) => {
    try {
      setRemovingId(id);
      await onRemove(id);
      success('已取消收藏');
    } catch (err) {
      error('取消收藏失败');
    } finally {
      setRemovingId(null);
    }
  }, [onRemove, success, error]);

  const handleAddToCart = useCallback(async (item: FavoriteItem) => {
    if (!onAddToCart) return;
    try {
      setAddingCartId(item.id);
      await onAddToCart(item);
      success('已加入购物车');
    } catch (err) {
      error('加入购物车失败');
    } finally {
      setAddingCartId(null);
    }
  }, [onAddToCart, success, error]);

  if (loading) {
    return <FavoriteListSkeleton count={6} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-12 h-12" />}
        title="暂无收藏"
        description="快去逛逛，发现喜欢的商品吧"
        action={
          <Link href="/shop">
            <Button>去购物</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <FavoriteCard
          key={item.id}
          item={item}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
          isRemoving={removingId === item.id}
          isAddingToCart={addingCartId === item.id}
        />
      ))}
    </div>
  );
}

interface FavoriteCardProps {
  item: FavoriteItem;
  onRemove: (id: number) => void;
  onAddToCart?: (item: FavoriteItem) => void;
  isRemoving?: boolean;
  isAddingToCart?: boolean;
}

function FavoriteCard({
  item,
  onRemove,
  onAddToCart,
  isRemoving = false,
  isAddingToCart = false,
}: FavoriteCardProps) {
  const hasDiscount = item.original_price && item.original_price > item.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - item.price / item.original_price!) * 100)
    : 0;

  return (
    <div className="group bg-card rounded-lg border overflow-hidden transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/goods/${item.goods_id}`} className="block relative aspect-square">
        <Image
          src={item.goods_image}
          alt={item.goods_name}
          className="w-full h-full object-cover"
          fallback="/placeholder.png"
        />
        {hasDiscount && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded">
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link href={`/goods/${item.goods_id}`} className="line-clamp-2 text-sm font-medium hover:text-primary transition-colors">
          {item.goods_name}
        </Link>

        {item.merchant_name && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {item.merchant_name}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-red-500">
              ¥{item.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ¥{item.original_price!.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          {onAddToCart && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onAddToCart(item)}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-1" />
              )}
              加购
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="px-2"
          >
            {isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Skeleton
export function FavoriteListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 收藏按钮组件
interface FavoriteButtonProps {
  goodsId: number;
  isFavorited: boolean;
  onToggle: (isFavorited: boolean) => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function FavoriteButton({
  goodsId,
  isFavorited,
  onToggle,
  size = 'md',
  showText = false,
}: FavoriteButtonProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleClick = async () => {
    try {
      setLoading(true);
      await onToggle(!isFavorited);
      success(isFavorited ? '已取消收藏' : '已添加收藏');
    } catch (err) {
      error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center justify-center rounded-full transition-all',
        isFavorited
          ? 'bg-red-50 text-red-500 hover:bg-red-100'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground',
        sizeClasses[size],
        loading && 'opacity-50'
      )}
    >
      {loading ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : (
        <Heart
          className={cn(
            iconSizes[size],
            isFavorited && 'fill-current'
          )}
        />
      )}
      {showText && (
        <span className="ml-1 text-sm">
          {isFavorited ? '已收藏' : '收藏'}
        </span>
      )}
    </button>
  );
}
