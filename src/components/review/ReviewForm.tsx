/**
 * @fileoverview 评价表单组件
 * @description 支持图片上传的商品评价表单
 * @module components/review/ReviewForm
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Camera, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewFormProps {
  orderId: number;
  goodsId: number;
  goodsName: string;
  goodsImage?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * 评价表单组件
 */
export function ReviewForm({
  orderId,
  goodsId,
  goodsName,
  goodsImage,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理图片上传
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 最多上传5张图片
    const remainingSlots = 5 - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast.error('最多只能上傳5張圖片');
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        // 检查文件大小 (最大5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`圖片 ${file.name} 超過5MB，已跳過`);
          continue;
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          toast.error(`文件 ${file.name} 不是圖片格式，已跳過`);
          continue;
        }

        // 创建FormData上传
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'review');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
        toast.success(`已上傳 ${uploadedUrls.length} 張圖片`);
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上傳失敗，請重試');
    } finally {
      setUploading(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * 删除图片
   */
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * 提交评价
   */
  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('請填寫評價內容');
      return;
    }

    if (content.trim().length < 10) {
      toast.error('評價內容至少需要10個字');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          goodsId,
          rating,
          content: content.trim(),
          images: images.length > 0 ? images : undefined,
        }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('評價成功，獲得10積分獎勵！');
        onSuccess?.();
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      toast.error('提交失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* 商品信息 */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
            {goodsImage ? (
              <img
                src={goodsImage}
                alt={goodsName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium line-clamp-2">{goodsName}</p>
            <p className="text-sm text-muted-foreground">訂單編號：{orderId}</p>
          </div>
        </div>

        {/* 评分选择 */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">評分</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating === 5 ? '非常滿意' : rating === 4 ? '滿意' : rating === 3 ? '一般' : rating === 2 ? '不滿意' : '非常不滿意'}
            </span>
          </div>
        </div>

        {/* 评价内容 */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">
            評價內容
            <span className="text-muted-foreground font-normal ml-2">
              ({content.length}/500)
            </span>
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 500))}
            placeholder="分享您的使用心得，幫助其他用戶了解這款商品..."
            className="min-h-[120px] resize-none"
          />
        </div>

        {/* 图片上传 */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">
            上傳圖片
            <span className="text-muted-foreground font-normal ml-2">
              (最多5張，每張不超過5MB)
            </span>
          </label>
          
          <div className="flex flex-wrap gap-3">
            {/* 已上传的图片 */}
            {images.map((url, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-lg overflow-hidden border"
              >
                <img
                  src={url}
                  alt={`評價圖片${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* 上传按钮 */}
            {images.length < 5 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">上傳</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                提交評價
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
