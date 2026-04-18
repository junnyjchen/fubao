/**
 * @fileoverview 商户订单详情页面
 * @description 商户查看订单详情、发货、备注
 * @module app/merchant/dashboard/orders/[id]/page
 */

'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  Phone,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader2,
  Send,
  Eye,
  QrCode,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderDetail {
  id: number;
  order_no: string;
  user_id: number;
  user_name: string;
  user_phone: string;
  user_email: string;
  goods_id: number;
  goods_name: string;
  goods_image: string;
  goods_price: number;
  quantity: number;
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  order_status: number;
  payment_status: number;
  shipping_status: number;
  payment_method: string;
  payment_time: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_company: string | null;
  shipping_no: string | null;
  shipping_time: string | null;
  remark: string | null;
  merchant_remark: string | null;
  cert_no: string | null;
  created_at: string;
  updated_at: string;
}

const ORDER_STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: '待付款', className: 'bg-yellow-100 text-yellow-800' },
  1: { label: '待發貨', className: 'bg-blue-100 text-blue-800' },
  2: { label: '已發貨', className: 'bg-purple-100 text-purple-800' },
  3: { label: '已完成', className: 'bg-green-100 text-green-800' },
  4: { label: '已取消', className: 'bg-gray-100 text-gray-800' },
  5: { label: '已退款', className: 'bg-red-100 text-red-800' },
};

