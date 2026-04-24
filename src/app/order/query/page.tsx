/**
 * @fileoverview 订单查询页面
 * @description 通过手机号和查询码查询订单
 * @module app/order/query/page
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Phone,
  Key,
  Loader2,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

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
  query_code?: string;
  total_amount: string;
  pay_amount: string;
  pay_status: number;
  order_status: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  remark: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  order_items: OrderItem[];
}

// 订单状态映射
const orderStatusMap: Record<number, { label: string; color: string; icon: typeof Clock }> = {
  0: { label: '待付款', color: 'bg-yellow-500', icon: Clock },
  1: { label: '待發貨', color: 'bg-blue-500', icon: Package },
  2: { label: '已發貨', color: 'bg-purple-500', icon: Truck },
  3: { label: '已完成', color: 'bg-green-500', icon: CheckCircle },
  4: { label: '已取消', color: 'bg-gray-500', icon: XCircle },
};

// 支付状态映射
const payStatusMap: Record<number, { label: string; color: string }> = {
  0: { label: '未支付', color: 'text-yellow-600' },
  1: { label: '已支付', color: 'text-green-600' },
  2: { label: '已退款', color: 'text-gray-600' },
};

// 订单查询表单组件
function OrderQueryForm() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(initialPhone);
  const [queryCode, setQueryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (initialPhone) {
      // 如果URL中有手机号，自动查询
      handleSearch();
    }
  }, [initialPhone]);

  const handleSearch = async () => {
    const normalizedPhone = phone.replace(/\s/g, '');
    if (!normalizedPhone || !/^[2-9]\d{7}$/.test(normalizedPhone)) {
      toast.error('請輸入正確的香港手機號碼');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({ phone: normalizedPhone });
      if (queryCode.trim()) {
        params.append('query_code', queryCode.trim().toUpperCase());
      }

      const res = await fetch(`/api/quick-order?${params.toString()}`);
      const result = await res.json();

      if (result.success) {
        setOrders(result.data || []);
        if (result.data?.length === 0) {
          toast.info('未找到相關訂單');
        }
      } else {
        toast.error(result.error || '查詢失敗');
      }
    } catch (error) {
      console.error('查询订单失败:', error);
      toast.error('查詢失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-8">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 查询表单 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-5 h-5" />
                查詢訂單
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 手机号 */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    手機號碼 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="請輸入手機號碼"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                {/* 查询码 */}
                <div className="space-y-2">
                  <Label htmlFor="queryCode" className="flex items-center gap-1">
                    <Key className="w-4 h-4" />
                    查詢碼（選填）
                  </Label>
                  <Input
                    id="queryCode"
                    value={queryCode}
                    onChange={(e) => setQueryCode(e.target.value.toUpperCase())}
                    placeholder="輸入查詢碼更精確"
                    maxLength={6}
                    className="font-mono uppercase"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    查詢中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    查詢訂單
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                輸入手機號即可查詢該手機號下的所有快速訂單，輸入查詢碼可精確定位單個訂單
              </p>
            </CardContent>
          </Card>

          {/* 订单列表 */}
          {orders.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Package className="w-5 h-5" />
                查詢結果（{orders.length} 個訂單）
              </h3>

              {orders.map((order) => {
                const statusInfo = orderStatusMap[order.order_status] || orderStatusMap[0];
                const payInfo = payStatusMap[order.pay_status] || payStatusMap[0];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order.id} className="overflow-hidden">
                    {/* 订单头部 */}
                    <div className="bg-muted/50 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{order.order_no}</span>
                        {order.query_code && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {order.query_code}
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${statusInfo.color} text-white`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <CardContent className="p-4">
                      {/* 商品列表 */}
                      <div className="space-y-3">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                              {item.goods_image ? (
                                <Image
                                  src={item.goods_image}
                                  alt={item.goods_name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <span className="text-xl text-primary/30">符</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{item.goods_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-primary font-medium">
                                  HK${item.price}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ×{item.quantity}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">HK${item.total_price}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-4" />

                      {/* 订单信息 */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">下單時間</span>
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">支付狀態</span>
                          <span className={payInfo.color}>{payInfo.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">收貨人</span>
                          <span>{order.shipping_name} {order.shipping_phone}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground">收貨地址</span>
                          <span className="text-right max-w-[60%]">{order.shipping_address}</span>
                        </div>
                        {order.remark && (
                          <div className="flex justify-between items-start">
                            <span className="text-muted-foreground">備註</span>
                            <span className="text-right max-w-[60%]">{order.remark}</span>
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      {/* 金额和操作 */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-muted-foreground text-sm">訂單金額：</span>
                          <span className="text-xl font-bold text-primary">
                            HK${order.pay_amount}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {order.order_status === 0 && order.pay_status === 0 && (
                            <Link href={`/payment/${order.id}`}>
                              <Button size="sm">
                                <CreditCard className="w-4 h-4 mr-1" />
                                去支付
                              </Button>
                            </Link>
                          )}
                          <Link href={`/order/${order.id}`}>
                            <Button variant="outline" size="sm">
                              訂單詳情
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* 无订单提示 */}
          {!loading && orders.length === 0 && phone && (
            <Card className="text-center py-8">
              <CardContent>
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">未找到相關訂單</p>
                <p className="text-sm text-muted-foreground mt-1">
                  請確認手機號碼是否正確，或嘗試輸入查詢碼
                </p>
              </CardContent>
            </Card>
          )}

          {/* 帮助信息 */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200/50">
            <CardContent className="py-4">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                常見問題
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 查詢碼在下單成功後會顯示，請妥善保管</li>
                <li>• 若忘記查詢碼，可僅輸入手機號查詢該手機下所有訂單</li>
                <li>• 訂單超過30分鐘未支付將自動取消</li>
                <li>• 如有問題請聯繫客服：+852 1234 5678</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OrderQueryForm />
    </Suspense>
  );
}
