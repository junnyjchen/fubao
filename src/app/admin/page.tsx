/**
 * @fileoverview 后台管理首页
 * @description 展示数据统计概览
 * @module app/admin/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

interface DashboardStats {
  goods: {
    total: number;
    active: number;
    lowStock: number;
  };
  orders: {
    total: number;
    pending: number;
    todayCount: number;
    todayAmount: number;
  };
  users: {
    total: number;
    todayCount: number;
  };
  revenue: {
    total: number;
    month: number;
    trend: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    goods: { total: 0, active: 0, lowStock: 0 },
    orders: { total: 0, pending: 0, todayCount: 0, todayAmount: 0 },
    users: { total: 0, todayCount: 0 },
    revenue: { total: 0, month: 0, trend: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // 并行获取统计数据
      const [goodsRes, ordersRes, usersRes] = await Promise.all([
        fetch('/api/goods?limit=1'),
        fetch('/api/orders?limit=1'),
        fetch('/api/auth/me'),
      ]);

      const [goodsData, ordersData] = await Promise.all([
        goodsRes.json(),
        ordersRes.json(),
      ]);

      setStats({
        goods: {
          total: goodsData.total || 0,
          active: goodsData.total || 0,
          lowStock: 0,
        },
        orders: {
          total: ordersData.total || 0,
          pending: ordersData.data?.filter((o: { order_status: number }) => o.order_status === 0).length || 0,
          todayCount: 0,
          todayAmount: 0,
        },
        users: { total: 1, todayCount: 0 },
        revenue: { total: 0, month: 0, trend: 0 },
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '商品總數',
      value: stats.goods.total,
      description: `${stats.goods.active} 個上架中`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/goods',
    },
    {
      title: '訂單總數',
      value: stats.orders.total,
      description: `${stats.orders.pending} 個待處理`,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/orders',
    },
    {
      title: '用戶總數',
      value: stats.users.total,
      description: `今日新增 ${stats.users.todayCount}`,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/users',
    },
    {
      title: '本月營收',
      value: `HK$${stats.revenue.month.toLocaleString()}`,
      description: stats.revenue.trend >= 0 ? '增長中' : '下降中',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: stats.revenue.trend,
    },
  ];

  const quickActions = [
    { title: '添加商品', href: '/admin/goods/new', icon: Package },
    { title: '訂單管理', href: '/admin/orders', icon: ShoppingCart },
    { title: '分類管理', href: '/admin/categories', icon: Package },
    { title: '輪播圖管理', href: '/admin/banners', icon: Package },
    { title: '系統設置', href: '/admin/settings', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">後台管理</h1>
              <p className="text-sm text-muted-foreground">符寶網管理系統</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/">返回前台</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className={stat.href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}>
                {stat.href ? (
                  <Link href={stat.href}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.title}</p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                ) : (
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {stat.trend !== undefined && (
                            <>
                              {stat.trend >= 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-600" />
                              )}
                              <span className={`text-xs ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.abs(stat.trend)}%
                              </span>
                            </>
                          )}
                          <span className="text-xs text-muted-foreground">{stat.description}</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* 快捷操作 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href}>
                    <Button variant="outline" className="w-full h-auto py-4">
                      <div className="flex flex-col items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span>{action.title}</span>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 待处理事项 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                待處理事項
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.orders.pending > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span>待付款訂單</span>
                    </div>
                    <span className="font-semibold text-yellow-600">{stats.orders.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span>待發貨訂單</span>
                    </div>
                    <span className="font-semibold text-blue-600">0</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  暫無待處理事項
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">庫存預警</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/goods?filter=low_stock">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stats.goods.lowStock > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span>庫存不足商品</span>
                    <span className="font-semibold text-red-600">{stats.goods.lowStock}</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  庫存充足
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
