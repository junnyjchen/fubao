'use client';

import { useState } from 'react';
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
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Eye,
} from 'lucide-react';

// 模拟统计数据
const stats = [
  { title: '今日訂單', value: '12', change: '+8%', icon: ShoppingCart },
  { title: '今日銷售額', value: 'HK$8,640', change: '+12%', icon: DollarSign },
  { title: '商品總數', value: '8', change: '+2', icon: Package },
  { title: '本月訪客', value: '1,234', change: '+15%', icon: Eye },
];

// 模拟订单数据
const recentOrders = [
  { id: 'FB20240001', customer: '張**', amount: 'HK$456', status: '待付款', date: '2024-01-15' },
  { id: 'FB20240002', customer: '李**', amount: 'HK$888', status: '待發貨', date: '2024-01-15' },
  { id: 'FB20240003', customer: '王**', amount: 'HK$288', status: '已發貨', date: '2024-01-14' },
  { id: 'FB20240004', customer: '陳**', amount: 'HK$1,288', status: '已完成', date: '2024-01-14' },
];

// 模拟商品数据
const products = [
  { id: 1, name: '武當鎮宅符', price: 288, stock: 100, sales: 1250, status: '上架' },
  { id: 2, name: '武當招財符', price: 388, stock: 80, sales: 890, status: '上架' },
  { id: 3, name: '天師平安符', price: 168, stock: 200, sales: 2560, status: '上架' },
  { id: 4, name: '開光銅錢劍', price: 1288, stock: 20, sales: 560, status: '上架' },
];

const statusColors: Record<string, string> = {
  '待付款': 'bg-yellow-100 text-yellow-800',
  '待發貨': 'bg-blue-100 text-blue-800',
  '已發貨': 'bg-purple-100 text-purple-800',
  '已完成': 'bg-green-100 text-green-800',
};

export function AdminDashboard() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');

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
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-success mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stat.change}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
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
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium text-sm">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.customer}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{order.amount}</p>
                            <Badge className={`text-xs ${statusColors[order.status]}`}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">熱銷商品</CardTitle>
                    <Button variant="link" size="sm" asChild>
                      <Link href="/admin/products">查看全部</Link>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.slice(0, 4).map((product, index) => (
                        <div key={product.id} className="flex items-center gap-4 py-2 border-b last:border-0">
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
                          <th className="text-left py-3 px-4 font-medium">客戶</th>
                          <th className="text-left py-3 px-4 font-medium">金額</th>
                          <th className="text-left py-3 px-4 font-medium">狀態</th>
                          <th className="text-left py-3 px-4 font-medium">日期</th>
                          <th className="text-left py-3 px-4 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.map((order) => (
                          <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm">{order.id}</td>
                            <td className="py-3 px-4 text-sm">{order.customer}</td>
                            <td className="py-3 px-4 text-sm">{order.amount}</td>
                            <td className="py-3 px-4">
                              <Badge className={`text-xs ${statusColors[order.status]}`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">詳情</Button>
                            </td>
                          </tr>
                        ))}
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
                          <th className="text-left py-3 px-4 font-medium">商品名稱</th>
                          <th className="text-left py-3 px-4 font-medium">價格</th>
                          <th className="text-left py-3 px-4 font-medium">庫存</th>
                          <th className="text-left py-3 px-4 font-medium">銷量</th>
                          <th className="text-left py-3 px-4 font-medium">狀態</th>
                          <th className="text-left py-3 px-4 font-medium">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-3 px-4 text-sm">{product.name}</td>
                            <td className="py-3 px-4 text-sm">HK${product.price}</td>
                            <td className="py-3 px-4 text-sm">{product.stock}</td>
                            <td className="py-3 px-4 text-sm">{product.sales}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {product.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">編輯</Button>
                                <Button variant="ghost" size="sm">下架</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
