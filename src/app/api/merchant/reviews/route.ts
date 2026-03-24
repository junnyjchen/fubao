/**
 * @fileoverview 商户评价API
 * @description 获取商户商品的评价列表
 * @module app/api/merchant/reviews/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取商户商品的评价列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id') || '1'; // TODO: 从认证获取
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    // 获取商户的商品ID列表
    const { data: goodsIds, error: goodsError } = await client
      .from('goods')
      .select('id')
      .eq('merchant_id', parseInt(merchantId));

    if (goodsError) {
      console.error('查询商品失败:', goodsError);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    if (!goodsIds || goodsIds.length === 0) {
      return NextResponse.json({ data: [], total: 0 });
    }

    const ids = goodsIds.map((g: any) => g.id);

    // 获取这些商品的评价
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
        goods:goods_id (name, images),
        user:users (nickname, avatar)
      `, { count: 'exact' })
      .in('goods_id', ids)
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
      user_name: r.user?.nickname || '匿名用戶',
      user_avatar: r.user?.avatar || null,
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
    console.error('获取评价失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
