/**
 * @fileoverview 商品评价 API
 * @description 处理商品评价的增删改查
 * @module app/api/reviews/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 临时用户ID */
const TEMP_USER_ID = 'guest-user-001';

/**
 * 获取商品评价列表
 * @param request - 请求对象
 * @returns 评价列表
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const goodsId = searchParams.get('goods_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = client
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('status', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (goodsId) {
      query = query.eq('goods_id', parseInt(goodsId));
    }

    const { data: reviews, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取用户信息
    const userIds = [...new Set(reviews?.map(r => r.user_id) || [])];
    let usersMap = new Map();
    
    if (userIds.length > 0) {
      const { data: users } = await client
        .from('users')
        .select('id, name, avatar')
        .in('id', userIds);
      
      users?.forEach(u => usersMap.set(u.id, u));
    }

    // 合并用户信息
    const reviewsWithUser = reviews?.map(review => ({
      ...review,
      user: usersMap.get(review.user_id) || { name: '匿名用戶', avatar: null },
    }));

    // 计算评分统计
    let ratingStats = { avg: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    
    if (goodsId && reviewsWithUser) {
      const allReviews = await client
        .from('reviews')
        .select('rating')
        .eq('goods_id', parseInt(goodsId))
        .eq('status', true);

      if (allReviews.data && allReviews.data.length > 0) {
        const total = allReviews.data.length;
        const sum = allReviews.data.reduce((acc, r) => acc + r.rating, 0);
        ratingStats.avg = Math.round((sum / total) * 10) / 10;
        ratingStats.total = total;
        
        allReviews.data.forEach(r => {
          ratingStats.distribution[r.rating as keyof typeof ratingStats.distribution]++;
        });
      }
    }

    return NextResponse.json({
      data: reviewsWithUser,
      ratingStats,
      page,
      limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('获取评价失败:', error);
    return NextResponse.json({ error: '獲取評價失敗' }, { status: 500 });
  }
}

/**
 * 创建商品评价
 * @param request - 请求对象
 * @returns 创建结果
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { orderId, goodsId, rating, content, images } = body;

    if (!orderId || !goodsId || !rating) {
      return NextResponse.json({ error: '請填寫完整評價信息' }, { status: 400 });
    }

    // 检查订单是否存在且已完成
    const { data: order } = await client
      .from('orders')
      .select('id, order_status')
      .eq('id', orderId)
      .eq('user_id', TEMP_USER_ID)
      .single();

    if (!order || order.order_status !== 3) {
      return NextResponse.json({ error: '訂單未完成，無法評價' }, { status: 400 });
    }

    // 检查是否已评价
    const { data: existingReview } = await client
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('goods_id', goodsId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: '該商品已評價' }, { status: 400 });
    }

    const { data, error } = await client
      .from('reviews')
      .insert({
        order_id: orderId,
        goods_id: goodsId,
        user_id: TEMP_USER_ID,
        rating,
        content: content || null,
        images: images || null,
        status: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '評價成功', data });
  } catch (error) {
    console.error('创建评价失败:', error);
    return NextResponse.json({ error: '創建評價失敗' }, { status: 500 });
  }
}
