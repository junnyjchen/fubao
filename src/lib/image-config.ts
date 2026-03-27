/**
 * @fileoverview 图片配置和工具
 * @description 图片相关的配置和工具函数
 * @module lib/image-config
 */

/**
 * 默认图片路径
 */
export const DEFAULT_IMAGES = {
  /** 默认商品图片 */
  goods: '/images/placeholder-goods.svg',
  /** 默认用户头像 */
  avatar: '/images/placeholder-avatar.svg',
  /** 默认商户Logo */
  merchant: '/images/placeholder-goods.svg',
  /** 默认新闻封面 */
  news: '/images/placeholder-goods.svg',
  /** 默认视频封面 */
  video: '/images/placeholder-goods.svg',
  /** 默认百科封面 */
  wiki: '/images/placeholder-goods.svg',
  /** 默认横幅 */
  banner: '/images/placeholder-goods.svg',
} as const;

/**
 * 图片加载失败处理
 * 替换为默认占位图
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc?: string
) {
  const img = event.currentTarget;
  if (img.src !== fallbackSrc) {
    img.src = fallbackSrc || DEFAULT_IMAGES.goods;
    img.onerror = null; // 防止无限循环
  }
}

/**
 * 图片优化配置
 */
export const IMAGE_CONFIG = {
  /** 商品图片尺寸 */
  goods: {
    thumbnail: { width: 100, height: 100 },
    small: { width: 200, height: 200 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
  },
  /** 头像尺寸 */
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
  },
  /** 横幅尺寸 */
  banner: {
    mobile: { width: 750, height: 400 },
    desktop: { width: 1920, height: 600 },
  },
} as const;

/**
 * 图片质量配置
 */
export const IMAGE_QUALITY = {
  low: 50,
  medium: 75,
  high: 90,
} as const;

/**
 * 判断图片URL是否有效
 */
export function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith('/');
  }
}

/**
 * 获取优化的图片URL
 * 添加图片处理参数
 */
export function getOptimizedImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string {
  if (!url || url.startsWith('data:')) return url;
  
  // 如果是相对路径，直接返回
  if (url.startsWith('/')) return url;
  
  // 如果URL不支持图片处理，直接返回
  return url;
}

export default DEFAULT_IMAGES;
