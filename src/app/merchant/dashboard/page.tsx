/**
 * @fileoverview 商户后台首页
 * @description 商户仪表盘，展示销售数据和统计
 * @module app/merchant/dashboard/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  Eye,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  today: {
    orders: number;
    amount: number;
    visitors: number;
  };
  pending: {
    orders: number;
    shipments: number;
  };
  goods: {
    total: number;
    active: number;
    lowStock: number;
  };
  finance: {
    monthRevenue: number;
    pendingSettlement: number;
    settled: number;
  };
}

interface RecentOrder {
  id: number;
  order_no: string;
  goods_name: string;
  amount: string;
  status: number;
  created_at: string;
}

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    today: { orders: 0, amount: 0, visitors: 0 },
    pending: { orders: 0, shipments: 0 },
    goods: { total: 0, active: 0, lowStock: 0 },
    finance: { monthRevenue: 0, pendingSettlement: 0, settled: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: 调用真实的API获取数据
      // 模拟数据
      setStats({
        today: { orders: 12, amount: 3560, visitors: 156 },
        pending: { orders: 5, shipments: 3 },
        goods: { total: 48, active: 42, lowStock: 3 },
        finance: { monthRevenue: 86500, pendingSettlement: 12500, settled: 74000 },
      });

      setRecentOrders([
        { id: 1, order_no: 'FB20260324001', goods_name: '開光平安符', amount: '288', status: 1, created_at: '2026-03-24T08:30:00' },
        { id: 2, order_no: 'FB20260324002', goods_name: '桃木劍', amount: '680', status: 0, created_at: '2026-03-24T09:15:00' },
        { id: 3, order_no: 'FB20260324003', goods_name: '八卦鏡', amount: '168', status: 2, created_at: '2026-03-24T10:00:00' },
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statusMap: Record<number, { label: string; className: string }> = {
      0: { label: '待付款', className: 'bg-yellow-100 text-yellow-800' },
      1: { label: '待發貨', className: 'bg-blue-100 text-blue-800' },
      2: { label: '已發貨', className: 'bg-purple-100 text-purple-800' },
      3: { label: '已完成', className: 'bg-green-100 text-green-800' },
      4: { label: '已取消', className: 'bg-gray-100 text-gray-800' },
    };
    const s = statusMap[status] || statusMap[0];
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const statCards = [
    {
      title: '今日訂單',
      value: stats.today.orders,
      description: `營業額 HK$${stats.today.amount.toLocaleString()}`,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '今日訪客',
      value: stats.today.visitors,
      description: '瀏覽量',
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '待處理訂單',
      value: stats.pending.orders,
      description: `待發貨 ${stats.pending.shipments}`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      href: '/merchant/dashboard/orders?status=pending',
    },
    {
      title: '本月營收',
      value: `HK$${stats.finance.monthRevenue.toLocaleString()}`,
      description: '較上月增長 12%',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 12,
    },
  ];

  return (
    <MerchantLayout title="儀表盤" description="店鋪運營數據概覽">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={stat.href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}>
              <Link href={stat.href || '#'}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {stat.trend !== undefined && (
                          <>
                            {stat.trend >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-600" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-600" />
                            )}
                            <span className={stat.trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {stat.trend}%
                            </span>
                          </>
                        )}
                        {stat.description}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 待处理事项 */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              待處理事項
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/merchant/dashboard/orders?status=unpaid" className="block">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span>待付款訂單</span>
                </div>
                <span className="font-semibold text-yellow-600">{stats.pending.orders}</span>
              </div>
            </Link>
            <Link href="/merchant/dashboard/orders?status=unshipped" className="block">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span>待發貨訂單</span>
                </div>
                <span className="font-semibold text-blue-600">{stats.pending.shipments}</span>
              </div>
            </Link>
            <Link href="/merchant/dashboard/goods?filter=low_stock" className="block">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>庫存預警</span>
                </div>
                <span className="font-semibold text-red-600">{stats.goods.lowStock}</span>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* 最近订单 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">最近訂單</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/merchant/dashboard/orders">
                查看全部
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暫無訂單
              </div>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/merchant/dashboard/orders/${order.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {order.order_no}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="font-medium truncate mt-1">{order.goods_name}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-semibold text-primary">HK${order.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString('zh-TW', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/merchant/dashboard/goods/new">
              <Button variant="outline" className="w-full h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>發布商品</span>
                </div>
              </Button>
            </Link>
            <Link href="/merchant/dashboard/orders">
              <Button variant="outline" className="w-full h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>處理訂單</span>
                </div>
              </Button>
            </Link>
            <Link href="/merchant/dashboard/finance">
              <Button variant="outline" className="w-full h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  <span>財務對賬</span>
                </div>
              </Button>
            </Link>
            <Link href="/merchant/dashboard/statistics">
              <Button variant="outline" className="w-full h-auto py-4">
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>數據分析</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 商品概览 */}
      <Card className="mt-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">商品概覽</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/merchant/dashboard/goods">
              管理商品
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{stats.goods.total}</p>
              <p className="text-sm text-muted-foreground">商品總數</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.goods.active}</p>
              <p className="text-sm text-muted-foreground">銷售中</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.goods.lowStock}</p>
              <p className="text-sm text-muted-foreground">庫存不足</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MerchantLayout>
  );
}
