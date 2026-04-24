'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallback?: string;
  fallbackType?: 'image' | 'icon' | 'color';
  loading?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function Image({
  src,
  alt = '',
  className,
  fallback = '/placeholder.png',
  fallbackType = 'icon',
  onLoad,
  onError,
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const currentSrc = hasError || !src ? fallback : src;

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="w-full h-full animate-pulse bg-muted-foreground/10" />
        </div>
      )}

      {/* Image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
        decoding="async"
      />

      {/* Fallback icon when no image */}
      {hasError && fallbackType === 'icon' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-muted-foreground/30"
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
        </div>
      )}
    </div>
  );
}

// Avatar with fallback
interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export function Avatar({
  src,
  alt = '',
  size = 'md',
  fallback,
  className,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const initials = alt
    ? alt
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted flex items-center justify-center font-medium text-muted-foreground',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : fallback ? (
        <img src={fallback} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

// Cover image with aspect ratio
interface CoverImageProps {
  src?: string | null;
  alt?: string;
  ratio?: '1/1' | '4/3' | '16/9' | '21/9';
  className?: string;
  fallback?: string;
}

export function CoverImage({
  src,
  alt = '',
  ratio = '4/3',
  className,
  fallback = '/placeholder.png',
}: CoverImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const currentSrc = hasError || !src ? fallback : src;

  const ratioClasses = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '21/9': 'aspect-[21/9]',
  };

  return (
    <div className={cn('relative overflow-hidden bg-muted', ratioClasses[ratio], className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        loading="lazy"
      />
    </div>
  );
}
