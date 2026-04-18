/**
 * @fileoverview 新闻页面加载状态
 * @module app/news/loading
 */

import { NewsListSkeleton } from '@/components/home/HomeSkeleton';

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 页面头部骨架 */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="h-10 w-48 bg-muted rounded animate-pulse mb-3" />
          <div className="h-6 w-64 bg-muted rounded animate-pulse" />
        </div>
      </section>
      
      {/* 分类标签骨架 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-20 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <NewsListSkeleton count={4} />
      </section>
    </div>
  );
}
