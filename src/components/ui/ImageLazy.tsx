/**
 * @fileoverview 图片懒加载组件
 * @description 支持懒加载、占位符、错误处理的图片组件
 * @module components/ui/ImageLazy
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageLazyProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty' | 'skeleton' | 'shimmer';
  blurDataURL?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
}

/**
 * 骨架屏动画样式
 */
const shimmer = `
  relative overflow-hidden before:absolute before:inset-0 
  before:-translate-x-full before:animate-[shimmer_2s_infinite]
  before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
`;

export function ImageLazy({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  containerClassName,
  priority = false,
  sizes,
  quality = 80,
  placeholder = 'skeleton',
  blurDataURL,
  fallback = '/images/placeholder.png',
  onLoad,
  onError,
  aspectRatio,
  objectFit = 'cover',
}: ImageLazyProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  // 占位符渲染
  const renderPlaceholder = () => {
    if (isLoaded || hasError) return null;

    switch (placeholder) {
      case 'skeleton':
        return (
          <div
            className={cn(
              'absolute inset-0 bg-muted animate-pulse',
              shimmer,
              className
            )}
          />
        );
      case 'shimmer':
        return (
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-r from-muted via-muted/50 to-muted',
              shimmer,
              className
            )}
          />
        );
      case 'blur':
        return blurDataURL ? (
          <Image
            src={blurDataURL}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            className={cn('blur-lg scale-110', className)}
            aria-hidden
          />
        ) : (
          <div className={cn('absolute inset-0 bg-muted', className)} />
        );
      default:
        return (
          <div className={cn('absolute inset-0 bg-muted', className)} />
        );
    }
  };

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden bg-muted',
        fill && 'h-full w-full',
        !fill && width && height && 'inline-block',
        containerClassName
      )}
      style={{
        ...(!fill && width && height ? { width, height } : {}),
        ...(aspectRatio ? { aspectRatio } : {}),
      }}
    >
      {/* 占位符 */}
      {renderPlaceholder()}

      {/* 图片 */}
      {isInView && (
        <Image
          src={hasError ? fallback : src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={cn(
            'transition-all duration-500 ease-out',
            objectFitClass,
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
        />
      )}

      {/* 错误状态图标 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="text-center text-muted-foreground">
            <svg
              className="w-12 h-12 mx-auto mb-2 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">加載失敗</span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 头像图片组件
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackText?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
  fallbackText,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  const initials = fallbackText || alt.slice(0, 2).toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium',
          avatarSizes[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden', avatarSizes[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

/**
 * 商品图片组件
 */
interface ProductImageProps {
  src?: string | null;
  alt: string;
  aspectRatio?: string;
  className?: string;
  priority?: boolean;
  showBadge?: boolean;
  badgeText?: string;
}

export function ProductImage({
  src,
  alt,
  aspectRatio = '1/1',
  className,
  priority = false,
  showBadge = false,
  badgeText,
}: ProductImageProps) {
  return (
    <div
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      {src ? (
        <ImageLazy
          src={src}
          alt={alt}
          fill
          className="group-hover:scale-105 transition-transform duration-500"
          priority={priority}
          placeholder="shimmer"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <span className="text-4xl text-primary/30">符</span>
        </div>
      )}
      
      {showBadge && badgeText && (
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded">
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
