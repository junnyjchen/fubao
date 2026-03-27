/**
 * @fileoverview 图片懒加载组件
 * @description 带有占位图和加载状态的图片组件，支持懒加载和错误处理
 * @module components/ui/ImageWithPlaceholder
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { ImageIcon } from 'lucide-react';

interface ImageWithPlaceholderProps {
  /** 图片URL */
  src: string | null | undefined;
  /** 图片alt文本 */
  alt: string;
  /** 图片宽度 */
  width?: number;
  /** 图片高度 */
  height?: number;
  /** 填充模式 */
  fill?: boolean;
  /** 图片适应方式 */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  /** 优先加载 */
  priority?: boolean;
  /** 图片类名 */
  className?: string;
  /** 容器类名 */
  containerClassName?: string;
  /** 占位符类型 */
  placeholder?: 'skeleton' | 'icon' | 'blur' | 'none';
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 错误时显示的图标 */
  fallbackIcon?: React.ReactNode;
  /** 加载完成回调 */
  onLoad?: () => void;
  /** 加载错误回调 */
  onError?: () => void;
  /** 尺寸提示 */
  sizes?: string;
}

/**
 * 图片懒加载组件
 * 
 * @example
 * // 基本用法
 * <ImageWithPlaceholder
 *   src="/images/product.jpg"
 *   alt="Product"
 *   width={200}
 *   height={200}
 * />
 * 
 * @example
 * // 填充模式
 * <ImageWithPlaceholder
 *   src={imageUrl}
 *   alt="Product"
 *   fill
 *   objectFit="cover"
 *   containerClassName="aspect-square relative"
 * />
 */
export function ImageWithPlaceholder({
  src,
  alt,
  width,
  height,
  fill = false,
  objectFit = 'cover',
  priority = false,
  className,
  containerClassName,
  placeholder = 'skeleton',
  showLoading = true,
  fallbackIcon,
  onLoad,
  onError,
  sizes,
}: ImageWithPlaceholderProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // 当src变化时重置状态
  React.useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  // 无图片或加载错误时的占位符
  const renderFallback = () => {
    if (hasError || !src) {
      return (
        <div className={cn(
          'absolute inset-0 flex items-center justify-center',
          'bg-muted/50 text-muted-foreground/40',
          className
        )}>
          {fallbackIcon || (
            <ImageIcon className={cn(
              'text-muted-foreground/30',
              fill ? 'w-1/3 h-1/3' : 'w-8 h-8'
            )} />
          )}
        </div>
      );
    }
    return null;
  };

  // 加载中占位符
  const renderLoading = () => {
    if (!showLoading || !isLoading || hasError) return null;

    if (placeholder === 'skeleton') {
      return (
        <Skeleton
          variant="rectangular"
          className="absolute inset-0"
        />
      );
    }

    if (placeholder === 'icon') {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
          <ImageIcon className="w-8 h-8 text-muted-foreground/20 animate-pulse" />
        </div>
      );
    }

    if (placeholder === 'blur') {
      return (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      );
    }

    return null;
  };

  // 容器样式
  const containerStyle = fill
    ? { position: 'relative' as const }
    : { width, height };

  return (
    <div
      className={cn(
        'overflow-hidden',
        !fill && 'relative',
        containerClassName
      )}
      style={!fill ? containerStyle : undefined}
    >
      {/* 加载状态 */}
      {renderLoading()}

      {/* 错误或无图片状态 */}
      {renderFallback()}

      {/* 图片 */}
      {src && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={cn(
            'transition-opacity duration-300',
            objectFitClass,
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}

/**
 * 商品图片组件
 * 预设了商品图片的常用配置
 */
interface GoodsImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function GoodsImage({
  src,
  alt,
  className,
  containerClassName,
  priority = false,
  fill = true,
  width,
  height,
}: GoodsImageProps) {
  return (
    <ImageWithPlaceholder
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      objectFit="cover"
      priority={priority}
      className={className}
      containerClassName={containerClassName}
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );
}

/**
 * 头像图片组件
 */
interface AvatarImageProps {
  src: string | null | undefined;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
}: AvatarImageProps) {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
  };

  return (
    <ImageWithPlaceholder
      src={src}
      alt={alt}
      {...sizeMap[size]}
      objectFit="cover"
      containerClassName={cn('rounded-full overflow-hidden', className)}
      placeholder="icon"
    />
  );
}

/**
 * 背景图片组件
 */
interface BackgroundImageProps {
  src: string | null | undefined;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function BackgroundImage({
  src,
  alt,
  children,
  className,
  overlay = true,
  overlayOpacity = 0.3,
}: BackgroundImageProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <ImageWithPlaceholder
        src={src}
        alt={alt}
        fill
        objectFit="cover"
        placeholder="blur"
        className="absolute inset-0"
        containerClassName="absolute inset-0"
        priority
      />
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default ImageWithPlaceholder;
