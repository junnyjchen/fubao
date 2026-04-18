/**
 * @fileoverview 加载状态组件
 * @description 提供多种加载状态的展示组件
 * @module components/common/LoadingStates
 */

'use client';

import { cn } from '@/lib/utils';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 中心加载动画
 */
interface LoadingSpinnerProps {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 自定义类名 */
  className?: string;
  /** 加载文案 */
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <p className={cn('text-muted-foreground', textSizes[size])}>{text}</p>
      )}
    </div>
  );
}

/**
 * 全屏加载状态
 */
interface FullPageLoadingProps {
  text?: string;
}

export function FullPageLoading({ text = '加载中...' }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 w-12 h-12 animate-ping opacity-20">
            <Loader2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        <p className="text-lg font-medium text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

/**
 * 内联加载状态
 */
interface InlineLoadingProps {
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

export function InlineLoading({ size = 'md', className }: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Loader2 className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)} />
  );
}

/**
 * 骨架屏加载状态
 */
interface SkeletonLoaderProps {
  /** 行数 */
  lines?: number;
  /** 高度 */
  height?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
}

export function SkeletonLoader({ lines = 3, height = 'md', className }: SkeletonLoaderProps) {
  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-muted/50 rounded animate-pulse',
            heightClasses[height],
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * 脉冲点加载动画
 */
interface PulsingDotsProps {
  count?: number;
  className?: string;
}

export function PulsingDots({ count = 3, className }: PulsingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

/**
 * 加载失败状态
 */
interface LoadErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function LoadError({ message = '加载失败', onRetry, className }: LoadErrorProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-8', className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      )}
    </div>
  );
}

/**
 * 空状态
 */
interface EmptyStateProps {
  /** 图标 */
  icon?: React.ReactNode;
  /** 标题 */
  title: string;
  /** 描述 */
  description?: string;
  /** 操作按钮 */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** 自定义类名 */
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12 px-4', className)}>
      {icon && (
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="text-center space-y-2">
        <h3 className="font-medium text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
        )}
      </div>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * 分页加载更多
 */
interface LoadMoreProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function LoadMore({ hasMore, loading, onLoadMore, children, className }: LoadMoreProps) {
  if (!hasMore) {
    return children ? (
      <div className={cn('py-4 text-center text-sm text-muted-foreground', className)}>
        {children}
      </div>
    ) : null;
  }

  return (
    <div className={cn('py-4 text-center', className)}>
      {loading ? (
        <InlineLoading className="mr-2" />
      ) : (
        <Button variant="ghost" onClick={onLoadMore}>
          加载更多
        </Button>
      )}
    </div>
  );
}

/**
 * 渐进式加载动画
 */
interface ProgressiveLoadingProps {
  /** 百分比 */
  progress?: number;
  /** 是否完成 */
  complete?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function ProgressiveLoading({ progress = 0, complete = false, className }: ProgressiveLoadingProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="h-1 bg-muted/50 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-primary transition-all duration-300 ease-out',
            complete && 'bg-green-500'
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {complete && (
        <p className="text-xs text-center text-muted-foreground">加载完成</p>
      )}
    </div>
  );
}
