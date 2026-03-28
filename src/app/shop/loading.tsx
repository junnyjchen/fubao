/**
 * @fileoverview 商城页面加载状态
 * @module app/shop/loading
 */

import { GoodsGridSkeleton } from '@/components/home/HomeSkeleton';

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 页面头部骨架 */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="h-10 w-48 bg-muted rounded animate-pulse mb-3" />
          <div className="h-6 w-64 bg-muted rounded animate-pulse" />
        </div>
      </section>
      
      {/* 筛选栏骨架 */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-background rounded-lg border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
            <div className="w-full md:w-[140px] h-10 bg-muted rounded animate-pulse" />
            <div className="w-full md:w-[160px] h-10 bg-muted rounded animate-pulse" />
            <div className="w-full md:w-[140px] h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* 商品网格骨架 */}
      <section className="container mx-auto px-4 pb-12">
        <GoodsGridSkeleton count={8} />
      </section>
    </div>
  );
}
