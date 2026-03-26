/**
 * @fileoverview 推荐商品组件
 * @description 商品详情页底部推荐
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, Truck, MapPin, ChevronRight, Flame } from 'lucide-react';

interface RecommendGift {
  id: number;
  name: string;
  image: string | null;
  original_price: string;
  stock: number;
  claimed: number;
  shipping_fee: string;
  category?: string;
  rating?: number;
}

interface RecommendListProps {
  title?: string;
  subtitle?: string;
  gifts: RecommendGift[];
  currentId?: number;
  maxShow?: number;
  layout?: 'horizontal' | 'grid';
}

export function RecommendList({
  title = '猜你喜歡',
  subtitle = '更多免費好物等你領',
  gifts,
  currentId,
  maxShow = 6,
  layout = 'grid',
}: RecommendListProps) {
  // 过滤当前商品
  const displayGifts = gifts
    .filter(g => g.id !== currentId)
    .slice(0, maxShow);

  if (displayGifts.length === 0) return null;

  const getProgress = (gift: RecommendGift) => {
    const total = gift.stock + gift.claimed;
    return total > 0 ? Math.round((gift.claimed / total) * 100) : 0;
  };

  if (layout === 'horizontal') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Link 
            href="/free-gifts" 
            className="text-sm text-primary flex items-center gap-1"
          >
            查看更多
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {displayGifts.map((gift) => (
            <Link 
              key={gift.id} 
              href={`/free-gifts/${gift.id}`}
              className="flex-shrink-0 w-36"
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-100">
                  {gift.image ? (
                    <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Gift className="w-10 h-10 text-red-300" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                    免費
                  </Badge>
                </div>
                <CardContent className="p-2">
                  <p className="text-xs font-medium line-clamp-2">{gift.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-through">
                    HK${gift.original_price}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link 
          href="/free-gifts" 
          className="text-sm text-primary flex items-center gap-1"
        >
          查看更多
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {displayGifts.map((gift) => {
          const progress = getProgress(gift);
          const isHot = progress >= 70;

          return (
            <Link key={gift.id} href={`/free-gifts/${gift.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gradient-to-br from-red-100 to-orange-100">
                  {gift.image ? (
                    <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Gift className="w-12 h-12 text-red-300" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                    免費
                  </Badge>
                  {isHot && (
                    <Badge className="absolute top-2 right-2 bg-orange-500 text-white">
                      <Flame className="w-3 h-3 mr-1" />
                      熱門
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm line-clamp-1">{gift.name}</p>
                  
                  <div className="flex items-center justify-between mt-1.5 mb-2">
                    <span className="text-xs text-muted-foreground line-through">
                      HK${gift.original_price}
                    </span>
                    {gift.rating && (
                      <span className="text-xs text-yellow-600">
                        ★ {gift.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>已領 {gift.claimed}</span>
                    <span>剩 {gift.stock}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 热门推荐横幅
 */
export function HotRecommendBanner({ 
  gifts,
  onMoreClick,
}: { 
  gifts: RecommendGift[];
  onMoreClick?: () => void;
}) {
  if (gifts.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200/50">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">熱門好物</p>
              <p className="text-xs text-muted-foreground">
                {gifts.slice(0, 3).map(g => g.name).join(' · ')}
              </p>
            </div>
          </div>
          <Link 
            href="/free-gifts?filter=hot" 
            className="text-sm text-primary flex items-center gap-1"
          >
            去看看
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
