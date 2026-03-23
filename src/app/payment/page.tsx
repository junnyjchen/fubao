/**
 * @fileoverview 支付页面
 * @description 统一支付页面，支持多种支付方式
 * @module app/payment/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  CreditCard,
  Smartphone,
  Wallet,
  ChevronLeft,
  Shield,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderInfo {
  id: number;
  order_no: string;
  pay_amount: string;
  items: Array<{
    goods_name: string;
    quantity: number;
    price: string;
  }>;
}

interface PaymentResult {
  payment_id: string;
  payment_url?: string;
  status: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'paypal'>('alipay');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.data) {
        setOrder(data.data);
      } else {
        toast({
          variant: 'destructive',
          title: '訂單不存在',
        });
      }
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;

    setPaying(true);
    try {
      // 创建支付订单
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.data) {
        // 模拟支付成功（开发环境）
        // 实际环境中应该跳转到支付URL
        if (data.data.payment_url) {
          // 对于演示，直接模拟支付成功
          await simulatePaymentSuccess(data.data.payment_id);
        }
      } else {
        toast({
          variant: 'destructive',
          title: '創建支付失敗',
          description: data.error,
        });
      }
    } catch (error) {
      console.error('支付失败:', error);
      toast({
        variant: 'destructive',
        title: '支付失敗',
      });
    } finally {
      setPaying(false);
    }
  };

  const simulatePaymentSuccess = async (paymentId: string) => {
    try {
      const res = await fetch('/api/payment/callback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      });

      const data = await res.json();
      if (data.message) {
        setPaymentResult('success');
        toast({
          title: '支付成功',
          description: '訂單已支付，正在跳轉...',
        });
        
        // 3秒后跳转到订单详情
        setTimeout(() => {
          router.push(`/user/orders/${order?.id}`);
        }, 3000);
      }
    } catch (error) {
      console.error('支付回调失败:', error);
      setPaymentResult('failed');
    }
  };

  const paymentMethods = [
    {
      id: 'alipay',
      name: '支付寶',
      icon: Wallet,
      description: '使用支付寶掃碼支付',
      enabled: true,
    },
    {
      id: 'wechat',
      name: '微信支付',
      icon: Smartphone,
      description: '使用微信掃碼支付',
      enabled: true,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      description: '使用PayPal賬戶支付',
      enabled: true,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">訂單不存在</h2>
            <p className="text-muted-foreground mb-4">請確認訂單信息是否正確</p>
            <Button asChild>
              <Link href="/user/orders">查看訂單列表</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentResult === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">支付成功</h2>
            <p className="text-muted-foreground mb-4">您的訂單已成功支付</p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">訂單編號</p>
              <p className="font-medium">{order.order_no}</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/user/orders">查看訂單</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">繼續購物</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/user/orders">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">訂單支付</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* 支付方式选择 */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">選擇支付方式</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}
                  className="space-y-4"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          paymentMethod === method.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <RadioGroupItem value={method.id} id={method.id} disabled={!method.enabled} />
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </Label>
                    );
                  })}
                </RadioGroup>

                <Separator className="my-6" />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>支付過程採用SSL加密傳輸，確保您的資金安全</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 订单信息 */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">訂單信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">訂單編號</p>
                  <p className="font-medium">{order.order_no}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">商品信息</p>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate flex-1">{item.goods_name}</span>
                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-sm">商品金額</span>
                  <span>HK${order.pay_amount}</span>
                </div>

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>應付金額</span>
                  <span className="text-primary">HK${order.pay_amount}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={paying}
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      支付中...
                    </>
                  ) : (
                    `立即支付 HK$${order.pay_amount}`
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>請在30分鐘內完成支付</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
