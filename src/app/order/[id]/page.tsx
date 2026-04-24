'use client';

import { useState, useEffect, useCallback, memo, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RequireAuth } from '@/components/auth/RequireAuth';
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  MapPin,
  Phone,
  Loader2,
} from 'lucide-react';

interface OrderItem {
  id: number;
  goodsId: number;
  goodsName: string;
  goodsImage: string | null;
  price: string;
  quantity: number;
  totalPrice: string;
}

interface Order {
  id: number;
  orderNo: string;
  totalAmount: string;
  payAmount: string;
  payStatus: number;
  orderStatus: number;
  payMethod: string | null;
  payTime: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingTime: string | null;
  receiveTime: string | null;
  createdAt: string;
  items: OrderItem[];
}

// 商品项组件
const OrderGoodsItem = memo(function OrderGoodsItem({
  item,
  isRTL,
}: {
  item: OrderItem;
  isRTL: boolean;
}) {
  return (
    <div className={`flex gap-4 py-3 border-b last:border-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs relative overflow-hidden">
        {item.goodsImage ? (
          <Image
            src={item.goodsImage}
            alt={item.goodsName}
            fill
            sizes="64px"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          '暫無'
        )}
      </div>
      <div className={`flex-1 ${isRTL ? 'text-end' : ''}`}>
        <Link href={`/shop/${item.goodsId}`} className="font-medium hover:text-primary">
          {item.goodsName}
        </Link>
        <div className={`flex items-center mt-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-between'}`}>
          <span className="text-primary">HK${item.price}</span>
          <span className="text-muted-foreground">x{item.quantity}</span>
        </div>
      </div>
      <div className={`font-semibold ${isRTL ? 'text-start' : 'text-end'}`}>
        <span>HK${item.totalPrice}</span>
      </div>
    </div>
  );
});

function OrderDetailContent() {
  const { t, isRTL } = useI18n();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const od = t.orderDetail;
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const orderStatusConfig: Record<number, { label: string; color: string; icon: React.ElementType }> = {
    '-1': { label: od.status.cancelled, color: 'bg-gray-100 text-gray-600', icon: XCircle },
    '0': { label: od.status.pending, color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    '1': { label: od.status.paid, color: 'bg-blue-100 text-blue-800', icon: Package },
    '2': { label: od.status.shipped, color: 'bg-purple-100 text-purple-800', icon: Truck },
    '3': { label: od.status.completed, color: 'bg-green-100 text-green-800', icon: CheckCircle },
  };

  useEffect(() => {
    const orderId = params.id;
    if (orderId) {
      fetchOrder(parseInt(orderId as string));
    }
  }, [params.id]);

  const fetchOrder = useCallback(async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();
      if (result.data) {
        setOrder(result.data);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePay = useCallback(async (method: string) => {
    if (!order) return;

    setPaying(true);
    try {
      // 模拟支付过程
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 更新订单状态为已支付
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pay', payMethod: method }),
      });

      const result = await response.json();
      if (result.data) {
        setOrder({ ...order, ...result.data });
        alert(od.messages.paySuccess);
      }
    } catch (error) {
      console.error('支付失败:', error);
      alert(od.messages.payFailed);
    } finally {
      setPaying(false);
    }
  }, [order, od.messages]);

  const handleConfirmReceive = useCallback(async () => {
    if (!order) return;

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'receive' }),
      });

      const result = await response.json();
      if (result.data) {
        setOrder({ ...order, ...result.data });
        alert(od.messages.receiveSuccess);
      }
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  }, [order, od.messages.receiveSuccess]);

  const handleCancel = useCallback(async () => {
    if (!order) return;

    if (!confirm(od.messages.cancelConfirm)) return;

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });

      const result = await response.json();
      if (result.data) {
        setOrder({ ...order, ...result.data });
      }
    } catch (error) {
      console.error('取消订单失败:', error);
    }
  }, [order, od.messages.cancelConfirm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-muted-foreground mb-4">{od.notFound}</p>
          <Button asChild>
            <Link href="/">{od.backHome}</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = orderStatusConfig[order.orderStatus] || orderStatusConfig[0];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/user/orders" className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BackIcon className="w-5 h-5" />
            <span>{od.backToList}</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold">{od.title}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 订单状态 */}
        <Card className="mb-6 animate-fade-in-up">
          <CardContent className="p-6">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`w-16 h-16 rounded-full ${status.color} flex items-center justify-center`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className={`flex-1 ${isRTL ? 'text-end' : ''}`}>
                <h2 className="text-xl font-semibold">{status.label}</h2>
                <p className="text-muted-foreground">{od.orderNo}：{order.orderNo}</p>
              </div>
              <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                <p className="text-2xl font-bold text-primary">HK${order.payAmount}</p>
                <p className="text-xs text-muted-foreground">{order.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 支付区域（待付款状态显示） */}
        {order.orderStatus === 0 && (
          <Card className="mb-6 border-primary/20 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CreditCard className="w-5 h-5 text-primary" />
                {od.payment.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => handlePay('paypal')}
                  disabled={paying}
                >
                  <span className="font-semibold">PayPal</span>
                  <span className="text-xs text-muted-foreground">{od.payment.paypalDesc}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => handlePay('wechat')}
                  disabled={paying}
                >
                  <span className="font-semibold text-green-600">{od.payment.wechat}</span>
                  <span className="text-xs text-muted-foreground">{od.payment.wechatDesc}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => handlePay('alipay')}
                  disabled={paying}
                >
                  <span className="font-semibold text-blue-600">{od.payment.alipay}</span>
                  <span className="text-xs text-muted-foreground">{od.payment.alipayDesc}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 收货信息 */}
        <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className="w-5 h-5 text-primary" />
              {od.shipping.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={isRTL ? 'text-end' : ''}>
                <p className="font-medium">{order.shippingName}</p>
                <p className={`text-sm text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <Phone className="w-4 h-4" />
                  {order.shippingPhone}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader>
            <CardTitle className={`text-base ${isRTL ? 'text-end' : ''}`}>{od.goodsList}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <OrderGoodsItem key={item.id} item={item} isRTL={isRTL} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 订单信息 */}
        <Card className="mb-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader>
            <CardTitle className={`text-base ${isRTL ? 'text-end' : ''}`}>{od.orderInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{od.orderNo}</span>
                <span>{order.orderNo}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{od.createTime}</span>
                <span>{order.createdAt}</span>
              </div>
              {order.payTime && (
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{od.payTime}</span>
                  <span>{order.payTime}</span>
                </div>
              )}
              {order.shippingTime && (
                <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-muted-foreground">{od.shipTime}</span>
                  <span>{order.shippingTime}</span>
                </div>
              )}
              <Separator />
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{od.goodsAmount}</span>
                <span>HK${order.totalAmount}</span>
              </div>
              <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-muted-foreground">{od.shippingFee}</span>
                <span className="text-green-600">{od.freeShipping}</span>
              </div>
              <Separator />
              <div className={`flex justify-between text-lg font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>{od.totalAmount}</span>
                <span className="text-primary">HK${order.payAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {order.orderStatus === 0 && (
            <Button variant="outline" onClick={handleCancel}>
              {od.actions.cancel}
            </Button>
          )}
          {order.orderStatus === 2 && (
            <Button onClick={handleConfirmReceive}>
              {od.actions.confirmReceive}
            </Button>
          )}
          {order.orderStatus === 3 && (
            <Button asChild>
              <Link href="/shop">{od.actions.continueShopping}</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="min-h-screen bg-muted/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <OrderDetailContent />
      </Suspense>
    </RequireAuth>
  );
}
