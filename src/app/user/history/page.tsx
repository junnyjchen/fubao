/**
 * @fileoverview 用户浏览历史页面
 * @description 查看和管理浏览历史
 * @module app/user/history/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Clock,
  Trash2,
  ShoppingCart,
  Heart,
  Package,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

/** 浏览历史项 */
interface HistoryItem {
  id: number;
  goods_id: number;
  view_time: string;
  view_duration: number;
  goods: {
    id: number;
    name: string;
    price: string;
    main_image: string | null;
    sales: number;
    status: boolean;
    merchant?: { name: string };
  } | null;
}

/**
 * 用户浏览历史页面
 */
export default function BrowseHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * 加载浏览历史
   */
  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/browse-history?limit=50');
      const data = await res.json();
      setHistory(data.data || []);
    } catch (error) {
      console.error('加载浏览历史失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 删除单条记录
   */
  const handleDeleteOne = async (goodsId: number) => {
    try {
      await fetch(`/api/user/browse-history?goods_id=${goodsId}`, {
        method: 'DELETE',
      });
      setHistory((prev) => prev.filter((h) => h.goods_id !== goodsId));
      toast.success('已刪除');
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('刪除失敗');
    }
  };

  /**
   * 清空所有记录
   */
  const handleClearAll = async () => {
    try {
      await fetch('/api/user/browse-history', { method: 'DELETE' });
      setHistory([]);
      toast.success('已清空');
    } catch (error) {
      console.error('清空失败:', error);
      toast.error('清空失敗');
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
        toast.success('已加入購物車');
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      toast.error('操作失敗');
    }
  };

  /**
   * 添加收藏
   */
  const handleAddFavorite = async (goodsId: number) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'goods', targetId: goodsId }),
      });
      const data = await res.json();
      if (data.data) {
        toast.success('已收藏');
      } else {
        toast.error(data.error || '操作失敗');
      }
    } catch (error) {
      console.error('收藏失败:', error);
      toast.error('操作失敗');
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '剛剛' : `${minutes}分鐘前`;
      }
      return `${hours}小時前`;
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <UserLayout title="瀏覽歷史" description="您最近瀏覽過的商品">
      {/* 操作栏 */}
      {history.length > 0 && (
        <Card className="mb-4">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                共 {history.length} 條記錄
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空全部
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確認清空</AlertDialogTitle>
                    <AlertDialogDescription>
                      確定要清空所有瀏覽記錄嗎？此操作無法撤銷。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-destructive text-destructive-foreground"
                    >
                      確認清空
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : history.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">暫無瀏覽記錄</h3>
            <p className="text-muted-foreground mb-4">
              去發現更多心儀的商品吧
            </p>
            <Button asChild>
              <Link href="/shop">去購物</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const goods = item.goods;
            if (!goods) return null;

            return (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    {/* 商品图片 */}
                    <Link
                      href={`/shop/${goods.id}`}
                      className="w-24 h-24 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden"
                    >
                      {goods.main_image ? (
                        <img
                          src={goods.main_image}
                          alt={goods.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </Link>

                    {/* 商品信息 */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${goods.id}`}>
                        <h3 className="font-medium line-clamp-2 hover:text-primary">
                          {goods.name}
                        </h3>
                      </Link>
                      <p className="text-primary font-semibold mt-1">
                        HK${goods.price}
                      </p>
                      {goods.merchant && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {goods.merchant.name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(item.view_time)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          銷量 {goods.sales}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToCart(goods.id)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddFavorite(goods.id)}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => handleDeleteOne(goods.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </UserLayout>
  );
}
