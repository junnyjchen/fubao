/**
 * @fileoverview 视频页面加载状态
 * @module app/videos/loading
 */

import { VideosGridSkeleton } from '@/components/home/HomeSkeleton';

export default function VideosLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero 骨架 */}
      <section className="bg-gradient-to-br from-primary/80 to-primary/60 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="h-6 w-24 bg-white/20 rounded animate-pulse" />
              <div className="h-12 w-64 bg-white/20 rounded animate-pulse" />
              <div className="h-6 w-80 bg-white/20 rounded animate-pulse" />
              <div className="flex gap-4 mt-6">
                <div className="h-12 w-32 bg-white/20 rounded animate-pulse" />
                <div className="h-12 w-32 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
            <div className="aspect-video bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>
      
      {/* 搜索筛选骨架 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
          <div className="w-40 h-10 bg-muted rounded animate-pulse" />
          <div className="w-32 h-10 bg-muted rounded animate-pulse" />
          <div className="w-32 h-10 bg-muted rounded animate-pulse" />
        </div>
        <VideosGridSkeleton count={8} />
      </main>
    </div>
  );
}
