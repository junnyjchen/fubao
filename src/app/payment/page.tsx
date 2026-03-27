/**
 * @fileoverview 支付页面
 * @description 订单支付、支付状态查询
 * @module app/payment/page
 */

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Shield,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentSkeleton } from '@/components/common/PageSkeletons';

/** 订单信息 */
interface Order {
  id: number;
  order_no: string;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  created_at: string;
  items: Array<{
    id: number;
    goods_name: string;
    goods_image: string | null;
    price: string;
    quantity: number;
  }>;
}

/** 支付信息 */
interface PaymentInfo {
  payment_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'expired';
  qr_code?: string;
  expire_time: string;
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [pollingPayment, setPollingPayment] = useState(false);

  // 加载订单和支付信息
  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else if (paymentId) {
      loadPayment();
    }
  }, [orderId, paymentId]);

  // 支付倒计时
  useEffect(() => {
    if (paymentInfo && paymentInfo.status === 'pending') {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expire = new Date(paymentInfo.expire_time).getTime();
        const remaining = Math.max(0, Math.floor((expire - now) / 1000));
        setCountdown(remaining);

        if (remaining <= 0) {
          setPaymentInfo((prev) => prev ? { ...prev, status: 'expired' } : null);
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentInfo]);

  // 轮询支付状态
  useEffect(() => {
    if (!pollingPayment || !paymentInfo) return;

    const pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/${paymentInfo.payment_id}/status`);
        const data = await res.json();
        
        if (data.status === 'success') {
          clearInterval(pollTimer);
          setPollingPayment(false);
          setPaymentInfo((prev) => prev ? { ...prev, status: 'success' } : null);
          toast.success('支付成功！');
          // 跳转到订单详情
          setTimeout(() => {
            if (order) {
              router.push(`/user/orders/${order.id}`);
            } else {
              router.push('/user/orders');
            }
          }, 2000);
        } else if (data.status === 'failed') {
          clearInterval(pollTimer);
          setPollingPayment(false);
          setPaymentInfo((prev) => prev ? { ...prev, status: 'failed' } : null);
          toast.error('支付失敗');
        }
      } catch (error) {
        console.error('轮询支付状态失败:', error);
      }
    }, 3000);

    return () => clearInterval(pollTimer);
  }, [pollingPayment, paymentInfo, order, router]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.data) {
        setOrder(data.data);
        // 如果订单未支付，创建支付
        if (data.data.pay_status === 0) {
          await createPayment(data.data.id);
        } else {
          // 已支付，跳转到订单详情
          router.push(`/user/orders/${data.data.id}`);
        }
      }
    } catch (error) {
      console.error('加载订单失败:', error);
      toast.error('加載訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/${paymentId}`);
      const data = await res.json();
      if (data.data) {
        setPaymentInfo(data.data);
        setPollingPayment(data.data.status === 'pending');
      }
    } catch (error) {
      console.error('加载支付信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (orderId: number) => {
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method: 'alipay' }),
      });
      const data = await res.json();
      if (data.data) {
        setPaymentInfo(data.data);
        setPollingPayment(true);
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('创建支付失败:', error);
      toast.error('創建支付失敗');
    }
  };

  // 模拟支付（开发环境）
  const handleMockPayment = async () => {
    if (!paymentInfo) return;

    try {
      const res = await fetch('/api/payment/callback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentInfo.payment_id }),
      });
      const data = await res.json();
      if (data.message) {
        setPaymentInfo((prev) => prev ? { ...prev, status: 'success' } : null);
        toast.success('支付成功！');
        setTimeout(() => {
          if (order) {
            router.push(`/user/orders/${order.id}`);
          } else {
            router.push('/user/orders');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('模拟支付失败:', error);
      toast.error('支付失敗');
    }
  };

  // 复制支付链接
  const copyPaymentLink = () => {
    if (!paymentInfo?.payment_id) return;
    const link = `${window.location.origin}/payment?paymentId=${paymentInfo.payment_id}`;
    navigator.clipboard.writeText(link);
    toast.success('已複製支付鏈接');
  };

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <PaymentSkeleton />;
  }

  if (!order && !paymentInfo) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">訂單不存在</h2>
            <p className="text-muted-foreground mb-6">該訂單可能已被刪除或不存在</p>
            <Button asChild>
              <Link href="/user/orders">查看訂單</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payAmount = order ? parseFloat(order.pay_amount) : (paymentInfo?.amount || 0);

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">訂單支付</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 支付信息 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 支付状态卡片 */}
            <Card>
              <CardContent className="py-8 text-center">
                {paymentInfo?.status === 'success' ? (
                  <>
                    <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-green-600 mb-2">支付成功</h2>
                    <p className="text-muted-foreground mb-6">
                      您的訂單已支付成功，即將跳轉到訂單詳情...
                    </p>
                    <Button asChild>
                      <Link href={order ? `/user/orders/${order.id}` : '/user/orders'}>
                        查看訂單
                      </Link>
                    </Button>
                  </>
                ) : paymentInfo?.status === 'failed' ? (
                  <>
                    <XCircle className="w-20 h-20 mx-auto text-destructive mb-4" />
                    <h2 className="text-2xl font-bold text-destructive mb-2">支付失敗</h2>
                    <p className="text-muted-foreground mb-6">
                      支付過程中出現問題，請重新嘗試
                    </p>
                    <Button onClick={() => order && createPayment(order.id)}>
                      重新支付
                    </Button>
                  </>
                ) : paymentInfo?.status === 'expired' ? (
                  <>
                    <Clock className="w-20 h-20 mx-auto text-orange-500 mb-4" />
                    <h2 className="text-2xl font-bold text-orange-600 mb-2">支付超時</h2>
                    <p className="text-muted-foreground mb-6">
                      訂單已超時取消，請重新下單
                    </p>
                    <Button asChild>
                      <Link href="/shop">繼續購物</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <CreditCard className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      待支付 HK${payAmount.toFixed(2)}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                      <Clock className="w-4 h-4" />
                      <span>請在 {formatCountdown(countdown)} 內完成支付</span>
                    </div>

                    {/* 支付二维码区域 */}
                    <div className="bg-white p-6 rounded-lg inline-block mb-6">
                      <div className="w-48 h-48 bg-muted flex items-center justify-center text-muted-foreground">
                        {paymentInfo?.qr_code ? (
                          <img src={paymentInfo.qr_code} alt="支付二维码" className="w-full h-full" />
                        ) : (
                          <div className="text-center">
                            <p className="text-sm">支付二維碼</p>
                            <p className="text-xs mt-1">掃碼支付</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm text-muted-foreground">
                        請使用支付寶或微信掃碼支付
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" onClick={copyPaymentLink}>
                          <Copy className="w-4 h-4 mr-2" />
                          複製鏈接
                        </Button>
                        {/* 开发环境：模拟支付按钮 */}
                        <Button variant="secondary" onClick={handleMockPayment}>
                          模擬支付（測試）
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* 订单商品 */}
            {order && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="w-4 h-4" />
                    訂單商品
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.goods_image ? (
                          <img
                            src={item.goods_image}
                            alt={item.goods_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">{item.goods_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm">HK${item.price}</span>
                          <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 订单汇总 */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>訂單信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order && (
                  <>
                    <div className="text-sm">
                      <span className="text-muted-foreground">訂單編號：</span>
                      <span className="font-mono">{order.order_no}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">創建時間：</span>
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商品金額</span>
                    <span>HK${payAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">運費</span>
                    <span className="text-green-600">免運費</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>應付金額</span>
                  <span className="text-primary">HK${payAmount.toFixed(2)}</span>
                </div>

                {/* 服务保障 */}
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    安全支付
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    正品保證
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentSkeleton />}>
      <PaymentPageContent />
    </Suspense>
  );
}
