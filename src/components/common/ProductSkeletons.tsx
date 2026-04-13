/**
 * @fileoverview 商品列表骨架屏组件
 * @description 商城、搜索结果、分类页面的加载骨架屏
 * @module components/common/ProductSkeletons
 */

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * 商品卡片骨架屏
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* 图片 */}
      <Skeleton variant="rounded" className="aspect-square w-full" />
      {/* 内容 */}
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="h-4 w-3/4" />
        <Skeleton variant="text" className="h-3 w-1/2" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton variant="text" className="h-5 w-16" />
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * 商品列表骨架屏 (网格布局)
 */
export function ProductGridSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={`grid ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 商品详情骨架屏
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 面包屑 */}
        <div className="flex items-center gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" className="h-4 w-16" />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 图片区域 */}
          <div className="space-y-4">
            <Skeleton variant="rounded" className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" className="aspect-square w-full" />
              ))}
            </div>
          </div>

          {/* 商品信息 */}
          <div className="space-y-4">
            <Skeleton variant="text" className="h-8 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
            
            <div className="flex items-baseline gap-3">
              <Skeleton variant="text" className="h-10 w-32" />
              <Skeleton variant="text" className="h-5 w-20" />
            </div>

            <div className="space-y-2">
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-2/3" />
            </div>

            <Skeleton variant="rounded" className="h-10 w-full" />

            <div className="flex gap-3">
              <Skeleton variant="rounded" className="h-12 flex-1" />
              <Skeleton variant="rounded" className="h-12 flex-1" />
            </div>
          </div>
        </div>

        {/* 详情标签页 */}
        <div className="mt-8 space-y-4">
          <Skeleton variant="rounded" className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 搜索结果骨架屏
 */
export function SearchResultsSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {/* 筛选栏 */}
      <div className="flex items-center justify-between py-4 border-b">
        <div className="flex items-center gap-4">
          <Skeleton variant="rounded" className="h-8 w-20" />
          <Skeleton variant="rounded" className="h-8 w-20" />
          <Skeleton variant="rounded" className="h-8 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="h-4 w-16" />
          <Skeleton variant="rounded" className="h-8 w-24" />
        </div>
      </div>

      {/* 结果计数 */}
      <Skeleton variant="text" className="h-5 w-48" />

      {/* 商品网格 */}
      <ProductGridSkeleton count={count} columns={4} />

      {/* 分页 */}
      <div className="flex justify-center gap-2 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" className="h-10 w-10" />
        ))}
      </div>
    </div>
  );
}

/**
 * 分类页面骨架屏
 */
export function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 分类标题 */}
        <Skeleton variant="text" className="h-8 w-32 mb-6" />

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" className="h-8 w-20 flex-shrink-0" />
          ))}
        </div>

        {/* 排序和视图切换 */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton variant="text" className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton variant="rounded" className="h-8 w-8" />
            <Skeleton variant="rounded" className="h-8 w-8" />
          </div>
        </div>

        {/* 商品网格 */}
        <ProductGridSkeleton count={12} columns={4} />
      </div>
    </div>
  );
}

/**
 * 视频卡片骨架屏
 */
export function VideoCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* 视频缩略图 */}
      <div className="relative aspect-video">
        <Skeleton variant="rounded" className="w-full h-full" />
        <div className="absolute bottom-2 right-2">
          <Skeleton variant="rounded" className="h-5 w-12 bg-black/50" />
        </div>
      </div>
      {/* 内容 */}
      <div className="p-3 space-y-2">
        <Skeleton variant="text" className="h-4 w-full" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-6 h-6" />
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * 视频列表骨架屏
 */
export function VideoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * 文章卡片骨架屏
 */
export function ArticleCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' | 'compact' }) {
  if (variant === 'featured') {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="grid md:grid-cols-2">
          <Skeleton variant="rounded" className="aspect-video md:aspect-auto md:min-h-[300px]" />
          <div className="p-6 space-y-4 flex flex-col justify-center">
            <Skeleton variant="rounded" className="h-6 w-20" />
            <Skeleton variant="text" className="h-8 w-full" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-2/3" />
            <div className="flex items-center gap-4 pt-4">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div className="space-y-2">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="h-3 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <Skeleton variant="rounded" className="w-20 h-20 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="text" className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Skeleton variant="rounded" className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="h-5 w-full" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-6 h-6" />
            <Skeleton variant="text" className="h-3 w-16" />
          </div>
          <Skeleton variant="text" className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * 文章列表骨架屏
 */
type ArticleVariant = 'default' | 'featured' | 'compact';

export function ArticleGridSkeleton({ count = 6, variant }: { count?: number; variant?: ArticleVariant }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} variant={variant || 'default'} />
      ))}
    </div>
  );
}
