/**
 * @fileoverview 用户评价展示组件
 * @description 展示已领取用户的评价
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ThumbsUp, Image as ImageIcon, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Review {
  id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  content: string;
  images?: string[];
  gift_name: string;
  created_at: string;
  likes: number;
  is_liked?: boolean;
}

interface ReviewListProps {
  reviews: Review[];
  maxShow?: number;
  showGiftName?: boolean;
}

// 模拟评价数据
export function getMockReviews(): Review[] {
  return [
    {
      id: 1,
      user_name: '陳**',
      rating: 5,
      content: '收到平安符了，做工很精緻，包裝也很用心。希望能保佑家人平安！',
      images: [],
      gift_name: '平安符（開光加持）',
      created_at: '2024-03-20',
      likes: 128,
      is_liked: false,
    },
    {
      id: 2,
      user_name: '林**',
      rating: 5,
      content: '香囊味道很自然，放在枕頭邊很安心。到店領取很方便，店員也很熱情。',
      images: [],
      gift_name: '道家養生香囊',
      created_at: '2024-03-18',
      likes: 86,
      is_liked: true,
    },
    {
      id: 3,
      user_name: '黃**',
      rating: 4,
      content: '手環質量不錯，戴著很舒服。就是快遞慢了點，等了3天才到。',
      images: [],
      gift_name: '六字真言手環',
      created_at: '2024-03-15',
      likes: 45,
      is_liked: false,
    },
  ];
}

export function ReviewList({ 
  reviews, 
  maxShow = 3,
  showGiftName = true 
}: ReviewListProps) {
  const [likedReviews, setLikedReviews] = useState<Set<number>>(
    new Set(reviews.filter(r => r.is_liked).map(r => r.id))
  );
  const [showAll, setShowAll] = useState(false);

  const displayReviews = showAll ? reviews : reviews.slice(0, maxShow);

  const handleLike = (reviewId: number) => {
    setLikedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">暫無評價</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 统计 */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">用戶評價</span>
        <Badge variant="secondary">{reviews.length}條</Badge>
        <div className="flex items-center gap-1 ml-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="font-medium">
            {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
          </span>
        </div>
      </div>

      {/* 评价列表 */}
      <div className="space-y-3">
        {displayReviews.map((review) => (
          <Card key={review.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {review.user_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{review.user_name}</span>
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.created_at}</span>
                  </div>
                  
                  {showGiftName && (
                    <p className="text-xs text-muted-foreground mb-1">
                      領取：{review.gift_name}
                    </p>
                  )}
                  
                  <p className="text-sm text-foreground/90 line-clamp-2">
                    {review.content}
                  </p>
                  
                  {/* 图片 */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.slice(0, 3).map((img, idx) => (
                        <div 
                          key={idx}
                          className="w-16 h-16 rounded bg-muted flex items-center justify-center"
                        >
                          <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 点赞 */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleLike(review.id)}
                      className={`flex items-center gap-1 text-xs ${
                        likedReviews.has(review.id) 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${likedReviews.has(review.id) ? 'fill-current' : ''}`} />
                      <span>{review.likes + (likedReviews.has(review.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 查看更多 */}
      {reviews.length > maxShow && !showAll && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowAll(true)}
        >
          查看全部 {reviews.length} 條評價
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}

/**
 * 评价预览卡片（用于商品详情页）
 */
export function ReviewPreview({ 
  reviews,
  onViewAll 
}: { 
  reviews: Review[];
  onViewAll?: () => void;
}) {
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onViewAll}>
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-lg">{avgRating}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {reviews.length}條評價
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        
        {reviews.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-1">
            「{reviews[0].content}」
          </p>
        )}
      </CardContent>
    </Card>
  );
}
