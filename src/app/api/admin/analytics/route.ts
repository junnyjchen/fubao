/**
 * @fileoverview 数据分析API
 * @description 获取销售趋势、用户分析等统计数据
 * @module app/api/admin/analytics/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取最近N天的日期数组
 */
function getLastNDays(n: number): string[] {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * 获取最近N个月
 */
function getLastNMonths(n: number): string[] {
  const months: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const range = parseInt(searchParams.get('range') || '7');

    switch (type) {
      case 'sales-trend':
        return await getSalesTrend(client, range);
      case 'user-growth':
        return await getUserGrowth(client, range);
      case 'category-sales':
        return await getCategorySales(client);
      case 'merchant-stats':
        return await getMerchantStats(client);
      case 'overview':
      default:
        return await getOverview(client, range);
    }
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 获取销售趋势
 */
async function getSalesTrend(client: ReturnType<typeof getSupabaseClient>, days: number) {
  const dates = getLastNDays(days);
  const startDate = dates[0] + 'T00:00:00Z';
  
  const { data: orders, error } = await client
    .from('orders')
    .select('pay_amount, pay_status, created_at')
    .gte('created_at', startDate)
    .eq('pay_status', 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 按日期分组统计
  const salesByDate: Record<string, { sales: number; orders: number }> = {};
  dates.forEach(date => {
    salesByDate[date] = { sales: 0, orders: 0 };
  });

  orders?.forEach(order => {
    const date = order.created_at?.split('T')[0];
    if (date && salesByDate[date]) {
      salesByDate[date].sales += parseFloat(order.pay_amount) || 0;
      salesByDate[date].orders += 1;
    }
  });

  const trend = dates.map(date => ({
    date: date.slice(5), // MM-DD格式
    fullDate: date,
    sales: salesByDate[date].sales,
    orders: salesByDate[date].orders,
  }));

  return NextResponse.json({ data: trend });
}

/**
 * 获取用户增长趋势
 */
async function getUserGrowth(client: ReturnType<typeof getSupabaseClient>, days: number) {
  const dates = getLastNDays(days);
  const startDate = dates[0] + 'T00:00:00Z';

  const { data: users, error } = await client
    .from('users')
    .select('created_at')
    .gte('created_at', startDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 按日期统计新用户
  const usersByDate: Record<string, number> = {};
  dates.forEach(date => {
    usersByDate[date] = 0;
  });

  users?.forEach(user => {
    const date = user.created_at?.split('T')[0];
    if (date && usersByDate[date] !== undefined) {
      usersByDate[date] += 1;
    }
  });

  // 累计用户数
  const { count: totalUsers } = await client
    .from('users')
    .select('*', { count: 'exact', head: true });

  const trend = dates.map(date => ({
    date: date.slice(5),
    fullDate: date,
    newUsers: usersByDate[date],
  }));

  return NextResponse.json({ 
    data: trend,
    totalUsers: totalUsers || 0,
  });
}

/**
 * 获取分类销售统计
 */
async function getCategorySales(client: ReturnType<typeof getSupabaseClient>) {
  // 获取所有分类
  const { data: categories } = await client
    .from('categories')
    .select('id, name')
    .eq('status', true);

  // 获取商品销售数据
  const { data: goods } = await client
    .from('goods')
    .select('category_id, sales');

  const categorySales: Record<number, number> = {};
  goods?.forEach(g => {
    if (g.category_id) {
      categorySales[g.category_id] = (categorySales[g.category_id] || 0) + (g.sales || 0);
    }
  });

  const data = categories?.map(cat => ({
    name: cat.name,
    sales: categorySales[cat.id] || 0,
  })).sort((a, b) => b.sales - a.sales).slice(0, 10) || [];

  return NextResponse.json({ data });
}

/**
 * 获取商户统计
 */
async function getMerchantStats(client: ReturnType<typeof getSupabaseClient>) {
  const { data: merchants, error } = await client
    .from('merchants')
    .select('id, name, total_sales, rating, status');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const data = merchants?.map(m => ({
    name: m.name,
    sales: m.total_sales || 0,
    rating: m.rating || 0,
  })).sort((a, b) => b.sales - a.sales).slice(0, 10) || [];

  return NextResponse.json({ data });
}

/**
 * 获取概览数据
 */
async function getOverview(client: ReturnType<typeof getSupabaseClient>, days: number) {
  const dates = getLastNDays(days);
  const startDate = dates[0] + 'T00:00:00Z';

  // 并行获取各类数据
  const [
    ordersResult,
    usersResult,
    goodsResult,
    merchantsResult,
  ] = await Promise.all([
    client.from('orders').select('pay_amount, pay_status, created_at').gte('created_at', startDate),
    client.from('users').select('created_at').gte('created_at', startDate),
    client.from('goods').select('sales, stock'),
    client.from('merchants').select('total_sales'),
  ]);

  // 计算销售额
  const orders = ordersResult.data || [];
  const totalSales = orders
    .filter(o => o.pay_status === 1)
    .reduce((sum, o) => sum + (parseFloat(o.pay_amount) || 0), 0);

  // 新用户数
  const newUsers = usersResult.data?.length || 0;

  // 商品销售量
  const goods = goodsResult.data || [];
  const totalGoodsSales = goods.reduce((sum, g) => sum + (g.sales || 0), 0);
  const lowStockGoods = goods.filter(g => (g.stock || 0) < 10).length;

  // 商户总销售
  const merchants = merchantsResult.data || [];
  const merchantTotalSales = merchants.reduce((sum, m) => sum + (m.total_sales || 0), 0);

  return NextResponse.json({
    period: { start: dates[0], end: dates[dates.length - 1] },
    sales: {
      total: totalSales,
      orders: orders.filter(o => o.pay_status === 1).length,
    },
    users: {
      newUsers,
    },
    goods: {
      totalSales: totalGoodsSales,
      lowStock: lowStockGoods,
    },
    merchants: {
      totalSales: merchantTotalSales,
    },
  });
}
