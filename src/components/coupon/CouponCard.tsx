'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Image } from '@/components/ui/image';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { 
  Ticket, 
  Check, 
  Clock, 
  Loader2,
  Gift,
  Calendar,
} from 'lucide-react';

interface Coupon {
  id: number;
  name: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_amount: number;
  max_discount?: number;
  total_count: number;
  remain_count: number;
  start_time: string;
  end_time: string;
  is_claimed?: boolean;
}

interface CouponCardProps {
  coupon: Coupon;
  onClaim: (id: number) => Promise<void>;
  size?: 'small' | 'normal';
}

export function CouponCard({ coupon, onClaim, size = 'normal' }: CouponCardProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleClaim = async () => {
    if (coupon.is_claimed) return;
    try {
      setLoading(true);
      await onClaim(coupon.id);
      success('领取成功');
    } catch (err) {
      error('领取失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = new Date(coupon.end_time) < new Date();
  const isOutOfStock = coupon.remain_count <= 0;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const discountText = coupon.type === 'fixed'
    ? `¥${coupon.value}`
    : `${coupon.value}%`;

  const minAmountText = coupon.min_amount > 0
    ? `满¥${coupon.min_amount}可用`
    : '无门槛';

  const isSmall = size === 'small';

  return (
    <div
      className={cn(
        'relative flex rounded-lg overflow-hidden',
        'border',
        isExpired || isOutOfStock || coupon.is_claimed
          ? 'bg-muted/30 border-muted'
          : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-100',
        isSmall ? 'h-24' : 'h-32'
      )}
    >
      {/* Left - Value */}
      <div
        className={cn(
          'flex flex-col justify-center items-center',
          'bg-gradient-to-b from-red-500 to-red-600',
          'text-white',
          isSmall ? 'w-24 px-2' : 'w-32 px-4'
        )}
      >
        <div className="flex items-baseline">
          <span className={cn('font-bold', isSmall ? 'text-xl' : 'text-3xl')}>
            {discountText}
          </span>
          {coupon.type === 'percentage' && (
            <span className="text-sm ml-0.5">折</span>
          )}
        </div>
        <span className={cn('text-white/80', isSmall ? 'text-xs' : 'text-sm')}>
          {minAmountText}
        </span>
        {coupon.max_discount && coupon.type === 'percentage' && (
          <span className={cn('text-white/60', isSmall ? 'text-xs' : 'text-xs')}>
            最高减¥{coupon.max_discount}
          </span>
        )}
      </div>

      {/* Right - Info */}
      <div className="flex-1 flex flex-col justify-between p-3">
        <div>
          <h3 className={cn('font-medium', isSmall ? 'text-sm' : 'text-base', 'line-clamp-1')}>
            {coupon.name}
          </h3>
          {!isSmall && (
            <p className="text-xs text-muted-foreground mt-1">
              剩余 {coupon.remain_count} 张
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {formatDate(coupon.start_time)} - {formatDate(coupon.end_time)}
            </span>
          </div>

          {coupon.is_claimed ? (
            <span className="flex items-center text-sm text-green-600 font-medium">
              <Check className="w-4 h-4 mr-1" />
              已领取
            </span>
          ) : isOutOfStock ? (
            <span className="text-sm text-muted-foreground">已抢光</span>
          ) : isExpired ? (
            <span className="text-sm text-muted-foreground">已过期</span>
          ) : (
            <Button
              size="sm"
              onClick={handleClaim}
              disabled={loading}
              className="h-7 px-3 bg-red-500 hover:bg-red-600"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                '立即领取'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Coupon List
interface CouponListProps {
  coupons: Coupon[];
  onClaim: (id: number) => Promise<void>;
  loading?: boolean;
}

export function CouponList({ coupons, onClaim, loading = false }: CouponListProps) {
  if (loading) {
    return <CouponListSkeleton count={3} />;
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无可领取的优惠券</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} onClaim={onClaim} />
      ))}
    </div>
  );
}

// Coupon Modal
interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: Coupon[];
  onClaim: (id: number) => Promise<void>;
  title?: string;
}

export function CouponModal({
  isOpen,
  onClose,
  coupons,
  onClaim,
  title = '领取优惠券',
}: CouponModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="max-h-[60vh] overflow-y-auto">
        <CouponList coupons={coupons} onClaim={onClaim} />
      </div>
    </Modal>
  );
}

// Coupon Badge (small display)
interface CouponBadgeProps {
  value: number;
  type: 'fixed' | 'percentage';
}

export function CouponBadge({ value, type }: CouponBadgeProps) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded">
      {type === 'fixed' ? `¥${value}` : `${value}折`}
    </span>
  );
}

// My Coupon Card (claimed coupons)
interface MyCouponCardProps {
  coupon: Coupon;
  status: 'unused' | 'used' | 'expired';
  onUse?: () => void;
}

export function MyCouponCard({ coupon, status, onUse }: MyCouponCardProps) {
  const isAvailable = status === 'unused' && new Date(coupon.end_time) >= new Date();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const discountText = coupon.type === 'fixed'
    ? `¥${coupon.value}`
    : `${coupon.value}%`;

  return (
    <div
      className={cn(
        'relative flex rounded-lg overflow-hidden',
        'border',
        !isAvailable && 'opacity-60'
      )}
    >
      {/* Left */}
      <div
        className={cn(
          'flex flex-col justify-center items-center text-white',
          isAvailable
            ? 'bg-gradient-to-b from-red-500 to-red-600'
            : 'bg-muted',
          'w-24 px-2'
        )}
      >
        <span className="text-2xl font-bold">{discountText}</span>
        {coupon.type === 'percentage' && (
          <span className="text-xs">折</span>
        )}
      </div>

      {/* Right */}
      <div className="flex-1 p-3 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{coupon.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            有效期至 {formatDate(coupon.end_time)}
          </p>
          {isAvailable && coupon.min_amount > 0 && (
            <p className="text-xs text-muted-foreground">
              满¥{coupon.min_amount}可用
            </p>
          )}
        </div>

        {status === 'used' && (
          <span className="text-xs text-muted-foreground">已使用</span>
        )}
        {status === 'expired' && (
          <span className="text-xs text-muted-foreground">已过期</span>
        )}
        {isAvailable && onUse && (
          <Button size="sm" onClick={onUse}>
            立即使用
          </Button>
        )}
      </div>

      {/* Used/Expired overlay */}
      {(status === 'used' || status === 'expired') && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-2xl font-bold text-muted-foreground/50">
            {status === 'used' ? '已使用' : '已过期'}
          </span>
        </div>
      )}
    </div>
  );
}

// Skeleton
export function CouponListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex h-32 rounded-lg border overflow-hidden">
          <div className="w-32 bg-muted animate-pulse" />
          <div className="flex-1 p-3 space-y-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-6 w-20 bg-muted animate-pulse rounded mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
