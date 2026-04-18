/**
 * @fileoverview 用户浏览历史页面
 * @description 查看和管理浏览历史
 * @module app/user/history/page
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { HistorySkeleton } from '@/components/common/PageSkeletons';

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

// 历史记录卡片组件
const HistoryCard = memo(function HistoryCard({
  item,
  onDelete,
  onAddToCart,
  onAddFavorite,
  formatTime,
  t,
  isRTL,
}: {
  item: HistoryItem;
  onDelete: () => void;
  onAddToCart: () => void;
  onAddFavorite: () => void;
  formatTime: (time: string) => string;
  t: any;
  isRTL: boolean;
}) {
  const goods = item.goods;
  if (!goods) return null;

  const hist = t.userPage.history;

  return (
    <Card className="hover:shadow-sm transition-shadow animate-fade-in-up">
      <CardContent className="py-4">
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* 商品图片 */}
          <Link
            href={`/shop/${goods.id}`}
            className="w-24 h-24 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden relative"
          >
            {goods.main_image ? (
              <Image
                src={goods.main_image}
                alt={goods.name}
                fill
                sizes="96px"
                className="object-cover"
                loading="lazy"
              />
            ) : (
              <Package className="w-8 h-8 text-muted-foreground" />
            )}
          </Link>

          {/* 商品信息 */}
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-end' : ''}`}>
            <Link href={`/shop/${goods.id}`}>
              <h3 className={`font-medium line-clamp-2 hover:text-primary ${isRTL ? 'text-end' : ''}`}>
                {goods.name}
              </h3>
            </Link>
            <p className={`text-primary font-semibold mt-1 ${isRTL ? 'text-end' : ''}`}>
              HK${goods.price}
            </p>
            {goods.merchant && (
              <p className={`text-xs text-muted-foreground mt-1 ${isRTL ? 'text-end' : ''}`}>
                {goods.merchant.name}
              </p>
            )}
            <div className={`flex items-center gap-4 mt-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <span className={`text-xs text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Clock className="w-3 h-3" />
                {formatTime(item.view_time)}
              </span>
              <span className="text-xs text-muted-foreground">
                {hist.sales} {goods.sales}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className={`flex flex-col gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              size="sm"
              variant="outline"
              onClick={onAddToCart}
              aria-label={t.userPage.favorite.addToCart}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onAddFavorite}
              aria-label={t.nav.favorites}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={onDelete}
              aria-label={t.common.delete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * 用户浏览历史页面
 */
export default function BrowseHistoryPage() {
  const { t, isRTL } = useI18n();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const hist = t.userPage.history;

  useEffect(() => {
    loadHistory();
  }, []);

  /**
   * 加载浏览历史
   */
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/browse-history?limit=50');
      const data = await res.json();
      setHistory(data.data || []);
    } catch (error) {
      console.error('加载浏览历史失败:', error);
      toast.error(t.common.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.common.loadFailed]);

  /**
   * 删除单条记录
   */
  const handleDeleteOne = useCallback(async (goodsId: number) => {
    try {
      await fetch(`/api/user/browse-history?goods_id=${goodsId}`, {
        method: 'DELETE',
      });
      setHistory((prev) => prev.filter((h) => h.goods_id !== goodsId));
      toast.success(hist.deleted);
    } catch (error) {
      console.error('删除失败:', error);
      toast.error(t.common.operationFailed);
    }
  }, [hist.deleted, t.common.operationFailed]);

  /**
   * 清空所有记录
   */
  const handleClearAll = useCallback(async () => {
    try {
      await fetch('/api/user/browse-history', { method: 'DELETE' });
      setHistory([]);
      toast.success(hist.cleared);
    } catch (error) {
      console.error('清空失败:', error);
      toast.error(t.common.operationFailed);
    }
  }, [hist.cleared, t.common.operationFailed]);

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
        toast.success(hist.addedToCart);
      } else {
        toast.error(data.error || t.common.operationFailed);
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      toast.error(t.common.operationFailed);
    }
  }, [hist.addedToCart, t.common.operationFailed]);

  /**
   * 添加收藏
   */
  const handleAddFavorite = useCallback(async (goodsId: number) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'goods', targetId: goodsId }),
      });
      const data = await res.json();
      if (data.data) {
        toast.success(hist.addedFavorite);
      } else {
        toast.error(data.error || t.common.operationFailed);
      }
    } catch (error) {
      console.error('收藏失败:', error);
      toast.error(t.common.operationFailed);
    }
  }, [hist.addedFavorite, t.common.operationFailed]);

  /**
   * 格式化时间
   */
  const formatTime = useCallback((time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return hist.justNow;
    } else if (minutes < 60) {
      return hist.minutesAgo.replace('{minutes}', minutes.toString());
    } else if (hours < 24) {
      return hist.hoursAgo.replace('{hours}', hours.toString());
    } else if (days === 1) {
      return hist.yesterday;
    } else if (days < 7) {
      return hist.daysAgo.replace('{days}', days.toString());
    } else {
      return date.toLocaleDateString();
    }
  }, [hist]);

  return (
    <UserLayout title={hist.title} description={hist.subtitle}>
      {/* 操作栏 */}
      {history.length > 0 && (
        <Card className="mb-4 animate-fade-in">
          <CardContent className="py-3">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm text-muted-foreground">
                {hist.totalRecords.replace('{count}', history.length.toString())}
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                    {hist.clearAll}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{hist.clearConfirm.title}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {hist.clearConfirm.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                    <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {hist.clearConfirm.confirm}
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
        <HistorySkeleton />
      ) : history.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="py-16 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{hist.noHistory}</h3>
            <p className="text-muted-foreground mb-4">
              {hist.noHistoryDesc}
            </p>
            <Button asChild>
              <Link href="/shop">{t.userPage.favorite.goShopping}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onDelete={() => handleDeleteOne(item.goods_id)}
              onAddToCart={() => handleAddToCart(item.goods!.id)}
              onAddFavorite={() => handleAddFavorite(item.goods!.id)}
              formatTime={formatTime}
              t={t}
              isRTL={isRTL}
            />
          ))}
        </div>
      )}
    </UserLayout>
  );
}
