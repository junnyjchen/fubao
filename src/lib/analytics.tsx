/**
 * @fileoverview 用户行为分析埋点
 * @description 提供用户行为追踪和分析功能
 * @module lib/analytics
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * 安全序列化对象，避免循环引用
 */
function safeStringify(obj: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    // 跳过函数和 undefined
    if (typeof value === 'function' || value === undefined) {
      return undefined;
    }
    // 跳过 DOM 元素
    if (value instanceof Element || value instanceof Node) {
      return '[DOM Element]';
    }
    // 跳过循环引用
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  });
}

/**
 * 事件类型
 */
type EventType =
  | 'page_view'
  | 'click'
  | 'search'
  | 'view_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'checkout'
  | 'purchase'
  | 'sign_up'
  | 'sign_in'
  | 'sign_out'
  | 'share'
  | 'custom';

/**
 * 用户属性
 */
interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  phone?: string;
  registeredAt?: string;
  vipLevel?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * 事件参数
 */
interface EventParams {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * 分析服务配置
 */
interface AnalyticsConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 应用 ID */
  appId?: string;
  /** API 地址 */
  apiUrl?: string;
  /** 自动追踪页面访问 */
  autoTrackPageView: boolean;
  /** 自动追踪点击 */
  autoTrackClick: boolean;
  /** 调试模式 */
  debug: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  autoTrackPageView: true,
  autoTrackClick: false,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * 分析器类
 */
class Analytics {
  private config: AnalyticsConfig;
  private queue: Array<{ event: string; params: EventParams; timestamp: number }> = [];
  private isProcessing = false;
  private userProperties: UserProperties = {};

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 配置
   */
  configure(config: Partial<AnalyticsConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * 设置用户属性
   */
  setUser(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };
    this.track('user_set', properties);
  }

  /**
   * 清除用户
   */
  clearUser() {
    this.userProperties = {};
    this.track('user_clear');
  }

  /**
   * 追踪事件
   */
  track(eventName: string, params: EventParams = {}) {
    if (!this.config.enabled) return;

    const event = {
      event: eventName,
      params: {
        ...params,
        ...this.getCommonParams(),
      },
      timestamp: Date.now(),
    };

    if (this.config.debug) {
      console.log('[Analytics]', event);
    }

    // 添加到队列
    this.queue.push(event);

    // 处理队列
    this.processQueue();
  }

  /**
   * 获取通用参数
   */
  private getCommonParams(): EventParams {
    return {
      url: typeof window !== 'undefined' ? window.location.href : '',
      referrer: typeof window !== 'undefined' ? document.referrer : '',
      screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
      screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
      language: typeof navigator !== 'undefined' ? navigator.language : '',
      userId: this.userProperties.userId,
    };
  }

  /**
   * 处理事件队列
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        await this.sendEvent(event);
      }
    }

    this.isProcessing = false;
  }

  /**
   * 发送事件到服务器
   */
  private async sendEvent(event: { event: string; params: EventParams; timestamp: number }) {
    if (!this.config.apiUrl) return;

    try {
      await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeStringify(event),
        keepalive: true,
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('[Analytics] Send error:', error);
      }
    }
  }

  // ============ 快捷追踪方法 ============

  /**
   * 页面访问
   */
  pageView(page: string, title?: string) {
    this.track('page_view', {
      page,
      title,
    });
  }

  /**
   * 点击事件
   */
  click(element: string, label?: string) {
    this.track('click', {
      element,
      label,
    });
  }

  /**
   * 搜索
   */
  search(keyword: string, resultCount?: number) {
    this.track('search', {
      keyword,
      result_count: resultCount,
    });
  }

  /**
   * 商品浏览
   */
  viewProduct(productId: string | number, productName: string, category?: string, price?: number) {
    this.track('view_product', {
      product_id: productId,
      product_name: productName,
      category,
      price,
    });
  }

  /**
   * 加入购物车
   */
  addToCart(productId: string | number, productName: string, price: number, quantity: number) {
    this.track('add_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      quantity,
    });
  }

  /**
   * 移出购物车
   */
  removeFromCart(productId: string | number) {
    this.track('remove_from_cart', {
      product_id: productId,
    });
  }

  /**
   * 加入愿望清单
   */
  addToWishlist(productId: string | number, productName: string) {
    this.track('add_to_wishlist', {
      product_id: productId,
      product_name: productName,
    });
  }

  /**
   * 移出愿望清单
   */
  removeFromWishlist(productId: string | number) {
    this.track('remove_from_wishlist', {
      product_id: productId,
    });
  }

  /**
   * 结账
   */
  checkout(orderId: string, totalAmount: number, itemCount: number) {
    this.track('checkout', {
      order_id: orderId,
      total_amount: totalAmount,
      item_count: itemCount,
    });
  }

  /**
   * 购买完成
   */
  purchase(orderId: string, totalAmount: number, items: Array<{ id: string; name: string; price: number; quantity: number }>) {
    this.track('purchase', {
      order_id: orderId,
      total_amount: totalAmount,
      items: JSON.stringify(items),
    });
  }

  /**
   * 注册
   */
  signUp(method: string) {
    this.track('sign_up', {
      method,
    });
  }

  /**
   * 登录
   */
  signIn(method: string) {
    this.track('sign_in', {
      method,
    });
  }

  /**
   * 分享
   */
  share(contentType: string, contentId: string, platform: string) {
    this.track('share', {
      content_type: contentType,
      content_id: contentId,
      platform,
    });
  }
}

