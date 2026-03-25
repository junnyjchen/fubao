/**
 * @fileoverview 空状态组件
 * @description 用于展示空数据状态的组件
 * @module components/ui/EmptyState
 */

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Search, 
  FileText, 
  ShoppingBag, 
  Heart,
  Bell,
  MessageSquare,
  Ticket,
  Image as ImageIcon,
  Folder,
  Inbox
} from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      {/* 图标 */}
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-muted-foreground" />}
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-medium mb-2">{title}</h3>

      {/* 描述 */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {action && (
        <Button asChild={!!action.href}>
          {action.href ? (
            <Link href={action.href}>{action.label}</Link>
          ) : (
            <button onClick={action.onClick}>{action.label}</button>
          )}
        </Button>
      )}
    </div>
  );
}

// 预设的空状态组件
export function EmptyOrders() {
  return (
    <EmptyState
      icon={<ShoppingBag className="w-8 h-8 text-muted-foreground" />}
      title="暫無訂單"
      description="您還沒有任何訂單，快去選購心儀的符箓法器吧"
      action={{ label: '去購物', href: '/shop' }}
    />
  );
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={<Heart className="w-8 h-8 text-muted-foreground" />}
      title="暫無收藏"
      description="收藏您喜歡的商品，方便下次查看"
      action={{ label: '去逛逛', href: '/shop' }}
    />
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={<Package className="w-8 h-8 text-muted-foreground" />}
      title="購物車是空的"
      description="快去選購您心儀的符箓法器吧"
      action={{ label: '去購物', href: '/shop' }}
    />
  );
}

export function EmptySearch({ keyword }: { keyword?: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-muted-foreground" />}
      title="未找到相關結果"
      description={
        keyword
          ? `沒有找到與"${keyword}"相關的商品或內容`
          : '請嘗試其他關鍵詞搜索'
      }
      action={{ label: '瀏覽全部商品', href: '/shop' }}
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8 text-muted-foreground" />}
      title="暫無消息"
      description="您沒有新的消息通知"
    />
  );
}

export function EmptyCoupons() {
  return (
    <EmptyState
      icon={<Ticket className="w-8 h-8 text-muted-foreground" />}
      title="暫無優惠券"
      description="快去領取優惠券，享受更多折扣"
      action={{ label: '領取優惠券', href: '/coupons' }}
    />
  );
}

export function EmptyReviews() {
  return (
    <EmptyState
      icon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
      title="暫無評價"
      description="購買商品後可以發表評價"
    />
  );
}

export function EmptyArticles() {
  return (
    <EmptyState
      icon={<FileText className="w-8 h-8 text-muted-foreground" />}
      title="暫無文章"
      description="敬請期待更多玄門文化內容"
    />
  );
}

export function EmptyImages() {
  return (
    <EmptyState
      icon={<ImageIcon className="w-8 h-8 text-muted-foreground" />}
      title="暫無圖片"
      description="上傳圖片來分享您的心願達成故事"
    />
  );
}

export function EmptyData() {
  return (
    <EmptyState
      icon={<Folder className="w-8 h-8 text-muted-foreground" />}
      title="暫無數據"
      description="這裡還沒有任何數據"
    />
  );
}

// 管理后台空状态
export function EmptyAdminData({
  title = '暫無數據',
  description,
  actionLabel,
  actionHref,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <EmptyState
      icon={<Folder className="w-8 h-8 text-muted-foreground" />}
      title={title}
      description={description}
      action={actionLabel && actionHref ? { label: actionLabel, href: actionHref } : undefined}
    />
  );
}
