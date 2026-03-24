/**
 * @fileoverview 晒图分享API路由
 * @description 晒图功能的增删查接口
 * @module app/api/shares/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

/**
 * GET /api/shares - 获取晒图列表
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const goodsId = searchParams.get('goods_id');
  const userId = searchParams.get('user_id');

  try {
    let query = supabase
      .from('shares')
      .select(`
        id,
        user_id,
        goods_id,
        content,
        images,
        video_url,
        likes_count,
        comments_count,
        is_anonymous,
        created_at,
        users (
          id,
          nickname,
          avatar
        ),
        goods (
          id,
          name,
          images
        )
      `, { count: 'exact' })
      .eq('status', 1)
      .order('created_at', { ascending: false });

    // 按商品筛选
    if (goodsId) {
      query = query.eq('goods_id', parseInt(goodsId));
    }

    // 按用户筛选
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 分页
    const { data: shares, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取晒图列表失败:', error);
      return NextResponse.json({ error: '獲取列表失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        list: shares || [],
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取晒图列表失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * POST /api/shares - 发布晒图
 */
export async function POST(request: NextRequest) {
  // 验证登录状态
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: '請先登錄' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      goods_id,
      order_id,
      content,
      images = [],
      video_url,
      is_anonymous = false,
    } = body;

    // 验证必填项
    if (!content || !content.trim()) {
      return NextResponse.json({ error: '請填寫分享內容' }, { status: 400 });
    }
    if (images.length === 0 && !video_url) {
      return NextResponse.json({ error: '請上傳圖片或視頻' }, { status: 400 });
    }

    // 验证是否购买过该商品
    if (goods_id && order_id) {
      const { data: orderItem, error: orderError } = await supabase
        .from('order_items')
        .select(`
          id,
          orders!inner (user_id, status)
        `)
        .eq('goods_id', goods_id)
        .eq('order_id', order_id)
        .eq('orders.user_id', userId)
        .in('orders.status', [2, 3]) // 已发货或已完成
        .single();

      if (orderError || !orderItem) {
        return NextResponse.json({ error: '您還未購買該商品' }, { status: 403 });
      }
    }

    // 创建晒图记录
    const { data: share, error } = await supabase
      .from('shares')
      .insert({
        user_id: userId,
        goods_id: goods_id || null,
        order_id: order_id || null,
        content: content.trim(),
        images,
        video_url: video_url || null,
        likes_count: 0,
        comments_count: 0,
        is_anonymous,
        status: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('发布晒图失败:', error);
      return NextResponse.json({ error: '發布失敗' }, { status: 500 });
    }

    // 如果关联商品，更新商品评价数
    if (goods_id) {
      await supabase.rpc('increment_share_count', { goods_id: parseInt(goods_id) });
    }

    return NextResponse.json({
      success: true,
      data: share,
      message: '發布成功',
    });
  } catch (error) {
    console.error('发布晒图失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
