/**
 * @fileoverview 性能监控工具
 * @description 前端性能监控和分析工具
 * @module lib/performance
 */

// 性能指标类型
interface PerformanceMetrics {
  // 首次内容绘制
  fcp: number | null;
  // 最大内容绘制
  lcp: number | null;
  // 首次输入延迟
  fid: number | null;
  // 累积布局偏移
  cls: number | null;
  // 交互时间
  tti: number | null;
  // 总阻塞时间
  tbt: number | null;
  // 服务器响应时间
  ttfb: number | null;
}

// 性能观察者回调
type PerformanceCallback = (metrics: PerformanceMetrics) => void;

// 存储回调函数
const callbacks: PerformanceCallback[] = [];

// 性能指标
const metrics: PerformanceMetrics = {
  fcp: null,
  lcp: null,
  fid: null,
  cls: null,
  tti: null,
  tbt: null,
  ttfb: null,
};

/**
 * 初始化性能监控
 */
export function initPerformanceMonitoring(callback?: PerformanceCallback) {
  if (typeof window === 'undefined') return;

  if (callback) {
    callbacks.push(callback);
  }

  // 检查 Performance Observer 支持
  if (!('PerformanceObserver' in window)) {
    console.warn('Performance Observer not supported');
    return;
  }

  // 监听 FCP
  observePerformance('paint', (entries) => {
    const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
      notifyCallbacks();
    }
  });

  // 监听 LCP
  observePerformance('largest-contentful-paint', (entries) => {
    const lcpEntry = entries[entries.length - 1];
    if (lcpEntry) {
      metrics.lcp = lcpEntry.startTime;
      notifyCallbacks();
    }
  });

  // 监听 FID
  observePerformance('first-input', (entries) => {
    const fidEntry = entries[0];
    if (fidEntry) {
      metrics.fid = (fidEntry as PerformanceEventTiming).processingStart - fidEntry.startTime;
      notifyCallbacks();
    }
  });

  // 监听 CLS
  observePerformance('layout-shift', (entries) => {
    let clsValue = 0;
    for (const entry of entries) {
      if (!(entry as LayoutShift).hadRecentInput) {
        clsValue += (entry as LayoutShift).value;
      }
    }
    metrics.cls = clsValue;
    notifyCallbacks();
  });

  // 监听长任务（用于计算TBT）
  observePerformance('longtask', (entries) => {
    let tbt = 0;
    for (const entry of entries) {
      tbt += entry.duration - 50; // 超过50ms的部分算作阻塞时间
    }
    metrics.tbt = tbt;
    notifyCallbacks();
  });

  // 计算 TTFB
  if (performance.timing) {
    const { responseStart, requestStart } = performance.timing;
    metrics.ttfb = responseStart - requestStart;
    notifyCallbacks();
  }
}

/**
 * 观察性能条目
 */
function observePerformance(
  entryType: string,
  callback: (entries: PerformanceEntry[]) => void
) {
  try {
    const observer = new PerformanceObserver((list) => {
      callback(list.getEntries());
    });
    observer.observe({ type: entryType, buffered: true });
  } catch (e) {
    // 某些浏览器可能不支持某些类型
  }
}

/**
 * 通知所有回调函数
 */
function notifyCallbacks() {
  callbacks.forEach((cb) => cb(metrics));
}

/**
 * 获取当前性能指标
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics };
}

/**
 * 获取资源加载时间
 */
export function getResourceTiming(): PerformanceResourceTiming[] {
  if (typeof window === 'undefined') return [];
  return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
}

/**
 * 获取慢资源（超过阈值的资源）
 */
export function getSlowResources(threshold = 1000): PerformanceResourceTiming[] {
  return getResourceTiming().filter(
    (resource) => resource.duration > threshold
  );
}

/**
 * 上报性能数据
 */
export async function reportPerformanceMetrics(
  endpoint: string,
  additionalData?: Record<string, unknown>
) {
  const data = {
    ...metrics,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  try {
    // 使用 sendBeacon 确保数据能够发送
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, JSON.stringify(data));
    } else {
      await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to report performance metrics:', error);
  }
}

/**
 * 测量函数执行时间
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  
  return { result, duration };
}

/**
 * 标记性能里程碑
 */
export function markPerformance(name: string) {
  if (typeof performance !== 'undefined') {
    performance.mark(name);
  }
}

/**
 * 测量两个标记之间的时间
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof performance !== 'undefined') {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      return measures[measures.length - 1]?.duration || 0;
    } catch {
      return 0;
    }
  }
  return 0;
}

// 类型声明
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
