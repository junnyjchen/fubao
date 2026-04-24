/**
 * @fileoverview 空状态组件
 * @description 友好的空状态展示
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Gift,
  Search,
  Filter,
  Package,
  Heart,
  Bell,
  ShoppingCart,
  RefreshCw,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  type: 'no_gifts' | 'no_search' | 'no_filter' | 'no_records' | 'no_favorites' | 'no_notifications' | 'custom';
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: EmptyStateAction;
  className?: string;
}

const defaultConfig: Record<string, { title: string; description: string; icon: React.ReactNode; action?: EmptyStateAction }> = {
  no_gifts: {
    title: '暫無免費商品',
    description: '敬請期待更多精彩活動',
    icon: <Gift className="w-16 h-16 text-muted-foreground/30" />,
    action: { label: '刷新看看', href: '' },
  },
  no_search: {
    title: '沒有找到相關商品',
    description: '試試其他關鍵詞',
    icon: <Search className="w-16 h-16 text-muted-foreground/30" />,
  },
  no_filter: {
    title: '沒有符合條件的商品',
    description: '調整篩選條件試試',
    icon: <Filter className="w-16 h-16 text-muted-foreground/30" />,
  },
  no_records: {
    title: '暫無領取記錄',
    description: '快去領取免費好物吧',
    icon: <Package className="w-16 h-16 text-muted-foreground/30" />,
    action: { label: '去領取', href: '/free-gifts' },
  },
  no_favorites: {
    title: '暫無收藏商品',
    description: '遇到喜歡的商品記得收藏哦',
    icon: <Heart className="w-16 h-16 text-muted-foreground/30" />,
    action: { label: '去逛逛', href: '/free-gifts' },
  },
  no_notifications: {
    title: '暫無消息通知',
    description: '有新活動會第一時間通知您',
    icon: <Bell className="w-16 h-16 text-muted-foreground/30" />,
  },
};

export function EmptyState({
  type,
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  const config = type !== 'custom' ? defaultConfig[type] : null;
  const displayTitle = title || config?.title || '';
  const displayDescription = description || config?.description || '';
  const displayIcon = icon || config?.icon;
  const displayAction = action || config?.action;

  return (
    <Card className={`text-center ${className}`}>
      <CardContent className="py-12">
        <div className="flex justify-center mb-4">
          {displayIcon}
        </div>
        <h3 className="font-medium text-lg mb-1">{displayTitle}</h3>
        <p className="text-muted-foreground text-sm mb-4">{displayDescription}</p>
        {displayAction && (
          displayAction.href ? (
            <Link href={displayAction.href}>
              <Button>
                {displayAction.label}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <Button onClick={displayAction.onClick}>
              {displayAction.label}
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 紧凑型空状态
 */
export function EmptyStateCompact({
  icon,
  title,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-8">
      {icon || <Gift className="w-10 h-10 text-muted-foreground/30 mb-2" />}
      <p className="text-sm text-muted-foreground">{title}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * 加载失败状态
 */
export function ErrorState({
  title = '加載失敗',
  description = '請檢查網絡後重試',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="text-center">
      <CardContent className="py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新加載
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 网络错误状态
 */
export function NetworkError({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <MapPin className="w-10 h-10 text-red-400" />
      </div>
      <p className="font-medium mb-1">網絡連接異常</p>
      <p className="text-sm text-muted-foreground mb-4">請檢查您的網絡設置</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          重試
        </Button>
      )}
    </div>
  );
}

/**
 * 活动已结束状态
 */
export function ActivityEnded({
  title = '活動已結束',
  nextActivity,
}: {
  title?: string;
  nextActivity?: { name: string; time: string };
}) {
  return (
    <Card className="text-center bg-muted/30">
      <CardContent className="py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm">
          感謝您的參與，敬請期待更多活動
        </p>
        {nextActivity && (
          <div className="mt-4 p-3 bg-background rounded-lg text-left">
            <p className="text-xs text-muted-foreground">下期活動預告</p>
            <p className="font-medium">{nextActivity.name}</p>
            <p className="text-sm text-muted-foreground">{nextActivity.time}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 倒计时状态（即将开始）
 */
export function ComingSoon({
  title,
  startTime,
  onRemind,
}: {
  title: string;
  startTime: Date;
  onRemind?: () => void;
}) {
  const getTimeLeft = () => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <Card className="text-center bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200/50">
      <CardContent className="py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
          <Clock className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">活動即將開始</p>
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{timeLeft.days}</p>
            <p className="text-xs text-muted-foreground">天</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{timeLeft.hours}</p>
            <p className="text-xs text-muted-foreground">小時</p>
          </div>
        </div>
        {onRemind && (
          <Button variant="outline" onClick={onRemind}>
            <Bell className="w-4 h-4 mr-2" />
            開始提醒我
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// 需要导入的hooks
import { useState, useEffect } from 'react';
