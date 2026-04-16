/* @ts-nocheck */
/**
 * @fileoverview 晒图分享API路由
 * @description 晒图功能的增删查接口
 * @module app/api/shares/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET /api/shares - 获取晒图列表
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '12');
  const goodsId = searchParams.get('goods_id');
  const isFeatured = searchParams.get('featured');

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('shares')
      .select('id, user_id, title, content, images, goods_id, status, views, likes, is_featured, created_at', { count: 'exact' })
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    // 按商品筛选
    if (goodsId) {
      query = query.eq('goods_id', parseInt(goodsId));
    }

    // 只看精选
    if (isFeatured === 'true') {
      query = query.eq('is_featured', true);
    }

    // 分页
    const { data: shares, error, count } = await query
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取晒图列表失败:', error);
      return NextResponse.json({ data: [], total: 0, page, pageSize });
    }

    // 获取用户信息
    const userMap = new Map();
    if (shares && shares.length > 0) {
      const userIds = [...new Set(shares.map(s => s.user_id))];
      const { data: users } = await client
        .from('users')
        .select('id, nickname, avatar')
        .in('id', userIds);
      users?.forEach(u => userMap.set(u.id, u));
    }

    // 获取商品信息
    const goodsMap = new Map();
    if (shares && shares.length > 0) {
      const goodsIds = [...new Set(shares.map(s => s.goods_id).filter(Boolean))];
      if (goodsIds.length > 0) {
        const { data: goods } = await client
          .from('goods')
          .select('id, name, main_image')
          .in('id', goodsIds);
        goods?.forEach(g => goodsMap.set(g.id, g));
      }
    }

    // 格式化返回数据
    const formattedShares = shares?.map(s => {
      const user = userMap.get(s.user_id);
      const goods = s.goods_id ? goodsMap.get(s.goods_id) : null;
      return {
        id: s.id,
        userId: s.user_id,
        title: s.title,
        content: s.content,
        images: s.images || [],
        goodsId: s.goods_id,
        views: s.views,
        likes: s.likes,
        isFeatured: s.is_featured,
        createdAt: s.created_at,
        user: user ? {
          id: user.id,
          nickname: user.nickname || '匿名用戶',
          avatar: user.avatar,
        } : { nickname: '匿名用戶', avatar: null },
        goods: goods ? {
          id: goods.id,
          name: goods.name,
          image: goods.main_image,
        } : null,
      };
    }) || [];

    return NextResponse.json({
      data: formattedShares,
      total: count || 0,
      page,
      pageSize,
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
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const {
      user_id,
      title,
      content,
      images = [],
      goods_id,
    } = body;

    // 验证必填项
    if (!content || !content.trim()) {
      return NextResponse.json({ error: '請填寫分享內容' }, { status: 400 });
    }
    if (!title || !title.trim()) {
      return NextResponse.json({ error: '請填寫標題' }, { status: 400 });
    }

    // 创建分享记录
    const { data: share, error } = await client
      .from('shares')
      .insert({
        user_id: user_id || 1,
        title: title.trim(),
        content: content.trim(),
        images: images,
        goods_id: goods_id || null,
        status: 'approved',
        views: 0,
        likes: 0,
        is_featured: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('发布分享失败:', error);
      return NextResponse.json({ error: '發布失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: share,
      message: '發布成功',
    });
  } catch (error) {
    console.error('发布分享失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
