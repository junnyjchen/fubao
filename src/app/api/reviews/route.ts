/**
 * @fileoverview 商品评价API
 * @description 获取商品评价列表和创建评价
 * @module app/api/reviews/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取评价列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goods_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!goodsId) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 获取评价列表
    const { data: reviews, error, count } = await client
      .from('reviews')
      .select('id, order_id, goods_id, user_id, rating, content, images, status, created_at', { count: 'exact' })
      .eq('goods_id', parseInt(goodsId))
      .eq('status', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询评价失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // 获取用户信息
    let userMap = new Map();
    if (reviews && reviews.length > 0) {
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: users } = await client
        .from('users')
        .select('id, nickname, avatar')
        .in('id', userIds);
      
      users?.forEach(u => userMap.set(u.id, u));
    }

    // 获取评分统计
    const { data: statsData } = await client
      .from('reviews')
      .select('rating')
      .eq('goods_id', parseInt(goodsId))
      .eq('status', true);

    const ratingStats = {
      avg: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
    };

    if (statsData && statsData.length > 0) {
      const total = statsData.length;
      const sum = statsData.reduce((acc: number, r: any) => acc + r.rating, 0);
      ratingStats.avg = Number((sum / total).toFixed(1));
      ratingStats.total = total;

      statsData.forEach((r: any) => {
        if (r.rating >= 1 && r.rating <= 5) {
          ratingStats.distribution[r.rating]++;
        }
      });
    }

    // 格式化评价数据
    const formattedReviews = reviews?.map((r: any) => {
      const user = userMap.get(r.user_id);
      return {
        id: r.id,
        orderId: r.order_id,
        goodsId: r.goods_id,
        userId: r.user_id,
        rating: r.rating,
        content: r.content,
        images: r.images,
        createdAt: r.created_at,
        user: {
          name: user?.nickname || '匿名用戶',
          avatar: user?.avatar || null,
        },
      };
    }) || [];

    return NextResponse.json({
      data: formattedReviews,
      total: count || 0,
      page,
      limit,
      ratingStats,
    });
  } catch (error) {
    console.error('获取评价列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// POST - 创建评价
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, goods_id, user_id, rating, content, images } = body;

    // 验证必填字段
    if (!order_id || !goods_id || !user_id || !rating) {
      return NextResponse.json(
        { error: '請填寫完整評價信息' },
        { status: 400 }
      );
    }

    // 验证评分范围
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '評分範圍為1-5分' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查是否已评价
    const { data: existingReview } = await client
      .from('reviews')
      .select('id')
      .eq('order_id', order_id)
      .eq('goods_id', goods_id)
      .eq('user_id', user_id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: '該商品已評價' },
        { status: 400 }
      );
    }

    // 创建评价
    const { data: review, error } = await client
      .from('reviews')
      .insert({
        order_id,
        goods_id,
        user_id,
        rating,
        content: content || null,
        images: images || null,
      })
      .select()
      .single();

    if (error) {
      console.error('创建评价失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '評價成功',
      data: review,
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
