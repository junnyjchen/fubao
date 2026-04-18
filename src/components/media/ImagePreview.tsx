'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Maximize2,
} from 'lucide-react';

interface ImagePreviewProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
}

export function ImagePreview({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  alt = '图片',
}: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          prev();
          break;
        case 'ArrowRight':
          next();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case 'r':
          rotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1));
    resetTransform();
  }, [images.length]);

  const next = useCallback(() => {
    setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0));
    resetTransform();
  }, [images.length]);

  const resetTransform = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const rotate = () => setRotation((r) => (r + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {currentIndex + 1} / {images.length}
          </span>
          {alt && (
            <span className="text-sm text-white/70 truncate max-w-xs">
              {alt}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Image Area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className={cn(
            'relative transition-transform duration-200',
            isDragging && 'cursor-grabbing'
          )}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <Image
            src={images[currentIndex]}
            alt={`${alt} ${currentIndex + 1}`}
            width={800}
            height={800}
            className="max-w-[90vw] max-h-[80vh] object-contain"
            priority
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4">
        <button
          onClick={prev}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm w-16 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
            disabled={scale >= 3}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-2" />
          <button
            onClick={rotate}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={next}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetTransform();
              }}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === currentIndex
                  ? 'border-white opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-80'
              )}
            >
              <Image
                src={image}
                alt={`缩略图 ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Gallery Component (for product pages)
interface ImageGalleryProps {
  images: string[];
  alt?: string;
}

export function ImageGallery({ images, alt = '图片' }: ImageGalleryProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openPreview = (index: number) => {
    setActiveIndex(index);
    setPreviewOpen(true);
  };

  return (
    <>
      {/* Main Image */}
      <div
        className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-zoom-in"
        onClick={() => openPreview(0)}
      >
        <Image
          src={images[0]}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
            1/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => openPreview(index)}
              className={cn(
                'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                index === 0
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <ImagePreview
        images={images}
        initialIndex={activeIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        alt={alt}
      />
    </>
  );
}
