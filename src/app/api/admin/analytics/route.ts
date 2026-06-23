/**
 * @fileoverview 管理后台分析数据 API
 */

import { NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

/** 获取仪表盘统计数据 */
export async function GET() {
  try {
    const [
      goodsCount,
      orderCount,
      userCount,
      merchantCount,
    ] = await Promise.all([
      count('goods', 'status = 1').catch(() => 0),
      count('orders').catch(() => 0),
      count('users', 'status = 1').catch(() => 0),
      count('merchants', 'status = 1').catch(() => 0),
    ]);

    // 尝试获取近期订单金额
    let totalRevenue = 0;
    let recentOrders: any[] = [];
    try {
      const revenueResult = await query(
        'SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != ?',
        ['cancelled']
      );
      totalRevenue = Array.isArray(revenueResult) && revenueResult[0]
        ? Number(revenueResult[0].total) || 0
        : 0;

      recentOrders = await query(
        'SELECT * FROM orders ORDER BY created_at DESC LIMIT 10'
      );
    } catch {
      // 表不存在时使用默认值
    }

    // 尝试获取商品分类统计
    let categoryStats: any[] = [];
    try {
      categoryStats = await query(
        'SELECT c.name, COUNT(g.id) as count FROM categories c LEFT JOIN goods g ON c.id = g.category_id GROUP BY c.id ORDER BY count DESC LIMIT 10'
      );
    } catch {
      // 忽略
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalGoods: Number(goodsCount) || 0,
          totalOrders: Number(orderCount) || 0,
          totalUsers: Number(userCount) || 0,
          totalMerchants: Number(merchantCount) || 0,
          totalRevenue,
        },
        recentOrders: Array.isArray(recentOrders) ? recentOrders : [],
        categoryStats: Array.isArray(categoryStats) ? categoryStats : [],
      },
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json({
      success: true,
      data: {
        overview: { totalGoods: 0, totalOrders: 0, totalUsers: 0, totalMerchants: 0, totalRevenue: 0 },
        recentOrders: [],
        categoryStats: [],
      },
    });
  }
}
