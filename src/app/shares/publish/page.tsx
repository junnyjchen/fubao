/**
 * @fileoverview 晒图发布页面
 * @description 用户发布图文视频分享
 * @module app/shares/publish/page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RequireAuth } from '@/components/auth/RequireAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Image as ImageIcon,
  Video,
  Send,
  Loader2,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Share2,
  QrCode,
  Copy,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/upload/ImageUpload';

interface Order {
  id: number;
  order_no: string;
  created_at: string;
  items: {
    goods_id: number;
    goods_name: string;
    goods_image: string;
  }[];
}

export default function SharePublishPage() {
  return (
    <RequireAuth>
      <SharePublishContent />
    </RequireAuth>
  );
}

function SharePublishContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [publishedShareId, setPublishedShareId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [form, setForm] = useState({
    goods_id: '',
    order_id: '',
    content: '',
    images: [] as string[],
    video_url: '',
    is_anonymous: false,
  });

  useEffect(() => {
    loadPurchasedOrders();
  }, []);

  const loadPurchasedOrders = async () => {
    setLoading(true);
    try {
      // 模拟获取已购买订单
      const mockOrders: Order[] = [
        {
          id: 1,
          order_no: 'FB20260324001',
          created_at: '2026-03-24',
          items: [
            { goods_id: 101, goods_name: '開光平安符', goods_image: '/goods/pinganfu.jpg' },
          ],
        },
        {
          id: 2,
          order_no: 'FB20260320002',
          created_at: '2026-03-20',
          items: [
            { goods_id: 102, goods_name: '桃木劍', goods_image: '/goods/taomujian.jpg' },
          ],
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!form.content.trim()) {
      toast.error('請填寫分享內容');
      return;
    }
    if (form.images.length === 0 && !form.video_url.trim()) {
      toast.error('請上傳圖片或視頻');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setPublishedShareId(data.data.id);
        setSuccessDialog(true);
      } else {
        toast.error(data.error || '發布失敗');
      }
    } catch (error) {
      console.error('发布失败:', error);
      toast.error('發布失敗，請重試');
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/shares/${publishedShareId}`;
    navigator.clipboard.writeText(link);
    toast.success('鏈接已複製');
  };

  const selectedOrder = orders.find(o => o.id.toString() === form.order_id);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 顶部 */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/shares">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                發布分享
              </h1>
              <p className="text-sm text-muted-foreground">分享您的心願達成</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧表单 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 关联商品 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">關聯商品（可選）</CardTitle>
                <CardDescription>選擇您購買的商品，分享真實體驗</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.order_id}
                  onValueChange={(v) => {
                    const order = orders.find(o => o.id.toString() === v);
                    setForm({
                      ...form,
                      order_id: v,
                      goods_id: order?.items[0]?.goods_id?.toString() || '',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="選擇已購買的商品" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(order => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        {order.items[0]?.goods_name} - {order.order_no}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedOrder && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg flex items-center gap-3">
                    <div className="w-16 h-16 bg-muted rounded overflow-hidden">
                      {selectedOrder.items[0]?.goods_image && (
                        <img
                          src={selectedOrder.items[0].goods_image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedOrder.items[0]?.goods_name}</p>
                      <p className="text-sm text-muted-foreground">
                        訂單號: {selectedOrder.order_no}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 内容编辑 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">分享內容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>分享內容 <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="分享您的故事，心願如何達成？"
                    rows={5}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {form.content.length}/500
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>上傳圖片 <span className="text-destructive">*</span></Label>
                  <ImageUpload
                    value={form.images}
                    onChange={(urls) => setForm({ ...form, images: urls })}
                    maxCount={9}
                    folder="shares"
                  />
                </div>

                <div className="space-y-2">
                  <Label>視頻鏈接（可選）</Label>
                  <Input
                    value={form.video_url}
                    onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                    placeholder="支持各大視頻平台鏈接"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 隐私设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">隱私設置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">匿名發布</p>
                    <p className="text-sm text-muted-foreground">開啟後其他用戶將看不到您的昵稱</p>
                  </div>
                  <Switch
                    checked={form.is_anonymous}
                    onCheckedChange={(checked) => setForm({ ...form, is_anonymous: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧预览和发布 */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">發布預覽</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 预览卡片 */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {form.images.length > 0 ? (
                      <img
                        src={form.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm line-clamp-2">
                      {form.content || '分享內容預覽...'}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>
                        {form.is_anonymous ? '匿名用戶' : '您的昵稱'}
                      </span>
                      <span>·</span>
                      <span>剛剛</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      發布中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      發布分享
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  發布後可分享到社交平台
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 发布成功弹窗 */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">發布成功！</DialogTitle>
            <DialogDescription>
              您的分享已發布到「如願」專區
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 分享链接 */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">分享鏈接</p>
              <div className="flex items-center gap-2">
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/shares/${publishedShareId}`}
                  readOnly
                  className="text-sm"
                />
                <Button size="icon" variant="outline" onClick={copyShareLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 分享按钮 */}
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                微信分享
              </Button>
              <Button variant="outline" className="gap-2">
                <QrCode className="w-4 h-4" />
                生成二維碼
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSuccessDialog(false)}
              >
                繼續發布
              </Button>
              <Button
                className="flex-1"
                onClick={() => router.push(`/shares/${publishedShareId}`)}
              >
                查看分享
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
}
