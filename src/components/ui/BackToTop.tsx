/**
 * @fileoverview 回到顶部按钮组件
 * @description 滚动回到页面顶部的浮动按钮
 * @module components/ui/BackToTop
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  /** 显示按钮的滚动阈值（像素） */
  threshold?: number;
  /** 滚动动画时长（毫秒） */
  duration?: number;
  /** 按钮位置 */
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  /** 自定义类名 */
  className?: string;
  /** 是否显示进度条 */
  showProgress?: boolean;
}

export function BackToTop({
  threshold = 300,
  duration = 300,
  position = 'bottom-right',
  className,
  showProgress = false,
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // 滚动处理
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // 更新可见性
    setIsVisible(scrollTop > threshold);
    
    // 更新滚动进度
    if (showProgress && scrollHeight > 0) {
      setScrollProgress((scrollTop / scrollHeight) * 100);
    }
  }, [threshold, showProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    const startTime = performance.now();
    const startScroll = window.scrollY || document.documentElement.scrollTop;

    const easeOutQuad = (t: number) => t * (2 - t);

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutQuad(progress);

      window.scrollTo(0, startScroll * (1 - easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, [duration]);

  // 位置样式
  const positionStyles = {
    'bottom-right': 'right-4',
    'bottom-left': 'left-4',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 z-40',
        positionStyles[position],
        className
      )}
    >
      <Button
        size="icon"
        variant="secondary"
        className={cn(
          'relative w-10 h-10 rounded-full shadow-lg transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'bg-background/80 backdrop-blur-sm border'
        )}
        onClick={scrollToTop}
        aria-label="回到頂部"
      >
        {/* 进度环 */}
        {showProgress && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 40 40"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted"
            />
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${scrollProgress} 100`}
              className="text-primary"
            />
          </svg>
        )}
        
        {/* 图标 */}
        <ArrowUp className="w-4 h-4" />
      </Button>
    </div>
  );
}

// 带进度显示的回到顶部
export function BackToTopWithProgress(props: Omit<BackToTopProps, 'showProgress'>) {
  return <BackToTop {...props} showProgress />;
}
