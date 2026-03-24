/**
 * @fileoverview 商户统计数据 API
 * @description 获取商户运营统计数据
 * @module app/api/merchant/statistics/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取商户统计数据
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 获取 token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 验证 token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const userId = payload.userId;

    // 获取用户的商户ID
    const { data: user } = await client
      .from('users')
      .select('merchant_id')
      .eq('id', userId)
      .single();

    if (!user?.merchant_id) {
      return NextResponse.json({ error: '您還未開通店鋪' }, { status: 400 });
    }

    const merchantId = user.merchant_id;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d'; // 7d, 30d, 90d, 1y

    // 计算日期范围
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startISO = startDate.toISOString();

    // 获取统计数据
    const [
      goodsResult,
      ordersResult,
      todayOrdersResult,
      pendingOrdersResult,
      revenueResult,
    ] = await Promise.all([
      // 商品统计
      client
        .from('goods')
        .select('id, status, stock', { count: 'exact' })
        .eq('merchant_id', merchantId),
      // 期间订单统计
      client
        .from('orders')
        .select('id, final_amount, created_at')
        .eq('merchant_id', merchantId)
        .gte('created_at', startISO),
      // 今日订单
      client
        .from('orders')
        .select('id, final_amount', { count: 'exact' })
        .eq('merchant_id', merchantId)
        .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString()),
      // 待处理订单
      client
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchantId)
        .in('order_status', [0, 1]), // 待付款、待发货
      // 总营收
      client
        .from('orders')
        .select('final_amount')
        .eq('merchant_id', merchantId)
        .eq('payment_status', 1),
    ]);

    // 计算概览数据
    const overview = {
      totalGoods: goodsResult.data?.length || 0,
      activeGoods: goodsResult.data?.filter(g => g.status === 1).length || 0,
      lowStockGoods: goodsResult.data?.filter(g => g.stock < 10).length || 0,
      periodOrders: ordersResult.count || 0,
      periodRevenue: ordersResult.data?.reduce((sum, o) => sum + (o.final_amount || 0), 0) || 0,
      todayOrders: todayOrdersResult.count || 0,
      todayRevenue: todayOrdersResult.data?.reduce((sum, o) => sum + (o.final_amount || 0), 0) || 0,
      pendingOrders: pendingOrdersResult.count || 0,
      totalRevenue: revenueResult.data?.reduce((sum, o) => sum + (o.final_amount || 0), 0) || 0,
    };

    // 计算销售趋势（按天分组）
    const salesTrend: Array<{ date: string; orders: number; revenue: number }> = [];
    const orderData = ordersResult.data || [];
    const dateMap = new Map<string, { orders: number; revenue: number }>();

    orderData.forEach(order => {
      const date = order.created_at.split('T')[0];
      const existing = dateMap.get(date) || { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += order.final_amount || 0;
      dateMap.set(date, existing);
    });

    dateMap.forEach((value, date) => {
      salesTrend.push({
        date: date.slice(5), // MM-DD
        ...value,
      });
    });

    // 按日期排序
    salesTrend.sort((a, b) => a.date.localeCompare(b.date));

    // 获取热销商品 TOP 5
    const { data: topGoods } = await client
      .from('orders')
      .select('goods_id, goods_name, quantity, final_amount')
      .eq('merchant_id', merchantId)
      .gte('created_at', startISO);

    const productSales = new Map<string, { name: string; sales: number; revenue: number }>();
    topGoods?.forEach(order => {
      if (!order.goods_id) return;
      const existing = productSales.get(order.goods_id.toString()) || {
        name: order.goods_name || '',
        sales: 0,
        revenue: 0,
      };
      existing.sales += order.quantity || 0;
      existing.revenue += order.final_amount || 0;
      productSales.set(order.goods_id.toString(), existing);
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id: parseInt(id), ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      overview,
      salesTrend,
      topProducts,
      range,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ error: '獲取統計數據失敗' }, { status: 500 });
  }
}
