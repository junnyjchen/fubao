/**
 * @fileoverview 页面过渡动画组件
 * @description 提供页面切换时的过渡动画效果
 * @module components/ui/PageTransition
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  /** 动画类型 */
  type?: 'fade' | 'slide' | 'scale' | 'blur';
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 页面过渡动画组件
 */
export function PageTransition({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  className,
}: PageTransitionProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClasses = {
    fade: cn(
      'transition-opacity',
      isVisible ? 'opacity-100' : 'opacity-0'
    ),
    slide: cn(
      'transition-all',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    ),
    scale: cn(
      'transition-all',
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    ),
    blur: cn(
      'transition-all',
      isVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
    ),
  };

  return (
    <div
      className={cn(animationClasses[type], className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * 列表项交错动画
 */
interface StaggeredListProps {
  children: React.ReactNode[];
  /** 每项延迟（毫秒） */
  staggerDelay?: number;
  /** 动画类型 */
  animation?: 'fade' | 'slide' | 'scale';
  /** 自定义类名 */
  className?: string;
  /** 子元素容器类名 */
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  animation = 'slide',
  className,
  itemClassName,
}: StaggeredListProps) {
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= children.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, staggerDelay);

    return () => clearInterval(timer);
  }, [children.length, staggerDelay]);

  const animationClasses = {
    fade: 'opacity-0 transition-opacity duration-300',
    slide: 'opacity-0 translate-y-4 transition-all duration-300',
    scale: 'opacity-0 scale-95 transition-all duration-300',
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            animationClasses[animation],
            index < visibleCount && 'opacity-100 translate-y-0 scale-100',
            itemClassName
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * 数字增长动画
 */
interface CountUpProps {
  /** 目标值 */
  end: number;
  /** 起始值 */
  start?: number;
  /** 持续时间（毫秒） */
  duration?: number;
  /** 小数位数 */
  decimals?: number;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 自定义类名 */
  className?: string;
}

export function CountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: CountUpProps) {
  const [count, setCount] = React.useState(start);
  const countRef = React.useRef(start);
  const startTimeRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      // 使用 easeOutQuart 缓动函数
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      const current = start + (end - start) * easeProgress;
      countRef.current = current;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, start, duration]);

  return (
    <span className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/**
 * 打字机效果
 */
interface TypewriterProps {
  /** 要显示的文本 */
  text: string;
  /** 打字速度（毫秒/字符） */
  speed?: number;
  /** 打字完成后显示的光标 */
  cursor?: string;
  /** 是否闪烁光标 */
  blinkCursor?: boolean;
  /** 打字完成回调 */
  onComplete?: () => void;
  /** 自定义类名 */
  className?: string;
}

export function Typewriter({
  text,
  speed = 50,
  cursor = '|',
  blinkCursor = true,
  onComplete,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = React.useState('');
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && <span>{cursor}</span>}
      {isComplete && blinkCursor && (
        <span className="animate-pulse">{cursor}</span>
      )}
    </span>
  );
}

export default PageTransition;
