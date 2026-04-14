/**
 * Loading Skeleton 组件
 * 用于内容加载时的占位显示
 */

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

/**
 * 商品卡片骨架屏
 */
export function GoodsCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * 商品列表骨架屏
 */
export function GoodsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <GoodsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 文章卡片骨架屏
 */
export function ArticleCardSkeleton() {
  return (
    <div className="bg-card rounded-lg overflow-hidden border flex">
      <Skeleton className="w-32 h-32 md:w-48 md:h-32 shrink-0" />
      <div className="p-4 flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * 文章列表骨架屏
 */
export function ArticleListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 商品详情骨架屏
 */
export function GoodsDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square w-full rounded-lg" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 商家卡片骨架屏
 */
export function MerchantCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-6 border space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

/**
 * 购物车骨架屏
 */
export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg p-4 flex gap-4 border">
          <Skeleton className="w-24 h-24 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 订单卡片骨架屏
 */
export function OrderCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 space-y-4 border">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2 border-t">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

/**
 * 用户资料骨架屏
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/**
 * 首页骨架屏
 */
export function HomeSkeleton() {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <Skeleton className="h-64 md:h-80 w-full rounded-lg" />
      
      {/* 分类 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-lg shrink-0" />
          ))}
        </div>
      </div>
      
      {/* 商品列表 */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        <GoodsListSkeleton count={8} />
      </div>
      
      {/* 文章列表 */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <ArticleListSkeleton count={3} />
      </div>
    </div>
  );
}

/**
 * 表格骨架屏
 */
export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      {/* 表头 */}
      <div className="flex gap-4 pb-3 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* 表格行 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className="h-4 flex-1" 
              style={{ maxWidth: colIndex === 0 ? '200px' : '100%' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * 表单骨架屏
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}
