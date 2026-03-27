/**
 * @fileoverview 订单详情页面
 * @description 展示订单完整详情
 * @module app/user/orders/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { OrderDetailSkeleton } from '@/components/common/PageSkeletons';

/** 订单项数据类型 */
interface OrderItem {
  id: number;
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  price: string;
  quantity: number;
  total_price: string;
}

/** 订单数据类型 */
interface Order {
  id: number;
  order_no: string;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  pay_method: string;
  pay_time: string | null;
  transaction_id: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_time: string | null;
  receive_time: string | null;
  remark: string | null;
  created_at: string;
  items: OrderItem[];
}

/** 订单状态映射 */
const orderStatusMap: Record<number, { label: string; color: string; description: string }> = {
  0: { label: '待付款', color: 'bg-yellow-100 text-yellow-800', description: '請盡快完成支付' },
  1: { label: '待發貨', color: 'bg-blue-100 text-blue-800', description: '商家正在準備發貨' },
  2: { label: '已發貨', color: 'bg-purple-100 text-purple-800', description: '商品正在運送中' },
  3: { label: '已完成', color: 'bg-green-100 text-green-800', description: '訂單已完成' },
  4: { label: '已取消', color: 'bg-gray-100 text-gray-800', description: '訂單已取消' },
};

/** 支付方式映射 */
const payMethodMap: Record<string, string> = {
  alipay: '支付寶',
  wechat: '微信支付',
  paypal: 'PayPal',
};

/** 页面参数类型 */
interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 订单详情页面组件
 * @returns 订单详情页面
 */
