/**
 * @fileoverview 订单支付页面
 * @description 用户支付订单
 * @module app/payment/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Smartphone,
  Wallet,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface OrderItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  price: string;
  quantity: number;
  total_price: string;
}

interface Order {
  id: number;
  order_no: string;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  pay_method: string | null;
  pay_time: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  remark: string | null;
  created_at: string;
  items: OrderItem[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const payMethods = [
  { value: 'alipay', label: '支付寶', icon: Wallet, enabled: false, description: '即將開通' },
  { value: 'wechat', label: '微信支付', icon: Smartphone, enabled: false, description: '即將開通' },
  { value: 'paypal', label: 'PayPal', icon: CreditCard, enabled: true, description: '支持國際信用卡' },
];

const orderStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  1: { label: '待發貨', color: 'bg-blue-100 text-blue-800' },
  2: { label: '已發貨', color: 'bg-purple-100 text-purple-800' },
  3: { label: '已完成', color: 'bg-green-100 text-green-800' },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-800' },
};

export default function PaymentPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('paypal');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.data) {
          setOrder(data.data);
          if (data.data.pay_method) {
            setPayMethod(data.data.pay_method);
          }
        } else {
          router.push('/user/orders');
        }
      } catch (error) {
        console.error('加载订单失败:', error);
        router.push('/user/orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, router]);

  // 倒计时（30分钟）
  useEffect(() => {
    if (!order || order.order_status !== 0) return;

    const createdAt = new Date(order.created_at).getTime();
    const expireTime = createdAt + 30 * 60 * 1000; // 30分钟后过期

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
      setCountdown(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        // 自动取消订单
        fetch(`/api/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_status: 4 }),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePay = async () => {
    if (!order) return;

    setPaying(true);
    try {
      // 模拟支付流程
      if (payMethod === 'paypal') {
        // PayPal 支付流程
        // 实际项目中需要跳转到 PayPal 支付页面
        // 这里模拟支付成功
        await new Promise(resolve => setTimeout(resolve, 2000));

        const res = await fetch(`/api/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pay_status: 1,
            pay_method: payMethod,
            pay_time: new Date().toISOString(),
          }),
        });

        const data = await res.json();
        if (data.message) {
          router.push(`/user/orders?highlight=${order.id}`);
        }
      }
    } catch (error) {
      console.error('支付失败:', error);
      alert('支付失敗，請重試');
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !confirm('確定要取消訂單嗎？')) return;

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: 4 }),
      });

      const data = await res.json();
      if (data.message) {
        router.push('/user/orders');
      }
    } catch (error) {
      console.error('取消订单失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">訂單不存在</h2>
            <Button asChild className="mt-4">
              <Link href="/user/orders">返回訂單列表</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = orderStatusMap[order.order_status] || orderStatusMap[0];
  const isPayable = order.order_status === 0 && order.pay_status === 0;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">訂單支付</h1>
          <Badge className={status.color}>{status.label}</Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 倒计时提示 */}
        {isPayable && countdown > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="py-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">
                請在 <span className="font-mono font-semibold">{formatCountdown(countdown)}</span> 內完成支付
              </span>
            </CardContent>
          </Card>
        )}

        {/* 订单信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">訂單信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">訂單編號</span>
              <span className="font-mono">{order.order_no}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">創建時間</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">收貨人</span>
              <span>{order.shipping_name} {order.shipping_phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">收貨地址</span>
              <span className="text-right max-w-[200px]">{order.shipping_address}</span>
            </div>
          </CardContent>
        </Card>

        {/* 商品明细 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">商品明細</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border-b last:border-0">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                  {item.goods_image ? (
                    <img src={item.goods_image} alt={item.goods_name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    '暫無圖片'
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.goods_name}</p>
                  <p className="text-sm text-muted-foreground">HK${item.price} × {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">HK${item.total_price}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 支付金额 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">支付金額</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品金額</span>
              <span>HK${order.total_amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">運費</span>
              <span className="text-green-600">
                {parseFloat(order.pay_amount) >= parseFloat(order.total_amount) ? 'HK$0.00' : '已包含'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-semibold">
              <span>應付金額</span>
              <span className="text-primary">HK${order.pay_amount}</span>
            </div>
          </CardContent>
        </Card>

        {/* 支付方式 */}
        {isPayable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">選擇支付方式</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={payMethod} onValueChange={setPayMethod}>
                {payMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        method.enabled ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50 cursor-not-allowed'
                      } ${payMethod === method.value ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => method.enabled && setPayMethod(method.value)}
                    >
                      <RadioGroupItem value={method.value} disabled={!method.enabled} />
                      <Icon className="w-6 h-6" />
                      <div className="flex-1">
                        <p className="font-medium">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          {isPayable ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={paying}
              >
                取消訂單
              </Button>
              <Button
                className="flex-1"
                size="lg"
                onClick={handlePay}
                disabled={paying || countdown <= 0}
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
            </>
          ) : order.order_status === 4 ? (
            <Button variant="outline" className="w-full" asChild>
              <Link href="/shop">繼續購物</Link>
            </Button>
          ) : order.pay_status === 1 ? (
            <Button className="w-full" disabled>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              已支付
            </Button>
          ) : null}
        </div>

        {/* 安全提示 */}
        <div className="text-center text-xs text-muted-foreground">
          <p>您的支付信息將被安全加密傳輸</p>
          <p className="mt-1">如有問題請聯繫客服</p>
        </div>
      </main>
    </div>
  );
}
