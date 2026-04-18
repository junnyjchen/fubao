/**
 * @fileoverview 商品详情页骨架屏组件
 * @description 用于商品详情页加载状态展示的骨架屏
 * @module components/shop/GoodsDetailSkeleton
 */

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * 商品详情页骨架屏
 */
export function GoodsDetailSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 面包屑骨架屏 */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="text" className="h-4 w-12" />
            <span className="text-muted-foreground">/</span>
            <Skeleton variant="text" className="h-4 w-12" />
            <span className="text-muted-foreground">/</span>
            <Skeleton variant="text" className="h-4 w-16" />
            <span className="text-muted-foreground">/</span>
            <Skeleton variant="text" className="h-4 w-24" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 商品主信息骨架屏 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 图片区域骨架屏 */}
          <div className="space-y-4">
            <Skeleton variant="rectangular" className="aspect-square rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" className="w-16 h-16 rounded-md" />
              ))}
            </div>
          </div>

          {/* 信息区域骨架屏 */}
          <div className="space-y-6">
            {/* 标题和价格 */}
            <div className="space-y-3">
              <Skeleton variant="text" className="h-8 w-3/4" />
              <Skeleton variant="text" className="h-5 w-1/2" />
              <div className="flex items-baseline gap-2">
                <Skeleton variant="text" className="h-10 w-32" />
                <Skeleton variant="text" className="h-5 w-24" />
              </div>
            </div>

            {/* 商家信息 */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-5 w-24" />
                  <Skeleton variant="text" className="h-4 w-32" />
                </div>
              </div>
            </div>

            {/* 数量选择 */}
            <div className="space-y-3">
              <Skeleton variant="text" className="h-5 w-16" />
              <div className="flex items-center gap-4">
                <Skeleton variant="rounded" className="h-10 w-32" />
                <Skeleton variant="text" className="h-4 w-24" />
              </div>
            </div>

            {/* 按钮骨架屏 */}
            <div className="flex gap-4">
              <Skeleton variant="rounded" className="h-12 flex-1" />
              <Skeleton variant="rounded" className="h-12 w-12" />
              <Skeleton variant="rounded" className="h-12 w-12" />
            </div>

            {/* 服务保障 */}
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Skeleton variant="circular" className="w-4 h-4" />
                  <Skeleton variant="text" className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 详情标签页骨架屏 */}
        <div className="space-y-6">
          <div className="flex gap-4 border-b">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-10 w-20" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-4 w-full" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default GoodsDetailSkeleton;
