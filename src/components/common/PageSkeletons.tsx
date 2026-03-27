/**
 * @fileoverview 通用页面骨架屏组件
 * @description 各页面加载状态展示的骨架屏组件
 * @module components/common/PageSkeletons
 */

import { Skeleton } from '@/components/ui/Skeleton';

/**
 * 结账页面骨架屏
 */
export function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 地址选择 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton variant="circular" className="w-5 h-5" />
            <Skeleton variant="text" className="h-5 w-24" />
          </div>
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-5 w-32" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="text" className="h-4 w-2/3" />
          </div>
        </div>

        {/* 商品列表 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton variant="circular" className="w-5 h-5" />
            <Skeleton variant="text" className="h-5 w-16" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 p-2 border rounded-lg">
                <Skeleton variant="rounded" className="w-16 h-16 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                  <div className="flex justify-between items-center">
                    <Skeleton variant="text" className="h-4 w-16" />
                    <Skeleton variant="text" className="h-4 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 支付方式 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton variant="circular" className="w-5 h-5" />
            <Skeleton variant="text" className="h-5 w-24" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-3 flex flex-col items-center gap-2">
                <Skeleton variant="circular" className="w-8 h-8" />
                <Skeleton variant="text" className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>

        {/* 备注 */}
        <div className="rounded-lg border bg-card p-4">
          <Skeleton variant="text" className="h-5 w-16 mb-3" />
          <Skeleton variant="rounded" className="h-20 w-full" />
        </div>

        {/* 底部结算栏 */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="space-y-1">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-6 w-20" />
            </div>
            <Skeleton variant="rounded" className="h-12 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * VIP会员页面骨架屏
 */
export function VIPSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 当前等级卡片 */}
        <div className="rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton variant="circular" className="w-16 h-16" />
              <div className="space-y-2">
                <Skeleton variant="text" className="h-6 w-24" />
                <Skeleton variant="text" className="h-4 w-32" />
              </div>
            </div>
            <Skeleton variant="rounded" className="h-6 w-16" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <Skeleton variant="text" className="h-4 w-20" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
            <Skeleton variant="rounded" className="h-2 w-full" />
          </div>
        </div>

        {/* 会员等级选择 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-4 text-center">
              <Skeleton variant="circular" className="w-12 h-12 mx-auto mb-2" />
              <Skeleton variant="text" className="h-4 w-16 mx-auto mb-2" />
              <Skeleton variant="text" className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>

        {/* 特权列表 */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Skeleton variant="text" className="h-6 w-32" />
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-24" />
                  <Skeleton variant="text" className="h-3 w-40" />
                </div>
                <Skeleton variant="rounded" className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 分销中心骨架屏
 */
export function DistributionSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部收益卡片 */}
      <div className="bg-gradient-to-br from-primary/90 to-primary p-6 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <Skeleton variant="text" className="h-4 w-24 mx-auto bg-white/30" />
            <Skeleton variant="text" className="h-10 w-32 mx-auto mt-2 bg-white/30" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-3 bg-white/10 rounded-lg">
                <Skeleton variant="text" className="h-6 w-16 mx-auto bg-white/30" />
                <Skeleton variant="text" className="h-3 w-20 mx-auto mt-1 bg-white/30" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 快捷入口 */}
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-4 text-center">
              <Skeleton variant="circular" className="w-10 h-10 mx-auto mb-2" />
              <Skeleton variant="text" className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* 数据统计 */}
        <div className="rounded-lg border bg-card p-4">
          <Skeleton variant="text" className="h-5 w-24 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
                <Skeleton variant="text" className="h-6 w-16 mx-auto" />
                <Skeleton variant="text" className="h-3 w-20 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* 推广商品 */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b flex justify-between items-center">
            <Skeleton variant="text" className="h-5 w-24" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 p-2 border rounded-lg">
                <Skeleton variant="rounded" className="w-16 h-16 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-4 w-20" />
                </div>
                <Skeleton variant="rounded" className="w-20 h-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 地址列表骨架屏
 */
