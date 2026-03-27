/**
 * @fileoverview 首页骨架屏组件
 * @description 用于首页加载状态展示的骨架屏
 * @module components/home/HomeSkeleton
 */

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * 首页Hero区域骨架屏
 */
export function HeroSkeleton() {
  return (
    <section className="relative h-[50vh] min-h-[400px] max-h-[600px] overflow-hidden">
      <Skeleton variant="rectangular" className="absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      <div className="absolute inset-0 flex items-end pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-4">
            <Skeleton variant="text" className="h-12 w-3/4" />
            <Skeleton variant="text" className="h-6 w-1/2" />
            <Skeleton variant="rounded" className="h-12 w-32" />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 功能入口骨架屏
 */
export function FeaturesSkeleton() {
  return (
    <section className="container mx-auto px-4 py-8 -mt-8 relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex flex-col items-center justify-center">
              <Skeleton variant="circular" className="w-12 h-12 mb-3" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * 商品网格骨架屏
 */
export function GoodsGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <Skeleton variant="rectangular" className="aspect-square" />
          <div className="p-4 space-y-3">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-4 w-1/2" />
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-5 w-20" />
              <Skeleton variant="text" className="h-4 w-12" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <Skeleton variant="circular" className="w-5 h-5" />
              <Skeleton variant="text" className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 新闻列表骨架屏
 */
export function NewsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 flex gap-4">
          <Skeleton variant="rounded" className="w-24 h-24 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton variant="rounded" className="h-5 w-16" />
              <Skeleton variant="text" className="h-4 w-12" />
            </div>
            <Skeleton variant="text" className="h-5 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 视频网格骨架屏
 */
export function VideosGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card overflow-hidden">
          <Skeleton variant="rectangular" className="aspect-video" />
          <div className="p-4 space-y-2">
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-2/3" />
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-3 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 百科文章骨架屏
 */
export function ArticleSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden md:flex">
      <Skeleton variant="rectangular" className="w-full md:w-80 h-48 md:h-auto flex-shrink-0" />
      <div className="flex-1 p-6 md:p-8 space-y-4">
        <Skeleton variant="rounded" className="h-6 w-20" />
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-full" />
        <Skeleton variant="text" className="h-4 w-2/3" />
        <Skeleton variant="text" className="h-4 w-24" />
      </div>
    </div>
  );
}

/**
 * 免费领入口骨架屏
 */
export function FreeGiftBannerSkeleton() {
  return (
    <div className="rounded-lg bg-gradient-to-r from-red-500/50 via-orange-500/50 to-amber-500/50 overflow-hidden animate-pulse">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-4">
          <Skeleton variant="rounded" className="w-14 h-14" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-6 w-32" />
            <Skeleton variant="text" className="h-4 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 完整首页骨架屏
 */
export function HomeSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroSkeleton />
      
      {/* 功能入口 */}
      <FeaturesSkeleton />
      
      {/* 今日符箓 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton variant="text" className="h-8 w-32" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <ArticleSkeleton />
      </section>
      
      {/* 免费领入口 */}
      <section className="container mx-auto px-4 py-4 -mt-4">
        <FreeGiftBannerSkeleton />
      </section>
      
      {/* 热门法器 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton variant="text" className="h-8 w-32" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <GoodsGridSkeleton count={8} />
      </section>
      
      {/* 精选视频 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-10 h-10" />
            <Skeleton variant="text" className="h-8 w-32" />
          </div>
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <VideosGridSkeleton count={4} />
      </section>
      
      {/* 玄门头条 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton variant="text" className="h-8 w-32" />
          <Skeleton variant="text" className="h-4 w-20" />
        </div>
        <NewsListSkeleton count={4} />
      </section>
    </div>
  );
}

export default HomeSkeleton;
