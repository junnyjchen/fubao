/* @ts-nocheck */
/**
 * @fileoverview 用户收藏 API
 * @description 提供用户收藏的增删查功能
 * @module app/api/favorites/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取用户收藏列表
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest-user-001';
  const targetType = searchParams.get('targetType') || 'goods';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  try {
    const client = getSupabaseClient();

    // 查询收藏总数
    const { count } = await client
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('target_type', targetType);

    // 查询收藏
    const { data: favorites, error } = await client
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果是商品收藏，查询商品详情
    if (targetType === 'goods' && favorites && favorites.length > 0) {
      const goodsIds = favorites.map((f: { target_id: number }) => f.target_id);
      const { data: goods } = await client
        .from('goods')
        .select('id, name, price, main_image, sales, status')
        .in('id', goodsIds);

      // 组合数据
      const goodsMap = new Map(
        (goods || []).map((g: { id: number }) => [g.id, g])
      );

      const result = favorites.map((f: { id: number; target_id: number; created_at: string }) => ({
        ...f,
        goods: goodsMap.get(f.target_id) || null,
      }));

      return NextResponse.json({ 
        data: result, 
        page,
        limit,
        total: count || 0,
        total_pages: count ? Math.ceil(count / limit) : 0,
      });
    }

    return NextResponse.json({ 
      data: favorites || [],
      page,
      limit,
      total: count || 0,
      total_pages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    return NextResponse.json({ error: '獲取收藏列表失敗' }, { status: 500 });
  }
}

/**
 * 添加收藏
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'guest-user-001', targetType, targetId } = body;

    if (!targetType || !targetId) {
      return NextResponse.json({ error: '參數不完整' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查是否已收藏
    const { data: existing } = await client
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single();

    if (existing) {
      return NextResponse.json({ error: '已收藏' }, { status: 400 });
    }

    // 添加收藏
    const { data, error } = await client
      .from('favorites')
      .insert({
        user_id: userId,
        target_type: targetType,
        target_id: targetId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ error: '添加收藏失敗' }, { status: 500 });
  }
}

/**
 * 取消收藏
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest-user-001';
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (!targetType || !targetId) {
    return NextResponse.json({ error: '參數不完整' }, { status: 400 });
  }

  try {
    const client = getSupabaseClient();

    const { error } = await client
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('target_type', targetType)
      .eq('target_id', parseInt(targetId));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ error: '取消收藏失敗' }, { status: 500 });
  }
}
