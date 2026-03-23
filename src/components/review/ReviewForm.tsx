'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Star, Loader2, Image as ImageIcon } from 'lucide-react';

interface ReviewFormProps {
  orderId: number;
  goodsId: number;
  goodsName: string;
  goodsImage?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ReviewForm({
  orderId,
  goodsId,
  goodsName,
  goodsImage,
  onSuccess,
  trigger,
}: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert('請填寫評價內容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          goods_id: goodsId,
          user_id: 'current-user', // TODO: 从session获取
          rating,
          content,
          images: images.length > 0 ? images : null,
        }),
      });

      const data = await res.json();

      if (data.message) {
        alert('評價成功');
        setOpen(false);
        onSuccess?.();
      } else {
        alert(data.error || '評價失敗');
      }
    } catch (error) {
      console.error('提交评价失败:', error);
      alert('評價失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageAdd = () => {
    const url = prompt('請輸入圖片URL');
    if (url && url.trim()) {
      setImages(prev => [...prev, url.trim()]);
    }
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">評價</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>發表評價</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 商品信息 */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
              {goodsImage ? (
                <img src={goodsImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <p className="flex-1 text-sm font-medium truncate">{goodsName}</p>
          </div>

          {/* 评分 */}
          <div className="space-y-2">
            <Label>評分</Label>
            <div className="flex items-center gap-1">
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
                        : 'fill-gray-200 text-gray-200 hover:fill-gray-300 hover:text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-lg font-medium">{rating}分</span>
            </div>
          </div>

          {/* 评价内容 */}
          <div className="space-y-2">
            <Label htmlFor="content">評價內容 *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="分享您的使用體驗..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>

          {/* 图片上传 */}
          <div className="space-y-2">
            <Label>評價圖片（選填）</Label>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded overflow-hidden bg-muted group"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(idx)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={handleImageAdd}
                  className="w-16 h-16 rounded border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">最多上傳5張圖片</p>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
