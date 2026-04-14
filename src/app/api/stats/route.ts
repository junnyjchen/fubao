/**
 * 站点统计 API
 * GET /api/stats
 * 获取网站公开统计数据
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      return NextResponse.json({
        goods_count: 0,
        articles_count: 0,
        merchants_count: 0,
        users_count: 0,
        orders_count: 0,
        message: 'Database unavailable',
      });
    }

    // 并行获取各类统计数据
    const [
      goodsResult,
      articlesResult,
      merchantsResult,
      usersResult,
      ordersResult,
    ] = await Promise.all([
      supabase.from('goods').select('id', { count: 'exact' }).eq('status', 1),
      supabase.from('articles').select('id', { count: 'exact' }).eq('status', 1),
      supabase.from('merchants').select('id', { count: 'exact' }).eq('status', 1),
      supabase.from('users').select('id', { count: 'exact' }).eq('status', 1),
      supabase.from('orders').select('id', { count: 'exact' }),
    ]);

    return NextResponse.json({
      goods_count: (goodsResult as any)?.length || 0,
      articles_count: (articlesResult as any)?.length || 0,
      merchants_count: (merchantsResult as any)?.length || 0,
      users_count: (usersResult as any)?.length || 0,
      orders_count: (ordersResult as any)?.length || 0,
      updated_at: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 缓存5分钟
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({
      goods_count: 0,
      articles_count: 0,
      merchants_count: 0,
      users_count: 0,
      orders_count: 0,
      error: error.message,
    });
  }
}
