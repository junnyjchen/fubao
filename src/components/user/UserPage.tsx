'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Clock,
  Truck,
  CheckCircle,
} from 'lucide-react';

interface OrderItem {
  id: number;
  goodsName: string;
  price: string;
  quantity: number;
  goodsImage: string | null;
}

interface Order {
  id: number;
  orderNo: string;
  totalAmount: string;
  payAmount: string;
  payStatus: number;
  orderStatus: number;
  createdAt: string;
  items: OrderItem[];
}

const orderStatusMap: Record<number, { label: string; color: string }> = {
  '-1': { label: '已取消', color: 'bg-gray-100 text-gray-600' },
  '0': { label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  '1': { label: '待發貨', color: 'bg-blue-100 text-blue-800' },
  '2': { label: '已發貨', color: 'bg-purple-100 text-purple-800' },
  '3': { label: '已完成', color: 'bg-green-100 text-green-800' },
};

function OrderCard({ order }: { order: Order }) {
  const status = orderStatusMap[order.orderStatus] || orderStatusMap[0];
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderDetailUrl = '/order/' + order.id;
  const payUrl = orderDetailUrl + '?pay=true';

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">訂單編號：</span>
          <span>{order.orderNo}</span>
          <span className="text-muted-foreground">{order.createdAt}</span>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                {item.goodsImage ? '圖' : '暫無'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{item.goodsName}</p>
                <p className="text-xs text-muted-foreground">
                  HK${item.price} x {item.quantity}
                </p>
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground">
              還有 {order.items.length - 2} 件商品
            </p>
          )}
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between">
          <p className="text-sm">
            共 {totalItems} 件商品
            <span className="ml-4">
              實付：<span className="text-primary font-semibold">HK${order.payAmount}</span>
            </span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={orderDetailUrl}>查看詳情</Link>
            </Button>
            {order.orderStatus === 0 && (
              <Button size="sm" asChild>
                <Link href={payUrl}>去支付</Link>
              </Button>
            )}
            {order.orderStatus === 2 && (
              <Button size="sm" asChild>
                <Link href={orderDetailUrl}>確認收貨</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const result = await response.json();
      if (result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unpaid') return order.orderStatus === 0;
    if (activeTab === 'unshipped') return order.orderStatus === 1;
    if (activeTab === 'shipped') return order.orderStatus === 2;
    if (activeTab === 'completed') return order.orderStatus === 3;
    return true;
  });

  const quickStats = [
    { label: '待付款', count: orders.filter(o => o.orderStatus === 0).length, icon: Clock, color: 'text-yellow-600' },
    { label: '待發貨', count: orders.filter(o => o.orderStatus === 1).length, icon: Package, color: 'text-blue-600' },
    { label: '已發貨', count: orders.filter(o => o.orderStatus === 2).length, icon: Truck, color: 'text-purple-600' },
    { label: '已完成', count: orders.filter(o => o.orderStatus === 3).length, icon: CheckCircle, color: 'text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">用戶中心</h1>
              <p className="text-primary-foreground/80 text-sm">歡迎回來</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Link href="/user">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
                      <Package className="w-5 h-5" />
                      <span>我的訂單</span>
                    </div>
                  </Link>
                  <Link href="/user/favorites">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                      <Heart className="w-5 h-5" />
                      <span>我的收藏</span>
                    </div>
                  </Link>
                  <Link href="/user/addresses">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                      <MapPin className="w-5 h-5" />
                      <span>收貨地址</span>
                    </div>
                  </Link>
                  <Link href="/user/settings">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                      <Settings className="w-5 h-5" />
                      <span>賬號設置</span>
                    </div>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {quickStats.map((stat) => {
                const Icon = stat.icon;
                const href = '/user/orders?status=' + stat.label;
                return (
                  <Link key={stat.label} href={href}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Icon className={'w-6 h-6 mx-auto mb-2 ' + stat.color} />
                        <p className="text-2xl font-bold">{stat.count}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>我的訂單</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="unpaid">待付款</TabsTrigger>
                    <TabsTrigger value="unshipped">待發貨</TabsTrigger>
                    <TabsTrigger value="shipped">已發貨</TabsTrigger>
                    <TabsTrigger value="completed">已完成</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="mt-4">
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">載入中...</div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">暫無訂單</p>
                        <Button asChild className="mt-4">
                          <Link href="/shop">去購物</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <OrderCard key={order.id} order={order} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
