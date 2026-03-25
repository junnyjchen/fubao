/**
 * @fileoverview 骨架屏组件
 * @description 用于加载状态展示的骨架屏组件
 * @module components/ui/Skeleton
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  style,
  ...props
}: SkeletonProps) {
  const baseStyles = 'bg-muted';
  
  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  const componentStyle: React.CSSProperties = {
    ...style,
  };
  if (width) componentStyle.width = typeof width === 'number' ? `${width}px` : width;
  if (height) componentStyle.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={componentStyle}
      {...props}
    />
  );
}

// 商品卡片骨架屏
export function GoodsCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-5 w-20" />
          <Skeleton variant="text" className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

// 视频卡片骨架屏
export function VideoCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-video" />
      <div className="p-4 space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-3 w-20" />
          <Skeleton variant="text" className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// 文章卡片骨架屏
export function ArticleCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton variant="rectangular" className="aspect-video" />
      <div className="p-4 space-y-3">
        <Skeleton variant="rounded" className="h-5 w-20" />
        <Skeleton variant="text" className="h-5 w-full" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// 列表项骨架屏
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <Skeleton variant="circular" className="w-12 h-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="h-4 w-1/2" />
        <Skeleton variant="text" className="h-3 w-3/4" />
      </div>
      <Skeleton variant="rounded" className="w-20 h-8" />
    </div>
  );
}

// 订单卡片骨架屏
export function OrderCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 flex justify-between">
        <Skeleton variant="text" className="h-4 w-32" />
        <Skeleton variant="rounded" className="h-5 w-16" />
      </div>
      <div className="p-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton variant="rounded" className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="h-3 w-1/2" />
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t">
          <Skeleton variant="text" className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton variant="rounded" className="w-20 h-8" />
            <Skeleton variant="rounded" className="w-20 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 表格行骨架屏
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton variant="text" className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// 完整页面骨架屏
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="rounded" className="h-10 w-32" />
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 space-y-2">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-8 w-16" />
          </div>
        ))}
      </div>
      
      {/* Content */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <Skeleton variant="text" className="h-6 w-32" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
