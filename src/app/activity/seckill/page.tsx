/**
 * @fileoverview 秒杀活动页面
 * @description 限时秒杀活动
 * @module app/activity/seckill/page
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Clock,
  ShoppingCart,
  Flame,
  AlertCircle,
  Loader2,
  Bell,
  Heart,
  BellOff,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { ShareButton } from '@/components/free-gifts/ShareButton';
import { SeckillSkeleton } from '@/components/common/PageSkeletons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

/** 秒杀商品类型 */
interface SeckillGoods {
  id: number;
  activity_id: number;
  goods_id: number;
  seckill_price: string;
  seckill_stock: number;
  seckill_sales: number;
  limit_per_user: number;
  start_time: string;
  end_time: string;
  goods: {
    id: number;
    name: string;
    main_image: string | null;
    price: string;
    original_price: string | null;
    stock: number;
    sales: number;
    merchants?: { name: string } | null;
  } | null;
}

/** 时间段类型 */
interface TimeSlot {
  id: number;
  label: string;
  time: string;
  status: 'upcoming' | 'active' | 'ended';
}

/** 商品提醒状态 */
interface ReminderState {
  [key: number]: { reminded: boolean; type: string };
}

/** 商品收藏状态 */
interface FavoriteState {
  [key: number]: boolean;
}

/**
 * 秒杀活动页面组件
 */
