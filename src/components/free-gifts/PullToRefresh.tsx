/**
 * @fileoverview 下拉刷新组件
 * @description 移动端下拉刷新功能
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    const scrollTop = containerRef.current?.scrollTop || 0;
    
    if (scrollTop <= 0) {
      startY.current = touch.clientY;
      isPulling.current = true;
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || disabled || isRefreshing) return;
    
    const touch = e.touches[0];
    const distance = touch.clientY - startY.current;
    
    if (distance > 0) {
      setPullDistance(Math.min(distance, threshold * 1.5));
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || disabled || isRefreshing) return;
    
    isPulling.current = false;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const getRefreshIconStyle = () => {
    const progress = Math.min(pullDistance / threshold, 1);
    return {
      transform: `rotate(${progress * 360}deg)`,
      opacity: 0.5 + progress * 0.5,
    };
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉指示器 */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-transform"
          style={{
            transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background shadow-md">
            {isRefreshing ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <RefreshCw 
                className="w-5 h-5 text-muted-foreground" 
                style={getRefreshIconStyle()}
              />
            )}
          </div>
        </div>
      )}
      
      {/* 内容 */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? threshold : Math.min(pullDistance * 0.5, threshold * 0.5)}px)`,
          transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 简单的刷新按钮
 */
export function RefreshButton({
  onRefresh,
  loading = false,
  className = '',
}: {
  onRefresh: () => void | Promise<void>;
  loading?: boolean;
  className?: string;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading || isRefreshing}
      className={`p-2 rounded-full hover:bg-muted transition-colors ${className}`}
    >
      <RefreshCw 
        className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} 
      />
    </button>
  );
}

/**
 * 刷新成功提示
 */
export function RefreshSuccessMessage({
  show,
  message = '刷新成功',
}: {
  show: boolean;
  message?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg text-sm flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        {message}
      </div>
    </div>
  );
}
