'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  Bell,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  Award,
  Store,
  Activity,
} from 'lucide-react';

// 统计数据类型
interface Stats {
  orderStats: {
    total: number;
    pending: number;
    paid: number;
    shipped: number;
    completed: number;
    cancelled: number;
    totalRevenue: number;
  };
  goodsStats: {
    total: number;
    lowStock: number;
    totalSales: number;
  };
  userStats: {
    total: number;
    admins: number;
    merchants: number;
    normal: number;
  };
  merchantStats: {
    total: number;
    active: number;
    pending: number;
  };
  certificateStats: {
    total: number;
    valid: number;
    expired: number;
    revoked: number;
  };
  todayStats: {
    orders: number;
    revenue: number;
  };
  recentOrders: Array<{
    id: number;
    order_no: string;
    total_amount: string;
    pay_status: number;
    order_status: number;
    created_at: string;
  }>;
  hotGoods: Array<{
    id: number;
    name: string;
    sales: number;
    stock: number;
  }>;
}

// 订单状态映射
const orderStatusMap: Record<number, { label: string; className: string }> = {
  0: { label: '待付款', className: 'bg-warning/10 text-warning' },
  1: { label: '待發貨', className: 'bg-primary/10 text-primary' },
  2: { label: '已發貨', className: 'bg-info/10 text-info' },
  3: { label: '已完成', className: 'bg-success/10 text-success' },
  4: { label: '已取消', className: 'bg-muted text-muted-foreground' },
};

// 支付状态映射
const payStatusMap: Record<number, { label: string; className: string }> = {
  0: { label: '未支付', className: 'text-muted-foreground' },
  1: { label: '已支付', className: 'text-success' },
  2: { label: '已退款', className: 'text-destructive' },
};

