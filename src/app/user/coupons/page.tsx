/**
 * @fileoverview 我的优惠券页面
 * @description 用户查看已领取的优惠券
 * @module app/user/coupons/page
 */

'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { useI18n } from '@/lib/i18n';
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

// 优惠券卡片组件
const CouponCard = memo(function CouponCard({
  userCoupon,
  onUse,
  t,
  isRTL,
}: {
  userCoupon: UserCoupon;
  onUse: () => void;
  t: any;
  isRTL: boolean;
}) {
  const coupon = userCoupon.coupons;
  const cpn = t.userPage.coupon;

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
    return cpn.types[type] || type;
  };

  const formatDiscount = (c: typeof coupon) => {
    if (c.discount_type === 'percent') {
      return `${c.discount_value}%`;
    }
    return `HK$${c.discount_value}`;
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

  const getStatusBadge = () => {
    if (userCoupon.status === 'used') {
      return <Badge variant="secondary">{cpn.status.used}</Badge>;
    }
    if (userCoupon.status === 'expired' || isExpired(coupon.end_time)) {
      return <Badge variant="destructive">{cpn.status.expired}</Badge>;
    }
    const days = getRemainingDays(coupon.end_time);
    if (days <= 7) {
      return <Badge variant="outline" className="text-orange-600 border-orange-600">{cpn.status.expiringSoon}</Badge>;
    }
    return <Badge className="bg-green-600">{cpn.status.available}</Badge>;
  };

  const expired = isExpired(coupon.end_time);
  const disabled = userCoupon.status === 'used' || userCoupon.status === 'expired' || expired;
  const days = getRemainingDays(coupon.end_time);

  return (
    <Card
      className={`relative overflow-hidden animate-fade-in-up ${disabled ? 'opacity-60' : ''}`}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* 左侧金额区域 */}
          <div className={`w-28 bg-primary/10 flex flex-col items-center justify-center py-6 ${isRTL ? 'border-l border-dashed order-last' : 'border-r border-dashed'}`}>
            <div className="text-2xl font-bold text-primary">
              {formatDiscount(coupon)}
            </div>
            <div className={`text-xs text-muted-foreground mt-1 flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {getTypeIcon(coupon.type)}
              {getTypeLabel(coupon.type)}
            </div>
            <div className="mt-2">
              {getStatusBadge()}
            </div>
          </div>

          {/* 右侧信息区域 */}
          <div className={`flex-1 p-4 flex flex-col justify-between ${isRTL ? 'order-first' : ''}`}>
            <div>
              <div className={`flex items-start justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <p className="font-medium">{coupon.name}</p>
                {coupon.code && (
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {coupon.code}
                  </code>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-2">
                {coupon.description || ''}
              </p>

              <div className={`flex items-center gap-4 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{cpn.minAmount.replace('{amount}', coupon.min_amount.toString())}</span>
                {coupon.scope !== 'all' && (
                  <Badge variant="outline" className="text-xs">
                    {coupon.scope === 'category' ? cpn.limitedCategory : cpn.limitedProduct}
                  </Badge>
                )}
              </div>
            </div>

            <div className={`flex items-center justify-between mt-3 pt-3 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Clock className="w-3 h-3" />
                <span>
                  {userCoupon.status === 'used'
                    ? `${cpn.usedTime}: ${new Date(userCoupon.used_at!).toLocaleDateString()}`
                    : expired
                      ? cpn.expiredLabel
                      : days <= 7
                        ? cpn.daysLeft.replace('{days}', days.toString())
                        : `${new Date(coupon.end_time).toLocaleDateString()}`
                  }
                </span>
              </div>

              {!disabled && (
                <Button size="sm" asChild>
                  <Link href="/shop">
                    <ShoppingCart className={`w-3 h-3 ${isRTL ? 'ms-1' : 'me-1'}`} />
                    {cpn.goUse}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 装饰圆形 */}
        <div className={`absolute -top-3 w-6 h-6 bg-muted/20 rounded-full ${isRTL ? '-left-3' : '-right-3'}`} style={{ top: '50%', transform: 'translateY(-50%)' }} />
        <div className={`absolute -bottom-3 w-6 h-6 bg-muted/20 rounded-full ${isRTL ? '-right-3' : '-left-3'}`} style={{ top: '50%', transform: 'translateY(-50%)' }} />

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
});

// 统计卡片组件
const StatCard = memo(function StatCard({
  count,
  label,
  color,
  onClick,
  isActive,
}: {
  count: number;
  label: string;
  color?: string;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${isActive ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardContent className="py-4 text-center">
        <p className={`text-2xl font-bold ${color || ''}`}>{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
});

export default function MyCouponsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, isRTL } = useI18n();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showCouponSelector, setShowCouponSelector] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unused' | 'used' | 'expired'>('all');

  const cpn = t.userPage.coupon;

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

  const loadCoupons = useCallback(async () => {
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
  }, [user?.id]);

  const isExpired = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const filterCoupons = useCallback((status: string) => {
    if (status === 'all') return coupons;
    if (status === 'unused') {
      return coupons.filter(c => c.status === 'unused' && !isExpired(c.coupons.end_time));
    }
    if (status === 'expired') {
      return coupons.filter(c => c.status === 'expired' || isExpired(c.coupons.end_time));
    }
    return coupons.filter(c => c.status === status);
  }, [coupons]);

  // 统计数量
  const stats = {
    all: coupons.length,
    unused: coupons.filter(c => c.status === 'unused' && !isExpired(c.coupons.end_time)).length,
    used: coupons.filter(c => c.status === 'used').length,
    expired: coupons.filter(c => c.status === 'expired' || isExpired(c.coupons.end_time)).length,
  };

  const currentCoupons = filterCoupons(activeTab);

  if (authLoading || loading) {
    return <CouponListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className={isRTL ? 'text-end' : ''}>
            <h1 className={`text-xl font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Ticket className="w-5 h-5 text-primary" />
              {cpn.title}
            </h1>
            <p className="text-sm text-muted-foreground">{cpn.subtitle}</p>
          </div>
          <Button onClick={() => setShowCouponSelector(true)}>
            <Plus className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
            {cpn.receiveMore}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            count={stats.all}
            label={cpn.tabs.all}
            onClick={() => setActiveTab('all')}
            isActive={activeTab === 'all'}
          />
          <StatCard
            count={stats.unused}
            label={cpn.tabs.unused}
            color="text-green-600"
            onClick={() => setActiveTab('unused')}
            isActive={activeTab === 'unused'}
          />
          <StatCard
            count={stats.used}
            label={cpn.tabs.used}
            color="text-blue-600"
            onClick={() => setActiveTab('used')}
            isActive={activeTab === 'used'}
          />
          <StatCard
            count={stats.expired}
            label={cpn.tabs.expired}
            color="text-red-600"
            onClick={() => setActiveTab('expired')}
            isActive={activeTab === 'expired'}
          />
        </div>

        {/* 优惠券列表 */}
        {currentCoupons.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="py-16 text-center">
              <Ticket className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{cpn.noCoupon}</h3>
              <p className="text-muted-foreground mb-6">{cpn.noCouponDesc}</p>
              <Button onClick={() => setShowCouponSelector(true)}>
                <Plus className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                {cpn.receiveNow}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {currentCoupons.map((userCoupon) => (
              <CouponCard
                key={userCoupon.id}
                userCoupon={userCoupon}
                onUse={() => {}}
                t={t}
                isRTL={isRTL}
              />
            ))}
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
