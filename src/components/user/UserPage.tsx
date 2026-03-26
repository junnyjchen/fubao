'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Clock,
  Truck,
  CheckCircle,
  TrendingUp,
  Ticket,
  Coins,
  Gift,
  Star,
  Bell,
  ChevronRight,
  Loader2,
  Wallet,
  CreditCard,
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

interface UserProfile {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  level: number;
  points: number;
  balance: number;
  totalSpent: number;
  orderCount: number;
  memberSince: string;
}

const orderStatusMap: Record<number, { label: string; color: string }> = {
  '-1': { label: '已取消', color: 'bg-gray-100 text-gray-600' },
  '0': { label: '待付款', color: 'bg-yellow-100 text-yellow-800' },
  '1': { label: '待發貨', color: 'bg-blue-100 text-blue-800' },
  '2': { label: '已發貨', color: 'bg-purple-100 text-purple-800' },
  '3': { label: '已完成', color: 'bg-green-100 text-green-800' },
};

// 会员等级配置
const memberLevels = [
  { level: 1, name: '普通會員', minPoints: 0, discount: 1.0, color: 'bg-gray-500' },
  { level: 2, name: '銅牌會員', minPoints: 100, discount: 0.98, color: 'bg-orange-600' },
  { level: 3, name: '銀牌會員', minPoints: 500, discount: 0.95, color: 'bg-gray-400' },
  { level: 4, name: '金牌會員', minPoints: 2000, discount: 0.92, color: 'bg-yellow-500' },
  { level: 5, name: '鑽石會員', minPoints: 5000, discount: 0.88, color: 'bg-blue-500' },
];

