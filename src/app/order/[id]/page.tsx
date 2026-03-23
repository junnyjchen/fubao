'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  MapPin,
  Phone,
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

const orderStatusMap: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  '-1': { label: '已取消', color: 'bg-gray-100 text-gray-600', icon: XCircle },
  '0': { label: '待付款', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  '1': { label: '待發貨', color: 'bg-blue-100 text-blue-800', icon: Package },
  '2': { label: '已發貨', color: 'bg-purple-100 text-purple-800', icon: Truck },
  '3': { label: '已完成', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function OrderDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const showPayment = searchParams.get('pay') === 'true';

  useEffect(() => {
    const orderId = params.id;
    if (orderId) {
      fetchOrder(parseInt(orderId as string));
    }
  }, [params.id]);

  const fetchOrder = async (orderId: number) => {
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
  };

  const handlePay = async (method: string) => {
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
        alert('支付成功！');
      }
    } catch (error) {
      console.error('支付失败:', error);
      alert('支付失败，请重试');
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmReceive = async () => {
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
        alert('已確認收貨！');
      }
    } catch (error) {
      console.error('确认收货失败:', error);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    
    if (!confirm('確定要取消此訂單嗎？')) return;
    
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">訂單不存在</p>
          <Button asChild>
            <Link href="/">返回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  const status = orderStatusMap[order.orderStatus] || orderStatusMap[0];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/user/orders" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span>返回訂單列表</span>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-semibold">訂單詳情</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 订单状态 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${status.color} flex items-center justify-center`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{status.label}</h2>
                <p className="text-muted-foreground">訂單編號：{order.orderNo}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">HK${order.payAmount}</p>
                <p className="text-xs text-muted-foreground">{order.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 支付区域（待付款状态显示） */}
        {order.orderStatus === 0 && (
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                選擇支付方式
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
                  <span className="text-xs text-muted-foreground">國際支付</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-1"
                  onClick={() => handlePay('wechat')}
                  disabled={paying}
                >
                  <span className="font-semibold text-green-600">微信支付</span>
                  <span className="text-xs text-muted-foreground">掃碼支付</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-1"
                  onClick={() => handlePay('alipay')}
                  disabled={paying}
                >
                  <span className="font-semibold text-blue-600">支付寶</span>
                  <span className="text-xs text-muted-foreground">掃碼支付</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 收货信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5 text-primary" />
              收貨信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div>
                <p className="font-medium">{order.shippingName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {order.shippingPhone}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{order.shippingAddress}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">商品清單</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-3 border-b last:border-0">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs">
                    {item.goodsImage ? '圖片' : '暫無'}
                  </div>
                  <div className="flex-1">
                    <Link href={`/shop/${item.goodsId}`} className="font-medium hover:text-primary">
                      {item.goodsName}
                    </Link>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-primary">HK${item.price}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">HK${item.totalPrice}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 订单信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">訂單信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">訂單編號</span>
                <span>{order.orderNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">創建時間</span>
                <span>{order.createdAt}</span>
              </div>
              {order.payTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支付時間</span>
                  <span>{order.payTime}</span>
                </div>
              )}
              {order.shippingTime && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">發貨時間</span>
                  <span>{order.shippingTime}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">商品金額</span>
                <span>HK${order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">運費</span>
                <span className="text-green-600">免運費</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>實付金額</span>
                <span className="text-primary">HK${order.payAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          {order.orderStatus === 0 && (
            <Button variant="outline" onClick={handleCancel}>
              取消訂單
            </Button>
          )}
          {order.orderStatus === 2 && (
            <Button onClick={handleConfirmReceive}>
              確認收貨
            </Button>
          )}
          {order.orderStatus === 3 && (
            <Button asChild>
              <Link href="/shop">繼續購物</Link>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
