'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Review {
  id: number;
  merchant_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  goods_id?: number;
  goods_name?: string;
  rating: number;
  content: string;
  images?: string[];
  created_at: string;
}

interface MerchantReviewsProps {
  merchantId: number;
  goodsId?: number;
  canReview?: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export function MerchantReviews({
  merchantId,
  goodsId,
  canReview = false,
  averageRating = 0,
  totalReviews = 0,
}: MerchantReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [merchantId, goodsId]);

  async function loadReviews() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ merchant_id: String(merchantId) });
      if (goodsId) params.set('goods_id', String(goodsId));
      const res = await fetch(`/api/merchant/reviews?${params}`);
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setLoading(false);
    }
  }

  async function submitReview() {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/merchant/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: merchantId,
          goods_id: goodsId,
          rating,
          content: content.trim(),
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setContent('');
        setRating(5);
        loadReviews();
      }
    } catch (e) {
      console.error('Failed to submit review', e);
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars(r: number, interactive = false) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          interactive
            ? i < (hoverStar || rating)
              ? 'fill-yellow-400 text-yellow-400 cursor-pointer'
              : 'text-muted-foreground/30 cursor-pointer'
            : i < r
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground/30'
        }`}
        onMouseEnter={() => interactive && setHoverStar(i + 1)}
        onMouseLeave={() => interactive && setHoverStar(0)}
        onClick={() => interactive && setRating(i + 1)}
      />
    ));
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">商家評價</h3>
          {totalReviews > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
              <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({totalReviews} 條評價)</span>
            </div>
          )}
        </div>
        {canReview && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            撰寫評價
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">評分：</span>
            <div className="flex">{renderStars(rating, true)}</div>
          </div>
          <Textarea
            placeholder="分享您的購物體驗..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button size="sm" onClick={submitReview} disabled={submitting || !content.trim()}>
              {submitting ? '提交中...' : '提交評價'}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">載入中...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">暫無評價</div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {review.user_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">{review.user_name}</span>
                    {review.goods_name && (
                      <span className="text-xs text-muted-foreground ml-2">
                        購買：{review.goods_name}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('zh-TW')}
                </span>
              </div>
              <div className="flex">{renderStars(review.rating)}</div>
              <p className="text-sm text-muted-foreground">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
