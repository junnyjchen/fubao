/**
 * Empty State 空状态组件
 */

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title = '暂无数据',
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
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">{icon}</div>
      )}
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

// 预设的空状态图标
export function EmptyIcon({ type }: { type: 'cart' | 'favorites' | 'orders' | 'search' | 'data' | 'network' }) {
  const icons = {
    cart: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    favorites: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    orders: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    search: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    data: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    network: (
      <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
    ),
  };

  return icons[type];
}

// 常用空状态预设
export function CartEmpty({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<EmptyIcon type="cart" />}
      title="购物车是空的"
      description="快去挑选心仪的商品吧"
      action={
        onBrowse && (
          <button
            onClick={onBrowse}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            去逛逛
          </button>
        )
      }
    />
  );
}

export function FavoritesEmpty({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<EmptyIcon type="favorites" />}
      title="还没有收藏"
      description="收藏你喜欢的商品，随时查看"
      action={
        onBrowse && (
          <button
            onClick={onBrowse}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            去收藏
          </button>
        )
      }
    />
  );
}

export function OrdersEmpty({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={<EmptyIcon type="orders" />}
      title="暂无订单"
      description="你还没有任何订单记录"
      action={
        onBrowse && (
          <button
            onClick={onBrowse}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            去购物
          </button>
        )
      }
    />
  );
}

export function SearchEmpty({ keyword }: { keyword?: string }) {
  return (
    <EmptyState
      icon={<EmptyIcon type="search" />}
      title="未找到相关结果"
      description={keyword ? `未找到与"${keyword}"相关的内容` : '尝试其他关键词搜索'}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<EmptyIcon type="network" />}
      title="网络连接失败"
      description="请检查网络连接后重试"
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
        )
      }
    />
  );
}
