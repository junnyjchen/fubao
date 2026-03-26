/**
 * @fileoverview 商品评价API
 * @description 评价CRUD操作
 * @module app/api/reviews/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取商品评价列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goods_id');
    const orderId = searchParams.get('order_id');
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    let query = client
      .from('reviews')
      .select(`
        id,
        order_id,
        goods_id,
        user_id,
        rating,
        content,
        images,
        created_at,
        users (
          name,
          avatar
        )
      `, { count: 'exact' });

    // 根据参数过滤
    if (goodsId) {
      query = query.eq('goods_id', parseInt(goodsId));
    }
    if (orderId) {
      query = query.eq('order_id', parseInt(orderId));
    }
    if (userId) {
      query = query.eq('user_id', parseInt(userId));
    }

    const { data: reviews, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    // 格式化数据
    const formattedReviews = (reviews || []).map((review: any) => ({
      id: review.id,
      order_id: review.order_id,
      goods_id: review.goods_id,
      user_id: review.user_id,
      rating: review.rating,
      content: review.content,
      images: review.images,
      created_at: review.created_at,
      user: {
        name: review.users?.name || '匿名用户',
        avatar: review.users?.avatar,
      },
    }));

    // 获取评分统计
    let ratingStats = {
      avg: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    if (goodsId) {
      const { data: statsData } = await client
        .from('reviews')
        .select('rating')
        .eq('goods_id', parseInt(goodsId));

      if (statsData && statsData.length > 0) {
        const total = statsData.length;
        const sum = statsData.reduce((acc: number, r: any) => acc + r.rating, 0);
        
        ratingStats = {
          avg: sum / total,
          total,
          distribution: {
            5: statsData.filter((r: any) => r.rating === 5).length,
            4: statsData.filter((r: any) => r.rating === 4).length,
            3: statsData.filter((r: any) => r.rating === 3).length,
            2: statsData.filter((r: any) => r.rating === 2).length,
            1: statsData.filter((r: any) => r.rating === 1).length,
          },
        };
      }
    }

    return NextResponse.json({
      data: formattedReviews,
      total: count || 0,
      page,
      limit,
      ratingStats,
    });
  } catch (error) {
    console.error('获取评价失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 创建评价
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id || 1; // TODO: 从认证获取
    const { orderId, goodsId, rating, content, images } = body;

    // 验证必填字段
    if (!orderId || !goodsId || !rating) {
      return NextResponse.json(
        { error: '請填寫完整評價信息' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '評分必須在1-5之間' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 验证订单是否属于当前用户且已完成
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('id, status, user_id')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '訂單不存在或無權評價' },
        { status: 403 }
      );
    }

    if (order.status !== 'completed') {
      return NextResponse.json(
        { error: '只能評價已完成的訂單' },
        { status: 400 }
      );
    }

    // 检查是否已评价
    const { data: existingReview } = await client
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('goods_id', goodsId)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: '該商品已評價' },
        { status: 400 }
      );
    }

    // 创建评价
    const { data: review, error: insertError } = await client
      .from('reviews')
      .insert({
        order_id: orderId,
        goods_id: goodsId,
        user_id: userId,
        rating,
        content: content || null,
        images: images || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: '評價失敗' }, { status: 500 });
    }

    // 更新商品评分
    await updateGoodsRating(client, goodsId);

    // 更新订单评价状态
    await client
      .from('order_items')
      .update({ reviewed: true })
      .eq('order_id', orderId)
      .eq('goods_id', goodsId);

    // 奖励积分
    await client.from('user_points').insert({
      user_id: userId,
      points: 10,
      type: 'earn',
      source: 'review',
      description: '評價商品獲得積分',
      balance_after: 0, // 需要查询当前余额
    });

    return NextResponse.json({
      message: '評價成功',
      data: review,
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    return NextResponse.json({ error: '評價失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新评价
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id || 1; // TODO: 从认证获取
    const { reviewId, rating, content, images } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: '請選擇評價' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 验证评价属于当前用户
    const { data: existingReview, error: reviewError } = await client
      .from('reviews')
      .select('id, goods_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();

    if (reviewError || !existingReview) {
      return NextResponse.json(
        { error: '評價不存在或無權修改' },
        { status: 403 }
      );
    }

    // 更新评价
    const updateData: any = { updated_at: new Date().toISOString() };
    if (rating !== undefined) updateData.rating = rating;
    if (content !== undefined) updateData.content = content;
    if (images !== undefined) updateData.images = images;

    const { error: updateError } = await client
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId);

    if (updateError) {
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    // 更新商品评分
    if (rating !== undefined) {
      await updateGoodsRating(client, existingReview.goods_id);
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新评价失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除评价
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: '請選擇評價' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 验证评价属于当前用户
    const { data: existingReview, error: reviewError } = await client
      .from('reviews')
      .select('id, goods_id')
      .eq('id', parseInt(reviewId))
      .eq('user_id', parseInt(userId))
      .single();

    if (reviewError || !existingReview) {
      return NextResponse.json(
        { error: '評價不存在或無權刪除' },
        { status: 403 }
      );
    }

    // 删除评价
    const { error: deleteError } = await client
      .from('reviews')
      .delete()
      .eq('id', parseInt(reviewId));

    if (deleteError) {
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    // 更新商品评分
    await updateGoodsRating(client, existingReview.goods_id);

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除评价失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}

/**
 * 更新商品评分
 */
async function updateGoodsRating(client: any, goodsId: number) {
  try {
    const { data: reviews } = await client
      .from('reviews')
      .select('rating')
      .eq('goods_id', goodsId);

    if (reviews && reviews.length > 0) {
      const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
      
      await client
        .from('goods')
        .update({ rating: avgRating, review_count: reviews.length })
        .eq('id', goodsId);
    }
  } catch (error) {
    console.error('更新商品评分失败:', error);
  }
}
