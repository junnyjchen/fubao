/**
 * @fileoverview 图片懒加载组件
 * @description 支持懒加载、占位符、错误处理的图片组件
 * @module components/ui/ImageLazy
 */

'use client';

import { useState, useRef, useEffect } from 'react';
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
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallback?: string;
}

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
  placeholder = 'empty',
  blurDataURL,
  fallback = '/images/placeholder.png',
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
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        fill ? 'h-full w-full' : '',
        containerClassName
      )}
      style={!fill ? { width, height } : undefined}
    >
      {/* 占位符骨架屏 */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            className
          )}
        />
      )}

      {/* 图片 */}
      {isInView && (
        <Image
          src={hasError ? fallback : src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          sizes={sizes}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      )}
    </div>
  );
}
