/**
 * @fileoverview 骨架屏组件
 * @description 用于加载状态展示
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';

export function GiftCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* 图片骨架 */}
      <div className="aspect-square bg-muted animate-pulse" />
      
      <CardContent className="p-4 space-y-3">
        {/* 标题骨架 */}
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        
        {/* 描述骨架 */}
        <div className="space-y-1.5">
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
        </div>
        
        {/* 进度条骨架 */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
            <div className="h-3 bg-muted rounded animate-pulse w-16" />
          </div>
          <div className="h-2 bg-muted rounded-full animate-pulse" />
        </div>
        
        {/* 领取方式骨架 */}
        <div className="flex gap-2">
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
        </div>
        
        {/* 按钮骨架 */}
        <div className="h-10 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function GiftListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <GiftCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function GiftDetailSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* 商品信息骨架 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 领取方式骨架 */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="h-5 bg-muted rounded animate-pulse w-1/3" />
          <div className="h-20 bg-muted rounded animate-pulse" />
          <div className="h-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
      
      {/* 按钮骨架 */}
      <div className="h-12 bg-muted rounded animate-pulse" />
    </div>
  );
}

export function ClaimRecordSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/50 px-4 py-2">
        <div className="h-4 bg-muted rounded animate-pulse w-24" />
      </div>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
