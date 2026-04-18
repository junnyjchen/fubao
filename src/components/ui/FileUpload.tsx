/**
 * @fileoverview 文件上传增强组件
 * @description 支持拖拽、多文件、进度显示的上传组件
 * @module components/ui/FileUpload
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  X,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  FileArchive,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// 文件类型图标映射
const fileTypeIcons: Record<string, React.ReactNode> = {
  image: <FileImage className="w-8 h-8 text-blue-500" />,
  video: <FileVideo className="w-8 h-8 text-purple-500" />,
  audio: <FileAudio className="w-8 h-8 text-pink-500" />,
  text: <FileText className="w-8 h-8 text-green-500" />,
  application: <FileArchive className="w-8 h-8 text-orange-500" />,
  default: <File className="w-8 h-8 text-gray-500" />,
};

// 获取文件类型图标
function getFileIcon(type: string): React.ReactNode {
  const category = type.split('/')[0];
  return fileTypeIcons[category] || fileTypeIcons.default;
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 上传文件状态
interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// 上传配置
interface UploadConfig {
  accept?: string[];
  maxSize?: number; // MB
  maxCount?: number;
  multiple?: boolean;
  autoUpload?: boolean;
}

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<{ url: string; error?: string }[]>;
  config?: UploadConfig;
  value?: string[];
  onChange?: (urls: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onUpload,
  config = {},
  value = [],
  onChange,
  className,
  disabled = false,
}: FileUploadProps) {
  const {
    accept = ['image/*', 'video/*', 'application/pdf'],
    maxSize = 10, // MB
    maxCount = 5,
    multiple = true,
    autoUpload = true,
  } = config;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 验证文件
  const validateFile = useCallback(
    (file: File): string | null => {
      // 检查大小
      if (file.size > maxSize * 1024 * 1024) {
        return `文件大小不能超過 ${maxSize}MB`;
      }

      // 检查类型
      const fileType = file.type.split('/')[0];
      const isAccepted = accept.some((type) => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAccepted) {
        return '不支持的文件類型';
      }

      return null;
    },
    [accept, maxSize]
  );

  // 处理文件选择
  const handleFiles = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles || disabled) return;

      const fileArray = Array.from(selectedFiles);
      const remainingSlots = maxCount - files.length - value.length;

      if (remainingSlots <= 0) {
        alert(`最多只能上傳 ${maxCount} 個文件`);
        return;
      }

      const filesToProcess = fileArray.slice(0, remainingSlots);

      // 创建上传文件对象
      const newFiles: UploadFile[] = filesToProcess.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'pending' as const,
      }));

      // 验证文件
      const validatedFiles = newFiles.map((f) => {
        const error = validateFile(f.file);
        return {
          ...f,
          error: error || undefined,
          status: error ? ('error' as const) : ('pending' as const),
        };
      });

      setFiles((prev) => [...prev, ...validatedFiles]);

      // 自动上传
      if (autoUpload) {
        const validFiles = validatedFiles.filter((f) => !f.error);
        if (validFiles.length > 0) {
          await uploadFiles(validFiles);
        }
      }
    },
    [disabled, files.length, maxCount, value.length, autoUpload, validateFile]
  );

  // 上传文件
  const uploadFiles = async (filesToUpload: UploadFile[]) => {
    // 更新状态为上传中
    setFiles((prev) =>
      prev.map((f) =>
        filesToUpload.find((uf) => uf.id === f.id)
          ? { ...f, status: 'uploading' as const }
          : f
      )
    );

    try {
      const results = await onUpload(filesToUpload.map((f) => f.file));

      // 更新上传结果
      setFiles((prev) =>
        prev.map((f) => {
          const index = filesToUpload.findIndex((uf) => uf.id === f.id);
          if (index === -1) return f;

          const result = results[index];
          return {
            ...f,
            status: result?.url ? ('success' as const) : ('error' as const),
            url: result?.url,
            error: result?.error,
            progress: 100,
          };
        })
      );

      // 更新外部值
      const successUrls = results
        .filter((r) => r?.url)
        .map((r) => r.url as string);
      onChange?.([...value, ...successUrls]);
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          filesToUpload.find((uf) => uf.id === f.id)
            ? { ...f, status: 'error' as const, error: '上傳失敗' }
            : f
        )
      );
    }
  };

  // 删除文件
  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file?.url) {
      onChange?.(value.filter((url) => url !== file.url));
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // 重试上传
  const retryUpload = async (id: string) => {
    const file = files.find((f) => f.id === id);
    if (file) {
      await uploadFiles([{ ...file, status: 'pending', error: undefined }]);
    }
  };

  // 拖拽处理
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* 上传区域 */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">拖拽文件至此處上傳</p>
        <p className="text-sm text-muted-foreground mb-4">
          或點擊選擇文件
        </p>
        <p className="text-xs text-muted-foreground">
          支持格式: {accept.join(', ')} | 最大 {maxSize}MB | 最多 {maxCount} 個文件
        </p>
      </div>

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
            >
              {/* 图标 */}
              <div className="flex-shrink-0">{getFileIcon(file.type)}</div>

              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>

                {/* 进度条 */}
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="h-1" />
                )}

                {/* 状态 */}
                <div className="flex items-center gap-1 mt-1">
                  {file.status === 'success' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      上傳成功
                    </span>
                  )}
                  {file.status === 'error' && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {file.error || '上傳失敗'}
                    </span>
                  )}
                  {file.status === 'uploading' && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      上傳中...
                    </span>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1">
                {file.status === 'error' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => retryUpload(file.id)}
                  >
                    重試
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 简化的图片上传
interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value = [],
  onChange,
  maxCount = 5,
  maxSize = 5,
  className,
  disabled = false,
}: ImageUploadProps) {
  const handleUpload = async (files: File[]): Promise<{ url: string }[]> => {
    // 这里应该调用实际的上传API
    // 示例：返回临时URL
    return files.map((file) => ({
      url: URL.createObjectURL(file),
    }));
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      config={{
        accept: ['image/*'],
        maxSize,
        maxCount,
        multiple: true,
      }}
      value={value}
      onChange={onChange}
      className={className}
      disabled={disabled}
    />
  );
}

// 单文件上传
interface SingleFileUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  accept?: string[];
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function SingleFileUpload({
  value,
  onChange,
  accept = ['image/*'],
  maxSize = 10,
  className,
  disabled = false,
}: SingleFileUploadProps) {
  const handleUpload = async (files: File[]): Promise<{ url: string }[]> => {
    // 示例上传
    return files.map((file) => ({
      url: URL.createObjectURL(file),
    }));
  };

  return (
    <FileUpload
      onUpload={handleUpload}
      config={{
        accept,
        maxSize,
        maxCount: 1,
        multiple: false,
      }}
      value={value ? [value] : []}
      onChange={(urls) => onChange?.(urls[0] || '')}
      className={className}
      disabled={disabled}
    />
  );
}

// 文件预览卡片
interface FilePreviewCardProps {
  url: string;
  name?: string;
  type?: string;
  onRemove?: () => void;
  className?: string;
}

export function FilePreviewCard({
  url,
  name,
  type,
  onRemove,
  className,
}: FilePreviewCardProps) {
  const isImage = type?.startsWith('image/');

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden border bg-muted/50',
        className
      )}
    >
      {isImage ? (
        <img
          src={url}
          alt={name || 'Preview'}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center">
          <File className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      {name && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
          {name}
        </div>
      )}

      {onRemove && (
        <button
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
