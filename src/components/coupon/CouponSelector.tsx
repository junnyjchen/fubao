/**
 * @fileoverview 优惠券选择组件
 * @description 在商品详情页和结算页选择可用优惠券
 * @module components/coupon/CouponSelector
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Percent,
  Truck,
  Gift,
  Loader2,
  Ticket,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
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
  received?: boolean;
  can_receive?: boolean;
  user_coupon_id?: number;
}

interface CouponSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  goodsId?: number;
  orderAmount?: number;
  onSelect?: (coupon: Coupon | null) => void;
  mode?: 'receive' | 'select'; // receive-领取优惠券, select-选择优惠券
  selectedCouponId?: number;
}

export function CouponSelector({
  open,
  onOpenChange,
  userId,
  goodsId,
  orderAmount,
  onSelect,
  mode = 'receive',
  selectedCouponId,
}: CouponSelectorProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [receivingId, setReceivingId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadCoupons();
    }
  }, [open, mode, userId, goodsId, orderAmount]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      let url = '/api/coupons?type=';
      
      if (mode === 'select' && userId && orderAmount) {
        url += `available_for_order&userId=${userId}&amount=${orderAmount}`;
        if (goodsId) url += `&goodsId=${goodsId}`;
      } else {
        url += 'available';
        if (userId) url += `&userId=${userId}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      
      if (result.success) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('加载优惠券失败:', error);
      setCoupons(getMockCoupons(mode));
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveCoupon = async (couponId: number) => {
    if (!userId) {
      toast.error('請先登錄');
      return;
    }

    setReceivingId(couponId);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, couponId }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success('領取成功');
        loadCoupons();
      } else {
        toast.error(result.error || '領取失敗');
      }
    } catch (error) {
      console.error('领取优惠券失败:', error);
      toast.error('領取失敗，請重試');
    } finally {
      setReceivingId(null);
    }
  };

  const handleSelectCoupon = (coupon: Coupon | null) => {
    onSelect?.(coupon);
    onOpenChange(false);
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

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percent') {
      return `${coupon.discount_value}%`;
    }
    return `HK$${coupon.discount_value}`;
  };

  const isExpired = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const isNotStarted = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            {mode === 'receive' ? '領取優惠券' : '選擇優惠券'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'receive' 
              ? '領取可用優惠券，購物時自動抵扣' 
              : '選擇一張優惠券用於當前訂單'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暫無可用優惠券</p>
            </div>
          ) : (
            coupons.map((coupon) => {
              const expired = isExpired(coupon.end_time);
              const notStarted = isNotStarted(coupon.start_time);
              const disabled = expired || notStarted;
              const isSelected = coupon.id === selectedCouponId;

              return (
                <Card
                  key={coupon.id}
                  className={`relative overflow-hidden transition-all ${
                    disabled ? 'opacity-60' : ''
                  } ${isSelected ? 'ring-2 ring-primary' : ''} ${
                    mode === 'select' && !disabled ? 'cursor-pointer hover:shadow-md' : ''
                  }`}
                  onClick={() => {
                    if (mode === 'select' && !disabled) {
                      handleSelectCoupon(coupon);
                    }
                  }}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* 左侧金额区域 */}
                      <div className="w-24 bg-primary/10 flex flex-col items-center justify-center py-4 border-r border-dashed">
                        <div className="text-2xl font-bold text-primary">
                          {formatDiscount(coupon)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {getTypeLabel(coupon.type)}
                        </div>
                      </div>

                      {/* 右侧信息区域 */}
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{coupon.name}</p>
                            {coupon.code && (
                              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {coupon.code}
                              </code>
                            )}
                          </div>
                          {mode === 'receive' && (
                            <Button
                              size="sm"
                              variant={coupon.received ? 'outline' : 'default'}
                              disabled={coupon.received || !coupon.can_receive || receivingId === coupon.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReceiveCoupon(coupon.id);
                              }}
                            >
                              {receivingId === coupon.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : coupon.received ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  已領取
                                </>
                              ) : (
                                '立即領取'
                              )}
                            </Button>
                          )}
                          {mode === 'select' && isSelected && (
                            <Badge className="bg-primary">
                              <Check className="w-3 h-3 mr-1" />
                              已選擇
                            </Badge>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {coupon.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>滿HK${coupon.min_amount}可用</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {expired 
                                ? '已過期' 
                                : notStarted 
                                  ? '即將開始'
                                  : `${new Date(coupon.end_time).toLocaleDateString()} 到期`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 装饰圆形 */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background rounded-full" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {mode === 'select' && selectedCouponId && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSelectCoupon(null)}
            >
              <X className="w-4 h-4 mr-2" />
              不使用優惠券
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// 模拟数据
function getMockCoupons(mode: string): Coupon[] {
  const baseCoupons: Coupon[] = [
    {
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
      received: false,
      can_receive: true,
    },
    {
      id: 2,
      name: '開年大促優惠券',
      code: 'SPRING2025',
      type: 'discount',
      discount_type: 'percent',
      discount_value: 15,
      min_amount: 300,
      max_discount: 100,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      description: '全場滿HK$300享85折',
      received: false,
      can_receive: true,
    },
    {
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
      received: true,
      can_receive: false,
    },
  ];

  if (mode === 'select') {
    return baseCoupons.map(c => ({ ...c, user_coupon_id: c.id }));
  }

  return baseCoupons;
}
