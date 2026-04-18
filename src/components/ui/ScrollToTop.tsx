/**
 * @fileoverview 回到顶部组件
 * @description 提供回到页面顶部的便捷操作
 * @module components/ui/ScrollToTop
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  /** 显示阈值（滚动距离，默认300px） */
  threshold?: number;
  /** 按钮位置底部偏移 */
  bottom?: number | string;
  /** 按钮位置右边偏移 */
  right?: number | string;
  /** 按钮大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 自定义类名 */
  className?: string;
  /** 是否显示进度环 */
  showProgress?: boolean;
  /** 平滑滚动 */
  smooth?: boolean;
}

/**
 * 回到顶部组件
 * 
 * @example
 * <ScrollToTop />
 * 
 * @example
 * // 带进度环
 * <ScrollToTop showProgress />
 */
export function ScrollToTop({
  threshold = 300,
  bottom = 24,
  right = 24,
  size = 'md',
  className,
  showProgress = false,
  smooth = true,
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // 显示/隐藏
      setIsVisible(scrollY > threshold);
      
      // 计算进度
      if (showProgress && docHeight > 0) {
        setProgress((scrollY / docHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, showProgress]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'fixed z-40 rounded-full shadow-lg',
        'bg-background/95 backdrop-blur border-border/50',
        'hover:bg-muted hover:scale-105',
        'transition-all duration-300',
        sizeMap[size],
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-16 opacity-0 pointer-events-none',
        className
      )}
      style={{ bottom: typeof bottom === 'number' ? `${bottom}px` : bottom, right: typeof right === 'number' ? `${right}px` : right }}
      onClick={scrollToTop}
      aria-label="回到頂部"
    >
      {showProgress ? (
        <div className="relative w-full h-full">
          {/* 进度环 */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 -rotate-90"
          >
            {/* 背景环 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            {/* 进度环 */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.83} 283`}
              className="text-primary transition-all duration-150"
            />
          </svg>
          {/* 箭头图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowUp className={iconSizeMap[size]} />
          </div>
        </div>
      ) : (
        <ArrowUp className={iconSizeMap[size]} />
      )}
    </Button>
  );
}

/**
 * 滚动到指定位置
 */
export function useScrollTo() {
  const scrollTo = React.useCallback(
    (options: { top?: number; left?: number; behavior?: ScrollBehavior }) => {
      window.scrollTo({
        top: options.top ?? 0,
        left: options.left ?? 0,
        behavior: options.behavior ?? 'smooth',
      });
    },
    []
  );

  const scrollToElement = React.useCallback(
    (element: HTMLElement | string, offset = 0) => {
      const el = typeof element === 'string' 
        ? document.querySelector(element) 
        : element;
      
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        scrollTo({ top });
      }
    },
    [scrollTo]
  );

  return { scrollTo, scrollToElement };
}

export default ScrollToTop;
