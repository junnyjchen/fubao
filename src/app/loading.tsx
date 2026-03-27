/**
 * @fileoverview 全局加载页面
 * @description 页面加载时显示的加载状态
 * @module app/loading
 */

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* 符字Logo动画 */}
        <div className="relative w-20 h-20 mx-auto">
          {/* 外圈旋转动画 */}
          <div className="absolute inset-0">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full animate-spin"
              style={{ animationDuration: '2s' }}
            >
              {/* 外圈轨道 */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted/30"
              />
              {/* 进度弧 */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="70 200"
                className="text-primary"
              />
            </svg>
          </div>
          
          {/* 中心符字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-bold text-2xl">符</span>
          </div>
          
          {/* 装饰圆点 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
        
        {/* 加载文字 */}
        <div className="space-y-2">
          <p className="text-muted-foreground font-medium">加載中</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 页面级加载组件（用于嵌套路由）
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

/**
 * 内联加载组件（用于组件内部）
 */
export function InlineLoading({ text = '加載中' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

/**
 * 全屏加载遮罩
 */
export function FullscreenLoading({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-spin"
            style={{ animationDuration: '1.5s' }}
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="60 180"
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">符</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">請稍候...</p>
      </div>
    </div>
  );
}
