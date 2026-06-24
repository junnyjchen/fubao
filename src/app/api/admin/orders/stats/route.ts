import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const orders = await query('SELECT status FROM orders') as any[];

    const stats = {
      total: orders.length,
      pending: orders.filter((o: any) => o.status === 'pending').length,
      paid: orders.filter((o: any) => o.status === 'paid').length,
      shipped: orders.filter((o: any) => o.status === 'shipped').length,
      completed: orders.filter((o: any) => o.status === 'completed' || o.status === 'delivered').length,
      cancelled: orders.filter((o: any) => o.status === 'cancelled').length,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('[admin/orders/stats] 获取统计失败:', error);
    return NextResponse.json({
      success: true,
      stats: { total: 0, pending: 0, paid: 0, shipped: 0, completed: 0, cancelled: 0 },
    });
  }
}
