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
import {
  Gift,
  Truck,
  MapPin,
  Loader2,
  ChevronRight,
  Clock,
  Users,
  Tag,
} from 'lucide-react';

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

export default function FreeGiftsPage() {
  const [gifts, setGifts] = useState<FreeGift[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-10 h-10" />
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
        <Card className="mb-6 bg-white/80 backdrop-blur">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">活動規則</p>
                <ul className="space-y-1">
                  <li>• 每人每件商品限領指定數量，先到先得</li>
                  <li>• 選擇郵寄需支付運費，選擇到店自取完全免費</li>
                  <li>• 領取後請在7天內完成領取，逾期將取消</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {gifts.map((gift) => {
            const expired = isExpired(gift);
            const outOfStock = gift.stock <= 0;
            const progress = getProgress(gift);

            return (
              <Card 
                key={gift.id} 
                className={`overflow-hidden hover:shadow-lg transition-all ${
                  expired || outOfStock ? 'opacity-60' : ''
                }`}
              >
                {/* 商品图片 */}
                <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50">
                  {gift.image ? (
                    <Image
                      src={gift.image}
                      alt={gift.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Gift className="w-20 h-20 text-red-300" />
                    </div>
                  )}
                  
                  {/* 免费标签 */}
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                    免費
                  </Badge>
                  
                  {/* 原价 */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2 py-1 rounded">
                    原價 HK${gift.original_price}
                  </div>
                  
                  {/* 已领完/已过期 */}
                  {(outOfStock || expired) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {expired ? '活動已結束' : '已領完'}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* 商品名称 */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
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
                      <span>剩餘 {gift.stock} 件</span>
                    </div>
                    <Progress value={progress} className="h-2" />
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
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                      disabled={expired || outOfStock}
                    >
                      {expired ? '活動已結束' : outOfStock ? '已領完' : '立即領取'}
                      {!expired && !outOfStock && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 无数据提示 */}
        {gifts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Gift className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">暫無免費領取商品</p>
              <p className="text-sm text-muted-foreground mt-1">敬請期待更多活動</p>
            </CardContent>
          </Card>
        )}

        {/* 我的领取记录 */}
        <Card className="mt-6">
          <CardContent className="py-4">
            <Link href="/user/free-gifts" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
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
