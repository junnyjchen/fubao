/**
 * @fileoverview 管理后台统计API
 * @description 获取仪表盘统计数据
 * @module app/api/admin/stats/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    // 并行获取各类统计数据
    const [
      ordersResult,
      goodsResult,
      usersResult,
      merchantsResult,
      certificatesResult,
      todayOrdersResult,
    ] = await Promise.all([
      // 订单总数和金额
      client
        .from('orders')
        .select('id, total_amount, pay_status, order_status, created_at, order_no')
        .order('created_at', { ascending: false }),
      
      // 商品统计
      client
        .from('goods')
        .select('id, stock, sales, status, name')
        .eq('status', true),
      
      // 用户统计
      client
        .from('users')
        .select('id, created_at'),
      
      // 商户统计
      client
        .from('merchants')
        .select('id, status, total_sales'),
      
      // 证书统计
      client
        .from('certificates')
        .select('id, valid_until'),
      
      // 今日订单
      client
        .from('orders')
        .select('id, total_amount, pay_status')
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ]);

    // 计算订单统计
    const orders = ordersResult.data || [];
    const totalRevenue = orders
      .filter((o) => o.pay_status === 1)
      .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

    const orderStats = {
      total: orders.length,
      pending: orders.filter((o) => o.order_status === 0).length,
      paid: orders.filter((o) => o.pay_status === 1).length,
      shipped: orders.filter((o) => o.order_status === 2).length,
      completed: orders.filter((o) => o.order_status === 3).length,
      cancelled: orders.filter((o) => o.order_status === 4).length,
      totalRevenue,
    };

    // 计算商品统计
    const goods = goodsResult.data || [];
    const goodsStats = {
      total: goods.length,
      lowStock: goods.filter((g) => g.stock < 10).length,
      totalSales: goods.reduce((sum, g) => sum + (g.sales || 0), 0),
    };

    // 计算用户统计
    const users = usersResult.data || [];
    const userStats = {
      total: users.length,
    };

    // 计算商户统计
    const merchants = merchantsResult.data || [];
    const merchantStats = {
      total: merchants.length,
      active: merchants.filter((m) => m.status === true).length,
      pending: merchants.filter((m) => m.status === false).length,
    };

    // 计算证书统计
    const certificates = certificatesResult.data || [];
    const now = new Date();
    const certificateStats = {
      total: certificates.length,
      valid: certificates.filter((c) => c.valid_until && new Date(c.valid_until) > now).length,
      expired: certificates.filter((c) => c.valid_until && new Date(c.valid_until) <= now).length,
      revoked: 0, // 暂无撤銷状态字段
    };

    // 计算今日统计
    const todayOrders = todayOrdersResult.data || [];
    const todayStats = {
      orders: todayOrders.length,
      revenue: todayOrders
        .filter((o) => o.pay_status === 1)
        .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
    };

    // 获取最近订单
    const recentOrders = orders.slice(0, 10).map((o) => ({
      id: o.id,
      order_no: o.order_no || `FB${o.id.toString().padStart(8, '0')}`,
      total_amount: o.total_amount,
      pay_status: o.pay_status,
      order_status: o.order_status,
      created_at: o.created_at,
    }));

    // 获取热销商品
    const hotGoods = goods
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, 5)
      .map((g) => ({
        id: g.id,
        name: g.name,
        sales: g.sales,
        stock: g.stock,
      }));

    return NextResponse.json({
      orderStats,
      goodsStats,
      userStats,
      merchantStats,
      certificateStats,
      todayStats,
      recentOrders,
      hotGoods,
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
