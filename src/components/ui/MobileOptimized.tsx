/**
 * @fileoverview 移动端优化组件
 * @description 用于提升移动端用户体验的组件
 * @module components/ui/MobileOptimized
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ============ 下拉刷新组件 ============

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;

      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    },
    [isPulling, isRefreshing, threshold]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉指示器 */}
      {(isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
          style={{
            height: threshold,
            transform: `translateY(${pullDistance - threshold}px)`,
          }}
        >
          <div
            className={cn(
              'w-8 h-8 border-2 border-primary border-t-transparent rounded-full transition-all',
              (isRefreshing || progress >= 1) && 'animate-spin'
            )}
            style={{
              opacity: progress,
            }}
          />
        </div>
      )}

      {/* 内容 */}
      <div
        className="transition-transform"
        style={{
          transform: `translateY(${pullDistance}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============ 无限滚动组件 ============

interface InfiniteScrollProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  children: React.ReactNode;
  threshold?: number;
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading = false,
  children,
  threshold = 200,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: `${threshold}px`, root: null, threshold: 0 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return (
    <div>
      {children}
      {/* 哨兵元素 */}
      <div ref={sentinelRef} className="h-4" />
      {/* 加载指示器 */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!hasMore && !loading && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          已經到底了
        </div>
      )}
    </div>
  );
}

// ============ 移动端底部操作栏 ============

interface MobileActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileActionBar({
  children,
  className,
}: MobileActionBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50',
        'safe-area-bottom', // iOS安全区域
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">{children}</div>
    </div>
  );
}

// ============ 横向滑动组件 ============

interface SwipeableProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  className?: string;
}

export function Swipeable({
  children,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  className,
}: SwipeableProps) {
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = endX - startX.current;
    const diffY = endY - startY.current;

    // 确保是水平滑动而不是垂直滚动
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// ============ 移动端轮播图 ============

interface MobileCarouselProps {
  items: { id: string; content: React.ReactNode }[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function MobileCarousel({
  items,
  autoPlay = true,
  interval = 3000,
  showDots = true,
  showArrows = false,
  className,
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动播放
  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, items.length]);

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* 幻灯片容器 */}
      <div
        ref={containerRef}
        className="flex transition-transform duration-300"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {items.map((item) => (
          <div key={item.id} className="w-full flex-shrink-0">
            {item.content}
          </div>
        ))}
      </div>

      {/* 箭头 */}
      {showArrows && items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/50"
            onClick={goPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/50"
            onClick={goNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* 指示点 */}
      {showDots && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-primary w-4'
                  : 'bg-background/50'
              )}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ 移动端底部弹出菜单 ============

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function MobileSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: MobileSheetProps) {
  // 点击遮罩关闭
  const handleOverlayClick = () => {
    onOpenChange(false);
  };

  // 阻止内容区域点击冒泡
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={handleOverlayClick}
      />

      {/* 内容 */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl',
          'animate-in slide-in-from-bottom duration-300',
          'max-h-[80vh] overflow-y-auto',
          className
        )}
        onClick={handleContentClick}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-background border-b px-4 py-3">
          <div className="flex items-center justify-between">
            {title && <h3 className="font-medium">{title}</h3>}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {/* 拖拽条 */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted rounded-full" />
        </div>

        {/* 内容 */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ============ 移动端搜索栏 ============

interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  className?: string;
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = '搜索商品、文章...',
  onSearch,
  className,
}: MobileSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div
      className={cn(
        'sticky top-0 bg-background/95 backdrop-blur z-40 px-4 py-3',
        isFocused && 'shadow-md',
        className
      )}
    >
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-10 pl-10 pr-4 rounded-full bg-muted border-0 focus:ring-2 focus:ring-primary"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ============ 移动端检测 Hook ============

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// ============ 触摸反馈 Hook ============

export function useTouchFeedback() {
  const [isActive, setIsActive] = useState(false);

  const handlers = {
    onTouchStart: () => setIsActive(true),
    onTouchEnd: () => setIsActive(false),
    onTouchCancel: () => setIsActive(false),
  };

  return {
    isActive,
    handlers,
    className: isActive ? 'scale-95 opacity-80' : '',
  };
}