export function AddressListSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 添加按钮 */}
        <Skeleton variant="rounded" className="h-12 w-full" />

        {/* 地址列表 */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="text" className="h-5 w-20" />
                <Skeleton variant="text" className="h-5 w-24" />
              </div>
              <Skeleton variant="rounded" className="h-5 w-12" />
            </div>
            <Skeleton variant="text" className="h-4 w-full mb-1" />
            <Skeleton variant="text" className="h-4 w-2/3 mb-3" />
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Skeleton variant="rounded" className="w-16 h-8" />
              <Skeleton variant="rounded" className="w-16 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 优惠券列表骨架屏
 */
export function CouponListSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Tabs */}
        <div className="flex gap-4 border-b pb-2">
          {['全部', '可用', '已用', '过期'].map((_, i) => (
            <Skeleton key={i} variant="text" className="h-6 w-12" />
          ))}
        </div>

        {/* 优惠券列表 */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border bg-card overflow-hidden flex">
            <div className="bg-primary/10 p-4 flex flex-col items-center justify-center w-24">
              <Skeleton variant="text" className="h-8 w-16" />
              <Skeleton variant="text" className="h-3 w-12" />
            </div>
            <div className="flex-1 p-4">
              <Skeleton variant="text" className="h-5 w-24 mb-2" />
              <Skeleton variant="text" className="h-3 w-full mb-1" />
              <Skeleton variant="text" className="h-3 w-2/3" />
            </div>
            <div className="p-4 flex items-center">
              <Skeleton variant="rounded" className="w-16 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 订单详情骨架屏
 */
export function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 订单状态 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="space-y-2">
              <Skeleton variant="text" className="h-5 w-24" />
              <Skeleton variant="text" className="h-4 w-40" />
            </div>
          </div>
        </div>

        {/* 收货地址 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton variant="circular" className="w-5 h-5" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
          <Skeleton variant="text" className="h-4 w-full mb-1" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>

        {/* 商品列表 */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Skeleton variant="text" className="h-5 w-32" />
          </div>
          <div className="divide-y">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 flex gap-3">
                <Skeleton variant="rounded" className="w-16 h-16 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                  <div className="flex justify-between">
                    <Skeleton variant="text" className="h-4 w-16" />
                    <Skeleton variant="text" className="h-4 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 订单信息 */}
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <Skeleton variant="text" className="h-5 w-24" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton variant="text" className="h-4 w-20" />
              <Skeleton variant="text" className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* 底部操作 */}
        <div className="flex gap-3">
          <Skeleton variant="rounded" className="flex-1 h-12" />
          <Skeleton variant="rounded" className="flex-1 h-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * 视频详情骨架屏
 */
export function VideoDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* 视频播放器 */}
      <div className="aspect-video bg-black relative">
        <Skeleton variant="rectangular" className="absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton variant="circular" className="w-16 h-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 视频信息 */}
        <div className="space-y-3">
          <Skeleton variant="text" className="h-6 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
        </div>

        {/* 简介 */}
        <div className="rounded-lg border bg-card p-4">
          <Skeleton variant="text" className="h-5 w-16 mb-3" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>

        {/* 相关视频 */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b">
            <Skeleton variant="text" className="h-5 w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton variant="rounded" className="aspect-video" />
                <Skeleton variant="text" className="h-4 w-full" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 百科详情骨架屏
 */
export function WikiDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-48 md:h-64 relative">
        <Skeleton variant="rectangular" className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton variant="rounded" className="h-6 w-20 mb-2" />
          <Skeleton variant="text" className="h-8 w-3/4" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 元信息 */}
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" className="w-10 h-10" />
          <div className="space-y-1">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-3 w-32" />
          </div>
        </div>

        {/* 内容 */}
        <div className="space-y-4">
          <Skeleton variant="text" className="h-6 w-32" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-3/4" />
          <Skeleton variant="rounded" className="h-48 w-full" />
          <Skeleton variant="text" className="h-4 w-full" />
          <Skeleton variant="text" className="h-4 w-2/3" />
        </div>

        {/* 相关文章 */}
        <div className="rounded-lg border bg-card p-4">
          <Skeleton variant="text" className="h-5 w-24 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton variant="rounded" className="w-20 h-14 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton variant="text" className="h-4 w-full" />
                  <Skeleton variant="text" className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 用户中心骨架屏
 */