// 创建全局实例
export const analytics = new Analytics();

/**
 * 初始化分析器
 */
export function initAnalytics(config?: Partial<AnalyticsConfig>) {
  analytics.configure({
    ...config,
    apiUrl: config?.apiUrl || process.env.NEXT_PUBLIC_ANALYTICS_URL,
    appId: config?.appId || process.env.NEXT_PUBLIC_ANALYTICS_APP_ID,
  });
}

/**
 * React Hook: 分析追踪
 */
export function useAnalytics() {
  const track = useCallback((event: string, params?: EventParams) => {
    analytics.track(event, params);
  }, []);

  const pageView = useCallback((page: string, title?: string) => {
    analytics.pageView(page, title);
  }, []);

  const viewProduct = useCallback((productId: string | number, productName: string, category?: string, price?: number) => {
    analytics.viewProduct(productId, productName, category, price);
  }, []);

  const addToCart = useCallback((productId: string | number, productName: string, price: number, quantity: number) => {
    analytics.addToCart(productId, productName, price, quantity);
  }, []);

  const purchase = useCallback((orderId: string, totalAmount: number, items: Array<{ id: string; name: string; price: number; quantity: number }>) => {
    analytics.purchase(orderId, totalAmount, items);
  }, []);

  return {
    track,
    pageView,
    viewProduct,
    addToCart,
    purchase,
    analytics,
  };
}

/**
 * 自动页面追踪组件
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const lastPath = useRef('');

  useEffect(() => {
    initAnalytics();

    // 追踪初始页面
    analytics.pageView(window.location.pathname, document.title);
    lastPath.current = window.location.pathname;

    // 监听路由变化
    const handleRouteChange = () => {
      if (window.location.pathname !== lastPath.current) {
        analytics.pageView(window.location.pathname, document.title);
        lastPath.current = window.location.pathname;
      }
    };

    // 使用 MutationObserver 监听 DOM 变化（适用于客户端路由）
    const observer = new MutationObserver(handleRouteChange);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}

/**
 * 自动点击追踪 Hook
 */
export function useAutoTrackClick(selector: string = '[data-track]') {
  useEffect(() => {
    const config = analytics.getConfig?.() || DEFAULT_CONFIG;
    if (!config.autoTrackClick) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const trackElement = target.closest('[data-track]') as HTMLElement;

      if (trackElement) {
        const trackData = trackElement.dataset;
        analytics.track(trackData.track || 'click', {
          element: trackData.trackElement || trackElement.tagName.toLowerCase(),
          label: trackData.trackLabel || trackElement.textContent?.trim(),
          ...trackData,
        });
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);
}

/**
 * 商品追踪 Hook
 */
export function useProductTracking() {
  const trackView = useCallback((product: { id: string | number; name: string; category?: string; price?: number }) => {
    analytics.viewProduct(product.id, product.name, product.category, product.price);
  }, []);

  const trackAddToCart = useCallback((product: { id: string | number; name: string; price: number }, quantity: number = 1) => {
    analytics.addToCart(product.id, product.name, product.price, quantity);
  }, []);

  const trackAddToWishlist = useCallback((product: { id: string | number; name: string }) => {
    analytics.addToWishlist(product.id, product.name);
  }, []);

  return {
    trackView,
    trackAddToCart,
    trackAddToWishlist,
  };
}

/**
 * 订单追踪 Hook
 */
export function useOrderTracking() {
  const trackCheckout = useCallback((order: { id: string; totalAmount: number; itemCount: number }) => {
    analytics.checkout(order.id, order.totalAmount, order.itemCount);
  }, []);

  const trackPurchase = useCallback((
    order: { id: string; totalAmount: number },
    items: Array<{ id: string; name: string; price: number; quantity: number }>
  ) => {
    analytics.purchase(order.id, order.totalAmount, items);
  }, []);

  return {
    trackCheckout,
    trackPurchase,
  };
}

/**
 * 搜索追踪 Hook
 */
export function useSearchTracking() {
  const track = useCallback((keyword: string, resultCount?: number) => {
    analytics.search(keyword, resultCount);
  }, []);

  return { trackSearch: track };
}

/**
 * 分享追踪 Hook
 */
export function useShareTracking() {
  const track = useCallback((contentType: string, contentId: string, platform: string) => {
    analytics.share(contentType, contentId, platform);
  }, []);

  return { trackShare: track };
}