function OrderCard({ order }: { order: Order }) {
  const status = orderStatusMap[order.orderStatus] || orderStatusMap[0];
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderDetailUrl = '/user/orders/' + order.id;
  const payUrl = orderDetailUrl + '?pay=true';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">訂單編號：</span>
          <span className="font-mono">{order.orderNo}</span>
          <span className="text-muted-foreground">{order.createdAt}</span>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                {item.goodsImage ? (
                  <img src={item.goodsImage} alt={item.goodsName} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6" />
                )}
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
            <p className="text-xs text-muted-foreground text-center">
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, profileRes] = await Promise.all([
        fetch('/api/orders?limit=10'),
        fetch('/api/auth/me'),
      ]);

      const ordersData = await ordersRes.json();
      const profileData = await profileRes.json();

      if (ordersData.data) setOrders(ordersData.data);
      if (profileData.user) {
        setProfile({
          id: profileData.user.id,
          username: profileData.user.username || '用戶',
          email: profileData.user.email || '',
          phone: profileData.user.phone,
          avatar: profileData.user.avatar,
          level: profileData.user.level || 1,
          points: profileData.user.points || 0,
          balance: profileData.user.balance || 0,
          totalSpent: profileData.user.totalSpent || 0,
          orderCount: ordersData.total || 0,
          memberSince: profileData.user.created_at || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      // 设置默认数据
      setProfile({
        id: 1,
        username: '用戶',
        email: 'user@example.com',
        level: 1,
        points: 0,
        balance: 0,
        totalSpent: 0,
        orderCount: 0,
        memberSince: new Date().toISOString(),
      });
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
    { label: '待付款', count: orders.filter(o => o.orderStatus === 0).length, icon: Clock, color: 'text-yellow-600', href: '/user/orders?status=unpaid' },
    { label: '待發貨', count: orders.filter(o => o.orderStatus === 1).length, icon: Package, color: 'text-blue-600', href: '/user/orders?status=unshipped' },
    { label: '已發貨', count: orders.filter(o => o.orderStatus === 2).length, icon: Truck, color: 'text-purple-600', href: '/user/orders?status=shipped' },
    { label: '待評價', count: orders.filter(o => o.orderStatus === 3).length, icon: Star, color: 'text-orange-600', href: '/user/reviews/pending' },
  ];

  // 获取当前会员等级信息
  const currentLevel = memberLevels.find(l => l.level === (profile?.level || 1)) || memberLevels[0];
  const nextLevel = memberLevels.find(l => l.level === (profile?.level || 1) + 1);
  const pointsProgress = nextLevel 
    ? ((profile?.points || 0) / nextLevel.minPoints) * 100 
    : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* 用户头部 */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-2 border-primary-foreground/30">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile?.username || '用戶'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge className={`${currentLevel.color} text-white`}>
                    {currentLevel.name}
                  </Badge>
                  <span className="text-primary-foreground/80 text-sm">
                    會員ID: {profile?.id}
                  </span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{profile?.points || 0}</p>
                <p className="text-xs text-primary-foreground/80">積分</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">HK${profile?.balance?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-primary-foreground/80">餘額</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile?.orderCount || 0}</p>
                <p className="text-xs text-primary-foreground/80">訂單</p>
              </div>
            </div>
          </div>

          {/* 会员等级进度 */}
          {nextLevel && (
            <div className="mt-6 bg-primary-foreground/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">距離 {nextLevel.name} 還需 {nextLevel.minPoints - (profile?.points || 0)} 積分</span>
                <span className="text-sm">當前 {currentLevel.discount * 10} 折優惠</span>
              </div>
              <Progress value={pointsProgress} className="h-2 bg-primary-foreground/20" />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 快捷入口 */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-6">
          {[
            { label: '待付款', count: orders.filter(o => o.orderStatus === 0).length, icon: Clock, href: '/user/orders?status=unpaid' },
            { label: '待發貨', count: orders.filter(o => o.orderStatus === 1).length, icon: Package, href: '/user/orders?status=unshipped' },
            { label: '已發貨', count: orders.filter(o => o.orderStatus === 2).length, icon: Truck, href: '/user/orders?status=shipped' },
            { label: '待評價', count: orders.filter(o => o.orderStatus === 3).length, icon: Star, href: '/user/reviews/pending' },
            { label: '我的收藏', icon: Heart, href: '/user/favorites' },
            { label: '優惠券', icon: Ticket, href: '/user/coupons' },
            { label: '我的積分', icon: Coins, href: '/user/points' },
            { label: '我的錢包', icon: Wallet, href: '/user/wallet' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-1 text-primary" />
                    <p className="text-xs font-medium">{item.label}</p>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge variant="destructive" className="mt-1 h-5 px-1.5 text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* 左侧菜单 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Link href="/user">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-medium">
                      <Package className="w-5 h-5" />
                      <span>我的訂單</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/user/favorites">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <Heart className="w-5 h-5" />
                      <span>我的收藏</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/user/addresses">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <MapPin className="w-5 h-5" />
                      <span>收貨地址</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/user/coupons">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <Ticket className="w-5 h-5" />
                      <span>優惠券</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/user/points">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <Coins className="w-5 h-5" />
                      <span>積分明細</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/user/wallet">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <Wallet className="w-5 h-5" />
                      <span>我的錢包</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Separator className="my-2" />
                  <Link href="/user/notifications">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <Bell className="w-5 h-5" />
                      <span>消息通知</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Link href="/user/settings">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <Settings className="w-5 h-5" />
                      <span>賬號設置</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                  <Separator className="my-2" />
                  <Link href="/distribution">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted">
                      <TrendingUp className="w-5 h-5" />
                      <span>分銷中心</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </div>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>我的訂單</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/user/orders">查看全部</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start mb-4">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="unpaid">待付款</TabsTrigger>
                    <TabsTrigger value="unshipped">待發貨</TabsTrigger>
                    <TabsTrigger value="shipped">已發貨</TabsTrigger>
                    <TabsTrigger value="completed">已完成</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-4">暫無訂單</p>
                        <Button asChild>
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

            {/* 猜你喜欢 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  為您推薦
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Link key={i} href={`/shop/${i}`}>
                      <div className="group cursor-pointer">
                        <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-2xl text-primary/30">符</span>
                          </div>
                        </div>
                        <p className="text-sm font-medium line-clamp-1">推薦商品 {i}</p>
                        <p className="text-sm text-primary font-semibold">HK$88.00</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