export function UserCenterSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 用户信息卡片 */}
      <div className="bg-card p-6">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" className="w-16 h-16" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-5 w-24" />
            <Skeleton variant="text" className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <Skeleton variant="text" className="h-6 w-8 mx-auto" />
              <Skeleton variant="text" className="h-3 w-12 mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* 订单入口 */}
      <div className="bg-card mt-2 p-4">
        <div className="flex justify-between items-center mb-4">
          <Skeleton variant="text" className="h-5 w-24" />
          <Skeleton variant="text" className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="text-center">
              <Skeleton variant="circular" className="w-10 h-10 mx-auto mb-1" />
              <Skeleton variant="text" className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* 功能列表 */}
      <div className="bg-card mt-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
            <Skeleton variant="circular" className="w-8 h-8" />
            <Skeleton variant="text" className="h-4 flex-1" />
            <Skeleton variant="circular" className="w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 积分页面骨架屏
 */
export function PointsSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 积分卡片 */}
      <div className="bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton variant="circular" className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-6 w-16" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-4 w-16" />
          </div>
          <Skeleton variant="rounded" className="h-2 w-full" />
        </div>
      </div>

      {/* 等级特权 */}
      <div className="bg-card mt-2 p-4">
        <Skeleton variant="text" className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-3 bg-muted/30 rounded-lg">
              <Skeleton variant="circular" className="w-8 h-8 mx-auto mb-2" />
              <Skeleton variant="text" className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* 积分记录 */}
      <div className="bg-card mt-2">
        <div className="p-4 border-b">
          <Skeleton variant="text" className="h-5 w-24" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="h-3 w-32" />
              </div>
              <Skeleton variant="text" className="h-5 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 退款列表骨架屏
 */
export function RefundListSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Tabs */}
      <div className="bg-card border-b">
        <div className="flex gap-4 px-4 py-3">
          {['全部', '處理中', '已完成', '已拒絕'].map((_, i) => (
            <Skeleton key={i} variant="text" className="h-6 w-12" />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="rounded" className="h-5 w-16" />
            </div>
            <div className="p-4">
              <div className="flex gap-3 mb-3">
                <Skeleton variant="rounded" className="w-16 h-16 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="h-4 w-3/4" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="rounded" className="w-20 h-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 浏览历史骨架屏
 */
export function HistorySkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-card border-b p-4">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="h-5 w-24" />
          <Skeleton variant="rounded" className="h-8 w-20" />
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="rounded-lg border bg-card overflow-hidden">
              <Skeleton variant="rectangular" className="aspect-square" />
              <div className="p-3 space-y-2">
                <Skeleton variant="text" className="h-4 w-3/4" />
                <Skeleton variant="text" className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * 快速下单骨架屏
 */
export function QuickOrderSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* 商品信息 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex gap-4">
            <Skeleton variant="rounded" className="w-24 h-24 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-5 w-3/4" />
              <Skeleton variant="text" className="h-4 w-1/2" />
              <Skeleton variant="text" className="h-5 w-20" />
            </div>
          </div>
        </div>

        {/* 地址选择 */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton variant="circular" className="w-5 h-5" />
            <Skeleton variant="text" className="h-5 w-24" />
          </div>
          <div className="p-3 border rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" className="h-5 w-32" />
              <Skeleton variant="text" className="h-4 w-16" />
            </div>
            <Skeleton variant="text" className="h-4 w-full" />
          </div>
        </div>

        {/* 支付方式 */}
        <div className="rounded-lg border bg-card p-4">
          <Skeleton variant="text" className="h-5 w-24 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-3 flex flex-col items-center gap-2">
                <Skeleton variant="circular" className="w-8 h-8" />
                <Skeleton variant="text" className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 分销子页面骨架屏（佣金、团队、提现）
 */
export function DistributionSubSkeleton() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* 统计卡片 */}
      <div className="bg-card p-4">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="text-center p-4 bg-muted/30 rounded-lg">
              <Skeleton variant="text" className="h-6 w-16 mx-auto" />
              <Skeleton variant="text" className="h-3 w-20 mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b mt-2">
        <div className="flex gap-4 px-4 py-3">
          {['全部', '選項1', '選項2'].map((_, i) => (
            <Skeleton key={i} variant="text" className="h-6 w-12" />
          ))}
        </div>
      </div>

      {/* 列表 */}
      <div className="p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-4 flex items-center gap-4">
            <Skeleton variant="circular" className="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="h-4 w-24" />
              <Skeleton variant="text" className="h-3 w-32" />
            </div>
            <Skeleton variant="text" className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