export default function MerchantOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShipDialog, setShowShipDialog] = useState(false);
  const [showRemarkDialog, setShowRemarkDialog] = useState(false);
  const [shippingCompany, setShippingCompany] = useState('');
  const [shippingNo, setShippingNo] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [resolvedParams.id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setOrder({
        id: parseInt(resolvedParams.id),
        order_no: 'FB20260324001',
        user_id: 100,
        user_name: '李先生',
        user_phone: '+852 9876 5432',
        user_email: 'lee@example.com',
        goods_id: 101,
        goods_name: '開光平安符',
        goods_image: '/goods/pinganfu.jpg',
        goods_price: 288,
        quantity: 1,
        total_amount: 288,
        shipping_fee: 20,
        discount_amount: 0,
        final_amount: 308,
        order_status: 1,
        payment_status: 1,
        shipping_status: 0,
        payment_method: 'alipay',
        payment_time: '2026-03-24T08:35:00',
        shipping_name: '李先生',
        shipping_phone: '+852 9876 5432',
        shipping_address: '香港九龍旺角彌敦道123號',
        shipping_company: null,
        shipping_no: null,
        shipping_time: null,
        remark: '請包裝精美一些，是送禮用的',
        merchant_remark: null,
        cert_no: 'CERT-2026-000001',
        created_at: '2026-03-24T08:30:00',
        updated_at: '2026-03-24T08:35:00',
      });
    } catch (error) {
      console.error('加载订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShip = async () => {
    if (!shippingCompany || !shippingNo) {
      toast.error('請填寫完整的物流信息');
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('發貨成功');
      setShowShipDialog(false);
      loadOrder();
    } catch (error) {
      toast.error('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemark = async () => {
    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('備注已保存');
      setShowRemarkDialog(false);
      loadOrder();
    } catch (error) {
      toast.error('操作失敗');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已複製');
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      alipay: '支付寶',
      wechat: '微信支付',
      paypal: 'PayPal',
      credit_card: '信用卡',
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <MerchantLayout title="訂單詳情" description="查看訂單信息">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  if (!order) {
    return (
      <MerchantLayout title="訂單詳情" description="查看訂單信息">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>訂單不存在</p>
          <Button className="mt-4" asChild>
            <Link href="/merchant/dashboard/orders">返回訂單列表</Link>
          </Button>
        </div>
      </MerchantLayout>
    );
  }

  const statusInfo = ORDER_STATUS_MAP[order.order_status] || ORDER_STATUS_MAP[0];

  return (
    <MerchantLayout title="訂單詳情" description={`訂單編號: ${order.order_no}`}>
      {/* 返回按钮 */}
      <Button variant="ghost" className="mb-4" asChild>
        <Link href="/merchant/dashboard/orders">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回訂單列表
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 订单状态 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge className={statusInfo.className + ' text-base px-4 py-1'}>
                    {statusInfo.label}
                  </Badge>
                  <span className="text-muted-foreground">
                    {order.payment_status === 1 ? '已付款' : '待付款'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">訂單編號</p>
                  <p className="font-mono">{order.order_no}</p>
                </div>
              </div>

              {/* 订单进度 */}
              <div className="flex items-center justify-between mt-6">
                {[
                  { label: '提交訂單', time: order.created_at, done: true },
                  { label: '支付成功', time: order.payment_time, done: order.payment_status === 1 },
                  { label: '商家發貨', time: order.shipping_time, done: order.shipping_status === 1 },
                  { label: '確認收貨', time: null, done: order.order_status === 3 },
                ].map((step, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      step.done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                    <p className="text-sm font-medium">{step.label}</p>
                    {step.time && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(step.time).toLocaleString('zh-TW', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 商品信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5" />
                商品信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={order.goods_image}
                    alt={order.goods_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{order.goods_name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">數量: {order.quantity}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-primary font-semibold">HK${order.goods_price}</p>
                    {order.cert_no && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        {order.cert_no}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 收货信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                收貨信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{order.shipping_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.shipping_phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{order.shipping_address}</span>
              </div>

              {order.shipping_company && (
                <>
                  <Separator />
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">物流信息</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{order.shipping_company}</span>
                      <span className="font-mono">{order.shipping_no}</span>
                      <Button variant="ghost" size="sm">
                        查看物流
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息 */}
        <div className="space-y-6">
          {/* 价格信息 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">訂單金額</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">商品金額</span>
                <span>HK${order.total_amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">運費</span>
                <span>HK${order.shipping_fee}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>優惠</span>
                  <span>-HK${order.discount_amount}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>實付金額</span>
                <span className="text-primary">HK${order.final_amount}</span>
              </div>
            </CardContent>
          </Card>

          {/* 买家信息 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">買家信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">用戶</span>
                <span>{order.user_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">電話</span>
                <span>{order.user_phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">支付方式</span>
                <span>{getPaymentMethodLabel(order.payment_method)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">下單時間</span>
                <span className="text-sm">
                  {new Date(order.created_at).toLocaleString('zh-TW')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 备注 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                備注
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.remark && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">買家備注</p>
                  <p className="text-sm">{order.remark}</p>
                </div>
              )}
              {order.merchant_remark ? (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">商家備注</p>
                  <p className="text-sm">{order.merchant_remark}</p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRemarkDialog(true)}
                >
                  添加備注
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {order.order_status === 1 && order.payment_status === 1 && (
                <Button className="w-full" onClick={() => setShowShipDialog(true)}>
                  <Truck className="w-4 h-4 mr-2" />
                  發貨
                </Button>
              )}
              {order.cert_no && (
                <Button variant="outline" className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  查看證書
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => copyToClipboard(order.order_no)}>
                <Copy className="w-4 h-4 mr-2" />
                複製訂單號
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 发货弹窗 */}
      <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>填寫物流信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>物流公司</Label>
              <Select value={shippingCompany} onValueChange={setShippingCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="請選擇物流公司" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sf">順豐速運</SelectItem>
                  <SelectItem value="yto">圓通速遞</SelectItem>
                  <SelectItem value="zto">中通快遞</SelectItem>
                  <SelectItem value="sto">申通快遞</SelectItem>
                  <SelectItem value="jd">京東物流</SelectItem>
                  <SelectItem value="ems">EMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>物流單號</Label>
              <Input
                value={shippingNo}
                onChange={(e) => setShippingNo(e.target.value)}
                placeholder="請輸入物流單號"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipDialog(false)}>
              取消
            </Button>
            <Button onClick={handleShip} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  處理中...
                </>
              ) : (
                '確認發貨'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 备注弹窗 */}
      <Dialog open={showRemarkDialog} onOpenChange={setShowRemarkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加備注</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="請輸入備注內容（僅商家可見）"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemarkDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRemark} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                '保存'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MerchantLayout>
  );
}
