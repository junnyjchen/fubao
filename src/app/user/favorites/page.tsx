/**
 * @fileoverview 用户收藏页面
 * @description 展示用户收藏的商品列表
 * @module app/user/favorites/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

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

/**
 * 用户收藏页面组件
 * @returns 收藏页面
 */
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    loadFavorites();
  }, [currentPage]);

  /**
   * 加载收藏列表
   */
  const loadFavorites = async () => {
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
  };

  /**
   * 取消收藏
   */
  const handleRemove = async (targetId: number) => {
    try {
      const response = await fetch(
        `/api/favorites?targetType=goods&targetId=${targetId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.target_id !== targetId));
      }
    } catch (error) {
      console.error('取消收藏失敗:', error);
    }
  };

  /**
   * 加入购物车
   */
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
      } else if (data.error) {
        alert(data.error);
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      alert('操作失敗，請重試');
    }
  };

  return (
    <UserLayout title="我的收藏" description="管理您收藏的商品">
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">暫無收藏</h2>
            <p className="text-muted-foreground mb-6">去發現更多心儀的商品吧</p>
            <Button asChild>
              <Link href="/shop">去購物</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => {
            const goods = favorite.goods;
            if (!goods) return null;

            return (
              <Card key={favorite.id} className="overflow-hidden">
                <Link href={`/shop/${goods.id}`}>
                  <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                    {goods.main_image ? '圖片' : '暫無圖片'}
                  </div>
                </Link>
                <CardContent className="p-4">
                  <Link href={`/shop/${goods.id}`}>
                    <h3 className="font-medium truncate hover:text-primary">
                      {goods.name}
                    </h3>
                  </Link>
                  <p className="text-primary font-semibold mt-1">
                    HK${goods.price}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    銷量 {goods.sales}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAddToCart(goods.id)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      加入購物車
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemove(favorite.target_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
