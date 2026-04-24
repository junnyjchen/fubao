/**
 * @fileoverview 图片预览组件
 * @description 支持缩放、拖拽、旋转等功能的图片查看器
 * @module components/ui/ImagePreview
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
} from 'lucide-react';

interface ImagePreviewProps {
  images: { src: string; alt?: string }[];
  currentIndex?: number;
  open: boolean;
  onClose: () => void;
  showDownload?: boolean;
  showThumbnail?: boolean;
}

export function ImagePreview({
  images,
  currentIndex = 0,
  open,
  onClose,
  showDownload = true,
  showThumbnail = true,
}: ImagePreviewProps) {
  const [index, setIndex] = useState(currentIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // 重置状态
  const resetState = useCallback(() => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 切换图片时重置
  useEffect(() => {
    resetState();
  }, [index, resetState]);

  // 同步外部索引
  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  // 上一张
  const prevImage = useCallback(() => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // 下一张
  const nextImage = useCallback(() => {
    setIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // 放大
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 5));
  }, []);

  // 缩小
  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 0.5));
  }, []);

  // 左旋转
  const rotateCcw = useCallback(() => {
    setRotation((prev) => prev - 90);
  }, []);

  // 右旋转
  const rotateCw = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  // 下载
  const download = useCallback(async () => {
    const image = images[index];
    if (!image) return;

    try {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.alt || `image-${index}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // 直接打开链接
      window.open(image.src, '_blank');
    }
  }, [images, index]);

  // 拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  // 拖拽中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  // 拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
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
          rotateCw();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, prevImage, nextImage, onClose, zoomIn, zoomOut, rotateCw]);

  const currentImage = images[index];

  if (!open || !currentImage) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-xl w-full h-[90vh] p-0 bg-black/95">
        {/* 工具栏 */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-4 py-2">
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={rotateCcw}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={rotateCw}>
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetState}>
            <Maximize2 className="w-4 h-4" />
          </Button>
          {showDownload && (
            <>
              <div className="w-px h-4 bg-border mx-2" />
              <Button variant="ghost" size="icon" onClick={download}>
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
          <div className="w-px h-4 bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 主图片区域 */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <img
            src={currentImage.src}
            alt={currentImage.alt || `Image ${index + 1}`}
            className="max-w-full max-h-full object-contain select-none transition-transform"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              cursor: scale > 1 ? 'grab' : 'default',
            }}
            draggable={false}
          />

          {/* 左右切换按钮 */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                onClick={prevImage}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/80"
                onClick={nextImage}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* 底部缩略图 */}
        {showThumbnail && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-2 bg-background/80 backdrop-blur rounded-lg max-w-[80vw] overflow-x-auto">
              {images.map((image, i) => (
                <button
                  key={i}
                  className={cn(
                    'flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all',
                    i === index
                      ? 'border-primary opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                  onClick={() => setIndex(i)}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 计数器 */}
        <div className="absolute bottom-4 right-4 z-50 text-sm text-white/80 bg-black/50 px-2 py-1 rounded">
          {index + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 简化的图片预览按钮
interface ImagePreviewButtonProps {
  src: string;
  alt?: string;
  children: React.ReactNode;
  className?: string;
}

export function ImagePreviewButton({
  src,
  alt,
  children,
  className,
}: ImagePreviewButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={className} onClick={() => setOpen(true)}>
        {children}
      </div>
      <ImagePreview
        images={[{ src, alt }]}
        open={open}
        onClose={() => setOpen(false)}
        showThumbnail={false}
      />
    </>
  );
}

// 图片预览Hook
export function useImagePreview(images: { src: string; alt?: string }[]) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openPreview = useCallback((index = 0) => {
    setCurrentIndex(index);
    setOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setOpen(false);
  }, []);

  const PreviewComponent = useCallback(
    () => (
      <ImagePreview
        images={images}
        currentIndex={currentIndex}
        open={open}
        onClose={closePreview}
      />
    ),
    [images, currentIndex, open, closePreview]
  );

  return {
    open: openPreview,
    close: closePreview,
    isOpen: open,
    currentIndex,
    setCurrentIndex,
    PreviewComponent,
  };
}
