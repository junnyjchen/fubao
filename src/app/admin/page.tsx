/**
 * @fileoverview 后台管理首页
 * @description 展示数据统计概览，实时数据刷新
 * @module app/admin/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  AlertCircle,
  Store,
  FileText,
  Wallet,
  RefreshCw,
  Activity,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Loader2,
  Sparkles,
  Settings,
} from 'lucide-react';
import { DashboardCharts } from '@/components/admin/DashboardCharts';

interface DashboardStats {
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadStats = useCallback(async (showRefreshLoader = false) => {
    if (showRefreshLoader) setRefreshing(true);
    
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;
    
    const timer = setInterval(() => {
      loadStats();
    }, 30000); // 30秒刷新一次
    
    return () => clearInterval(timer);
  }, [autoRefresh, loadStats]);

  // 订单状态映射
  const orderStatusMap: Record<number, { label: string; color: string; icon: React.ElementType }> = {
    0: { label: '待付款', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    1: { label: '待發貨', color: 'bg-blue-100 text-blue-700', icon: Package },
    2: { label: '已發貨', color: 'bg-purple-100 text-purple-700', icon: Truck },
    3: { label: '已完成', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    4: { label: '已取消', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  };

  const statCards = stats ? [
    {
      title: '商品總數',
      value: stats.goodsStats.total,
      description: `總銷量 ${stats.goodsStats.totalSales.toLocaleString()}`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/goods',
    },
    {
      title: '訂單總數',
      value: stats.orderStats.total,
      description: `${stats.orderStats.pending} 個待處理`,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/orders',
    },
    {
      title: '用戶總數',
      value: stats.userStats.total,
      description: '註冊用戶',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/users',
    },
    {
      title: '總營收',
      value: `HK$${stats.orderStats.totalRevenue.toLocaleString()}`,
      description: `今日 HK$${stats.todayStats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: stats.todayStats.revenue > 0 ? 1 : 0,
    },
    {
      title: '商戶數量',
      value: stats.merchantStats.total,
      description: `${stats.merchantStats.active} 家營業中`,
      icon: Store,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      href: '/admin/merchants',
    },
    {
      title: '證書數量',
      value: stats.certificateStats.total,
      description: `${stats.certificateStats.valid} 個有效`,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      href: '/admin/certificates',
    },
  ] : [];

  const quickActions = [
    { title: 'AI內容發佈', href: '/admin/ai-content', icon: Sparkles, color: 'bg-gradient-to-r from-purple-500 to-pink-500', isNew: true },
    { title: '添加商品', href: '/admin/goods/new', icon: Package, color: 'bg-blue-500' },
    { title: '訂單管理', href: '/admin/orders', icon: ShoppingCart, color: 'bg-green-500' },
    { title: '分類管理', href: '/admin/categories', icon: Package, color: 'bg-purple-500' },
    { title: '輪播圖', href: '/admin/banners', icon: Eye, color: 'bg-pink-500' },
    { title: '證書管理', href: '/admin/certificates', icon: AlertCircle, color: 'bg-amber-500' },
    { title: '分銷管理', href: '/admin/distribution', icon: TrendingUp, color: 'bg-indigo-500' },
    { title: '提現審核', href: '/admin/withdrawals', icon: Wallet, color: 'bg-teal-500' },
    { title: '百科管理', href: '/admin/wiki', icon: FileText, color: 'bg-cyan-500' },
    { title: '新聞管理', href: '/admin/news', icon: FileText, color: 'bg-lime-500' },
    { title: '商戶管理', href: '/admin/merchants', icon: Store, color: 'bg-rose-500' },
    { title: '財務對賬', href: '/admin/finance', icon: DollarSign, color: 'bg-emerald-500' },
    { title: '第三方登錄', href: '/admin/oauth-config', icon: Settings, color: 'bg-slate-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">加載中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">後台管理</h1>
              <p className="text-sm text-muted-foreground">
                符寶網管理系統 · 最後更新: {lastUpdate.toLocaleTimeString('zh-TW')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-100 text-green-700 border-green-300' : ''}
              >
                <Activity className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                {autoRefresh ? '自動刷新中' : '自動刷新'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadStats(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
              <Button variant="default" asChild>
                <Link href="/">返回前台</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 今日概览 */}
        <Card className="mb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">今日數據</p>
                <div className="flex items-baseline gap-6">
                  <div>
                    <span className="text-3xl font-bold text-primary">{stats?.todayStats.orders || 0}</span>
                    <span className="text-sm text-muted-foreground ml-2">訂單</span>
                  </div>
                  <div>
                    <span className="text-3xl font-bold text-primary">HK${stats?.todayStats.revenue.toLocaleString() || 0}</span>
                    <span className="text-sm text-muted-foreground ml-2">營收</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-sm py-1.5">
                    <Clock className="w-3 h-3 mr-1" />
                    待付款: {stats?.orderStats.pending || 0}
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1.5">
                    <Package className="w-3 h-3 mr-1" />
                    待發貨: {stats?.orderStats.shipped || 0}
                  </Badge>
                  <Badge variant="secondary" className="text-sm py-1.5">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    低庫存: {stats?.goodsStats.lowStock || 0}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className={stat.href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}>
                {stat.href ? (
                  <Link href={stat.href}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{stat.title}</p>
                        <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                      <div className={`w-8 h-8 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend !== undefined && (
                        <>
                          {stat.trend > 0 ? (
                            <TrendingUp className="w-3 h-3 text-green-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* 快捷操作 */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <div className="relative flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                      {'isNew' in action && action.isNew && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full animate-pulse">
                          NEW
                        </span>
                      )}
                      <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium">{action.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 待处理事项 & 热销商品 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 最近订单 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                最近訂單
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.slice(0, 5).map((order) => {
                    const status = orderStatusMap[order.order_status] || orderStatusMap[0];
                    const StatusIcon = status.icon;
                    return (
                      <Link key={order.id} href={`/admin/orders?id=${order.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{order.order_no}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('zh-TW')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">HK${order.total_amount}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暫無訂單數據
                </div>
              )}
            </CardContent>
          </Card>

          {/* 热销商品 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                熱銷商品
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/goods">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats?.hotGoods && stats.hotGoods.length > 0 ? (
                <div className="space-y-3">
                  {stats.hotGoods.map((goods, index) => (
                    <Link key={goods.id} href={`/admin/goods/${goods.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{goods.name}</p>
                            <p className="text-xs text-muted-foreground">
                              庫存: {goods.stock}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{goods.sales}</p>
                          <p className="text-xs text-muted-foreground">銷量</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  暫無商品數據
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 数据图表 */}
        <DashboardCharts />
      </main>
    </div>
  );
}
