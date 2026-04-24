/**
 * @fileoverview 用户收藏页面
 * @description 展示用户收藏的商品列表
 * @module app/user/favorites/page
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heart, Trash2, ShoppingCart, Package } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';

/** 收藏数据类型 */
interface Favorite {
  id: number;
  target_id: number;
  created_at: string;
  goods: {
    id: number;
    name: string;
    price: string;
    main_image: string | null;
    sales: number;
    status: boolean;
  } | null;
}

// 收藏商品卡片组件
const FavoriteCard = memo(function FavoriteCard({
  favorite,
  onRemove,
  onAddToCart,
  t,
  isRTL,
}: {
  favorite: Favorite;
  onRemove: () => void;
  onAddToCart: () => void;
  t: any;
  isRTL: boolean;
}) {
  const goods = favorite.goods;
  if (!goods) return null;

  const fav = t.userPage.favorite;

  return (
    <Card className="overflow-hidden animate-fade-in-up hover:shadow-md transition-shadow">
      <Link href={`/shop/${goods.id}`}>
        <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground relative overflow-hidden">
          {goods.main_image ? (
            <Image
              src={goods.main_image}
              alt={goods.name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <Package className="w-12 h-12" />
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/shop/${goods.id}`}>
          <h3 className={`font-medium truncate hover:text-primary ${isRTL ? 'text-end' : ''}`}>
            {goods.name}
          </h3>
        </Link>
        <p className={`text-primary font-semibold mt-1 ${isRTL ? 'text-end' : ''}`}>
          HK${goods.price}
        </p>
        <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-end' : ''}`}>
          {fav.sales} {goods.sales}
        </p>
        <div className={`flex gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onAddToCart}
          >
            <ShoppingCart className={`w-4 h-4 ${isRTL ? 'ms-1' : 'me-1'}`} />
            {fav.addToCart}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={onRemove}
            aria-label={fav.remove}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * 用户收藏页面组件
 * @returns 收藏页面
 */
export default function FavoritesPage() {
  const { t, isRTL } = useI18n();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const fav = t.userPage.favorite;

  useEffect(() => {
    loadFavorites();
  }, [currentPage]);

  /**
   * 加载收藏列表
   */
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/favorites?targetType=goods&page=${currentPage}&limit=${pageSize}`);
      const result = await response.json();
      if (result.data) {
        setFavorites(result.data);
        setTotalItems(result.total || 0);
        setTotalPages(result.total_pages || 0);
      }
    } catch (error) {
      console.error('加載收藏失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  /**
   * 取消收藏
   */
  const handleRemove = useCallback(async (targetId: number) => {
    try {
      const response = await fetch(
        `/api/favorites?targetType=goods&targetId=${targetId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.target_id !== targetId));
        toast.success(fav.removed);
      }
    } catch (error) {
      console.error('取消收藏失敗:', error);
    }
  }, [fav.removed]);

  /**
   * 加入购物车
   */
  const handleAddToCart = useCallback(async (goodsId: number) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goodsId, quantity: 1 }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success(fav.addedToCart);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      toast.error(t.common.error);
    }
  }, [fav.addedToCart, t.common.error]);

  return (
    <UserLayout title={fav.title} description={fav.subtitle}>
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-pulse">{t.common.loading}</div>
        </div>
      ) : favorites.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="py-16 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{fav.noFavorite}</h3>
            <p className="text-muted-foreground mb-6">{fav.noFavoriteDesc}</p>
            <Button asChild>
              <Link href="/shop">{fav.goShopping}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <FavoriteCard
              key={favorite.id}
              favorite={favorite}
              onRemove={() => handleRemove(favorite.target_id)}
              onAddToCart={() => handleAddToCart(favorite.goods!.id)}
              t={t}
              isRTL={isRTL}
            />
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
    </UserLayout>
  );
}
