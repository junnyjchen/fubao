/**
 * @fileoverview 组件代码分割工具
 * @description 提供动态导入组件的工具函数
 * @module lib/async-components
 */

import dynamic from 'next/dynamic';
import { ComponentType, ReactElement, ReactNode, useState, useEffect, useRef } from 'react';

/**
 * 加载状态组件类型
 */
type LoadingComponent = ReactElement | null;

/**
 * 动态导入选项
 */
interface DynamicImportOptions {
  /** 加载中显示的组件 */
  loading?: LoadingComponent;
  /** ssr 模式，默认 true */
  ssr?: boolean;
  /** 自定义加载延迟（毫秒） */
  loadingDelay?: number;
}

/**
 * 默认加载组件
 */
function DefaultLoading() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

/**
 * 通用动态导入函数
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
): T {
  const { loading, ssr = true, loadingDelay } = options;

  return dynamic(
    () => importFn(),
    {
      ssr,
      loading: () => (loading || <DefaultLoading />),
    }
  ) as unknown as T;
}

// ============ 条件加载组件 ============

/**
 * 根据条件动态加载组件
 */
interface ConditionalLazyProps {
  condition: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConditionalLazy({ condition, children, fallback = null }: ConditionalLazyProps) {
  return condition ? <>{children}</> : <>{fallback}</>;
}

/**
 * 基于视口的动态加载
 */
interface ViewportLazyProps {
  children: ReactNode;
  /** 根边距 */
  rootMargin?: string;
  /** 相交比例阈值 */
  threshold?: number;
  /** 加载前的占位符 */
  placeholder?: ReactNode;
  /** 加载完成后是否移除占位符 */
  unmountPlaceholderOnLoad?: boolean;
}

export function ViewportLazy({
  children,
  rootMargin = '100px',
  threshold = 0,
  placeholder,
  unmountPlaceholderOnLoad = true,
}: ViewportLazyProps) {
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
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return (
    <div ref={ref}>
      {(!isVisible || !unmountPlaceholderOnLoad) && placeholder && (
        <div className={unmountPlaceholderOnLoad && isVisible ? 'hidden' : ''}>
          {placeholder}
        </div>
      )}
      {isVisible && children}
    </div>
  );
}

/**
 * 预加载组件钩子
 */
export function usePreload(importFn: () => Promise<any>) {
  useEffect(() => {
    importFn();
  }, []);
}

/**
 * 预加载多个组件
 */
export function usePreloadMultiple(importFns: Array<() => Promise<any>>) {
  useEffect(() => {
    importFns.forEach(fn => fn());
  }, []);
}