export default function OrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string>('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    params.then(p => setOrderId(p.id));
  }, [params]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  /**
   * 加载订单详情
   */
  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      if (data.data) {
        setOrder(data.data);
      } else {
        toast.error('訂單不存在');
        router.push('/user/orders');
      }
    } catch (error) {
      console.error('加載訂單失敗:', error);
      toast.error('加載訂單失敗');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 复制订单号
   */
  const handleCopyOrderNo = () => {
    if (order?.order_no) {
      navigator.clipboard.writeText(order.order_no);
      toast.success('訂單號已複製');
    }
  };

  /**
   * 取消订单
   */
  const handleCancelOrder = async () => {
    if (!order) return;

    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: 4 }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('訂單已取消');
        setCancelDialogOpen(false);
        loadOrder();
      } else {
        toast.error(data.error || '取消失敗');
      }
    } catch (error) {
      console.error('取消訂單失敗:', error);
      toast.error('取消訂單失敗');
    } finally {
      setConfirming(false);
    }
  };

  /**
   * 确认收货
   */
  const handleConfirmReceive = async () => {
    if (!order) return;

    setConfirming(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_status: 3, 
          receive_time: new Date().toISOString() 
        }),
      });

      const data = await res.json();
      if (data.message) {
        toast.success('已確認收貨');
        loadOrder();
      } else {
        toast.error(data.error || '確認失敗');
      }
    } catch (error) {
      console.error('確認收貨失敗:', error);
      toast.error('確認收貨失敗');
    } finally {
      setConfirming(false);
    }
  };

  /**
   * 去支付
   */
  const handlePay = () => {
    router.push(`/payment?order_id=${order?.id}`);
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <UserLayout title="訂單詳情">
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">訂單不存在</h3>
            <Button asChild>
              <Link href="/user/orders">返回訂單列表</Link>
            </Button>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  const status = orderStatusMap[order.order_status] || orderStatusMap[0];
  const totalQuantity = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <UserLayout title="訂單詳情">
      {/* 返回按钮 */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/user/orders">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回訂單列表
        </Link>
      </Button>

      {/* 订单状态卡片 */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                order.order_status === 3 ? 'bg-green-100' : 
                order.order_status === 4 ? 'bg-gray-100' : 'bg-primary/10'
              }`}>
                {order.order_status === 3 ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : order.order_status === 4 ? (
                  <X className="w-6 h-6 text-gray-500" />
                ) : (
                  <Package className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{status.label}</h2>
                  <Badge className={status.color}>{status.description}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  訂單編號：{order.order_no}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopyOrderNo}>
              <Copy className="w-4 h-4 mr-1" />
              複製
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 订单进度 */}
      {order.order_status !== 4 && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: '提交訂單', time: order.created_at },
                { step: 2, label: '支付成功', time: order.pay_time },
                { step: 3, label: '商家發貨', time: order.shipping_time },
                { step: 4, label: '確認收貨', time: order.receive_time },
              ].map((item, index) => {
                const isCompleted = item.time || (item.step === 1);
                const isCurrent = 
                  (order.order_status === 0 && item.step === 1) ||
                  (order.order_status === 1 && item.step === 2) ||
                  (order.order_status === 2 && item.step === 3);

                return (
                  <div key={item.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-primary text-primary-foreground' :
                        isCurrent ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{item.step}</span>
                        )}
                      </div>
                      <span className={`text-xs mt-2 ${isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.label}
                      </span>
                      {item.time && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.time).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {index < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="md:col-span-2 space-y-6">
          {/* 商品列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">商品明細</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                      {item.goods_image ? (
                        <img 
                          src={item.goods_image} 
                          alt={item.goods_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/goods/${item.goods_id}`}
                        className="font-medium hover:text-primary truncate block"
                      >
                        {item.goods_name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        HK${item.price} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      HK${item.total_price}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* 金额汇总 */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品金額</span>
                  <span>HK${order.total_amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">運費</span>
                  <span>HK${(parseFloat(order.pay_amount) - parseFloat(order.total_amount)).toFixed(2)}</span>
                </div>
                {order.remark && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">備註</span>
                    <span>{order.remark}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">
                  共 {totalQuantity} 件商品
                </span>
                <div className="text-right">
                  <span className="text-muted-foreground text-sm">實付金額：</span>
                  <span className="text-2xl font-bold text-primary">
                    HK${order.pay_amount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 收货信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                收貨信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {order.shipping_name} {order.shipping_phone}
                </p>
                <p className="text-muted-foreground">
                  {order.shipping_address}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧订单信息 */}
        <div className="space-y-6">
          {/* 操作按钮 */}
          <Card>
            <CardContent className="py-6">
              <div className="space-y-3">
                {order.order_status === 0 && (
                  <>
                    <Button className="w-full" onClick={handlePay}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      立即支付
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      取消訂單
                    </Button>
                  </>
                )}
                {order.order_status === 2 && (
                  <Button className="w-full" onClick={handleConfirmReceive} disabled={confirming}>
                    {confirming ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4 mr-2" />
                    )}
                    確認收貨
                  </Button>
                )}
                {order.order_status === 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/shop">
                      再次購買
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 订单信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                訂單信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">訂單編號</span>
                  <span className="font-mono">{order.order_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">下單時間</span>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                {order.pay_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付時間</span>
                    <span>{new Date(order.pay_time).toLocaleString()}</span>
                  </div>
                )}
                {order.pay_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">支付方式</span>
                    <span>{payMethodMap[order.pay_method] || order.pay_method}</span>
                  </div>
                )}
                {order.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">交易號</span>
                    <span className="font-mono text-xs">{order.transaction_id}</span>
                  </div>
                )}
                {order.shipping_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">發貨時間</span>
                    <span>{new Date(order.shipping_time).toLocaleString()}</span>
                  </div>
                )}
                {order.receive_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">收貨時間</span>
                    <span>{new Date(order.receive_time).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 客服支持 */}
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center mb-3">
                有問題需要幫助？
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  聯繫客服
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 取消订单弹窗 */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              取消訂單
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            確定要取消此訂單嗎？取消後將無法恢復。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              返回
            </Button>
            <Button variant="destructive" onClick={handleCancelOrder} disabled={confirming}>
              {confirming ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              確認取消
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}

// 缺失的图标组件
function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
