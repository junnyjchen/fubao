/**
 * @fileoverview 快速下单页面
 * @description 免登录快速下单，游客可直接购买
 * @module app/quick-order/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  User,
  Phone,
  MapPin,
  MessageSquare,
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Loader2,
  AlertCircle,
  Copy,
  Search,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { QuickOrderSkeleton } from '@/components/common/PageSkeletons';

interface GoodsInfo {
  id: number;
  name: string;
  subtitle?: string;
  main_image?: string;
  price: string;
  original_price?: string;
  stock: number;
  is_certified: boolean;
  merchant?: {
    id: number;
    name: string;
  };
}

interface OrderResult {
  order_id: number;
  order_no: string;
  query_code: string;
  total_amount: number;
  shipping_fee: number;
  pay_amount: number;
  goods_name: string;
  quantity: number;
  unit_price: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  created_at: string;
}

// 快速下单表单组件
function QuickOrderForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const goodsId = searchParams.get('goods_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [goods, setGoods] = useState<GoodsInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // 收货信息表单
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    remark: '',
  });

  // 表单错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goodsId) {
      fetchGoods();
    } else {
      setLoading(false);
    }
  }, [goodsId]);

  const fetchGoods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/goods/${goodsId}`);
      const result = await res.json();
      if (result.data) {
        setGoods(result.data);
      } else {
        toast.error('商品不存在');
      }
    } catch (error) {
      console.error('获取商品失败:', error);
      toast.error('獲取商品信息失敗');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shipping_name.trim() || formData.shipping_name.trim().length < 2) {
      newErrors.shipping_name = '請填寫收貨人姓名（至少2個字符）';
    }

    // 手机号非必填，支持国际手机号码格式
    const phone = formData.shipping_phone.replace(/\s/g, '');
    if (phone && !/^[\+]?[\d\s\-]{6,20}$/.test(phone)) {
      newErrors.shipping_phone = '請填寫正確的手機號碼';
    }

    if (!formData.shipping_address.trim() || formData.shipping_address.trim().length < 5) {
      newErrors.shipping_address = '請填寫詳細的收貨地址（至少5個字符）';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !goods) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/quick-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goods_id: goods.id,
          quantity,
          shipping_name: formData.shipping_name,
          shipping_phone: formData.shipping_phone,
          shipping_address: formData.shipping_address,
          remark: formData.remark || undefined,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setOrderResult(result.data);
        setShowSuccessDialog(true);
        toast.success('訂單創建成功！');
      } else {
        toast.error(result.error || '訂單創建失敗');
      }
    } catch (error) {
      console.error('下单失败:', error);
      toast.error('訂單創建失敗，請稍後重試');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label}已複製`);
  };

  // 计算金额
  const unitPrice = goods ? Number(goods.price) : 0;
  const totalAmount = unitPrice * quantity;
  const shippingFee = totalAmount >= 500 ? 0 : 30;
  const payAmount = totalAmount + shippingFee;

  if (loading) {
    return <QuickOrderSkeleton />;
  }

  if (!goods) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">請選擇要購買的商品</p>
        <Link href="/">
          <Button>返回首頁</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-8">
      {/* 顶部提示 */}
      <div className="bg-primary/5 border-b border-primary/10">
        <div className="container mx-auto px-4 py-3">
          <p className="text-sm text-center text-muted-foreground">
            <ShoppingCart className="w-4 h-4 inline-block mr-1" />
            快速下單 · 無需註冊登錄 · 方便快捷
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 商品信息 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5" />
                商品信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {/* 商品图片 */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                  {goods.main_image ? (
                    <Image
                      src={goods.main_image}
                      alt={goods.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-3xl text-primary/30">符</span>
                    </div>
                  )}
                </div>
                {/* 商品详情 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium line-clamp-2">{goods.name}</h3>
                    {goods.is_certified && (
                      <Badge className="bg-gold text-gold-foreground flex-shrink-0">
                        一物一證
                      </Badge>
                    )}
                  </div>
                  {goods.subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{goods.subtitle}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-primary">HK${goods.price}</span>
                    {goods.original_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        HK${goods.original_price}
                      </span>
                    )}
                  </div>
                  {goods.merchant && (
                    <p className="text-xs text-muted-foreground mt-1">
                      商家：{goods.merchant.name}
                    </p>
                  )}
                </div>
              </div>

              {/* 数量选择 */}
              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="text-sm">購買數量</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setQuantity(Math.min(goods.stock, quantity + 1))}
                  >
                    +
                  </Button>
                  <span className="text-xs text-muted-foreground">（庫存 {goods.stock}）</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 收货信息 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                收貨信息
              </CardTitle>
              <CardDescription>請填寫準確的收貨信息，確保商品能順利送達</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 收货人姓名 */}
              <div className="space-y-2">
                <Label htmlFor="shipping_name" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  收貨人姓名 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shipping_name"
                  value={formData.shipping_name}
                  onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                  placeholder="請輸入收貨人姓名"
                  className={errors.shipping_name ? 'border-destructive' : ''}
                />
                {errors.shipping_name && (
                  <p className="text-xs text-destructive">{errors.shipping_name}</p>
                )}
              </div>

              {/* 手机号 */}
              <div className="space-y-2">
                <Label htmlFor="shipping_phone" className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  手機號碼 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shipping_phone"
                  value={formData.shipping_phone}
                  onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                  placeholder="請輸入香港手機號碼（如：9876 5432）"
                  className={errors.shipping_phone ? 'border-destructive' : ''}
                />
                {errors.shipping_phone && (
                  <p className="text-xs text-destructive">{errors.shipping_phone}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  用於接收訂單通知和查詢訂單
                </p>
              </div>

              {/* 收货地址 */}
              <div className="space-y-2">
                <Label htmlFor="shipping_address" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  收貨地址 <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="shipping_address"
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  placeholder="請輸入詳細的收貨地址（如：九龍油尖旺區彌敦道100號ABC大廈15樓A室）"
                  className={errors.shipping_address ? 'border-destructive' : ''}
                  rows={2}
                />
                {errors.shipping_address && (
                  <p className="text-xs text-destructive">{errors.shipping_address}</p>
                )}
              </div>

              {/* 订单备注 */}
              <div className="space-y-2">
                <Label htmlFor="remark" className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  訂單備註（選填）
                </Label>
                <Input
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="有什麼需要備註的嗎？"
                />
              </div>
            </CardContent>
          </Card>

          {/* 费用明细 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                費用明細
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>商品金額</span>
                <span>HK${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>
                  運費
                  {totalAmount >= 500 && (
                    <span className="text-green-600 ml-1">（滿HK$500免運費）</span>
                  )}
                </span>
                <span className={shippingFee === 0 ? 'text-green-600' : ''}>
                  {shippingFee === 0 ? '免運費' : `HK$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">應付金額</span>
                <span className="text-xl font-bold text-primary">
                  HK${payAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex gap-3">
            <Link href={goodsId ? `/shop/${goodsId}` : '/'} className="flex-1">
              <Button variant="outline" className="w-full">
                返回商品
              </Button>
            </Link>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  立即下單
                </>
              )}
            </Button>
          </div>

          {/* 温馨提示 */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200/50">
            <CardContent className="py-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                溫馨提示
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 無需註冊登錄，填寫信息即可快速下單</li>
                <li>• 請妥善保管訂單查詢碼，用於查詢訂單狀態</li>
                <li>• 我們會通過手機短信通知您訂單狀態變更</li>
                <li>• 如需幫助，請聯繫客服：+852 1234 5678</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              訂單創建成功
            </DialogTitle>
            <DialogDescription>
              您的訂單已成功創建，請妥善保管以下信息
            </DialogDescription>
          </DialogHeader>

          {orderResult && (
            <div className="space-y-4 py-4">
              {/* 订单号 */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">訂單編號</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={() => copyToClipboard(orderResult.order_no, '訂單編號')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    複製
                  </Button>
                </div>
                <p className="font-mono font-bold text-lg">{orderResult.order_no}</p>
              </div>

              {/* 查询码 */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">訂單查詢碼</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6"
                    onClick={() => copyToClipboard(orderResult.query_code, '查詢碼')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    複製
                  </Button>
                </div>
                <p className="font-mono font-bold text-2xl text-primary text-center">
                  {orderResult.query_code}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  請妥善保管此查詢碼，用於查詢訂單狀態
                </p>
              </div>

              {/* 订单信息 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品</span>
                  <span>{orderResult.goods_name} × {orderResult.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">應付金額</span>
                  <span className="font-bold text-primary">HK${orderResult.pay_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">收貨人</span>
                  <span>{orderResult.shipping_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">手機號</span>
                  <span>{orderResult.shipping_phone}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  <Truck className="w-4 h-4 inline-block mr-1" />
                  請在30分鐘內完成支付，超時訂單將自動取消
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    router.push(`/order/query?phone=${orderResult.shipping_phone}`);
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  查詢訂單
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    router.push(`/payment/${orderResult.order_id}`);
                  }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  立即支付
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function QuickOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <QuickOrderForm />
    </Suspense>
  );
}
