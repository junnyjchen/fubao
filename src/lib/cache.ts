/**
 * @fileoverview API 响应缓存工具
 * @description 提供服务端数据缓存功能
 * @module lib/cache
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * 缓存配置
 */
interface CacheConfig {
  /** 缓存标签 */
  tags: string[];
  /** 缓存时间（秒） */
  revalidate?: number;
}

/**
 * 分类列表缓存配置
 */
const CATEGORIES_CACHE: CacheConfig = {
  tags: ['categories'],
  revalidate: 3600, // 1小时
};

/**
 * 商品列表缓存配置
 */
const GOODS_LIST_CACHE: CacheConfig = {
  tags: ['goods', 'goods-list'],
  revalidate: 300, // 5分钟
};

/**
 * 商品详情缓存配置
 */
const GOODS_DETAIL_CACHE: CacheConfig = {
  tags: ['goods'],
  revalidate: 600, // 10分钟
};

/**
 * 文章列表缓存配置
 */
const ARTICLES_CACHE: CacheConfig = {
  tags: ['articles', 'articles-list'],
  revalidate: 600, // 10分钟
};

/**
 * 文章详情缓存配置
 */
const ARTICLE_DETAIL_CACHE: CacheConfig = {
  tags: ['articles'],
  revalidate: 1800, // 30分钟
};

/**
 * 视频列表缓存配置
 */
const VIDEOS_CACHE: CacheConfig = {
  tags: ['videos', 'videos-list'],
  revalidate: 600,
};

/**
 * 首页数据缓存配置
 */
const HOME_CACHE: CacheConfig = {
  tags: ['home', 'categories', 'goods', 'articles'],
  revalidate: 300,
};

/**
 * 创建缓存查询函数
 */
export function createCachedQuery<T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  config: CacheConfig,
  cacheKey: string
) {
  return unstable_cache(
    async (...args: Parameters<T>) => {
      try {
        return await queryFn(...args);
      } catch (error) {
        console.error(`Cached query error [${cacheKey}]:`, error);
        throw error;
      }
    },
    [], // 参数数组，实际使用时会通过 args 生成
    {
      tags: config.tags,
      revalidate: config.revalidate,
    }
  );
}

/**
 * 重新验证缓存
 */
export function invalidateCache(tags: string | string[]) {
  const tagArray = Array.isArray(tags) ? tags : [tags];
  tagArray.forEach(tag => {
    revalidateTag(tag, 'page');
  });
}

/**
 * 重新验证特定路径的缓存
 */
export function invalidatePath(paths: string | string[]) {
  const pathArray = Array.isArray(paths) ? paths : [paths];
  pathArray.forEach(path => {
    revalidatePath(path);
  });
}

/**
 * 重新验证商品相关缓存
 */
export function invalidateGoodsCache(goodsId?: number) {
  invalidateCache(['goods', 'goods-list']);
  if (goodsId) {
    invalidateCache(`goods-${goodsId}`);
  }
  invalidatePath('/shop');
  invalidatePath('/');
}

/**
 * 重新验证文章相关缓存
 */
export function invalidateArticlesCache(articleId?: number) {
  invalidateCache(['articles', 'articles-list']);
  if (articleId) {
    invalidateCache(`article-${articleId}`);
  }
  invalidatePath('/news');
  invalidatePath('/wiki');
  invalidatePath('/');
}

/**
 * 重新验证分类缓存
 */
export function invalidateCategoriesCache() {
  invalidateCache(['categories']);
  invalidatePath('/categories');
  invalidatePath('/');
}

/**
 * 重新验证首页缓存
 */
export function invalidateHomeCache() {
  invalidateCache(['home', 'categories', 'goods', 'articles', 'videos']);
  invalidatePath('/');
}

/**
 * 内存缓存存储
 */
class MemoryCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttl || this.defaultTTL),
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期项
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// 创建实例
export const memoryCache = new MemoryCache();

// 定期清理过期项
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 60000); // 每分钟清理一次
}

/**
 * 带内存缓存的请求包装器
 */
export async function cachedFetch<T>(
  url: string,
  options?: {
    ttl?: number;
    key?: string;
    cache?: MemoryCache<T>;
  }
): Promise<T> {
  const { ttl, key = url, cache = memoryCache } = options || {};

  // 尝试从内存缓存获取
  const cached = cache.get(key);
  if (cached !== null) {
    return cached as T;
  }

  // 发起请求
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // 存入内存缓存
  cache.set(key, data, ttl);

  return data;
}

/**
 * SWR 风格的重新验证钩子
 */
export function useRevalidate() {
  return {
    revalidateGoods: invalidateGoodsCache,
    revalidateArticles: invalidateArticlesCache,
    revalidateCategories: invalidateCategoriesCache,
    revalidateHome: invalidateHomeCache,
    revalidateCache: invalidateCache,
    revalidatePath: invalidatePath,
  };
}

// 导出缓存配置供其他地方使用
export const cacheConfigs = {
  CATEGORIES_CACHE,
  GOODS_LIST_CACHE,
  GOODS_DETAIL_CACHE,
  ARTICLES_CACHE,
  ARTICLE_DETAIL_CACHE,
  VIDEOS_CACHE,
  HOME_CACHE,
};
