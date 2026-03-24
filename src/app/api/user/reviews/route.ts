/**
 * @fileoverview 用户评价API
 * @description 获取用户已发表的评价列表
 * @module app/api/user/reviews/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取用户已发表的评价
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    // 获取评价列表，关联商品和订单信息
    const { data: reviews, error, count } = await client
      .from('reviews')
      .select(`
        id,
        order_id,
        goods_id,
        rating,
        content,
        images,
        reply,
        reply_time,
        created_at,
        goods:goods_id (name, images)
      `, { count: 'exact' })
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询评价失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // 格式化数据
    const formattedReviews = reviews?.map((r: any) => ({
      id: r.id,
      order_id: r.order_id,
      goods_id: r.goods_id,
      goods_name: r.goods?.name || '未知商品',
      goods_image: r.goods?.images?.[0] || null,
      rating: r.rating,
      content: r.content,
      images: r.images,
      reply: r.reply,
      reply_time: r.reply_time,
      created_at: r.created_at,
    })) || [];

    return NextResponse.json({
      data: formattedReviews,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取用户评价失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