export default function SeckillPage() {
  const [seckillGoods, setSeckillGoods] = useState<SeckillGoods[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimeSlot, setActiveTimeSlot] = useState<string>('now');
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [reminders, setReminders] = useState<ReminderState>({});
  const [favorites, setFavorites] = useState<FavoriteState>({});
  const [reminderLoading, setReminderLoading] = useState<number | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);

  // 时间段列表
  const timeSlots: TimeSlot[] = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const slots: TimeSlot[] = [];
    
    // 生成时间段（每2小时一个）
    for (let i = 0; i < 12; i++) {
      const slotHour = Math.floor(i * 2);
      const nextHour = slotHour + 2;
      const timeStr = `${slotHour.toString().padStart(2, '0')}:00`;
      
      let status: 'upcoming' | 'active' | 'ended' = 'upcoming';
      if (currentHour >= slotHour && currentHour < nextHour) {
        status = 'active';
      } else if (currentHour >= nextHour) {
        status = 'ended';
      }
      
      slots.push({
        id: i + 1,
        label: status === 'active' ? '搶購中' : status === 'ended' ? '已結束' : '即將開始',
        time: timeStr,
        status,
      });
    }
    
    return slots;
  }, []);

  // 倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const endTime = new Date();
      endTime.setHours(Math.ceil(now.getHours() / 2) * 2, 0, 0, 0);
      
      const diff = endTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdown({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 加载秒杀商品
  useEffect(() => {
    loadSeckillGoods();
  }, [activeTimeSlot]);

  const loadSeckillGoods = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/activities/seckill');
      const result = await res.json();
      if (result.success) {
        setSeckillGoods(result.data);
      }
    } catch (error) {
      console.error('加载秒杀商品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算销售进度
  const getProgress = (item: SeckillGoods) => {
    const total = item.seckill_stock + item.seckill_sales;
    if (total === 0) return 0;
    return Math.round((item.seckill_sales / total) * 100);
  };

  // 判断是否售罄
  const isSoldOut = (item: SeckillGoods) => {
    return item.seckill_stock <= 0;
  };

  // 加入购物车
  const handleAddToCart = async (item: SeckillGoods) => {
    if (!item.goods) return;
    
    if (isSoldOut(item)) {
      toast.error('商品已售罄');
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goodsId: item.goods_id,
          quantity: 1,
        }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('已加入購物車');
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('加入购物车失败:', error);
      toast.error('操作失敗，請重試');
    }
  };

  // 立即抢购
  const handleBuyNow = async (item: SeckillGoods) => {
    if (!item.goods) return;
    
    if (isSoldOut(item)) {
      toast.error('商品已售罄');
      return;
    }

    // 跳转到商品详情页
    window.location.href = `/shop/${item.goods_id}?seckill=true`;
  };

  // 设置提醒
  const handleSetReminder = async (item: SeckillGoods, type: string) => {
    setReminderLoading(item.id);
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setReminders(prev => ({
      ...prev,
      [item.id]: { reminded: true, type }
    }));
    setReminderLoading(null);
    
    const typeText = {
      '5min': '5分鐘前',
      '30min': '30分鐘前',
      '1hour': '1小時前',
    }[type] || type;
    
    toast.success(`已設置${typeText}提醒`);
  };

  // 取消提醒
  const handleCancelReminder = async (item: SeckillGoods) => {
    setReminderLoading(item.id);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setReminders(prev => {
      const newReminders = { ...prev };
      delete newReminders[item.id];
      return newReminders;
    });
    setReminderLoading(null);
    
    toast.success('已取消提醒');
  };

  // 切换收藏
  const handleToggleFavorite = async (item: SeckillGoods) => {
    setFavoriteLoading(item.id);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const isFavorited = favorites[item.id];
    setFavorites(prev => ({
      ...prev,
      [item.id]: !prev[item.id]
    }));
    setFavoriteLoading(null);
    
    toast.success(isFavorited ? '已取消收藏' : '已添加收藏');
  };

  // 获取即将开始的场次
  const upcomingSlots = useMemo(() => {
    return timeSlots.filter(slot => slot.status === 'upcoming').slice(0, 3);
  }, [timeSlots]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-background">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-8 relative">
        {/* 返回按钮 */}
        <Link href="/activity" className="absolute left-4 top-4 md:left-8 md:top-6">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4 mr-1" />
            返回活動中心
          </Button>
        </Link>
        
        {/* 分享按钮 */}
        <div className="absolute right-4 top-4 md:right-8 md:top-6">
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title="限時秒殺活動"
            description="精選好貨，限時特價，快來搶購！"
            variant="ghost"
            size="sm"
            showText={false}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">限時秒殺</h1>
          </div>
          <p className="text-center text-red-100 mb-6">
            精選好貨，限時特價，手慢無！
          </p>
          
          {/* 倒计时 */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-red-100">距離結束</span>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 backdrop-blur px-3 py-2 rounded-lg">
                <span className="text-2xl font-bold">
                  {countdown.hours.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xl">:</span>
              <div className="bg-white/20 backdrop-blur px-3 py-2 rounded-lg">
                <span className="text-2xl font-bold">
                  {countdown.minutes.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="text-xl">:</span>
              <div className="bg-white/20 backdrop-blur px-3 py-2 rounded-lg">
                <span className="text-2xl font-bold">
                  {countdown.seconds.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 时间段选择 */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => slot.status !== 'ended' && setActiveTimeSlot(slot.time)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border-2 transition-all min-w-[80px] ${
                activeTimeSlot === slot.time
                  ? 'border-red-500 bg-red-50 text-red-600 shadow-sm'
                  : slot.status === 'active'
                  ? 'border-red-200 bg-white text-red-500 hover:border-red-500 hover:bg-red-50'
                  : slot.status === 'ended'
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:bg-red-50/50'
              }`}
              disabled={slot.status === 'ended'}
            >
              <div className="text-sm font-medium">{slot.time}</div>
              <div className="text-xs mt-0.5">{slot.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 即将开始的秒杀预告 */}
      {upcomingSlots.length > 0 && (
        <div className="container mx-auto px-4 py-2">
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-orange-700">即將開始</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {upcomingSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="px-3 py-2 bg-white rounded-lg border border-orange-200 text-sm"
                  >
                    <span className="font-medium text-orange-600">{slot.time}</span>
                    <span className="text-muted-foreground ml-2">場次</span>
                    <Button variant="ghost" size="sm" className="ml-2 h-6 px-2 text-xs">
                      <Bell className="w-3 h-3 mr-1" />
                      提醒我
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 商品列表 */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <SeckillSkeleton />
        ) : seckillGoods.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>暫無秒殺商品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {seckillGoods.map((item) => (
              <Card 
                key={item.id} 
                className={`overflow-hidden hover:shadow-lg transition-all ${
                  isSoldOut(item) ? 'opacity-60' : ''
                }`}
              >
                <div className="relative aspect-square bg-muted">
                  {item.goods?.main_image ? (
                    <Image
                      src={item.goods.main_image}
                      alt={item.goods.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-red-100 to-red-50">
                      <Zap className="w-16 h-16 text-red-300" />
                    </div>
                  )}
                  
                  {/* 秒杀标签 */}
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-red-500 text-white">
                      <Flame className="w-3 h-3 mr-1" />
                      秒殺
                    </Badge>
                  </div>
                  
                  {/* 收藏和提醒按钮 */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="w-8 h-8 bg-white/90 hover:bg-white"
                      onClick={() => handleToggleFavorite(item)}
                      disabled={favoriteLoading === item.id}
                    >
                      {favoriteLoading === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : favorites[item.id] ? (
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      ) : (
                        <Heart className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className={`w-8 h-8 bg-white/90 hover:bg-white ${
                            reminders[item.id]?.reminded ? 'text-orange-500' : ''
                          }`}
                          disabled={reminderLoading === item.id}
                        >
                          {reminderLoading === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : reminders[item.id]?.reminded ? (
                            <BellOff className="w-4 h-4" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {reminders[item.id]?.reminded ? (
                          <>
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                              已設置提醒
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleCancelReminder(item)}
                              className="text-destructive"
                            >
                              <BellOff className="w-4 h-4 mr-2" />
                              取消提醒
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuLabel>設置開搶提醒</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSetReminder(item, '5min')}>
                              <Bell className="w-4 h-4 mr-2" />
                              開始前5分鐘
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetReminder(item, '30min')}>
                              <Bell className="w-4 h-4 mr-2" />
                              開始前30分鐘
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetReminder(item, '1hour')}>
                              <Bell className="w-4 h-4 mr-2" />
                              開始前1小時
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* 售罄标记 */}
                  {isSoldOut(item) && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="secondary" className="text-lg px-4 py-2">
                        已售罄
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <Link href={`/shop/${item.goods_id}`}>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2 hover:text-red-600 transition-colors">
                      {item.goods?.name}
                    </h3>
                  </Link>
                  
                  {/* 价格 */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-bold text-red-600">
                      HK${item.seckill_price}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      HK${item.goods?.price}
                    </span>
                  </div>
                  
                  {/* 进度条 */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>已搶 {item.seckill_sales} 件</span>
                      <span>{getProgress(item)}%</span>
                    </div>
                    <Progress value={getProgress(item)} className="h-2" />
                  </div>
                  
                  {/* 限购提示 */}
                  <div className="text-xs text-muted-foreground mb-3">
                    限購 {item.limit_per_user} 件 | 剩餘 {item.seckill_stock} 件
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(item)}
                      disabled={isSoldOut(item)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      加入購物車
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => handleBuyNow(item)}
                      disabled={isSoldOut(item)}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      立即搶購
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* 活动规则 */}
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              活動規則
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>1. 秒殺商品數量有限，先到先得，搶完即止；</li>
              <li>2. 每人限購數量以商品詳情頁顯示為準；</li>
              <li>3. 秒殺商品不與其他優惠同享；</li>
              <li>4. 秒殺商品一經售出，非質量問題不支持退換；</li>
              <li>5. 如有疑問，請聯繫客服諮詢。</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
