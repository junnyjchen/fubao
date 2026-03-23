/**
 * @fileoverview 后台管理控制台页面
 * @description 提供数据概览、快捷操作入口
 * @module app/admin/page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Eye,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

/** 统计数据类型 */
interface Stat {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down';
}

/** 订单数据类型 */
interface RecentOrder {
  id: string;
  orderNo: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

/** 商品数据类型 */
interface TopProduct {
  id: number;
  name: string;
  price: number;
  stock: number;
  sales: number;
  status: string;
}

/** 订单状态映射 */
const statusColors: Record<string, string> = {
  '待付款': 'bg-yellow-100 text-yellow-800',
  '待發貨': 'bg-blue-100 text-blue-800',
  '已發貨': 'bg-purple-100 text-purple-800',
  '已完成': 'bg-green-100 text-green-800',
};

/**
 * 后台管理控制台页面组件
 * @returns 控制台页面
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载统计数据
    loadDashboardData();
  }, []);

  /**
   * 加载控制台数据
   */
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 并行请求商品和订单数据
      const [goodsRes, ordersRes] = await Promise.all([
        fetch('/api/goods?limit=100'),
        fetch('/api/orders?limit=10'),
      ]);

      const goodsResult = await goodsRes.json();
      const ordersResult = await ordersRes.json();

      // 计算统计数据
      const goods = goodsResult.data || [];
      const orders = ordersResult.data || [];
      
      const totalSales = orders.reduce(
        (sum: number, o: { pay_amount: string | number }) => sum + parseFloat(String(o.pay_amount || 0)),
        0
      );

      setStats([
        { 
          title: '今日訂單', 
          value: String(orders.length), 
          change: '+8%', 
          icon: ShoppingCart,
          trend: 'up' 
        },
        { 
          title: '今日銷售額', 
          value: `HK$${totalSales.toFixed(0)}`, 
          change: '+12%', 
          icon: DollarSign,
          trend: 'up' 
        },
        { 
          title: '商品總數', 
          value: String(goods.length), 
          change: '+2', 
          icon: Package,
          trend: 'up' 
        },
        { 
          title: '本月訪客', 
          value: '1,234', 
          change: '+15%', 
          icon: Eye,
          trend: 'up' 
        },
      ]);

      // 设置最近订单
      setRecentOrders(
        orders.slice(0, 5).map((o: { 
          id: number; 
          order_no: string; 
          shipping_name: string; 
          pay_amount: string; 
          order_status: number; 
          created_at: string;
        }) => ({
          id: String(o.id),
          orderNo: o.order_no,
          customer: (o.shipping_name || '未命名').charAt(0) + '**',
          amount: 'HK$' + o.pay_amount,
          status: ['待付款', '待發貨', '已發貨', '已完成'][o.order_status] || '待付款',
          date: (o.created_at || '').split('T')[0],
        }))
      );

      // 设置热销商品
      setTopProducts(
        goods
          .sort((a: { sales: number }, b: { sales: number }) => b.sales - a.sales)
          .slice(0, 5)
          .map((g: { id: number; name: string; price: string; stock: number; sales: number; status: boolean }) => ({
            id: g.id,
            name: g.name,
            price: parseFloat(g.price),
            stock: g.stock,
            sales: g.sales,
            status: g.status ? '上架' : '下架',
          }))
      );
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout
      title="控制台"
      description="歡迎回來，管理員"
      actions={
        <Button asChild>
          <Link href="/">查看網站</Link>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        {stat.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : null}
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 数据展示 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 最近订单 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">最近訂單</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link href="/admin/orders">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">載入中...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暫無訂單</div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-medium text-sm">{order.orderNo}</p>
                        <p className="text-xs text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{order.amount}</p>
                        <Badge className={`text-xs ${statusColors[order.status] || ''}`}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 热销商品 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">熱銷商品</CardTitle>
              <Button variant="link" size="sm" asChild>
                <Link href="/admin/products">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">載入中...</div>
              ) : topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">暫無商品</div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 py-2 border-b last:border-0"
                    >
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">HK${product.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{product.sales}</p>
                        <p className="text-xs text-muted-foreground">銷量</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
