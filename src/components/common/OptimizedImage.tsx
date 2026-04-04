/**
 * @fileoverview 优化图片组件
 * @description 带懒加载、占位符和错误处理的优化图片组件
 * @module components/common/OptimizedImage
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
}

/**
 * 优化图片组件
 * - 自动懒加载（除非 priority=true）
 * - 加载状态显示
 * - 错误处理
 * - 响应式尺寸
 * - 性能优化
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  aspectRatio,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // 错误状态显示
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted',
          className,
          fill ? 'absolute inset-0' : 'rounded-lg'
        )}
        style={{
          width: fill ? undefined : width,
          height: fill ? undefined : height,
          aspectRatio: fill ? aspectRatio : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-6 h-6" />
          <span className="text-xs">圖片加載失敗</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden bg-muted/10', className)}
      style={{
        width: fill ? undefined : width,
        height: fill ? undefined : height,
        aspectRatio: fill ? aspectRatio : undefined,
      }}
    >
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* 优化的图片 */}
      <Image
        ref={imageRef}
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          fill ? 'object-cover' : 'object-contain'
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? undefined : 'lazy'}
      />
    </div>
  );
}

/**
 * 商品图片卡片组件
 * 用于商品列表和详情页
 */
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  showZoom?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  showZoom = true,
}: ProductImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn('relative group overflow-hidden rounded-lg bg-muted', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          'transition-transform duration-300',
          isHovered && showZoom && 'scale-105'
        )}
      />
    </div>
  );
}

/**
 * 头像组件
 * 支持加载失败时显示首字母
 */
interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  name?: string;
  size?: number;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  name,
  size = 40,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  // 如果没有图片或加载失败，显示首字母
  if (!src || hasError) {
    const initials = name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : alt.slice(0, 2);

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium',
          className
        )}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>{initials}</span>
      </div>
    );
  }

  return (
    <div
      className={cn('relative rounded-full overflow-hidden bg-muted', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        onError={() => setHasError(true)}
        className="object-cover"
      />
    </div>
  );
}

/**
 * Banner 图片组件
 * 用于首页轮播和广告横幅
 */
interface BannerImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: string;
}

export function BannerImage({
  src,
  alt,
  priority = false,
  className,
  aspectRatio = '16/9',
}: BannerImageProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        aspectRatio={aspectRatio}
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
