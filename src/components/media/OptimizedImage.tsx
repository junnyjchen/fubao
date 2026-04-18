/**
 * @fileoverview 图片优化组件
 * @description 提供高级图片加载功能
 * @module components/media/OptimizedImage
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  /** 图片源 */
  src: string;
  /** 替代文本 */
  alt: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 填充模式 */
  fill?: boolean;
  /** 样式类名 */
  className?: string;
  /** 占位符类型 */
  placeholder?: 'blur' | 'empty' | 'skeleton';
  /** 模糊图片（base64） */
  blurDataURL?: string;
  /** 加载优先级 */
  priority?: boolean;
  /** 懒加载 */
  lazy?: boolean;
  /** 渐进式加载 */
  progressive?: boolean;
  /** 错误时的占位图 */
  fallbackSrc?: string;
  /** 动画时长 */
  animationDuration?: number;
  /** 点击回调 */
  onClick?: () => void;
  /** 加载完成回调 */
  onLoad?: () => void;
  /** 加载错误回调 */
  onError?: () => void;
}

/**
 * 优化的图片组件
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  placeholder = 'empty',
  blurDataURL,
  priority = false,
  lazy = true,
  progressive = true,
  fallbackSrc,
  animationDuration = 300,
  onClick,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const imgRef = useRef<HTMLDivElement>(null);

  // 渐进式加载模拟
  useEffect(() => {
    if (!progressive || loaded) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progressive, loaded]);

  const handleLoad = () => {
    setLoaded(true);
    setProgress(100);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // 错误时使用占位图
  const finalSrc = error && fallbackSrc ? fallbackSrc : src;

  // 默认模糊图
  const defaultBlur =
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2telecsrT2A1MfNOX3+ogFlmWiuI1lhkWSNhlWUhlI9iDxSlVVQf//Z';

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        placeholder === 'skeleton' && !loaded && 'animate-pulse bg-muted',
        className
      )}
      onClick={onClick}
    >
      {/* 渐进式加载进度条 */}
      {progressive && !loaded && !error && (
        <div
          className="absolute inset-0 z-10 bg-muted/30"
          style={{
            clipPath: `inset(0 ${100 - progress}% 0 0)`,
            transition: 'clip-path 0.1s linear',
          }}
        />
      )}

      {/* 占位符 */}
      {placeholder === 'blur' && !loaded && (
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `url(${blurDataURL || defaultBlur})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}

      {placeholder === 'skeleton' && !loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* 实际图片 */}
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        priority={priority}
        loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
        placeholder={placeholder === 'blur' ? 'blur' : 'empty'}
        blurDataURL={placeholder === 'blur' ? blurDataURL || defaultBlur : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-all duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          progressive && !loaded && 'scale-105',
          fill && 'object-cover',
          !fill && 'w-full h-full'
        )}
        style={{
          transitionDuration: `${animationDuration}ms`,
        }}
        {...props}
      />

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <svg
            className="w-12 h-12 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * 图片画廊组件
 */
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  }>;
  /** 缩略图大小 */
  thumbnailSize?: number;
  className?: string;
}

export function ImageGallery({ images, thumbnailSize = 80, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  const handleImageClick = (index: number) => {
    setActiveIndex(index);
    setLoadedImages(prev => new Set(prev).add(index));
  };

  if (images.length === 0) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 主图 */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <OptimizedImage
          src={images[activeIndex].src}
          alt={images[activeIndex].alt || `Image ${activeIndex + 1}`}
          fill
          priority={activeIndex === 0}
          progressive
        />
      </div>

      {/* 缩略图 */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={cn(
                'relative flex-shrink-0 rounded-md overflow-hidden transition-all',
                activeIndex === index
                  ? 'ring-2 ring-primary ring-offset-2'
                  : 'opacity-60 hover:opacity-100'
              )}
              style={{
                width: thumbnailSize,
                height: thumbnailSize,
              }}
            >
              <OptimizedImage
                src={image.src}
                alt={image.alt || `Thumbnail ${index + 1}`}
                fill
                lazy={!loadedImages.has(index)}
                progressive={!loadedImages.has(index)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 头像组件
 */
interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export function Avatar({ src, alt, size = 'md', fallback, className }: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const displayText = fallback || (alt ? alt.charAt(0).toUpperCase() : 'U');

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-primary/10 flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {src && !error ? (
        <Image
          src={src}
          alt={alt || 'Avatar'}
          fill
          className="object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span className="font-medium text-primary">{displayText}</span>
      )}
    </div>
  );
}

/**
 * 图片预览组件
 */
interface ImagePreviewProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImagePreview({ src, alt, onClose }: ImagePreviewProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <Image
          src={src}
          alt={alt || 'Preview'}
          width={1200}
          height={1200}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          priority
        />
      </div>
    </div>
  );
}
