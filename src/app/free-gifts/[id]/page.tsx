/**
 * @fileoverview 免费领商品详情页面
 * @description 填写领取信息，选择邮寄或到店自取
 * @module app/free-gifts/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Gift,
  Truck,
  MapPin,
  Loader2,
  ChevronLeft,
  CheckCircle2,
  Store,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface FreeGift {
  id: number;
  name: string;
  description: string;
  image: string | null;
  original_price: string;
  stock: number;
  claimed: number;
  limit_per_user: number;
  shipping_fee: string;
  is_active: boolean;
  merchant?: {
    id: number;
    name: string;
    address: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function FreeGiftDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [gift, setGift] = useState<FreeGift | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receiveType, setReceiveType] = useState<'shipping' | 'pickup'>('shipping');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [claimResult, setClaimResult] = useState<{
    claim_no: string;
    shipping_fee: string;
    pay_amount: string;
    need_pay?: boolean;
    pickup_address?: string;
  } | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
  });

  useEffect(() => {
    loadGift();
  }, [id]);

  const loadGift = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/free-gifts');
      const data = await res.json();
      const giftData = (data.data || []).find((g: FreeGift) => g.id === parseInt(id));
      if (giftData) {
        setGift(giftData);
      } else {
        toast.error('商品不存在');
        router.push('/free-gifts');
      }
    } catch (error) {
      console.error('加载商品失败:', error);
      toast.error('加載失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!gift) return;

    // 验证表单
    if (receiveType === 'shipping') {
      if (!formData.shipping_name.trim()) {
        toast.error('請填寫收貨人姓名');
        return;
      }
      if (!formData.shipping_phone.trim()) {
        toast.error('請填寫手機號碼');
        return;
      }
      if (!formData.shipping_address.trim()) {
        toast.error('請填寫收貨地址');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/free-gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gift_id: gift.id,
          receive_type: receiveType,
          shipping_name: formData.shipping_name,
          shipping_phone: formData.shipping_phone,
          shipping_address: formData.shipping_address,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setClaimResult(data.data);
        setShowSuccessDialog(true);
      } else {
        toast.error(data.error || '領取失敗');
      }
    } catch (error) {
      console.error('领取失败:', error);
      toast.error('領取失敗，請稍後重試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Gift className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">商品不存在</p>
        <Link href="/free-gifts">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  const isExpired = gift.stock <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 pb-8">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur sticky top-0 z-10 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">填寫領取信息</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4">
          {/* 商品信息 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-red-100 to-orange-100 flex-shrink-0 relative">
                  {gift.image ? (
                    <Image src={gift.image} alt={gift.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <Gift className="w-10 h-10 text-red-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold mb-1">{gift.name}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-500">免費</Badge>
                    <span className="text-sm text-muted-foreground line-through">
                      HK${gift.original_price}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">每人限領 {gift.limit_per_user} 件</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 领取方式选择 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">選擇領取方式</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={receiveType}
                onValueChange={(v) => setReceiveType(v as 'shipping' | 'pickup')}
                className="space-y-3"
              >
                {/* 邮寄 */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                  receiveType === 'shipping' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}>
                  <RadioGroupItem value="shipping" id="shipping" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="shipping" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">郵寄到家</span>
                      <Badge variant="secondary">需付運費 HK${gift.shipping_fee}</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      支付運費後，我們將快遞送到您手中
                    </p>
                  </div>
                </div>

                {/* 到店自取 */}
                <div className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                  receiveType === 'pickup' ? 'border-primary bg-primary/5' : 'border-muted'
                }`}>
                  <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer">
                      <Store className="w-5 h-5 text-green-600" />
                      <span className="font-medium">到店免費領取</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">完全免費</Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      前往門店出示領取碼即可免費領取
                    </p>
                    {gift.merchant && (
                      <div className="mt-2 p-2 bg-muted rounded text-sm">
                        <p className="font-medium">{gift.merchant.name}</p>
                        <p className="text-muted-foreground">{gift.merchant.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* 收货信息（邮寄时显示） */}
          {receiveType === 'shipping' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">收貨信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    收貨人姓名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.shipping_name}
                    onChange={(e) => setFormData({ ...formData, shipping_name: e.target.value })}
                    placeholder="請輸入收貨人姓名"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    手機號碼 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.shipping_phone}
                    onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                    placeholder="請輸入手機號碼"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    收貨地址 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    placeholder="請輸入詳細收貨地址"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 费用说明 */}
          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    {receiveType === 'shipping' 
                      ? `需支付運費 HK${gift.shipping_fee}` 
                      : '到店領取完全免費'}
                  </p>
                  {receiveType === 'shipping' && (
                    <p className="text-muted-foreground mt-1">
                      商品免費，僅需支付運費
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <Button
            className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || isExpired}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                提交中...
              </>
            ) : isExpired ? (
              '已領完'
            ) : receiveType === 'shipping' ? (
              `確認並支付 HK${gift.shipping_fee} 運費`
            ) : (
              '確認領取'
            )}
          </Button>

          {/* 温馨提示 */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• 領取後請在7天內完成支付/領取</p>
            <p>• 每人每件商品限領 {gift.limit_per_user} 次</p>
          </div>
        </div>
      </div>

      {/* 成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              領取成功
            </DialogTitle>
            <DialogDescription>
              {claimResult?.need_pay ? '請盡快完成運費支付' : '請前往門店領取'}
            </DialogDescription>
          </DialogHeader>

          {claimResult && (
            <div className="space-y-4 py-4">
              {/* 领取码 */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-2">領取碼</p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {claimResult.claim_no}
                </p>
              </div>

              {/* 领取信息 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品</span>
                  <span>{gift.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">領取方式</span>
                  <span>{receiveType === 'shipping' ? '郵寄到家' : '到店自取'}</span>
                </div>
                {receiveType === 'shipping' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">運費</span>
                    <span className="text-primary font-medium">
                      HK${claimResult.shipping_fee}
                    </span>
                  </div>
                )}
                {receiveType === 'pickup' && claimResult.pickup_address && (
                  <div className="pt-2">
                    <span className="text-muted-foreground">領取地址：</span>
                    <p className="mt-1">{claimResult.pickup_address}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessDialog(false);
                    router.push('/free-gifts');
                  }}
                >
                  繼續領取
                </Button>
                {claimResult.need_pay ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowSuccessDialog(false);
                      // 跳转支付页面
                      toast.info('請前往支付頁面');
                    }}
                  >
                    去支付
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowSuccessDialog(false);
                      router.push('/user/free-gifts');
                    }}
                  >
                    查看記錄
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
