/**
 * @fileoverview 商品评价组件
 * @description 展示商品评价列表和评分统计
 * @module components/review/ReviewSection
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, ThumbsUp, Image as ImageIcon, ChevronRight, Sparkles, Plus, Camera } from 'lucide-react';

interface Review {
  id: number;
  order_id: number;
  goods_id: number;
  user_id: string;
  rating: number;
  content: string | null;
  images: string[] | null;
  created_at: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

interface RatingStats {
  avg: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewSectionProps {
  goodsId: number;
  limit?: number;
}

export function ReviewSection({ goodsId, limit = 5 }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    avg: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [goodsId, page]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?goods_id=${goodsId}&page=${page}&limit=${limit}`
      );
      const data = await res.json();
      
      if (data.data) {
        setReviews(prev => page === 1 ? data.data : [...prev, ...data.data]);
        setTotal(data.total);
      }
      if (data.ratingStats) {
        setRatingStats(data.ratingStats);
      }
    } catch (error) {
      console.error('加载评价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const hasMore = reviews.length < total;

  return (
    <div className="space-y-6">
      {/* 评分统计 */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-8">
            {/* 平均分 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {ratingStats.avg.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mt-1">
                {renderStars(Math.round(ratingStats.avg))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {ratingStats.total} 條評價
              </div>
            </div>

            {/* 评分分布 */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingStats.distribution[star as keyof typeof ratingStats.distribution];
                const percentage = ratingStats.total > 0
                  ? Math.round((count / ratingStats.total) * 100)
                  : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star}星</span>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 如愿 - 晒图分享入口 */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  如願
                  <Badge variant="secondary" className="text-xs">曬圖專區</Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  分享您的心願達成，讓更多人見證美好
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/shares?goods_id=${goodsId}`}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Camera className="w-4 h-4" />
                  查看分享
                </Button>
              </Link>
              <Link href={`/shares/publish?goods_id=${goodsId}`}>
                <Button size="sm" className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  <Plus className="w-4 h-4" />
                  我要分享
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 评价列表 */}
      {reviews.length === 0 && !loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              暫無評價
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  {/* 用户头像 */}
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      review.user.name.charAt(0)
                    )}
                  </div>

                  <div className="flex-1">
                    {/* 用户名和评分 */}
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{review.user.name}</span>
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {/* 评价内容 */}
                    {review.content && (
                      <p className="mt-2 text-sm text-foreground/90">
                        {review.content}
                      </p>
                    )}

                    {/* 评价图片 */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80"
                          >
                            <img
                              src={img}
                              alt={`评价图片${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                        <ThumbsUp className="w-4 h-4" />
                        有幫助
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={loading}
              >
                {loading ? '載入中...' : '查看更多評價'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
