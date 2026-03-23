/**
 * @fileoverview 图片上传组件
 * @description 支持拖拽上传和点击上传图片
 * @module components/upload/ImageUpload
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  /** 已上传图片URL列表 */
  value?: string[];
  /** 上传完成回调 */
  onChange?: (urls: string[]) => void;
  /** 最大上传数量 */
  maxCount?: number;
  /** 最大文件大小(MB) */
  maxSize?: number;
  /** 上传文件夹路径 */
  folder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 提示文字 */
  placeholder?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  maxCount = 5,
  maxSize = 5,
  folder = 'images',
  disabled = false,
  showPreview = true,
  className,
  placeholder = '點擊或拖拽圖片到此處上傳',
}: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleUpload = useCallback(async (files: File[]) => {
    if (disabled) return;

    // 检查数量限制
    const remainingSlots = maxCount - value.length - uploadingFiles.length;
    if (remainingSlots <= 0) {
      toast.error(`最多只能上傳 ${maxCount} 張圖片`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    if (filesToUpload.length < files.length) {
      toast.warning(`已選擇超過數量限制，僅上傳前 ${filesToUpload.length} 張`);
    }

    // 验证文件
    const validFiles: File[] = [];
    for (const file of filesToUpload) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是圖片文件`);
        continue;
      }

      // 验证文件大小
      if (file.size > maxSize * 1024 * 1024) {
        toast.error(`${file.name} 超過 ${maxSize}MB 限制`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // 添加到上传队列
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // 逐个上传
    const uploadedUrls: string[] = [];
    for (const uploadFile of newUploadingFiles) {
      try {
        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('folder', folder);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (result.data) {
          uploadedUrls.push(result.data.url);
          setUploadingFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, progress: 100, status: 'success' as const }
                : f
            )
          );
        } else {
          throw new Error(result.error || '上傳失敗');
        }
      } catch (error) {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : '上傳失敗',
                }
              : f
          )
        );
      }
    }

    // 更新已上传列表
    if (uploadedUrls.length > 0) {
      const newUrls = [...value, ...uploadedUrls];
      onChange?.(newUrls);
    }

    // 延迟清除上传队列
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
    }, 1000);
  }, [disabled, maxCount, maxSize, folder, value, uploadingFiles.length, onChange]);

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleUpload(files);
    // 清空input以便重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleUpload(files);
  };

  // 删除图片
  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange?.(newUrls);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 上传区域 */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-primary hover:bg-primary/5'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{placeholder}</p>
            <p className="text-sm text-muted-foreground mt-1">
              支持 JPG、PNG、GIF、WebP，單個文件不超過 {maxSize}MB
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            已上傳 {value.length}/{maxCount} 張
          </p>
        </div>
      </div>

      {/* 上传进度 */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map(file => (
            <div key={file.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
              {file.status === 'uploading' && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              {file.status === 'success' && (
                <ImageIcon className="w-4 h-4 text-green-600" />
              )}
              {file.status === 'error' && (
                <X className="w-4 h-4 text-destructive" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.file.name}</p>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1 mt-1" />
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-destructive">{file.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 图片预览 */}
      {showPreview && value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={`${url}_${index}`}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted group"
            >
              <img
                src={url}
                alt={`圖片 ${index + 1}`}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="%23999" font-size="12">預覽</text></svg>';
                }}
              />
              {/* 删除按钮 */}
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 单图上传组件
 */
interface SingleImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  maxSize?: number;
  folder?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function SingleImageUpload({
  value,
  onChange,
  maxSize = 5,
  folder = 'images',
  disabled = false,
  className,
  placeholder = '點擊上傳圖片',
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (disabled || uploading) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片文件');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`圖片大小不能超過 ${maxSize}MB`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.data) {
        onChange?.(result.data.url);
        toast.success('上傳成功');
      } else {
        throw new Error(result.error || '上傳失敗');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上傳失敗');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />
      
      {value ? (
        <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
          <img
            src={value}
            alt="已上傳圖片"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '更換'
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onChange?.('')}
              >
                刪除
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
            !disabled && 'hover:border-primary hover:bg-primary/5'
          )}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground mt-1">
                最大 {maxSize}MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
