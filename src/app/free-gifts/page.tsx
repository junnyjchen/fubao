/**
 * @fileoverview 免费领商品列表页面
 * @description 免费领取商品，支持邮寄或到店自取
 * @module app/free-gifts/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Gift,
  Truck,
  MapPin,
  Loader2,
  ChevronRight,
  Users,
  Tag,
  Zap,
  Flame,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SimpleCountdown } from '@/components/free-gifts/CountdownTimer';
import { GiftListSkeleton } from '@/components/free-gifts/Skeleton';
import { ShareButton } from '@/components/free-gifts/ShareButton';

interface FreeGift {
  id: number;
  name: string;
  description: string;
  image: string | null;
  original_price: string;
  stock: number;
  claimed: number;
  limit_per_user: number;
  shipping_fee: string;
  is_active: boolean;
  start_time: string;
  end_time: string;
  merchant_id: number;
  merchant?: {
    id: number;
    name: string;
    address: string;
  };
}

type FilterType = 'all' | 'hot' | 'ending_soon' | 'pickup';

export default function FreeGiftsPage() {
  const [gifts, setGifts] = useState<FreeGift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadGifts();
  }, []);

  const loadGifts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/free-gifts');
      const data = await res.json();
      if (data.success || data.data) {
        setGifts(data.data || []);
      }
    } catch (error) {
      console.error('加载免费商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (gift: FreeGift) => {
    const total = gift.stock + gift.claimed;
    return total > 0 ? Math.round((gift.claimed / total) * 100) : 0;
  };

  const isExpired = (gift: FreeGift) => {
    return new Date(gift.end_time) < new Date();
  };

  const getRemainingDays = (gift: FreeGift) => {
    const end = new Date(gift.end_time).getTime();
    const now = Date.now();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  // 过滤商品
  const filteredGifts = gifts.filter((gift) => {
    if (isExpired(gift) || gift.stock <= 0) return false;
    
    switch (filter) {
      case 'hot':
        return getProgress(gift) >= 70; // 热门：已领超过70%
      case 'ending_soon':
        return getRemainingDays(gift) <= 3; // 即将结束：3天内
      case 'pickup':
        return true; // 所有都支持到店自取
      default:
        return true;
    }
  }).sort((a, b) => {
    if (filter === 'hot') {
      return getProgress(b) - getProgress(a);
    }
    if (filter === 'ending_soon') {
      return getRemainingDays(a) - getRemainingDays(b);
    }
    return b.id - a.id;
  });

  // 统计数据
  const stats = {
    total: gifts.filter(g => !isExpired(g) && g.stock > 0).length,
    hot: gifts.filter(g => getProgress(g) >= 70 && !isExpired(g) && g.stock > 0).length,
    endingSoon: gifts.filter(g => getRemainingDays(g) <= 3 && !isExpired(g) && g.stock > 0).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white relative overflow-hidden">
        {/* 装饰背景 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-white blur-2xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-yellow-300 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-8 text-center relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Gift className="w-10 h-10" />
              <Sparkles className="w-5 h-5 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold">免費領</h1>
          </div>
          <p className="text-white/90 text-lg mb-2">
            精選好物 · 免費領取 · 郵寄或到店自取
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              郵寄僅付運費
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              到店免費領取
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 活动规则 */}
        <Card className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm text-muted-foreground flex-1">
                <p className="font-medium text-foreground mb-1">活動規則</p>
                <ul className="space-y-1">
                  <li>• 每人每件商品限領指定數量，先到先得</li>
                  <li>• 選擇郵寄需支付運費，選擇到店自取完全免費</li>
                  <li>• 領取後請在7天內完成領取，逾期將取消</li>
                </ul>
              </div>
              <ShareButton
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title="免費領好禮 - 符寶網"
                description="精選好物免費領取，快來看看吧！"
                size="sm"
                showText={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* 筛选标签 */}
        <div className="mb-6">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="bg-white/80 backdrop-blur">
              <TabsTrigger value="all" className="gap-1.5">
                <Gift className="w-4 h-4" />
                全部 ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="hot" className="gap-1.5">
                <Flame className="w-4 h-4" />
                熱門 ({stats.hot})
              </TabsTrigger>
              <TabsTrigger value="ending_soon" className="gap-1.5">
                <Zap className="w-4 h-4" />
                即將結束 ({stats.endingSoon})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 商品列表 */}
        {loading ? (
          <GiftListSkeleton count={6} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGifts.map((gift) => {
              const progress = getProgress(gift);
              const remainingDays = getRemainingDays(gift);
              const isHot = progress >= 70;
              const isEndingSoon = remainingDays <= 3;

              return (
                <Card 
                  key={gift.id} 
                  className="overflow-hidden hover:shadow-lg transition-all group"
                >
                  {/* 商品图片 */}
                  <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50">
                    {gift.image ? (
                      <Image
                        src={gift.image}
                        alt={gift.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Gift className="w-20 h-20 text-red-300" />
                      </div>
                    )}
                    
                    {/* 标签组 */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className="bg-red-500 text-white">
                        免費
                      </Badge>
                      {isHot && (
                        <Badge className="bg-orange-500 text-white animate-pulse">
                          <Flame className="w-3 h-3 mr-1" />
                          熱門
                        </Badge>
                      )}
                      {isEndingSoon && (
                        <Badge className="bg-yellow-500 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          即將結束
                        </Badge>
                      )}
                    </div>
                    
                    {/* 原价 */}
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded backdrop-blur-sm">
                      原價 HK${gift.original_price}
                    </div>
                    
                    {/* 倒计时 */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs flex items-center justify-between">
                        <SimpleCountdown endTime={gift.end_time} />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* 商品名称 */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {gift.name}
                    </h3>
                    
                    {/* 商品描述 */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {gift.description}
                    </p>

                    {/* 进度条 */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>已領 {gift.claimed} 件</span>
                        <span className={isHot ? 'text-orange-600 font-medium' : ''}>
                          剩餘 {gift.stock} 件
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className={`h-2 ${isHot ? '[&>div]:bg-orange-500' : ''}`}
                      />
                    </div>

                    {/* 领取方式 */}
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <div className="flex items-center gap-1 text-orange-600">
                        <Truck className="w-4 h-4" />
                        郵費 HK${gift.shipping_fee}
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <MapPin className="w-4 h-4" />
                        到店免費
                      </div>
                    </div>

                    {/* 门店信息 */}
                    {gift.merchant && (
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {gift.merchant.name}
                      </div>
                    )}

                    {/* 领取按钮 */}
                    <Link href={`/free-gifts/${gift.id}`}>
                      <Button 
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 group-hover:shadow-md transition-shadow"
                      >
                        立即領取
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* 无数据提示 */}
        {!loading && filteredGifts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === 'all' ? '暫無免費領取商品' : '沒有符合條件的商品'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">敬請期待更多活動</p>
              {filter !== 'all' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setFilter('all')}
                >
                  查看全部商品
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* 我的领取记录 */}
        <Card className="mt-6 hover:shadow-md transition-shadow">
          <CardContent className="py-4">
            <Link href="/user/free-gifts" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">我的領取記錄</p>
                  <p className="text-sm text-muted-foreground">查看已領取的商品</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
