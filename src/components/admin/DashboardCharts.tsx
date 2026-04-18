'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Loader2,
} from 'lucide-react';

// 颜色配置
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

interface SalesTrendItem {
  date: string;
  sales: number;
  orders: number;
}

interface UserGrowthItem {
  date: string;
  newUsers: number;
}

interface CategorySalesItem {
  name: string;
  sales: number;
}

// 格式化金额
const formatCurrency = (value: number) => `HK$${value.toFixed(0)}`;

// 格式化数字
const formatNumber = (value: number) => value.toLocaleString();

export function DashboardCharts() {
  const [salesTrend, setSalesTrend] = useState<SalesTrendItem[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthItem[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySalesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesRes, usersRes, categoryRes] = await Promise.all([
        fetch(`/api/admin/analytics?type=sales-trend&range=${dateRange}`),
        fetch(`/api/admin/analytics?type=user-growth&range=${dateRange}`),
        fetch('/api/admin/analytics?type=category-sales'),
      ]);

      const salesData = await salesRes.json();
      const usersData = await usersRes.json();
      const categoryData = await categoryRes.json();

      setSalesTrend(salesData.data || []);
      setUserGrowth(usersData.data || []);
      setCategorySales(categoryData.data || []);
    } catch (error) {
      console.error('获取图表数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">最近7天</SelectItem>
            <SelectItem value="14">最近14天</SelectItem>
            <SelectItem value="30">最近30天</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 销售趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            銷售趨勢
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList className="mb-4">
              <TabsTrigger value="line">折線圖</TabsTrigger>
              <TabsTrigger value="area">面積圖</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => 
                      name === 'sales' ? formatCurrency(value) : formatNumber(value)
                    }
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    name="銷售額"
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#82ca9d" 
                    name="訂單數"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="area">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name="銷售額"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 用户增长和分类销售 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 用户增长 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              用戶增長
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatNumber(value)} />
                <Bar dataKey="newUsers" fill="#82ca9d" name="新用戶" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 分类销售 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              分類銷售佔比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="sales"
                  nameKey="name"
                >
                  {categorySales.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatNumber(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
