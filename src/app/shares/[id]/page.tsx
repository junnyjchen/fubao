/**
 * @fileoverview 晒图详情页面
 * @description 查看晒图详情、点赞评论、分享功能
 * @module app/shares/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  QrCode,
  Copy,
  Download,
  Play,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareDetail {
  id: number;
  user_id: string;
  goods_id: number | null;
  content: string;
  images: string[];
  video_url: string | null;
  likes_count: number;
  comments_count: number;
  is_anonymous: boolean;
  created_at: string;
  users: {
    id: string;
    nickname: string;
    avatar: string | null;
  } | null;
  goods: {
    id: number;
    name: string;
    images: string[];
    price: string;
  } | null;
  comments: {
    id: number;
    content: string;
    created_at: string;
    users: {
      id: string;
      nickname: string;
      avatar: string | null;
    } | null;
  }[];
}

export default function ShareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [share, setShare] = useState<ShareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  useEffect(() => {
    loadShare();
  }, [resolvedParams.id]);

  const loadShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shares/${resolvedParams.id}`);
      const data = await res.json();

      if (data.success) {
        setShare(data.data);
      } else {
        toast.error('內容不存在');
        router.push('/shares');
      }
    } catch (error) {
      console.error('加载失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/shares/${resolvedParams.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' }),
      });

      const data = await res.json();

      if (data.success) {
        setLiked(data.liked);
        if (share) {
          setShare({
            ...share,
            likes_count: data.liked ? share.likes_count + 1 : share.likes_count - 1,
          });
        }
        toast.success(data.message);
      }
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      toast.error('請輸入評論內容');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/shares/${resolvedParams.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', content: comment }),
      });

      const data = await res.json();

      if (data.success && share) {
        setShare({
          ...share,
          comments: [data.data, ...share.comments],
          comments_count: share.comments_count + 1,
        });
        setComment('');
        toast.success('評論成功');
      }
    } catch (error) {
      toast.error('評論失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/shares/${resolvedParams.id}`;
    navigator.clipboard.writeText(link);
    toast.success('鏈接已複製');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!share) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>內容不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部导航 */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/shares">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold">如願</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 图片轮播 */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-black">
                {share.images && share.images.length > 0 ? (
                  <>
                    <Image
                      src={share.images[currentImage]}
                      alt=""
                      fill
                      className="object-contain cursor-pointer"
                      onClick={() => setShowImagePreview(true)}
                    />
                    {share.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : share.images.length - 1)}
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => setCurrentImage(prev => prev < share.images.length - 1 ? prev + 1 : 0)}
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {share.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentImage(i)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                i === currentImage ? 'bg-white w-6' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : share.video_url ? (
                  <video
                    src={share.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>
              
              {/* 缩略图 */}
              {share.images && share.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {share.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                        i === currentImage ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <Image src={img} alt="" width={64} height={64} className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* 内容 */}
            <Card>
              <CardContent className="p-6">
                {/* 用户信息 */}
                <div className="flex items-center gap-3 mb-4">
                  {share.is_anonymous ? (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ) : share.users?.avatar ? (
                    <Image
                      src={share.users.avatar}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {share.users?.nickname?.[0] || '用'}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {share.is_anonymous ? '匿名用戶' : share.users?.nickname || '用戶'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(share.created_at)}
                    </p>
                  </div>
                </div>

                {/* 文字内容 */}
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {share.content}
                </p>

                <Separator className="my-4" />

                {/* 互动按钮 */}
                <div className="flex items-center gap-6">
                  <Button
                    variant="ghost"
                    className={`gap-2 ${liked ? 'text-red-500' : ''}`}
                    onClick={handleLike}
                  >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                    {share.likes_count}
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {share.comments_count}
                  </Button>
                  <Button
                    variant="ghost"
                    className="gap-2 ml-auto"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <Share2 className="w-5 h-5" />
                    分享
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 关联商品 */}
            {share.goods && (
              <Card>
                <CardContent className="p-4">
                  <Link href={`/shop/${share.goods.id}`} className="flex items-center gap-4 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                    <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      {share.goods.images?.[0] && (
                        <Image
                          src={share.goods.images[0]}
                          alt=""
                          width={80}
                          height={80}
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{share.goods.name}</p>
                      <p className="text-primary font-semibold mt-1">HK${share.goods.price}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      查看
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* 评论区 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">評論 ({share.comments_count})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 评论输入 */}
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="說點什麼..."
                    className="flex-1"
                  />
                  <Button onClick={handleComment} disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <Separator />

                {/* 评论列表 */}
                {share.comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    還沒有評論，來說點什麼吧
                  </p>
                ) : (
                  <div className="space-y-4">
                    {share.comments.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.users?.avatar ? (
                          <Image
                            src={item.users.avatar}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {item.users?.nickname || '用戶'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(item.created_at)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧 */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">分享到</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-3" variant="outline">
                  <span className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">微</span>
                  微信好友
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <span className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">朋</span>
                  朋友圈
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <span className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">微</span>
                  微博
                </Button>
                <Separator />
                <Button className="w-full justify-start gap-3" variant="outline" onClick={copyShareLink}>
                  <Copy className="w-5 h-5" />
                  複製鏈接
                </Button>
                <Button className="w-full justify-start gap-3" variant="outline">
                  <QrCode className="w-5 h-5" />
                  生成二維碼
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 分享弹窗 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">分享到</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">微</span>
              </div>
              <span className="text-xs">微信</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">朋</span>
              </div>
              <span className="text-xs">朋友圈</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">微</span>
              </div>
              <span className="text-xs">微博</span>
            </button>
            <button
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
              onClick={copyShareLink}
            >
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Copy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs">複製</span>
            </button>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">分享鏈接</p>
            <p className="text-sm font-mono break-all">
              {typeof window !== 'undefined' ? window.location.href : ''}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片预览 */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-screen-2xl h-screen p-0 bg-black">
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <X className="w-6 h-6" />
          </button>
          {share.images && share.images[currentImage] && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={share.images[currentImage]}
                alt=""
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
