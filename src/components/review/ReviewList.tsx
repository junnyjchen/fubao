'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/image';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Review {
  id: number;
  user_id: number;
  user_nickname?: string;
  user_avatar?: string;
  goods_id: number;
  goods_name?: string;
  order_id?: number;
  rating: number;
  content: string;
  images?: string[];
  reply?: {
    content: string;
    created_at: string;
    merchant_name?: string;
  };
  likes: number;
  is_liked?: boolean;
  created_at: string;
}

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export function ReviewList({
  reviews,
  loading = false,
  onLoadMore,
  hasMore = false,
}: ReviewListProps) {
  if (loading && reviews.length === 0) {
    return <ReviewListSkeleton count={3} />;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无评价</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  showGoods?: boolean;
}

export function ReviewCard({ review, showGoods = false }: ReviewCardProps) {
  const [showAllImages, setShowAllImages] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const { success, error } = useToast();

  const handleLike = async () => {
    try {
      // API call would go here
      success(review.is_liked ? '取消点赞' : '点赞成功');
    } catch (err) {
      error('操作失败');
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar
            src={review.user_avatar}
            alt={review.user_nickname || '用户'}
            size="sm"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {review.user_nickname || '匿名用户'}
              </span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3 h-3',
                      i < review.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRelativeTime(review.created_at)}
            </p>
          </div>
          <button className="p-1 text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-sm">{review.content}</p>
          
          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {review.images.slice(0, showAllImages ? undefined : 4).map((image, i) => (
                <div
                  key={i}
                  className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setShowAllImages(true)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`评价图片 ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {review.images.length > 4 && !showAllImages && (
                <div
                  className="shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center cursor-pointer"
                  onClick={() => setShowAllImages(true)}
                >
                  <span className="text-sm text-muted-foreground">
                    +{review.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Goods info */}
        {showGoods && review.goods_name && (
          <div className="mt-3 p-2 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">评价商品</p>
            <p className="text-sm mt-1">{review.goods_name}</p>
          </div>
        )}

        {/* Reply */}
        {review.reply && (
          <div
            className="mt-3 p-3 bg-muted/50 rounded-lg cursor-pointer"
            onClick={() => setShowReply(!showReply)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-primary font-medium">
                商家回复
              </span>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(review.reply.created_at)}
              </span>
            </div>
            {showReply && (
              <p className="text-sm mt-2">{review.reply.content}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1 text-sm transition-colors',
              review.is_liked
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {review.is_liked ? (
              <ThumbsUp className="w-4 h-4 fill-current" />
            ) : (
              <ThumbsUp className="w-4 h-4" />
            )}
            <span>{review.likes || 0}</span>
          </button>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Flag className="w-4 h-4" />
            <span>举报</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Rating Filter
interface RatingFilterProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  counts?: Record<number, number>;
}

export function RatingFilter({ value, onChange, counts }: RatingFilterProps) {
  const options = [
    { label: '全部', value: null },
    { label: '5星', value: 5 },
    { label: '4星', value: 4 },
    { label: '3星', value: 3 },
    { label: '2星', value: 2 },
    { label: '1星', value: 1 },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value ?? 'all'}
          onClick={() => onChange(option.value)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-full border transition-colors',
            value === option.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary'
          )}
        >
          {option.label}
          {counts && option.value !== null && counts[option.value] !== undefined && (
            <span className="ml-1 text-xs opacity-70">({counts[option.value]})</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Rating Summary
interface RatingSummaryProps {
  average: number;
  distribution: Record<number, number>;
  total: number;
}

export function RatingSummary({ average, distribution, total }: RatingSummaryProps) {
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-6">
          {/* Average */}
          <div className="text-center">
            <p className="text-4xl font-bold">{average.toFixed(1)}</p>
            <div className="flex mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-4 h-4',
                    i < Math.round(average)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{total} 条评价</p>
          </div>

          {/* Distribution */}
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs w-6">{star}星</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{
                      width: `${((distribution[star] || 0) / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {distribution[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Submit Review Form
interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  goodsId: number;
  orderId?: number;
  loading?: boolean;
}

export interface ReviewFormData {
  rating: number;
  content: string;
  images?: string[];
}

export function ReviewForm({
  isOpen,
  onClose,
  onSubmit,
  goodsId,
  orderId,
  loading = false,
}: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const { success, error } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      error('请选择评分');
      return;
    }
    if (!content.trim()) {
      error('请输入评价内容');
      return;
    }
    try {
      await onSubmit({ rating, content, images: [] });
      success('评价成功');
      onClose();
    } catch (err) {
      error('评价失败');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="发表评价" size="md">
      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">商品评分</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-colors hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-8 h-8',
                    star <= (hoverRating || rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium mb-2 block">评价内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享您的购物体验..."
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-lg resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {content.length}/500
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="text-sm font-medium mb-2 block">上传图片（可选）</label>
          <div className="flex gap-2 flex-wrap">
            <button className="w-20 h-20 border-2 border-dashed border-muted rounded-lg flex items-center justify-center hover:border-primary transition-colors">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            提交评价
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Skeleton
export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                <div className="w-16 h-3 bg-muted animate-pulse rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-muted animate-pulse rounded" />
              <div className="w-2/3 h-4 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
