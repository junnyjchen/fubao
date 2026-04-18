/**
 * @fileoverview 商户评价管理页面
 * @description 查看和回复商品评价
 * @module app/merchant/dashboard/reviews/page
 */

'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
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
  MessageSquare,
  Package,
  Loader2,
  Send,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

/** 评价数据类型 */
interface Review {
  id: number;
  order_id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  content: string | null;
  images: string[] | null;
  reply: string | null;
  reply_time: string | null;
  created_at: string;
}

/**
 * 商户评价管理页面
 */
export default function MerchantReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 回复弹窗状态
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  /**
   * 加载评价列表
   */
  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/merchant/reviews');
      const data = await res.json();
      setReviews(data.data || []);
    } catch (error) {
      console.error('加载评价失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开回复弹窗
   */
  const openReplyDialog = (review: Review) => {
    setSelectedReview(review);
    setReplyContent(review.reply || '');
    setReplyDialogOpen(true);
  };

  /**
   * 提交回复
   */
  const handleSubmitReply = async () => {
    if (!selectedReview) return;

    if (!replyContent.trim()) {
      toast.error('請填寫回復內容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/merchant/reviews/${selectedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyContent.trim() }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('回復成功');
        setReplyDialogOpen(false);
        loadReviews();
      } else {
        toast.error(data.error || '回復失敗');
      }
    } catch (error) {
      console.error('提交回复失败:', error);
      toast.error('提交失敗');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 渲染评分星星
   */
  const renderStars = (value: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // 筛选评价
  const filteredReviews = reviews.filter((r) => {
    const matchKeyword =
      !searchKeyword ||
      r.goods_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      r.content?.toLowerCase().includes(searchKeyword.toLowerCase());

    if (activeTab === 'all') return matchKeyword;
    if (activeTab === 'pending') return matchKeyword && !r.reply;
    if (activeTab === 'replied') return matchKeyword && r.reply;

    return matchKeyword;
  });

  // 统计数据
  const pendingCount = reviews.filter((r) => !r.reply).length;
  const repliedCount = reviews.filter((r) => r.reply).length;
  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : '0.0';

  return (
    <MerchantLayout title="評價管理" description="查看和回復商品評價">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviews.length}</p>
                <p className="text-sm text-muted-foreground">總評價數</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgRating}</p>
                <p className="text-sm text-muted-foreground">平均評分</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">待回復</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{repliedCount}</p>
                <p className="text-sm text-muted-foreground">已回復</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索商品名稱或評價內容..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 评价列表 */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">全部評價</TabsTrigger>
              <TabsTrigger value="pending">
                待回復
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="replied">已回復</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">暫無評價</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="pb-6 border-b last:border-b-0 last:pb-0"
                >
                  <div className="flex gap-4">
                    {/* 商品图片 */}
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
                      {/* 商品名 */}
                      <p className="font-medium line-clamp-1">
                        {review.goods_name}
                      </p>

                      {/* 用户和评分 */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-muted-foreground">
                          {review.user_name}
                        </span>
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* 评价内容 */}
                      <p className="text-sm mt-2">{review.content}</p>

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
                      {review.reply ? (
                        <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                            <MessageSquare className="w-4 h-4" />
                            我的回復
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.reply}
                          </p>
                          {review.reply_time && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(review.reply_time).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => openReplyDialog(review)}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          回復
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 回复弹窗 */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>回復評價</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* 评价信息 */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="text-sm text-muted-foreground">
                    {selectedReview.user_name}
                  </span>
                </div>
                <p className="text-sm">{selectedReview.content}</p>
              </div>

              {/* 回复内容 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  回復內容
                </label>
                <Textarea
                  placeholder="請輸入回復內容..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSubmitReply} disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              提交回復
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
