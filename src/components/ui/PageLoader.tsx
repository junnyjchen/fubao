/**
 * @fileoverview 页面加载器组件
 * @description 用于页面级加载状态展示的优雅加载动画
 * @module components/ui/PageLoader
 */

'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  /** 加载提示文字 */
  text?: string;
  /** 是否全屏展示 */
  fullscreen?: boolean;
  /** 自定义类名 */
  className?: string;
}

export function PageLoader({ 
  text = '載入中...', 
  fullscreen = true,
  className 
}: PageLoaderProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4',
      fullscreen && 'min-h-screen bg-background',
      className
    )}>
      <div className="relative">
        {/* 外圈旋转动画 */}
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        {/* 中心图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-primary font-bold text-lg">符</span>
        </div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * 简洁版加载器
 */
export function SimpleLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
}

/**
 * 内联加载器
 */
export function InlineLoader({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('w-4 h-4 animate-spin', className)} />
  );
}

export default PageLoader;
