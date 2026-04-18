/**
 * @fileoverview 首屏加载优化组件
 * @description 提供预加载、预连接等性能优化组件
 * @module components/performance/PerformanceOptimizations
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';

/**
 * DNS 预解析
 */
interface DnsPrefetchProps {
  /** 域名列表 */
  domains: string[];
}

export function DnsPrefetch({ domains }: DnsPrefetchProps) {
  return (
    <>
      {domains.map(domain => (
        <link
          key={domain}
          rel="dns-prefetch"
          href={domain}
        />
      ))}
    </>
  );
}

/**
 * 资源预加载
 */
interface ResourceHintProps {
  /** 预加载的资源 */
  resources: Array<{
    href: string;
    type: 'preload' | 'prefetch' | 'preconnect';
    as?: 'script' | 'style' | 'image' | 'font' | 'fetch';
    crossOrigin?: 'anonymous' | 'use-credentials';
  }>;
}

export function ResourceHint({ resources }: ResourceHintProps) {
  return (
    <>
      {resources.map((resource, index) => (
        <link
          key={index}
          rel={resource.type}
          href={resource.href}
          as={resource.as}
          crossOrigin={resource.crossOrigin}
        />
      ))}
    </>
  );
}

/**
 * 预连接
 */
interface PreconnectProps {
  /** 预连接的域名 */
  domains: Array<{
    href: string;
    includeCredentials?: boolean;
  }>;
}

export function PreconnectDomains({ domains }: PreconnectProps) {
  return (
    <>
      {domains.map(domain => (
        <link
          key={domain.href}
          rel="preconnect"
          href={domain.href}
          crossOrigin={domain.includeCredentials ? 'anonymous' : undefined}
        />
      ))}
    </>
  );
}

/**
 * 字体预加载
 */
interface FontPreloadProps {
  fonts: Array<{
    family: string;
    weights?: number[];
    style?: 'normal' | 'italic';
  }>;
}

export function FontPreload({ fonts }: FontPreloadProps) {
  return (
    <>
      {fonts.map(font => (
        <link
          key={font.family}
          rel="preload"
          as="font"
          href={`/fonts/${font.family.toLowerCase().replace(/\s/g, '-')}.woff2`}
          type="font/woff2"
          crossOrigin="anonymous"
        />
      ))}
    </>
  );
}

/**
 * 关键 CSS 内联提示
 */
interface CriticalCSSProps {
  css: string;
}

export function CriticalCSS({ css }: CriticalCSSProps) {
  return (
    <style
      dangerouslySetInnerHTML={{ __html: css }}
      media="print"
      onLoad={(e) => {
        (e.target as HTMLStyleElement).media = 'all';
      }}
    />
  );
}

/**
 * 图片预加载
 */
interface ImagePreloadProps {
  images: Array<{
    src: string;
    type?: string;
    sizes?: string;
  }>;
}

export function ImagePreload({ images }: ImagePreloadProps) {
  return (
    <>
      {images.map((image, index) => (
        <link
          key={index}
          rel="preload"
          as="image"
          href={image.src}
          {...(image.type && { type: image.type })}
        />
      ))}
    </>
  );
}

/**
 * 脚本预加载
 */
interface ScriptPreloadProps {
  scripts: Array<{
    src: string;
    async?: boolean;
    defer?: boolean;
  }>;
}

export function ScriptPreload({ scripts }: ScriptPreloadProps) {
  return (
    <>
      {scripts.map((script, index) => (
        <script
          key={index}
          src={script.src}
          async={script.async}
          defer={script.defer}
        />
      ))}
    </>
  );
}

/**
 * 性能监控组件
 */
interface PerformanceMonitorProps {
  onReport?: (metrics: PerformanceMetrics) => void;
  enabled?: boolean;
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  load: number; // Page Load Time
}