export function AdminDashboard() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('獲取統計數據失敗');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('加载统计数据失败:', err);
        setError('無法加載統計數據');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 格式化金额
  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `HK$${num.toLocaleString()}`;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW');
  };

  // 统计卡片数据
  const getStatCards = () => {
    if (!stats) return [];
    return [
      {
        title: '今日訂單',
        value: stats.todayStats.orders.toString(),
        subValue: formatAmount(stats.todayStats.revenue),
        icon: ShoppingCart,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
      },
      {
        title: '訂單總數',
        value: stats.orderStats.total.toString(),
        subValue: `已完成 ${stats.orderStats.completed}`,
        icon: TrendingUp,
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
      },
      {
        title: '商品總數',
        value: stats.goodsStats.total.toString(),
        subValue: `總銷量 ${stats.goodsStats.totalSales}`,
        icon: Package,
        iconBg: 'bg-info/10',
        iconColor: 'text-info',
      },
      {
        title: '商戶數量',
        value: stats.merchantStats.total.toString(),
        subValue: `活躍 ${stats.merchantStats.active}`,
        icon: Store,
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
      },
      {
        title: '用戶總數',
        value: stats.userStats.total.toString(),
        subValue: `商戶 ${stats.userStats.merchants}`,
        icon: Users,
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
      },
      {
        title: '證書總數',
        value: stats.certificateStats.total.toString(),
        subValue: `有效 ${stats.certificateStats.valid}`,
        icon: Award,
        iconBg: 'bg-success/10',
        iconColor: 'text-success',
      },
      {
        title: '總營收',
        value: formatAmount(stats.orderStats.totalRevenue),
        subValue: '累計營收',
        icon: DollarSign,
        iconBg: 'bg-warning/10',
        iconColor: 'text-warning',
      },
      {
        title: '待處理訂單',
        value: (stats.orderStats.pending + stats.orderStats.paid).toString(),
        subValue: `待付款 ${stats.orderStats.pending}`,
        icon: Activity,
        iconBg: 'bg-destructive/10',
        iconColor: 'text-destructive',
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加載中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            重試
          </Button>
        </div>
      </div>
    );
  }

  const statCards = getStatCards();

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-background border-r min-h-screen p-4 hidden md:block">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              符
            </div>
            <span className="font-semibold">符寶網後台</span>
          </div>

          <nav className="space-y-1">
            <Link href="/admin">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
                <LayoutDashboard className="w-5 h-5" />
                <span>控制台</span>
              </div>
            </Link>
            <Link href="/admin/products">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <Package className="w-5 h-5" />
                <span>商品管理</span>
              </div>
            </Link>
            <Link href="/admin/orders">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <ShoppingCart className="w-5 h-5" />
                <span>訂單管理</span>
              </div>
            </Link>
            <Link href="/admin/merchants">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <Users className="w-5 h-5" />
                <span>商戶管理</span>
              </div>
            </Link>
            <Link href="/admin/content">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <FileText className="w-5 h-5" />
                <span>內容管理</span>
              </div>
            </Link>
            <Link href="/admin/settings">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted">
                <Settings className="w-5 h-5" />
                <span>系統設置</span>
              </div>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">控制台</h1>
              <p className="text-muted-foreground">歡迎回來，管理員</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button asChild>
                <Link href="/">查看網站</Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.iconBg} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">概覽</TabsTrigger>
              <TabsTrigger value="orders">訂單</TabsTrigger>
              <TabsTrigger value="products">商品</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">最近訂單</CardTitle>
                    <Button variant="link" size="sm" asChild>
                      <Link href="/admin/orders">查看全部</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                        stats.recentOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium text-sm">{order.order_no}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">{formatAmount(order.total_amount)}</p>
                              <Badge className={`text-xs ${orderStatusMap[order.order_status]?.className || ''}`}>
                                {orderStatusMap[order.order_status]?.label || '未知'}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">暫無訂單數據</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Hot Products */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">熱銷商品</CardTitle>
                    <Button variant="link" size="sm" asChild>
                      <Link href="/admin/products">查看全部</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats?.hotGoods && stats.hotGoods.length > 0 ? (
                        stats.hotGoods.map((product, index) => (
                          <div key={product.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{product.name || `商品 #${product.id}`}</p>
                              <p className="text-xs text-muted-foreground">庫存: {product.stock}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">{product.sales}</p>
                              <p className="text-xs text-muted-foreground">銷量</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground py-4">暫無商品數據</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">訂單狀態分佈</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(orderStatusMap).map(([status, config]) => {
                        const count = stats?.orderStats[
                          ['pending', 'paid', 'shipped', 'completed', 'cancelled'][parseInt(status)] as keyof typeof stats.orderStats
                        ] || 0;
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <Badge className={config.className}>{config.label}</Badge>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">用戶類型分佈</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">管理員</span>
                        <span className="font-medium">{stats?.userStats.admins || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">商戶</span>
                        <span className="font-medium">{stats?.userStats.merchants || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">普通用戶</span>
                        <span className="font-medium">{stats?.userStats.normal || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">證書狀態</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-success/10 text-success">有效</Badge>
                        <span className="font-medium">{stats?.certificateStats.valid || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-warning/10 text-warning">過期</Badge>
                        <span className="font-medium">{stats?.certificateStats.expired || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-destructive/10 text-destructive">撤銷</Badge>
                        <span className="font-medium">{stats?.certificateStats.revoked || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>訂單列表</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">訂單號</th>
                          <th className="text-left py-3 px-4 font-medium">金額</th>
                          <th className="text-left py-3 px-4 font-medium">支付狀態</th>
                          <th className="text-left py-3 px-4 font-medium">訂單狀態</th>
                          <th className="text-left py-3 px-4 font-medium">日期</th>
                          <th className="text-left py-3 px-4 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                          stats.recentOrders.map((order) => (
                            <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-3 px-4 text-sm">{order.order_no}</td>
                              <td className="py-3 px-4 text-sm">{formatAmount(order.total_amount)}</td>
                              <td className="py-3 px-4">
                                <span className={`text-sm ${payStatusMap[order.pay_status]?.className || ''}`}>
                                  {payStatusMap[order.pay_status]?.label || '未知'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <Badge className={`text-xs ${orderStatusMap[order.order_status]?.className || ''}`}>
                                  {orderStatusMap[order.order_status]?.label || '未知'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                              <td className="py-3 px-4">
                                <Button variant="ghost" size="sm">詳情</Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-muted-foreground">
                              暫無訂單數據
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>商品列表</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    添加商品
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">商品</th>
                          <th className="text-left py-3 px-4 font-medium">銷量</th>
                          <th className="text-left py-3 px-4 font-medium">庫存</th>
                          <th className="text-left py-3 px-4 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats?.hotGoods && stats.hotGoods.length > 0 ? (
                          stats.hotGoods.map((product) => (
                            <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                              <td className="py-3 px-4 text-sm">{product.name || `商品 #${product.id}`}</td>
                              <td className="py-3 px-4 text-sm">{product.sales}</td>
                              <td className="py-3 px-4">
                                <span className={`text-sm ${product.stock < 10 ? 'text-destructive' : ''}`}>
                                  {product.stock}
                                  {product.stock < 10 && ' (低庫存)'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">編輯</Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                              暫無商品數據
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
