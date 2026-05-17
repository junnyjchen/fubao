/**
 * @fileoverview 管理后台统计API - MySQL 实现
 * @module app/api/admin/stats/route
 */

import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export async function GET() {
  try {
    // 订单统计
    const orderStats = await queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN status IN ('paid','shipped','delivered') THEN pay_amount ELSE 0 END), 0) as total_revenue
      FROM orders
    `);

    // 商品统计
    const goodsStats = await queryOne(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN stock < 10 THEN 1 ELSE 0 END) as low_stock,
        COALESCE(SUM(sales), 0) as total_sales
      FROM goods WHERE status = 1
    `);

    // 用户统计
    const userStats = await queryOne('SELECT COUNT(*) as total FROM users');

    // 商户统计
    const merchantStats = await queryOne('SELECT COUNT(*) as total FROM merchants WHERE status = 1');

    // 今日订单
    const todayStats = await queryOne(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(pay_amount), 0) as revenue
      FROM orders 
      WHERE status IN ('paid','shipped','delivered') 
        AND DATE(created_at) = CURDATE()
    `);

    return NextResponse.json({
      data: {
        orders: orderStats || { total: 0, pending: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0, total_revenue: 0 },
        goods: goodsStats || { total: 0, low_stock: 0, total_sales: 0 },
        users: userStats || { total: 0 },
        merchants: merchantStats || { total: 0 },
        today: todayStats || { total: 0, revenue: 0 },
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