export function PerformanceMonitor({ onReport, enabled = true }: PerformanceMonitorProps) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const metrics: PerformanceMetrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0,
      load: 0,
    };

    // 观察 FCP
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntriesByName('first-contentful-paint');
      if (entries.length > 0) {
        metrics.fcp = entries[0].startTime;
      }
    });

    // 观察 LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];
      const lastEntry = entries[entries.length - 1];
      metrics.lcp = lastEntry.startTime;
    });

    // 观察 CLS
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ('hadRecentInput' in entry && !(entry as any).hadRecentInput) {
          metrics.cls += (entry as any).value || 0;
        }
      }
    });

    // 观察 FID
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      if (entries.length > 0) {
        metrics.fid = (entries[0] as any).processingStart - entries[0].startTime;
      }
    });

    try {
      fcpObserver.observe({ type: 'paint', buffered: true });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // 某些指标可能不支持
    }

    // 获取 TTFB
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      metrics.ttfb = nav.responseStart;
      metrics.load = nav.loadEventEnd;
    }

    // 页面加载完成后报告
    window.addEventListener('load', () => {
      setTimeout(() => {
        onReport?.(metrics);
        
        // 输出到控制台（生产环境可移除）
        if (process.env.NODE_ENV === 'development') {
          console.log('Performance Metrics:', metrics);
        }
      }, 0);
    });

    return () => {
      fcpObserver.disconnect();
      lcpObserver.disconnect();
      clsObserver.disconnect();
      fidObserver.disconnect();
    };
  }, [enabled, onReport]);

  return null;
}

/**
 * 预读取下一个页面
 */
interface PrefetchNextProps {
  /** 要预取的链接 */
  links: string[];
  /** 预取方式 */
  method?: 'hover' | 'viewport' | 'tap' | 'load';
}

export function PrefetchNext({ links, method = 'viewport' }: PrefetchNextProps) {
  const prefetched = useRef<Set<string>>(new Set());

  // 预取下一个页面链接
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const url = (entry.target as HTMLAnchorElement).getAttribute('href');
            if (url && !prefetched.current.has(url)) {
              prefetched.current.add(url);
            }
          }
        });
      },
      { rootMargin: '200px' }
    );

    links.forEach((link) => {
      const element = document.querySelector(`a[href="${link}"]`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [links]);

  return null;
}

/**
 * 骨架屏预加载
 */
interface SkeletonPreloaderProps {
  /** 骨架屏内容 */
  skeleton: React.ReactNode;
  /** 实际内容 */
  children: React.ReactNode;
  /** 加载完成 */
  loaded: boolean;
  /** 最小显示时间（毫秒） */
  minDuration?: number;
}

export function SkeletonPreloader({
  skeleton,
  children,
  loaded,
  minDuration = 300,
}: SkeletonPreloaderProps) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (loaded) {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, minDuration - elapsed);
      const timer = setTimeout(() => setShowSkeleton(false), remaining);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(true);
      startTime.current = Date.now();
    }
  }, [loaded, minDuration]);

  return showSkeleton ? <>{skeleton}</> : <>{children}</>;
}

/**
 * 延迟加载的组件包装器
 */
interface LazyComponentProps {
  children: React.ReactNode;
  /** 加载前的占位符 */
  placeholder?: React.ReactNode;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 是否立即加载 */
  immediate?: boolean;
}

export function LazyComponent({
  children,
  placeholder = null,
  delay = 200,
  immediate = false,
}: LazyComponentProps) {
  const [show, setShow] = useState(immediate);

  useEffect(() => {
    if (immediate) return;

    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay, immediate]);

  return show ? <>{children}</> : <>{placeholder}</>;
}

/**
 * 预加载提示组件
 */
interface LoadingHintsProps {
  /** 是否显示 */
  show: boolean;
}

export function LoadingHints({ show }: LoadingHintsProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>优化中...</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 懒加载脚本
 */
interface LazyScriptProps {
  src: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyScript({ src, onLoad, onError }: LazyScriptProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    script.onload = () => {
      setLoaded(true);
      onLoad?.();
    };
    
    script.onerror = () => {
      onError?.();
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [src, onLoad, onError]);

  return null;
}

/**
 * 服务端预渲染提示
 */
export function PrerenderHints() {
  return (
    <>
      {/* 告诉浏览器预渲染这些页面 */}
      <meta name="prerender-status" content="false" />
      {/* 预搜索域名 */}
      <link rel="dns-prefetch" href="//www.google.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      {/* 预连接 */}
      <link rel="preconnect" href="https://www.google.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
    </>
  );
}
