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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Shield,
  Copy,
  ExternalLink,
  Wallet,
  DollarSign,
  RefreshCw,
  ArrowRight,
  Smartphone,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentSkeleton } from '@/components/common/PageSkeletons';
import { useI18n } from '@/lib/i18n';

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
  redirect_url?: string;
  client_secret?: string;
  expire_time: string;
  payment_method: string;
  method_info?: {
    name: string;
    icon: string;
    type: string;
  };
}

/** 支付方式配置 */
const PAYMENT_METHODS = [
  {
    value: 'alipay',
    name: '支付宝',
    nameEn: 'Alipay',
    icon: 'alipay',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    value: 'wechat',
    name: '微信支付',
    nameEn: 'WeChat Pay',
    icon: 'wechat',
    color: 'text-green-600',
    bg: 'bg-green-100',
  },
  {
    value: 'balance',
    name: '余额支付',
    nameEn: 'Balance',
    icon: 'wallet',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
  },
  {
    value: 'paypal',
    name: 'PayPal',
    nameEn: 'PayPal',
    icon: 'paypal',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    value: 'stripe',
    name: '信用卡',
    nameEn: 'Credit Card',
    icon: 'credit-card',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
];

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useI18n();
  const p = t.payment;
  
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('alipay');
  const [countdown, setCountdown] = useState(0);
  const [pollingPayment, setPollingPayment] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);

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
          setPollingPayment(false);
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
          toast.success(p.success);
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
          toast.error(p.failed);
        }
      } catch (error) {
        console.error('轮询支付状态失败:', error);
      }
    }, 3000);

    return () => clearInterval(pollTimer);
  }, [pollingPayment, paymentInfo, order, router, p]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.data) {
        setOrder(data.data);
        if (data.data.pay_status === 0) {
          await createPayment(data.data.id, selectedMethod);
        } else {
          router.push(`/user/orders/${data.data.id}`);
        }
      }
    } catch (error) {
      console.error('加载订单失败:', error);
      toast.error(p.loadOrderFailed);
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
        setSelectedMethod(data.data.payment_method);
        setPollingPayment(data.data.status === 'pending');
      }
    } catch (error) {
      console.error('加载支付信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (orderId: number, method: string) => {
    setCreatingPayment(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, payment_method: method }),
      });
      const data = await res.json();
      if (data.data) {
        setPaymentInfo(data.data);
        setPollingPayment(data.data.status === 'pending');
        if (data.data.status === 'success') {
          toast.success(p.success);
          setTimeout(() => {
            router.push(`/user/orders/${orderId}`);
          }, 2000);
        }
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('创建支付失败:', error);
      toast.error(p.createFailed);
    } finally {
      setCreatingPayment(false);
    }
  };

  const handleMethodChange = async (value: string) => {
    if (value === selectedMethod || !order) return;
    
    setSelectedMethod(value);
    await createPayment(order.id, value);
  };

  const handleRetryPayment = async () => {
    if (!order) return;
    await createPayment(order.id, selectedMethod);
  };

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
        toast.success(p.success);
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
      toast.error(p.failed);
    }
  };

  const copyPaymentLink = () => {
    if (!paymentInfo?.payment_id) return;
    const link = `${window.location.origin}/payment?paymentId=${paymentInfo.payment_id}`;
    navigator.clipboard.writeText(link);
    toast.success(p.linkCopied);
  };

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
        <Card className="max-w-md animate-fade-in">
          <CardContent className="py-12 text-center">
            <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">{p.orderNotFound}</h2>
            <p className="text-muted-foreground mb-6">{p.orderNotExists}</p>
            <Button asChild>
              <Link href="/user/orders">{p.viewOrders}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const payAmount = order ? parseFloat(order.pay_amount) : (paymentInfo?.amount || 0);

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b">
        <div className={`max-w-4xl mx-auto px-4 py-4 ${isRTL ? 'text-right' : ''}`}>
          <h1 className="text-xl font-semibold">{p.title}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className={`grid lg:grid-cols-3 gap-6 ${isRTL ? 'lg:grid-flow-row-dense' : ''}`}>
          {/* 支付信息 */}
          <div className="lg:col-span-2 space-y-4">
            {/* 支付状态卡片 */}
            <Card className="animate-fade-in-up">
              <CardContent className="py-8 text-center">
                {paymentInfo?.status === 'success' ? (
                  <>
                    <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4 animate-bounce" />
                    <h2 className={`text-2xl font-bold text-green-600 mb-2 ${isRTL ? 'text-right' : ''}`}>{p.success}</h2>
                    <p className="text-muted-foreground mb-6">{p.successDesc}</p>
                    <Button asChild>
                      <Link href={order ? `/user/orders/${order.id}` : '/user/orders'}>
                        {p.viewOrder}
                      </Link>
                    </Button>
                  </>
                ) : paymentInfo?.status === 'failed' ? (
                  <>
                    <XCircle className="w-20 h-20 mx-auto text-destructive mb-4 animate-pulse" />
                    <h2 className={`text-2xl font-bold text-destructive mb-2 ${isRTL ? 'text-right' : ''}`}>{p.failed}</h2>
                    <p className="text-muted-foreground mb-6">{p.failedDesc}</p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleRetryPayment} disabled={creatingPayment}>
                        {creatingPayment ? (
                          <>
                            <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ms-2' : 'me-2'}`} />
                            {p.loading}
                          </>
                        ) : (
                          <>
                            <RefreshCw className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                            {p.retry}
                          </>
                        )}
                      </Button>
                      {order && (
                        <Button variant="outline" onClick={() => router.push(`/user/orders/${order.id}`)}>
                          {p.viewOrder}
                        </Button>
                      )}
                    </div>
                  </>
                ) : paymentInfo?.status === 'expired' ? (
                  <>
                    <Clock className="w-20 h-20 mx-auto text-orange-500 mb-4" />
                    <h2 className={`text-2xl font-bold text-orange-600 mb-2 ${isRTL ? 'text-right' : ''}`}>{p.expired}</h2>
                    <p className="text-muted-foreground mb-6">{p.expiredDesc}</p>
                    <div className="flex gap-3 justify-center">
                      <Button asChild>
                        <Link href="/shop">{p.continueShopping}</Link>
                      </Button>
                      {order && (
                        <Button variant="outline" onClick={() => router.push(`/user/orders/${order.id}`)}>
                          {p.viewOrder}
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center animate-fade-in">
                      <CreditCard className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className={`text-2xl font-bold mb-2 ${isRTL ? 'text-right' : ''}`}>
                      {p.pendingTitle.replace('{amount}', payAmount.toFixed(2))}
                    </h2>
                    <div className={`flex items-center justify-center gap-2 text-muted-foreground mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Clock className="w-4 h-4" />
                      <span>{p.payWithin.replace('{time}', formatCountdown(countdown))}</span>
                    </div>

                    {/* 支付方式选择 */}
                    {order && (
                      <div className={`text-left mb-6 ${isRTL ? 'text-right' : ''}`}>
                        <Label className="text-sm font-medium mb-3 block">{p.selectMethod}</Label>
                        <RadioGroup value={selectedMethod} onValueChange={handleMethodChange}>
                          <div className={`grid grid-cols-2 gap-3 ${isRTL ? 'direction-rtl' : ''}`}>
                            {PAYMENT_METHODS.map((method) => (
                              <div
                                key={method.value}
                                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedMethod === method.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => handleMethodChange(method.value)}
                              >
                                <RadioGroupItem
                                  value={method.value}
                                  id={`method-${method.value}`}
                                  className="sr-only"
                                />
                                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-lg ${method.bg} flex items-center justify-center`}>
                                    {method.icon === 'wallet' ? (
                                      <Wallet className={`w-5 h-5 ${method.color}`} />
                                    ) : method.icon === 'credit-card' ? (
                                      <CreditCard className={`w-5 h-5 ${method.color}`} />
                                    ) : (
                                      <Smartphone className={`w-5 h-5 ${method.color}`} />
                                    )}
                                  </div>
                                  <div className={isRTL ? 'text-right' : ''}>
                                    <p className="font-medium text-sm">{method.name}</p>
                                    <p className="text-xs text-muted-foreground">{method.nameEn}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* 支付二维码区域 */}
                    {(paymentInfo?.qr_code || paymentInfo?.redirect_url || paymentInfo?.client_secret) && (
                      <div className="bg-white p-6 rounded-lg inline-block mb-6">
                        {paymentInfo.qr_code ? (
                          <div className="w-48 h-48">
                            <img
                              src={paymentInfo.qr_code}
                              alt={p.qrCode}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : paymentInfo.redirect_url ? (
                          <div className="w-48 h-48 flex items-center justify-center text-center">
                            <div>
                              <ExternalLink className="w-12 h-12 mx-auto text-primary mb-2" />
                              <p className="text-sm font-medium">{p.redirectPayment}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-center">
                            <div>
                              <CreditCard className="w-12 h-12 mx-auto text-primary mb-2" />
                              <p className="text-sm font-medium">{p.cardPayment}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex flex-col items-center gap-3 ${isRTL ? 'direction-rtl' : ''}`}>
                      <p className="text-sm text-muted-foreground">{p.scanPay}</p>
                      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <Button variant="outline" onClick={copyPaymentLink}>
                          <Copy className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                          {p.copyLink}
                        </Button>
                        {/* 开发环境：模拟支付按钮 */}
                        <Button variant="secondary" onClick={handleMockPayment}>
                          <Smartphone className={`w-4 h-4 ${isRTL ? 'ms-2' : 'me-2'}`} />
                          {p.mockPayment}
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
                  <CardTitle className={`flex items-center gap-2 text-base ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Package className="w-4 h-4" />
                    {p.orderGoods}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className={`flex gap-4 p-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                        <p className="font-medium line-clamp-2">{item.goods_name}</p>
                        <div className={`flex items-center justify-between mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-sm">HK${item.price}</span>
                          <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* 安全提示 */}
            <Card className="bg-muted/30 border-muted">
              <CardContent className="py-4">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <Shield className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{p.securityTitle}</p>
                    <p className="text-xs text-muted-foreground">{p.securityDesc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 订单汇总 */}
          <div className={isRTL ? 'lg:col-start-1' : ''}>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className={isRTL ? 'text-right' : ''}>{p.orderInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order && (
                  <>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{p.orderNo}：</span>
                      <span className="font-mono">{order.order_no}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">{p.createTime}：</span>
                      <span>{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </>
                )}
                
                <Separator />

                <div className="space-y-2 text-sm">
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-muted-foreground">{p.goodsAmount}</span>
                    <span>HK${payAmount.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-muted-foreground">{p.shippingFee}</span>
                    <span className="text-green-600">{p.freeShipping}</span>
                  </div>
                </div>

                <Separator />

                <div className={`flex justify-between text-lg font-semibold ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{p.totalAmount}</span>
                  <span className="text-primary">HK${payAmount.toFixed(2)}</span>
                </div>

                {/* 服务保障 */}
                <div className={`flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {p.safePayment}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {p.authenticGuarantee}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 客服联系 */}
            <Card className="mt-4">
              <CardContent className="py-4">
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/contact" className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <AlertCircle className="w-4 h-4" />
                    {p.contactSupport}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
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
