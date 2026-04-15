'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck,
  Trash2,
  MessageSquare,
  Package,
  Gift,
  ShoppingCart,
  Loader2,
} from 'lucide-react';

interface Notification {
  id: number;
  type: 'system' | 'order' | 'promotion' | 'activity';
  title: string;
  content: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onMarkRead?: (id: number) => Promise<void>;
  onMarkAllRead?: () => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function NotificationList({
  notifications,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onLoadMore,
  hasMore = false,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return <NotificationListSkeleton count={5} />;
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellOff className="w-12 h-12" />}
        title="暂无通知"
        description="您还没有收到任何通知消息"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {unreadCount > 0 && onMarkAllRead && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm">
            有 <span className="font-medium text-primary">{unreadCount}</span> 条未读消息
          </span>
          <button
            onClick={onMarkAllRead}
            className="text-sm text-primary hover:underline"
          >
            全部标记为已读
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkRead={onMarkRead}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkRead?: (id: number) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

function NotificationCard({ notification, onMarkRead, onDelete }: NotificationCardProps) {
  const [loading, setLoading] = useState(false);
  const { success } = useToast();

  const handleMarkRead = async () => {
    if (!onMarkRead || notification.is_read) return;
    try {
      setLoading(true);
      await onMarkRead(notification.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    try {
      setLoading(true);
      await onDelete(notification.id);
      success('删除成功');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'promotion':
        return <Gift className="w-5 h-5 text-red-500" />;
      case 'activity':
        return <Bell className="w-5 h-5 text-green-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getLink = () => {
    if (!notification.data) return null;
    
    switch (notification.type) {
      case 'order':
        return `/order/${notification.data.order_id || ''}`;
      case 'goods':
        return `/goods/${notification.data.goods_id || ''}`;
      case 'article':
        return `/news/${notification.data.article_id || ''}`;
      default:
        return null;
    }
  };

  const link = getLink();
  const content = (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border transition-colors',
        notification.is_read
          ? 'bg-background hover:bg-muted/50'
          : 'bg-primary/5 hover:bg-primary/10'
      )}
    >
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-medium text-sm',
              !notification.is_read && 'text-foreground'
            )}>
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.content}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatRelativeTime(notification.created_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {!notification.is_read && onMarkRead && (
              <button
                onClick={handleMarkRead}
                disabled={loading}
                className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                title="标记已读"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary" />
      )}
    </div>
  );

  return (
    <div className="relative">
      {link ? (
        <Link href={link} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

// Notification Badge (for header)
interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
}

export function NotificationBadge({ count = 0, onClick }: NotificationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <>
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-medium bg-red-500 text-white rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        </>
      )}
    </button>
  );
}

// Notification Dot (small indicator)
interface NotificationDotProps {
  show?: boolean;
}

export function NotificationDot({ show = true }: NotificationDotProps) {
  if (!show) return null;
  
  return (
    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
  );
}

// Skeleton
export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-4 rounded-lg border">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Notification Group (grouped by date)
interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

interface NotificationGroupedListProps extends NotificationListProps {
  groups?: NotificationGroup[];
}

export function NotificationGroupedList({
  groups,
  ...props
}: NotificationGroupedListProps) {
  if (!groups || groups.length === 0) {
    return <NotificationList {...props} notifications={props.notifications} />;
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">
            {group.date}
          </h3>
          <NotificationList
            {...props}
            notifications={group.notifications}
          />
        </div>
      ))}
    </div>
  );
}
