/**
 * @fileoverview 商户数据统计页面
 * @description 商户运营数据可视化分析
 * @module app/merchant/dashboard/statistics/page
 */

'use client';

import { useState, useEffect } from 'react';
import { MerchantLayout } from '@/components/merchant/MerchantLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Users,
  Package,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Loader2,
} from 'lucide-react';

interface StatisticsData {
  overview: {
    totalOrders: number;
    totalRevenue: number;
    totalVisitors: number;
    totalCustomers: number;
    orderGrowth: number;
    revenueGrowth: number;
    visitorGrowth: number;
    customerGrowth: number;
  };
  salesTrend: Array<{ date: string; orders: number; revenue: number }>;
  topProducts: Array<{ id: number; name: string; sales: number; revenue: number }>;
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  customerSource: Array<{ source: string; count: number; percentage: number }>;
}

export default function MerchantStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [data, setData] = useState<StatisticsData | null>(null);

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setData({
        overview: {
          totalOrders: 156,
          totalRevenue: 45800,
          totalVisitors: 3520,
          totalCustomers: 128,
          orderGrowth: 12.5,
          revenueGrowth: 18.2,
          visitorGrowth: 8.3,
          customerGrowth: 15.0,
        },
        salesTrend: [
          { date: '03/18', orders: 18, revenue: 5200 },
          { date: '03/19', orders: 22, revenue: 6800 },
          { date: '03/20', orders: 15, revenue: 4500 },
          { date: '03/21', orders: 28, revenue: 8200 },
          { date: '03/22', orders: 32, revenue: 9500 },
          { date: '03/23', orders: 25, revenue: 7200 },
          { date: '03/24', orders: 16, revenue: 4400 },
        ],
        topProducts: [
          { id: 1, name: '開光平安符', sales: 86, revenue: 24768 },
          { id: 2, name: '桃木劍', sales: 42, revenue: 28560 },
          { id: 3, name: '八卦鏡', sales: 38, revenue: 6384 },
          { id: 4, name: '太極圖掛飾', sales: 28, revenue: 2800 },
          { id: 5, name: '道家符咒冊', sales: 22, revenue: 3080 },
        ],
        categoryDistribution: [
          { category: '符箓類', count: 120, percentage: 45 },
          { category: '法器類', count: 85, percentage: 32 },
          { category: '書籍類', count: 35, percentage: 13 },
          { category: '其他', count: 26, percentage: 10 },
        ],
        customerSource: [
          { source: '搜索', count: 52, percentage: 40 },
          { source: '推薦', count: 35, percentage: 27 },
          { source: '直接訪問', count: 28, percentage: 22 },
          { source: '廣告', count: 13, percentage: 11 },
        ],
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const overviewCards = data ? [
    {
      title: '訂單數',
      value: data.overview.totalOrders,
      growth: data.overview.orderGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '營業額',
      value: `HK$${data.overview.totalRevenue.toLocaleString()}`,
      growth: data.overview.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '訪客數',
      value: data.overview.totalVisitors,
      growth: data.overview.visitorGrowth,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: '新客戶',
      value: data.overview.totalCustomers,
      growth: data.overview.customerGrowth,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ] : [];

  if (loading || !data) {
    return (
      <MerchantLayout title="數據統計" description="店鋪運營數據分析">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MerchantLayout>
    );
  }

  return (
    <MerchantLayout title="數據統計" description="店鋪運營數據分析">
      {/* 时间筛选 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近90天</SelectItem>
              <SelectItem value="1y">近1年</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          導出報表
        </Button>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.growth >= 0;
          return (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{card.title}</span>
                  <div className={`w-8 h-8 rounded-full ${card.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold">{card.value}</p>
                  <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{Math.abs(card.growth)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* 销售趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              銷售趨勢
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.salesTrend.map((item) => (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/20 rounded-t-sm transition-all hover:bg-primary/40"
                    style={{ height: `${(item.revenue / 10000) * 200}px` }}
                    title={`營業額: HK$${item.revenue}`}
                  />
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span>營業額</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 热销商品 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5" />
              熱銷商品 TOP 5
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">銷量 {product.sales}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">HK${product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 分类分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              商品分類分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categoryDistribution.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{item.category}</span>
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 客户来源 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5" />
              客戶來源分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.customerSource.map((item) => (
                <div key={item.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{item.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{item.count} 人</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 转化漏斗 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">轉化漏斗</CardTitle>
          <CardDescription>用戶從瀏覽到下單的轉化情況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              { label: '瀏覽', value: 3520, color: 'bg-blue-500' },
              { label: '詳情頁', value: 856, color: 'bg-purple-500' },
              { label: '加購', value: 328, color: 'bg-yellow-500' },
              { label: '下單', value: 156, color: 'bg-green-500' },
              { label: '支付', value: 142, color: 'bg-primary' },
            ].map((item, index) => (
              <div key={item.label} className="flex items-center">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-lg mb-2`}>
                    {item.value}
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {index > 0 && (
                    <p className="text-xs text-muted-foreground">
                      轉化率 {((item.value / [
                        3520, 856, 328, 156, 142
                      ][index - 1]) * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                {index < 4 && (
                  <div className="hidden md:block w-12 h-0.5 bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MerchantLayout>
  );
}
