/**
 * @fileoverview 用户浏览历史API
 * @description 记录和查询用户浏览历史
 * @module app/api/user/browse-history/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/user/browse-history
 * 获取用户浏览历史
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // 获取浏览历史
    const { data: history, error } = await supabase
      .from('browse_history')
      .select(`
        id,
        goods_id,
        view_duration,
        created_at,
        goods (
          id,
          name,
          price,
          main_image,
          sales
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取浏览历史失败:', error);
      return NextResponse.json({ data: [] });
    }

    return NextResponse.json({ data: history || [] });
  } catch (error) {
    console.error('浏览历史API错误:', error);
    return NextResponse.json({ data: [] });
  }
}

/**
 * POST /api/user/browse-history
 * 记录浏览历史
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // 未登录用户不记录
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const { goods_id, view_duration } = body;

    if (!goods_id) {
      return NextResponse.json(
        { error: '商品ID不能為空' },
        { status: 400 }
      );
    }

    // 检查是否已存在
    const { data: existing } = await supabase
      .from('browse_history')
      .select('id')
      .eq('user_id', user.id)
      .eq('goods_id', goods_id)
      .single();

    if (existing) {
      // 更新浏览时间
      await supabase
        .from('browse_history')
        .update({
          created_at: new Date().toISOString(),
          view_duration: view_duration || 0,
        })
        .eq('id', existing.id);
    } else {
      // 创建新记录
      await supabase
        .from('browse_history')
        .insert({
          user_id: user.id,
          goods_id,
          view_duration: view_duration || 0,
          created_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('记录浏览历史错误:', error);
    return NextResponse.json({ success: true });
  }
}

/**
 * DELETE /api/user/browse-history
 * 清除浏览历史
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goods_id');

    if (goodsId) {
      // 删除单条记录
      await supabase
        .from('browse_history')
        .delete()
        .eq('user_id', user.id)
        .eq('goods_id', goodsId);
    } else {
      // 清空所有历史
      await supabase
        .from('browse_history')
        .delete()
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('清除浏览历史错误:', error);
    return NextResponse.json({ error: '清除失敗' }, { status: 500 });
  }
}
