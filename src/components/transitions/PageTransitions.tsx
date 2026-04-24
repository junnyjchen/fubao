/**
 * @fileoverview 页面过渡动画组件
 * @description 提供页面切换、路由过渡等动画效果
 * @module components/transitions/PageTransitions
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * 页面加载进度条
 */
interface PageProgressProps {
  /** 是否显示 */
  show?: boolean;
  /** 进度值 0-100 */
  progress?: number;
  /** 自动加载模式 */
  autoMode?: boolean;
  /** 颜色 */
  color?: string;
  /** 高度 */
  height?: number;
  className?: string;
}

export function PageProgress({
  show = true,
  progress,
  autoMode = false,
  color = 'bg-primary',
  height = 3,
  className,
}: PageProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // 自动模式：模拟加载进度
  useEffect(() => {
    if (!autoMode || !show) {
      if (!show) setVisible(false);
      return;
    }

    setVisible(true);
    setCurrentProgress(0);

    const steps = [30, 60, 80, 90, 95, 98, 100];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setCurrentProgress(steps[stepIndex]);
        stepIndex++;
      } else {
        clearInterval(interval);
        // 完成动画
        setTimeout(() => {
          setVisible(false);
          setCurrentProgress(0);
        }, 200);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [autoMode, show]);

  // 受控模式
  useEffect(() => {
    if (progress !== undefined) {
      setCurrentProgress(progress);
      setVisible(progress < 100);
    }
  }, [progress]);

  if (!show && !visible) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[9999] transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ height }}
    >
      <div
        className={cn('h-full transition-all duration-300 ease-out', color)}
        style={{ width: `${currentProgress}%` }}
      />
    </div>
  );
}

/**
 * 淡入淡出过渡
 */
interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export function FadeTransition({
  children,
  show,
  duration = 300,
  className,
}: FadeTransitionProps) {
  return (
    <div
      className={cn('transition-opacity', className)}
      style={{
        opacity: show ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * 滑动过渡
 */
type SlideDirection = 'left' | 'right' | 'up' | 'down';

interface SlideTransitionProps {
  children: React.ReactNode;
  show: boolean;
  direction?: SlideDirection;
  duration?: number;
  className?: string;
}

export function SlideTransition({
  children,
  show,
  direction = 'up',
  duration = 300,
  className,
}: SlideTransitionProps) {
  const directionClasses = {
    left: show ? 'translate-x-0' : 'translate-x-full',
    right: show ? 'translate-x-0' : '-translate-x-full',
    up: show ? 'translate-y-0' : 'translate-y-full',
    down: show ? 'translate-y-0' : '-translate-y-full',
  };

  return (
    <div
      className={cn(
        'transition-transform',
        directionClasses[direction],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 缩放过渡
 */
interface ScaleTransitionProps {
  children: React.ReactNode;
  show: boolean;
  initialScale?: number;
  duration?: number;
  className?: string;
}

export function ScaleTransition({
  children,
  show,
  initialScale = 0.95,
  duration = 200,
  className,
}: ScaleTransitionProps) {
  return (
    <div
      className={cn('transition-all origin-center', className)}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : `scale(${initialScale})`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * 路由过渡包装器
 */
interface RouteTransitionProps {
  children: React.ReactNode;
  /** 过渡类型 */
  type?: 'fade' | 'slide' | 'scale' | 'none';
  /** 过渡时长 */
  duration?: number;
  className?: string;
}

export function RouteTransition({
  children,
  type = 'fade',
  duration = 200,
  className,
}: RouteTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [displayPathname, setDisplayPathname] = useState(pathname);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // 开始退出动画
      setIsVisible(false);

      // 动画结束后切换内容
      const exitTimer = setTimeout(() => {
        setDisplayPathname(pathname);
        setIsVisible(true);
      }, duration);

      prevPathname.current = pathname;

      return () => clearTimeout(exitTimer);
    }
  }, [pathname, duration]);

  const content = (
    <div key={displayPathname} className={className}>
      {children}
    </div>
  );

  switch (type) {
    case 'fade':
      return (
        <FadeTransition show={isVisible} duration={duration}>
          {content}
        </FadeTransition>
      );
    case 'slide':
      return (
        <SlideTransition show={isVisible} duration={duration}>
          {content}
        </SlideTransition>
      );
    case 'scale':
      return (
        <ScaleTransition show={isVisible} duration={duration}>
          {content}
        </ScaleTransition>
      );
    default:
      return content;
  }
}

/**
 * 交错列表动画
 */
interface StaggeredListProps {
  children: React.ReactNode;
  /** 初始状态 */
  initial?: boolean;
  /** 交错延迟（毫秒） */
  staggerDelay?: number;
  /** 动画类型 */
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  className?: string;
}

export function StaggeredList({
  children,
  initial = false,
  staggerDelay = 50,
  animation = 'slide-up',
  className,
}: StaggeredListProps) {
  const [visible, setVisible] = useState(initial);

  useEffect(() => {
    setVisible(true);
  }, []);

  const animationClasses = {
    fade: 'opacity-0 opacity-100',
    'slide-up': 'opacity-0 translate-y-4 opacity-100 translate-y-0',
    'slide-down': 'opacity-0 -translate-y-4 opacity-100 translate-y-0',
    scale: 'opacity-0 scale-95 opacity-100 scale-100',
  };

  return (
    <div className={cn('space-y-4', className)}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                'transition-all duration-300 ease-out',
                animationClasses[animation],
                { 'transition-delay': visible ? `${index * staggerDelay}ms` : '0ms' }
              )}
              style={{
                transitionDelay: visible ? `${index * staggerDelay}ms` : '0ms',
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

/**
 * 页面进入动画
 */
type EnterAnimation =
  | 'fade-in'
  | 'fade-in-up'
  | 'fade-in-down'
  | 'fade-in-left'
  | 'fade-in-right'
  | 'zoom-in'
  | 'slide-in-up'
  | 'slide-in-down';

interface PageEnterProps {
  children: React.ReactNode;
  animation?: EnterAnimation;
  delay?: number;
  duration?: number;
  className?: string;
}

export function PageEnter({
  children,
  animation = 'fade-in-up',
  delay = 0,
  duration = 400,
  className,
}: PageEnterProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClasses: Record<EnterAnimation, string> = {
    'fade-in': 'opacity-0 opacity-100',
    'fade-in-up': 'opacity-0 translate-y-8 opacity-100 translate-y-0',
    'fade-in-down': 'opacity-0 -translate-y-8 opacity-100 translate-y-0',
    'fade-in-left': 'opacity-0 translate-x-8 opacity-100 translate-x-0',
    'fade-in-right': 'opacity-0 -translate-x-8 opacity-100 translate-x-0',
    'zoom-in': 'opacity-0 scale-90 opacity-100 scale-100',
    'slide-in-up': 'translate-y-full opacity-100 translate-y-0',
    'slide-in-down': '-translate-y-full opacity-100 translate-y-0',
  };

  return (
    <div
      className={cn(
        'transition-all',
        animationClasses[animation],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </div>
  );
}

/**
 * 滚动触发动画
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  /** 动画类型 */
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'zoom' | 'flip';
  /** 触发阈值 */
  threshold?: number;
  /** 延迟（毫秒） */
  delay?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  animation = 'slide-up',
  threshold = 0.1,
  delay = 0,
  className,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  const animationClasses = {
    fade: isVisible ? 'opacity-100' : 'opacity-0',
    'slide-up': isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
    'slide-down': isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8',
    zoom: isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
    flip: isVisible ? 'opacity-100 rotate-0' : 'opacity-0 rotate-y-90',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500 ease-out',
        animationClasses[animation],
        className
      )}
      style={{ transitionDelay: delay ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}

/**
 * 骨架屏过渡到内容
 */
interface SkeletonFadeProps {
  children: React.ReactNode;
  loading: boolean;
  skeleton?: React.ReactNode;
  fadeDuration?: number;
  className?: string;
}

export function SkeletonFade({
  children,
  loading,
  skeleton,
  fadeDuration = 300,
  className,
}: SkeletonFadeProps) {
  return (
    <div className={cn('relative', className)}>
      {/* 骨架屏 */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity',
          loading ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
        )}
        style={{ transitionDuration: `${fadeDuration}ms` }}
      >
        {skeleton}
      </div>

      {/* 实际内容 */}
      <div
        className={cn(
          'transition-opacity',
          loading ? 'opacity-0' : 'opacity-100'
        )}
        style={{ transitionDuration: `${fadeDuration}ms` }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 页面切换动画样式（需要添加到 globals.css）
 */
export const pageTransitionStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }

  @keyframes particle-fade {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(calc(-50% + var(--x, 0px)), calc(-50% + var(--y, 0px))) scale(0);
    }
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @keyframes sparkle {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
    }
  }

  @keyframes bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes slide-in-top {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
