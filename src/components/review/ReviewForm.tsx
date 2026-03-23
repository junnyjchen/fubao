/**
 * @fileoverview 评价表单组件
 * @description 用户提交商品评价
 * @module components/review/ReviewForm
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Camera, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  orderId: number;
  goodsId: number;
  goodsName: string;
  goodsImage: string | null;
  onSuccess?: () => void;
}

export function ReviewForm({
  orderId,
  goodsId,
  goodsName,
  goodsImage,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        variant: 'destructive',
        title: '請選擇評分',
      });
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
          content,
          images,
        }),
      });

      const data = await res.json();
      
      if (data.message) {
        toast({
          title: '評價成功',
          description: '感謝您的評價',
        });
        onSuccess?.();
      } else if (data.error) {
        toast({
          variant: 'destructive',
          title: '評價失敗',
          description: data.error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '評價失敗',
        description: '網絡錯誤，請重試',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 模拟图片上传（实际项目中需要上传到服务器）
    const newImages: string[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newImages.push(e.target.result as string);
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages].slice(0, 5));
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">評價商品</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 商品信息 */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
            {goodsImage ? (
              <img
                src={goodsImage}
                alt={goodsName}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              '暫無圖片'
            )}
          </div>
          <div>
            <p className="font-medium">{goodsName}</p>
            <p className="text-sm text-muted-foreground">訂單號：{orderId}</p>
          </div>
        </div>

        {/* 评分选择 */}
        <div>
          <label className="text-sm font-medium mb-2 block">評分</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 hover:fill-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              {rating === 5 ? '非常好' : rating === 4 ? '好' : rating === 3 ? '一般' : rating === 2 ? '差' : '很差'}
            </span>
          </div>
        </div>

        {/* 评价内容 */}
        <div>
          <label className="text-sm font-medium mb-2 block">評價內容（選填）</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享您的使用體驗，幫助其他用戶做出選擇"
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {content.length}/500
          </p>
        </div>

        {/* 图片上传 */}
        <div>
          <label className="text-sm font-medium mb-2 block">上傳圖片（最多5張）</label>
          <div className="flex gap-2 flex-wrap">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden border"
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">上傳</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              '提交評價'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
