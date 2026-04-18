/**
 * @fileoverview 管理后台订单统计API
 * @description 获取订单统计数据
 * @module app/api/admin/orders/stats/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 获取各状态订单数量
    const { data: statusCounts, error } = await client
      .from('orders')
      .select('status');

    if (error) {
      console.error('查询订单统计失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // 统计各状态数量
    const stats = {
      total: statusCounts?.length || 0,
      pending: 0,
      paid: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    };

    statusCounts?.forEach(order => {
      if (order.status in stats) {
        stats[order.status as keyof typeof stats]++;
      }
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('获取订单统计失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
