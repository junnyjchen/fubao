/**
 * @fileoverview 管理后台统计API - 匹配前端 DashboardStats 接口
 */

import { NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET() {
  try {
    // 订单统计
    const orders = await query('SELECT * FROM orders') as any[];
    const paidOrders = orders.filter(o => ['paid', 'shipped', 'delivered', 'completed'].includes(o.status));
    const orderStats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending' || o.status === 0).length,
      paid: orders.filter(o => o.status === 'paid' || o.status === 1).length,
      shipped: orders.filter(o => o.status === 'shipped' || o.status === 2).length,
      completed: orders.filter(o => o.status === 'completed' || o.status === 'delivered' || o.status === 3).length,
      cancelled: orders.filter(o => o.status === 'cancelled' || o.status === 4).length,
      totalRevenue: paidOrders.reduce((sum: number, o: any) => sum + (Number(o.pay_amount) || Number(o.total_amount) || 0), 0),
    };

    // 商品统计
    const goods = await query('SELECT * FROM goods WHERE status = 1') as any[];
    const goodsStats = {
      total: goods.length,
      lowStock: goods.filter(g => Number(g.stock) < 10).length,
      totalSales: goods.reduce((sum: number, g: any) => sum + (Number(g.sales) || 0), 0),
    };

    // 用户统计
    const userTotal = await count('users');
    const userStats = { total: userTotal };

    // 商户统计
    const merchants = await query('SELECT * FROM merchants') as any[];
    const merchantStats = {
      total: merchants.length,
      active: merchants.filter(m => Number(m.status) === 1 && Number(m.verified) === 1).length,
      pending: merchants.filter(m => Number(m.verified) === 0).length,
    };

    // 证书统计
    const certificates = await query('SELECT * FROM certificates') as any[];
    const now = new Date();
    const certificateStats = {
      total: certificates.length,
      valid: certificates.filter(c => !c.valid_until || new Date(c.valid_until) > now).length,
      expired: certificates.filter(c => c.valid_until && new Date(c.valid_until) <= now).length,
    };

    // 今日统计
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = paidOrders.filter(o => {
      const orderDate = new Date(o.created_at).toISOString().split('T')[0];
      return orderDate === today;
    });
    const todayStats = {
      orders: todayOrders.length,
      revenue: todayOrders.reduce((sum: number, o: any) => sum + (Number(o.pay_amount) || Number(o.total_amount) || 0), 0),
    };

    // 最近订单
    const recentOrders = orders
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((o: any) => ({
        id: o.id,
        order_no: o.order_no || `ORD${String(o.id).padStart(6, '0')}`,
        total_amount: String(o.pay_amount || o.total_amount || 0),
        pay_status: o.pay_status ?? (o.status === 'paid' ? 1 : 0),
        order_status: o.order_status ?? o.status ?? 0,
        created_at: o.created_at,
      }));

    // 热销商品
    const hotGoods = goods
      .sort((a: any, b: any) => (Number(b.sales) || 0) - (Number(a.sales) || 0))
      .slice(0, 5)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        sales: Number(g.sales) || 0,
        stock: Number(g.stock) || 0,
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
    return NextResponse.json({
      orderStats: { total: 0, pending: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0, totalRevenue: 0 },
      goodsStats: { total: 0, lowStock: 0, totalSales: 0 },
      userStats: { total: 0 },
      merchantStats: { total: 0, active: 0, pending: 0 },
      certificateStats: { total: 0, valid: 0, expired: 0 },
      todayStats: { orders: 0, revenue: 0 },
      recentOrders: [],
      hotGoods: [],
    });
  }
}
