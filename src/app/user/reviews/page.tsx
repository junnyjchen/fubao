/**
 * @fileoverview 用户评价管理页面
 * @description 查看已发表的评价和待评价的订单
 * @module app/user/reviews/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  Package,
  MessageSquare,
  Loader2,
  ImagePlus,
  X,
  Send,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

/** 评价数据类型 */
interface Review {
  id: number;
  order_id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  rating: number;
  content: string | null;
  images: string[] | null;
  reply: string | null;
  reply_time: string | null;
  created_at: string;
}

/** 待评价订单项 */
interface PendingReviewItem {
  order_id: number;
  order_no: string;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  price: string;
  quantity: number;
  order_time: string;
}

/**
 * 用户评价管理页面
 */
export default function UserReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // 评价弹窗状态
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PendingReviewItem | null>(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  /**
   * 加载数据
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载已评价和待评价
      const [reviewsRes, pendingRes] = await Promise.all([
        fetch('/api/user/reviews'),
        fetch('/api/user/reviews/pending'),
      ]);

      const reviewsData = await reviewsRes.json();
      const pendingData = await pendingRes.json();

      if (reviewsData.data) {
        setReviews(reviewsData.data);
      }
      if (pendingData.data) {
        setPendingItems(pendingData.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开评价弹窗
   */
  const openReviewDialog = (item: PendingReviewItem) => {
    setSelectedItem(item);
    setRating(5);
    setContent('');
    setImages([]);
    setReviewDialogOpen(true);
  };

  /**
   * 提交评价
   */
  const handleSubmitReview = async () => {
    if (!selectedItem) return;

    if (!content.trim()) {
      toast.error('請填寫評價內容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedItem.order_id,
          goods_id: selectedItem.goods_id,
          user_id: 1, // TODO: 从认证获取
          rating,
          content: content.trim(),
          images: images.length > 0 ? images : null,
        }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('評價成功');
        setReviewDialogOpen(false);
        loadData();
      } else {
        toast.error(data.error || '評價失敗');
      }
    } catch (error) {
      console.error('提交評價失敗:', error);
      toast.error('提交失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 渲染评分星星
   */
  const renderStars = (value: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 cursor-${
              interactive ? 'pointer' : 'default'
            } transition-colors ${
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            onClick={() => interactive && setRating(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <UserLayout title="我的評價">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            待評價
            {pendingItems.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            已評價
          </TabsTrigger>
        </TabsList>

        {/* 待评价列表 */}
        <TabsContent value="pending">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : pendingItems.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">暫無待評價商品</h3>
                <p className="text-muted-foreground mb-4">
                  完成訂單後即可對商品進行評價
                </p>
                <Button asChild>
                  <Link href="/shop">去購物</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingItems.map((item) => (
                <Card key={`${item.order_id}-${item.goods_id}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {item.goods_image ? (
                          <img
                            src={item.goods_image}
                            alt={item.goods_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/goods/${item.goods_id}`}
                          className="font-medium hover:text-primary line-clamp-2"
                        >
                          {item.goods_name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          HK${item.price} × {item.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          訂單號：{item.order_no}
                        </p>
                      </div>
                      <Button onClick={() => openReviewDialog(item)}>
                        <Star className="w-4 h-4 mr-2" />
                        評價
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 已评价列表 */}
        <TabsContent value="reviewed">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">暫無評價記錄</h3>
                <p className="text-muted-foreground">
                  評價過的商品會在這裡顯示
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {review.goods_image ? (
                          <img
                            src={review.goods_image}
                            alt={review.goods_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/goods/${review.goods_id}`}
                          className="font-medium hover:text-primary line-clamp-1"
                        >
                          {review.goods_name}
                        </Link>
                        
                        {/* 评分 */}
                        <div className="flex items-center gap-2 mt-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* 评价内容 */}
                        <p className="text-sm mt-2 text-muted-foreground">
                          {review.content}
                        </p>

                        {/* 评价图片 */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {review.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="w-16 h-16 rounded-lg overflow-hidden bg-muted"
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

                        {/* 商家回复 */}
                        {review.reply && (
                          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                              <MessageSquare className="w-4 h-4" />
                              商家回復
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.reply}
                            </p>
                            {review.reply_time && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(review.reply_time).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* 评价弹窗 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>發表評價</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* 商品信息 */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {selectedItem.goods_image ? (
                    <img
                      src={selectedItem.goods_image}
                      alt={selectedItem.goods_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">
                    {selectedItem.goods_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    HK${selectedItem.price} × {selectedItem.quantity}
                  </p>
                </div>
              </div>

              {/* 评分 */}
              <div>
                <label className="text-sm font-medium mb-2 block">評分</label>
                {renderStars(rating, true)}
              </div>

              {/* 评价内容 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  評價內容
                </label>
                <Textarea
                  placeholder="分享您的使用體驗..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>

              {/* 上传图片 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  上傳圖片（可選）
                </label>
                <div className="flex gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={img}
                        alt={`图片${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                        onClick={() =>
                          setImages(images.filter((_, i) => i !== idx))
                        }
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      type="button"
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center hover:border-primary transition-colors"
                    >
                      <ImagePlus className="w-6 h-6 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  最多上傳5張圖片
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSubmitReview} disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              提交評價
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
