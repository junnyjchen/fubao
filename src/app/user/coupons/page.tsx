/**
 * @fileoverview 我的优惠券页面
 * @description 用户查看已领取的优惠券
 * @module app/user/coupons/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  Percent,
  Truck,
  Gift,
  Ticket,
  Clock,
  Check,
  X,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { CouponSelector } from '@/components/coupon/CouponSelector';
import { CouponListSkeleton } from '@/components/common/PageSkeletons';

interface UserCoupon {
  id: number;
  coupon_id: number;
  status: string;
  received_at: string;
  used_at: string | null;
  coupons: {
    id: number;
    name: string;
    code: string | null;
    type: string;
    discount_type: string;
    discount_value: number;
    min_amount: number;
    max_discount: number | null;
    start_time: string;
    end_time: string;
    description: string | null;
    scope: string;
  };
}

export default function MyCouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthDialog(true);
      setLoading(false);
      return;
    }
    
    if (user) {
      loadCoupons();
    }
  }, [user, authLoading]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coupons?type=my&userId=${user?.id}`);
      const result = await res.json();
      if (result.success) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
      setCoupons(getMockCoupons());
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <DollarSign className="w-5 h-5" />;
      case 'discount':
        return <Percent className="w-5 h-5" />;
      case 'shipping':
        return <Truck className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return '現金券';
      case 'discount':
        return '折扣券';
      case 'shipping':
        return '免運費券';
      default:
        return type;
    }
  };

  const formatDiscount = (coupon: UserCoupon['coupons']) => {
    if (coupon.discount_type === 'percent') {
      return `${coupon.discount_value}%`;
    }
    return `HK$${coupon.discount_value}`;
  };

  const isExpired = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const getRemainingDays = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const filterCoupons = (status: string) => {
    if (status === 'all') return coupons;
    return coupons.filter(c => c.status === status);
  };

  const getStatusBadge = (coupon: UserCoupon) => {
    if (coupon.status === 'used') {
      return <Badge variant="secondary">已使用</Badge>;
    }
    if (coupon.status === 'expired' || isExpired(coupon.coupons.end_time)) {
      return <Badge variant="destructive">已過期</Badge>;
    }
    const days = getRemainingDays(coupon.coupons.end_time);
    if (days <= 7) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">即將到期</Badge>;
    }
    return <Badge className="bg-green-600">可使用</Badge>;
  };

  const currentCoupons = filterCoupons(activeTab);

  // 统计数量
  const stats = {
    all: coupons.length,
    unused: coupons.filter(c => c.status === 'unused' && !isExpired(c.coupons.end_time)).length,
    used: coupons.filter(c => c.status === 'used').length,
    expired: coupons.filter(c => c.status === 'expired' || isExpired(c.coupons.end_time)).length,
  };

  if (authLoading || loading) {
    return <CouponListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              我的優惠券
            </h1>
            <p className="text-sm text-muted-foreground">管理您已領取的優惠券</p>
          </div>
          <Button onClick={() => setShowCouponSelector(true)}>
            <Plus className="w-4 h-4 mr-2" />
            領取更多
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('all')}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold">{stats.all}</p>
              <p className="text-sm text-muted-foreground">全部</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('unused')}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-green-600">{stats.unused}</p>
              <p className="text-sm text-muted-foreground">可使用</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('used')}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
              <p className="text-sm text-muted-foreground">已使用</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('expired')}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">已過期</p>
            </CardContent>
          </Card>
        </div>

        {/* 优惠券列表 */}
        {currentCoupons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Ticket className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">暫無優惠券</h3>
              <p className="text-muted-foreground mb-6">快去領取優惠券，享受更多折扣吧！</p>
              <Button onClick={() => setShowCouponSelector(true)}>
                <Plus className="w-4 h-4 mr-2" />
                領取優惠券
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {currentCoupons.map((userCoupon) => {
              const coupon = userCoupon.coupons;
              const expired = isExpired(coupon.end_time);
              const disabled = userCoupon.status === 'used' || userCoupon.status === 'expired' || expired;
              const days = getRemainingDays(coupon.end_time);

              return (
                <Card
                  key={userCoupon.id}
                  className={`relative overflow-hidden ${disabled ? 'opacity-60' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* 左侧金额区域 */}
                      <div className="w-28 bg-primary/10 flex flex-col items-center justify-center py-6 border-r border-dashed">
                        <div className="text-2xl font-bold text-primary">
                          {formatDiscount(coupon)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          {getTypeIcon(coupon.type)}
                          {getTypeLabel(coupon.type)}
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(userCoupon)}
                        </div>
                      </div>

                      {/* 右侧信息区域 */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium">{coupon.name}</p>
                            {coupon.code && (
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {coupon.code}
                              </code>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {coupon.description || '無使用說明'}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>滿HK${coupon.min_amount}可用</span>
                            {coupon.scope !== 'all' && (
                              <Badge variant="outline" className="text-xs">
                                {coupon.scope === 'category' ? '限定分類' : '限定商品'}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              {userCoupon.status === 'used' 
                                ? `使用時間: ${new Date(userCoupon.used_at!).toLocaleDateString()}`
                                : expired 
                                  ? '已過期'
                                  : days <= 7 
                                    ? `${days}天後到期`
                                    : `${new Date(coupon.end_time).toLocaleDateString()} 到期`
                              }
                            </span>
                          </div>
                          
                          {!disabled && (
                            <Button size="sm" asChild>
                              <Link href="/shop">
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                去使用
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 装饰圆形 */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-muted/20 rounded-full" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-muted/20 rounded-full" />

                    {/* 已使用/已过期标记 */}
                    {disabled && (
                      <div className="absolute top-4 right-4">
                        {userCoupon.status === 'used' ? (
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="w-6 h-6 text-red-600" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      {/* Coupon Selector */}
      <CouponSelector
        open={showCouponSelector}
        onOpenChange={setShowCouponSelector}
        userId={user?.id}
        mode="receive"
      />
    </div>
  );
}

// 模拟数据
function getMockCoupons(): UserCoupon[] {
  return [
    {
      id: 101,
      coupon_id: 1,
      status: 'unused',
      received_at: '2026-03-20T10:00:00',
      used_at: null,
      coupons: {
        id: 1,
        name: '新用戶專享券',
        code: 'NEWUSER50',
        type: 'cash',
        discount_type: 'fixed',
        discount_value: 50,
        min_amount: 200,
        max_discount: null,
        start_time: '2024-01-01T00:00:00',
        end_time: '2026-12-31T23:59:59',
        description: '新用戶首單立減HK$50',
        scope: 'all',
      },
    },
    {
      id: 102,
      coupon_id: 2,
      status: 'unused',
      received_at: '2026-03-18T10:00:00',
      used_at: null,
      coupons: {
        id: 2,
        name: '開年大促優惠券',
        code: 'SPRING2025',
        type: 'discount',
        discount_type: 'percent',
        discount_value: 15,
        min_amount: 300,
        max_discount: 100,
        start_time: '2024-01-01T00:00:00',
        end_time: '2026-03-28T23:59:59',
        description: '全場滿HK$300享85折',
        scope: 'all',
      },
    },
    {
      id: 103,
      coupon_id: 3,
      status: 'used',
      received_at: '2026-03-10T10:00:00',
      used_at: '2026-03-15T14:30:00',
      coupons: {
        id: 3,
        name: '免運費券',
        code: 'FREESHIP',
        type: 'shipping',
        discount_type: 'fixed',
        discount_value: 30,
        min_amount: 100,
        max_discount: null,
        start_time: '2024-01-01T00:00:00',
        end_time: '2026-12-31T23:59:59',
        description: '滿HK$100免運費',
        scope: 'all',
      },
    },
  ];
}
