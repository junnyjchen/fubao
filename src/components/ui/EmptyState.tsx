/**
 * @fileoverview 空状态组件
 * @description 用于展示列表为空、搜索无结果等场景的统一空状态组件
 * @module components/ui/EmptyState
 */

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Package,
  Search,
  ShoppingCart,
  Heart,
  FileText,
  Video,
  Store,
  MessageSquare,
  Ticket,
  Bell,
  Inbox,
  AlertCircle,
  Construction,
  type LucideIcon,
} from 'lucide-react';

/**
 * 空状态类型预设
 */
export type EmptyStateType =
  | 'default'
  | 'search'
  | 'cart'
  | 'favorites'
  | 'orders'
  | 'goods'
  | 'articles'
  | 'videos'
  | 'merchants'
  | 'comments'
  | 'coupons'
  | 'notifications'
  | 'tickets'
  | 'error'
  | 'construction';

/**
 * 空状态预设配置
 */
const presets: Record<EmptyStateType, {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}> = {
  default: {
    icon: Inbox,
    title: '暫無數據',
    description: '這裡還沒有任何內容',
  },
  search: {
    icon: Search,
    title: '未找到相關結果',
    description: '請嘗試其他關鍵詞或篩選條件',
  },
  cart: {
    icon: ShoppingCart,
    title: '購物車是空的',
    description: '快去挑選心儀的商品吧',
    action: { label: '去購物', href: '/shop' },
  },
  favorites: {
    icon: Heart,
    title: '暫無收藏',
    description: '收藏您喜歡的商品，方便下次查看',
    action: { label: '去逛逛', href: '/shop' },
  },
  orders: {
    icon: Package,
    title: '暫無訂單',
    description: '您還沒有下過訂單',
    action: { label: '去購物', href: '/shop' },
  },
  goods: {
    icon: Package,
    title: '暫無商品',
    description: '該分類下還沒有商品',
    action: { label: '查看其他分類', href: '/shop' },
  },
  articles: {
    icon: FileText,
    title: '暫無文章',
    description: '這裡還沒有發布任何文章',
    action: { label: '瀏覽百科', href: '/wiki' },
  },
  videos: {
    icon: Video,
    title: '暫無視頻',
    description: '這裡還沒有發布任何視頻',
  },
  merchants: {
    icon: Store,
    title: '暫無商戶',
    description: '這裡還沒有入駐商戶',
  },
  comments: {
    icon: MessageSquare,
    title: '暫無評論',
    description: '成為第一個評論的人吧',
  },
  coupons: {
    icon: Ticket,
    title: '暫無優惠券',
    description: '繼續購物以獲取更多優惠券',
    action: { label: '去購物', href: '/shop' },
  },
  notifications: {
    icon: Bell,
    title: '暫無通知',
    description: '這裡會顯示您的消息通知',
  },
  tickets: {
    icon: AlertCircle,
    title: '暫無工單',
    description: '您還沒有提交過工單',
  },
  error: {
    icon: AlertCircle,
    title: '加載失敗',
    description: '請檢查網絡連接後重試',
  },
  construction: {
    icon: Construction,
    title: '功能開發中',
    description: '該功能正在緊鑼密鼓開發中，敬請期待',
  },
};

interface EmptyStateProps {
  /** 空状态类型预设 */
  type?: EmptyStateType;
  /** 自定义图标 */
  icon?: LucideIcon;
  /** 自定义标题 */
  title?: string;
  /** 自定义描述 */
  description?: string;
  /** 自定义操作按钮 */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** 额外的操作按钮 */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** 自定义图片URL */
  image?: string;
  /** 容器类名 */
  className?: string;
  /** 图标大小 */
  iconSize?: 'sm' | 'md' | 'lg';
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 子元素（自定义内容） */
  children?: React.ReactNode;
}

/**
 * 空状态组件
 * 
 * @example
 * // 使用预设类型
 * <EmptyState type="cart" />
 * 
 * @example
 * // 自定义内容
 * <EmptyState
 *   icon={Package}
 *   title="没有找到商品"
 *   description="尝试其他搜索条件"
 *   action={{ label: "清除筛选", onClick: handleClear }}
 * />
 */
export function EmptyState({
  type = 'default',
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  action: customAction,
  secondaryAction,
  image,
  className,
  iconSize = 'md',
  compact = false,
  children,
}: EmptyStateProps) {
  const preset = presets[type];
  
  const Icon = customIcon || preset.icon;
  const title = customTitle || preset.title;
  const description = customDescription || preset.description;
  const action = customAction || preset.action;

  const iconSizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const containerSizeClasses = compact
    ? 'py-8'
    : 'py-16';

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      containerSizeClasses,
      className
    )}>
      {/* 图片或图标 */}
      {image ? (
        <img 
          src={image} 
          alt={title}
          className="w-32 h-32 object-contain mb-4 opacity-60"
        />
      ) : (
        <div className={cn(
          'rounded-full bg-muted/50 flex items-center justify-center mb-4',
          iconSizeClasses[iconSize]
        )}>
          <Icon className={cn(
            'text-muted-foreground/60',
            iconSize === 'sm' && 'w-6 h-6',
            iconSize === 'md' && 'w-8 h-8',
            iconSize === 'lg' && 'w-12 h-12',
          )} />
        </div>
      )}

      {/* 标题 */}
      <h3 className={cn(
        'font-semibold text-foreground',
        compact ? 'text-base mb-1' : 'text-lg mb-2'
      )}>
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className={cn(
          'text-muted-foreground',
          compact ? 'text-sm mb-4' : 'text-base mb-6'
        )}>
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Button asChild>
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : 'onClick' in action && action.onClick ? (
              <Button onClick={action.onClick}>{action.label}</Button>
            ) : null
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : secondaryAction.onClick ? (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ) : null
          )}
        </div>
      )}

      {/* 自定义子元素 */}
      {children}
    </div>
  );
}

/**
 * 列表空状态包装器
 * 用于包裹列表组件，在列表为空时显示空状态
 */
interface EmptyListWrapperProps {
  /** 列表数据 */
  items: unknown[];
  /** 空状态类型 */
  emptyType?: EmptyStateType;
  /** 自定义空状态组件 */
  emptyComponent?: React.ReactNode;
  /** 子元素 */
  children: React.ReactNode;
}

export function EmptyListWrapper({
  items,
  emptyType = 'default',
  emptyComponent,
  children,
}: EmptyListWrapperProps) {
  if (!items || items.length === 0) {
    return emptyComponent || <EmptyState type={emptyType} />;
  }
  return <>{children}</>;
}

export default EmptyState;
