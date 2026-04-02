'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronLeft,
  Loader2,
  Wallet,
  CreditCard,
  Crown,
  Users,
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

function OrderCard({ order, t, isRTL }: { order: Order; t: any; isRTL: boolean }) {
  const status = orderStatusMap[order.orderStatus] || orderStatusMap[0];
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderDetailUrl = '/user/orders/' + order.id;
  const payUrl = orderDetailUrl + '?pay=true';
  const uh = t.userPage.home;
  const os = uh.orderSection;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`bg-muted/50 px-4 py-2 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-muted-foreground">{t.userPage.ordersPage.list.orderNo}：</span>
          <span className="font-mono">{order.orderNo}</span>
          <span className="text-muted-foreground">{order.createdAt}</span>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-xs overflow-hidden">
                {item.goodsImage ? (
                  <Image src={item.goodsImage} alt={item.goodsName} width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6" />
                )}
              </div>
              <div className={`flex-1 ${isRTL ? 'text-end' : ''}`}>
                <p className="text-sm font-medium truncate">{item.goodsName}</p>
                <p className="text-xs text-muted-foreground">
                  HK${item.price} x {item.quantity}
                </p>
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-muted-foreground text-center">
              {os.moreItems.replace('{count}', String(order.items.length - 2))}
            </p>
          )}
        </div>
        <Separator className="my-3" />
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className={`text-sm ${isRTL ? 'text-end' : ''}`}>
            {os.totalItems.replace('{count}', String(totalItems))}
            <span className="mx-4">
              {os.actualPay}：<span className="text-primary font-semibold">HK${order.payAmount}</span>
            </span>
          </p>
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="sm" asChild>
              <Link href={orderDetailUrl}>{os.viewDetail}</Link>
            </Button>
            {order.orderStatus === 0 && (
              <Button size="sm" asChild>
                <Link href={payUrl}>{os.goPay}</Link>
              </Button>
            )}
            {order.orderStatus === 2 && (
              <Button size="sm" asChild>
                <Link href={orderDetailUrl}>{os.confirmReceive}</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// 订单状态映射 - 使用函数获取翻译
const orderStatusMap: Record<number, { label: string; color: string }> = {
  '-1': { label: '已取消', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  '0': { label: '待付款', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  '1': { label: '待發貨', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  '2': { label: '已發貨', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  '3': { label: '已完成', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
};

// 会员等级配置 - 使用翻译
const getMemberLevels = (t: any) => [
  { level: 1, name: t.userPage.home.memberLevel.normal, minPoints: 0, discount: 1.0, color: 'bg-gray-500' },
  { level: 2, name: t.userPage.home.memberLevel.bronze, minPoints: 100, discount: 0.98, color: 'bg-orange-600' },
  { level: 3, name: t.userPage.home.memberLevel.silver, minPoints: 500, discount: 0.95, color: 'bg-gray-400' },
  { level: 4, name: t.userPage.home.memberLevel.gold, minPoints: 2000, discount: 0.92, color: 'bg-yellow-500' },
  { level: 5, name: t.userPage.home.memberLevel.diamond, minPoints: 5000, discount: 0.88, color: 'bg-blue-500' },
];

export function UserPage() {
  const { t, isRTL } = useI18n();
  const uh = t.userPage.home;
  const memberLevels = getMemberLevels(t);
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;
  
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
          username: profileData.user.username || uh.userInfo.defaultUsername,
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
      console.error('Failed to fetch data:', error);
      // 设置默认数据
      setProfile({
        id: 1,
        username: uh.userInfo.defaultUsername,
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

  // 获取当前会员等级信息
  const currentLevel = memberLevels.find(l => l.level === (profile?.level || 1)) || memberLevels[0];
  const nextLevel = memberLevels.find(l => l.level === (profile?.level || 1) + 1);
  const pointsProgress = nextLevel 
    ? ((profile?.points || 0) / nextLevel.minPoints) * 100 
    : 100;

  // 快捷入口配置
  const quickAccessItems = [
    { label: uh.quickAccess.unpaid, count: orders.filter(o => o.orderStatus === 0).length, icon: Clock, color: 'text-yellow-600', href: '/user/orders?status=unpaid' },
    { label: uh.quickAccess.unshipped, count: orders.filter(o => o.orderStatus === 1).length, icon: Package, color: 'text-blue-600', href: '/user/orders?status=unshipped' },
    { label: uh.quickAccess.shipped, count: orders.filter(o => o.orderStatus === 2).length, icon: Truck, color: 'text-purple-600', href: '/user/orders?status=shipped' },
    { label: uh.quickAccess.toReview, count: orders.filter(o => o.orderStatus === 3).length, icon: Star, color: 'text-orange-600', href: '/user/reviews/pending' },
  ];

  // 快捷入口网格
  const quickGridItems = [
    { label: uh.quickAccess.unpaid, count: orders.filter(o => o.orderStatus === 0).length, icon: Clock, href: '/user/orders?status=unpaid' },
    { label: uh.quickAccess.unshipped, count: orders.filter(o => o.orderStatus === 1).length, icon: Package, href: '/user/orders?status=unshipped' },
    { label: uh.quickAccess.shipped, count: orders.filter(o => o.orderStatus === 2).length, icon: Truck, href: '/user/orders?status=shipped' },
    { label: uh.quickAccess.toReview, count: orders.filter(o => o.orderStatus === 3).length, icon: Star, href: '/user/reviews/pending' },
    { label: uh.quickAccess.vip, icon: Crown, href: '/vip', highlight: true, highlightColor: 'gold' },
    { label: uh.quickAccess.distribution, icon: TrendingUp, href: '/distribution', highlight: true, highlightColor: 'purple' },
    { label: uh.quickAccess.coupons, icon: Ticket, href: '/user/coupons' },
    { label: uh.quickAccess.myPoints, icon: Coins, href: '/user/points' },
  ];

  // 侧边菜单配置
  const menuItems = [
    { label: uh.menu.myOrders, icon: Package, href: '/user', active: true },
    { label: uh.menu.myFavorites, icon: Heart, href: '/user/favorites' },
    { label: uh.menu.addresses, icon: MapPin, href: '/user/addresses' },
    { label: uh.menu.coupons, icon: Ticket, href: '/user/coupons' },
    { label: uh.menu.pointsDetail, icon: Coins, href: '/user/points' },
    { label: uh.menu.myWallet, icon: Wallet, href: '/user/wallet' },
  ];

  const menuItemsBottom = [
    { label: uh.menu.notifications, icon: Bell, href: '/user/notifications' },
    { label: uh.menu.accountSettings, icon: Settings, href: '/user/settings' },
  ];

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
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center border-2 border-primary-foreground/30">
                {profile?.avatar ? (
                  <Image src={profile.avatar} alt={profile.username} width={80} height={80} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <div className={isRTL ? 'text-end' : ''}>
                <h1 className="text-2xl font-bold">{profile?.username || uh.userInfo.defaultUsername}</h1>
                <div className={`flex items-center gap-3 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Badge className={`${currentLevel.color} text-white`}>
                    {currentLevel.name}
                  </Badge>
                  <span className="text-primary-foreground/80 text-sm">
                    {uh.userInfo.memberId}: {profile?.id}
                  </span>
                </div>
              </div>
            </div>
            <div className={`hidden md:flex items-center gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile?.points || 0}</p>
                <p className="text-xs text-primary-foreground/80">{uh.stats.points}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">HK${profile?.balance?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-primary-foreground/80">{uh.stats.balance}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{profile?.orderCount || 0}</p>
                <p className="text-xs text-primary-foreground/80">{uh.stats.orders}</p>
              </div>
            </div>
          </div>

          {/* 会员等级进度 */}
          {nextLevel && (
            <div className="mt-6 bg-primary-foreground/10 rounded-lg p-4">
              <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm">
                  {uh.levelProgress.needPoints.replace('{points}', String(nextLevel.minPoints - (profile?.points || 0))).replace('{level}', nextLevel.name)}
                </span>
                <span className="text-sm">
                  {uh.levelProgress.currentDiscount.replace('{discount}', String(currentLevel.discount * 10))}
                </span>
              </div>
              <Progress value={pointsProgress} className="h-2 bg-primary-foreground/20" />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 快捷入口 */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-6">
          {quickGridItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
                  item.highlightColor === 'gold' 
                    ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-300/50' 
                    : item.highlightColor === 'purple'
                    ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-300/50'
                    : ''
                }`}>
                  <CardContent className="p-3 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${
                      item.highlightColor === 'gold' 
                        ? 'text-amber-500' 
                        : item.highlightColor === 'purple'
                        ? 'text-purple-500'
                        : 'text-primary'
                    }`} />
                    <p className={`text-xs font-medium ${
                      item.highlightColor === 'gold' 
                        ? 'text-amber-700' 
                        : item.highlightColor === 'purple'
                        ? 'text-purple-700'
                        : ''
                    }`}>{item.label}</p>
                    {item.count !== undefined && item.count > 0 && (
                      <Badge variant="destructive" className="mt-1 h-5 px-1.5 text-xs">
                        {item.count}
                      </Badge>
                    )}
                    {item.highlightColor === 'gold' && (
                      <Badge className="mt-1 h-5 px-1.5 text-xs bg-gradient-to-r from-amber-500 to-yellow-500">
                        {uh.quickAccess.privilege}
                      </Badge>
                    )}
                    {item.highlightColor === 'purple' && (
                      <Badge className="mt-1 h-5 px-1.5 text-xs bg-gradient-to-r from-purple-500 to-indigo-500">
                        {uh.quickAccess.earnMoney}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className={`grid lg:grid-cols-4 gap-6 ${isRTL ? 'direction-rtl' : ''}`}>
          {/* 左侧菜单 */}
          <div className="lg:col-span-1">
            {/* VIP和分销突出卡片 */}
            <div className={`grid grid-cols-2 gap-3 mb-4 ${isRTL ? 'direction-rtl' : ''}`}>
              <Link href="/vip">
                <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-300/50 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <Crown className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                    <p className="text-xs font-medium text-amber-700">{uh.quickAccess.vip}</p>
                    <p className="text-[10px] text-amber-600/70 mt-0.5">{uh.quickAccess.privilege}</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/distribution">
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-300/50 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                    <p className="text-xs font-medium text-purple-700">{uh.quickAccess.distribution}</p>
                    <p className="text-[10px] text-purple-600/70 mt-0.5">{uh.quickAccess.earnMoney}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                          item.active 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground hover:bg-muted'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Icon className="w-5 h-5" />
                          <span className={isRTL ? 'ms-0 me-auto' : ''}>{item.label}</span>
                          <NextIcon className={`w-4 h-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                        </div>
                      </Link>
                    );
                  })}
                  <Separator className="my-2" />
                  {menuItemsBottom.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.label} href={item.href}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Icon className="w-5 h-5" />
                          <span className={isRTL ? 'ms-0 me-auto' : ''}>{item.label}</span>
                          <NextIcon className={`w-4 h-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                        </div>
                      </Link>
                    );
                  })}
                  <Separator className="my-2" />
                  <Link href="/free-gifts">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Gift className="w-5 h-5 text-red-500" />
                      <span className={`font-medium text-red-600 ${isRTL ? 'ms-0' : ''}`}>{uh.menu.freeGift}</span>
                      <Badge className={`${isRTL ? 'mr-auto' : 'ml-auto'} bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs`}>HOT</Badge>
                    </div>
                  </Link>
                  <Link href="/user/free-gifts">
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-muted ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Gift className="w-5 h-5" />
                      <span className={isRTL ? 'ms-0 me-auto' : ''}>{uh.menu.giftRecord}</span>
                      <NextIcon className={`w-4 h-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                    </div>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader className={`flex flex-row items-center justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CardTitle>{uh.orderSection.title}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/user/orders">{uh.orderSection.viewAll}</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className={`w-full mb-4 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                    <TabsTrigger value="all">{uh.orderSection.tabs.all}</TabsTrigger>
                    <TabsTrigger value="unpaid">{uh.orderSection.tabs.unpaid}</TabsTrigger>
                    <TabsTrigger value="unshipped">{uh.orderSection.tabs.unshipped}</TabsTrigger>
                    <TabsTrigger value="shipped">{uh.orderSection.tabs.shipped}</TabsTrigger>
                    <TabsTrigger value="completed">{uh.orderSection.tabs.completed}</TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    {filteredOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground mb-4">{uh.orderSection.empty}</p>
                        <Button asChild>
                          <Link href="/shop">{uh.orderSection.goShopping}</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <OrderCard key={order.id} order={order} t={t} isRTL={isRTL} />
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
                <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Gift className="w-5 h-5 text-primary" />
                  {uh.recommendSection.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isRTL ? 'direction-rtl' : ''}`}>
                  {[1, 2, 3, 4].map((i) => (
                    <Link key={i} href={`/shop/${i}`}>
                      <div className="group cursor-pointer">
                        <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-2xl text-primary/30">符</span>
                          </div>
                        </div>
                        <p className={`text-sm font-medium line-clamp-1 ${isRTL ? 'text-end' : ''}`}>{uh.recommendSection.recommendedProduct} {i}</p>
                        <p className={`text-sm text-primary font-semibold ${isRTL ? 'text-end' : ''}`}>HK$88.00</p>
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
