/**
 * @fileoverview 用户浏览历史API
 * @description 记录和查询浏览历史
 * @module app/api/user/browse-history/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取浏览历史
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    const { data, error, count } = await client
      .from('browse_history')
      .select(`
        id,
        goods_id,
        view_time,
        view_duration,
        goods:goods_id (
          id,
          name,
          price,
          main_image,
          sales,
          status,
          merchant:merchants (name)
        )
      `, { count: 'exact' })
      .eq('user_id', parseInt(userId))
      .order('view_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询浏览历史失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取浏览历史失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 记录浏览历史
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, goods_id, view_duration } = body;

    if (!user_id || !goods_id) {
      return NextResponse.json({ error: '參數不完整' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 使用 upsert 更新或插入
    const { error } = await client
      .from('browse_history')
      .upsert({
        user_id: parseInt(user_id),
        goods_id: parseInt(goods_id),
        view_duration: view_duration || 0,
        view_time: new Date().toISOString(),
      }, {
        onConflict: 'user_id,goods_id',
      });

    if (error) {
      console.error('记录浏览历史失败:', error);
      return NextResponse.json({ error: '記錄失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '記錄成功' });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    return NextResponse.json({ error: '記錄失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 清空浏览历史
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const goodsId = searchParams.get('goods_id');

    const client = getSupabaseClient();

    if (goodsId) {
      // 删除单条记录
      await client
        .from('browse_history')
        .delete()
        .eq('user_id', parseInt(userId || '1'))
        .eq('goods_id', parseInt(goodsId));
    } else {
      // 清空所有记录
      await client
        .from('browse_history')
        .delete()
        .eq('user_id', parseInt(userId || '1'));
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除浏览历史失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
