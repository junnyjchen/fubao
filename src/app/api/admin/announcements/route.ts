/**
 * @fileoverview 后台公告管理API
 * @description 公告的增删改查
 * @module app/api/admin/announcements/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取公告列表（后台）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    const { data, error, count } = await client
      .from('announcements')
      .select('*', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询公告失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({ data, total: count || 0 });
  } catch (error) {
    console.error('获取公告失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 创建公告
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, is_pinned, is_active, start_time, end_time } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: '請填寫公告標題和內容' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('announcements')
      .insert({
        title: title.trim(),
        content: content.trim(),
        type: type || 'notice',
        is_pinned: is_pinned || false,
        is_active: is_active !== false,
        start_time: start_time || null,
        end_time: end_time || null,
      })
      .select()
      .single();

    if (error) {
      console.error('创建公告失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '創建成功',
      data,
    });
  } catch (error) {
    console.error('创建公告失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
