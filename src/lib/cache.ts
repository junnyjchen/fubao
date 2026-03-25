/**
 * @fileoverview 缓存管理工具
 * @description 前端缓存管理和工具函数
 * @module lib/cache
 */

// 缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
  tags?: string[]; // 用于批量清除
}

// 缓存配置
interface CacheConfig {
  prefix: string;
  defaultTtl: number; // 默认生存时间（毫秒）
  maxSize: number; // 最大缓存条数
}

// 默认配置
const defaultConfig: CacheConfig = {
  prefix: 'fubao_cache_',
  defaultTtl: 5 * 60 * 1000, // 5分钟
  maxSize: 100,
};

let config: CacheConfig = defaultConfig;

/**
 * 配置缓存
 */
export function configureCache(newConfig: Partial<CacheConfig>) {
  config = { ...config, ...newConfig };
}

/**
 * 生成缓存键
 */
function generateKey(key: string): string {
  return `${config.prefix}${key}`;
}

/**
 * 检查缓存是否过期
 */
function isExpired<T>(item: CacheItem<T>): boolean {
  return Date.now() - item.timestamp > item.ttl;
}

/**
 * 获取缓存大小
 */
function getCacheSize(): number {
  let size = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(config.prefix)) {
      size++;
    }
  }
  return size;
}

/**
 * 清理过期缓存
 */
function cleanupExpired(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(config.prefix)) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '');
        if (isExpired(item)) {
          keysToRemove.push(key);
        }
      } catch {
        keysToRemove.push(key);
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * 清理超出大小的缓存（LRU策略）
 */
function cleanupOverflow(): void {
  const items: { key: string; timestamp: number }[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(config.prefix)) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '');
        items.push({ key, timestamp: item.timestamp });
      } catch {
        // 忽略解析错误
      }
    }
  }

  // 按时间排序，删除最旧的
  items.sort((a, b) => a.timestamp - b.timestamp);
  const toRemove = items.slice(0, items.length - config.maxSize);
  toRemove.forEach(({ key }) => localStorage.removeItem(key));
}

/**
 * 设置缓存
 */
export function setCache<T>(
  key: string,
  data: T,
  options?: {
    ttl?: number;
    tags?: string[];
  }
): void {
  // 清理过期缓存
  cleanupExpired();

  // 检查大小限制
  if (getCacheSize() >= config.maxSize) {
    cleanupOverflow();
  }

  const cacheKey = generateKey(key);
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    ttl: options?.ttl || config.defaultTtl,
    tags: options?.tags,
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(item));
  } catch {
    // 存储失败时清理并重试
    cleanupExpired();
    cleanupOverflow();
    try {
      localStorage.setItem(cacheKey, JSON.stringify(item));
    } catch {
      console.warn('Cache storage failed:', key);
    }
  }
}

/**
 * 获取缓存
 */
export function getCache<T>(key: string): T | null {
  const cacheKey = generateKey(key);

  try {
    const raw = localStorage.getItem(cacheKey);
    if (!raw) return null;

    const item: CacheItem<T> = JSON.parse(raw);

    // 检查过期
    if (isExpired(item)) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return item.data;
  } catch {
    return null;
  }
}

/**
 * 删除缓存
 */
export function removeCache(key: string): void {
  const cacheKey = generateKey(key);
  localStorage.removeItem(cacheKey);
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(config.prefix)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * 按标签清除缓存
 */
export function clearCacheByTag(tag: string): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(config.prefix)) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '');
        if (item.tags?.includes(tag)) {
          keysToRemove.push(key);
        }
      } catch {
        // 忽略解析错误
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * 获取或设置缓存（带回调）
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    tags?: string[];
  }
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  const data = await fetcher();
  setCache(key, data, options);
  return data;
}

/**
 * 缓存装饰器（用于函数）
 */
export function cached<T extends (...args: unknown[]) => Promise<unknown>>(
  keyGenerator: (...args: Parameters<T>) => string,
  options?: {
    ttl?: number;
    tags?: string[];
  }
) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: unknown, ...args: Parameters<T>) {
      const cacheKey = keyGenerator(...args);
      const cached = getCache<ReturnType<T>>(cacheKey);

      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod?.apply(this, args);
      setCache(cacheKey, result, options);
      return result;
    } as T;

    return descriptor;
  };
}

/**
 * 内存缓存（用于频繁访问的数据）
 */
class MemoryCache<T> {
  private cache = new Map<string, CacheItem<T>>();

  set(key: string, data: T, ttl: number = config.defaultTtl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (isExpired(item)) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// 导出内存缓存实例
export const memoryCache = new MemoryCache();

/**
 * Session缓存（会话级别，关闭浏览器后清除）
 */
export const sessionCache = {
  set<T>(key: string, data: T): void {
    const cacheKey = generateKey(key);
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch {
      console.warn('Session cache set failed:', key);
    }
  },

  get<T>(key: string): T | null {
    const cacheKey = generateKey(key);
    try {
      const raw = sessionStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    const cacheKey = generateKey(key);
    sessionStorage.removeItem(cacheKey);
  },

  clear(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(config.prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  },
};

/**
 * 预定义缓存键
 */
export const CacheKeys = {
  // 商品相关
  PRODUCTS: 'products',
  PRODUCT: (id: string) => `product_${id}`,
  CATEGORIES: 'categories',
  BANNERS: 'banners',

  // 用户相关
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_FAVORITES: (userId: string) => `user_favorites_${userId}`,
  USER_CART: (userId: string) => `user_cart_${userId}`,

  // 订单相关
  ORDERS: (userId: string) => `orders_${userId}`,
  ORDER: (orderId: string) => `order_${orderId}`,

  // 内容相关
  ARTICLES: 'articles',
  ARTICLE: (slug: string) => `article_${slug}`,
  VIDEOS: 'videos',

  // 设置相关
  SETTINGS: 'settings',
  REGION_SETTINGS: 'region_settings',
};

/**
 * 预定义缓存标签
 */
export const CacheTags = {
  PRODUCTS: 'products',
  USERS: 'users',
  ORDERS: 'orders',
  CONTENT: 'content',
  SETTINGS: 'settings',
};

// 页面加载时清理过期缓存
if (typeof window !== 'undefined') {
  window.addEventListener('load', cleanupExpired);
}

export default {
  set: setCache,
  get: getCache,
  remove: removeCache,
  clear: clearCache,
  clearByTag: clearCacheByTag,
  getOrSet: getOrSetCache,
  memory: memoryCache,
  session: sessionCache,
};
