/**
 * @fileoverview 管理后台统计API - Mock DB 兼容实现
 */

import { NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET() {
  try {
    // 订单统计 - 使用简单查询后 JS 计算
    const orders = await query('SELECT * FROM orders') as any[];
    const orderStats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      paid: orders.filter(o => o.status === 'paid').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      total_revenue: orders
        .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum: number, o: any) => sum + (Number(o.pay_amount) || 0), 0),
    };

    // 商品统计
    const goods = await query('SELECT * FROM goods WHERE status = 1') as any[];
    const goodsStats = {
      total: goods.length,
      low_stock: goods.filter(g => Number(g.stock) < 10).length,
      total_sales: goods.reduce((sum: number, g: any) => sum + (Number(g.sales) || 0), 0),
    };

    // 用户统计
    const userTotal = await count('users');
    const merchantTotal = await count('merchants', 'status = 1');

    // 今日订单
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at).toISOString().split('T')[0];
      return orderDate === today && ['paid', 'shipped', 'delivered'].includes(o.status);
    });
    const todayStats = {
      total: todayOrders.length,
      revenue: todayOrders.reduce((sum: number, o: any) => sum + (Number(o.pay_amount) || 0), 0),
    };

    return NextResponse.json({
      data: {
        orders: orderStats,
        goods: goodsStats,
        users: { total: userTotal },
        merchants: { total: merchantTotal },
        today: todayStats,
      },
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return NextResponse.json({
      data: {
        orders: { total: 0, pending: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0, total_revenue: 0 },
        goods: { total: 0, low_stock: 0, total_sales: 0 },
        users: { total: 0 },
        merchants: { total: 0 },
        today: { total: 0, revenue: 0 },
      },
    });
  }
}
