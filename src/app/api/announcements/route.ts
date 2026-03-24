/**
 * @fileoverview 前端公告API
 * @description 获取启用的公告列表
 * @module app/api/announcements/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取启用的公告列表（前端展示）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const client = getSupabaseClient();
    const now = new Date().toISOString();

    // 查询启用的、在有效期内的公告
    const { data, error } = await client
      .from('announcements')
      .select('id, title, content, type, is_pinned, created_at')
      .eq('is_active', true)
      .or(`start_time.is.null,start_time.lte.${now}`)
      .or(`end_time.is.null,end_time.gte.${now}`)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('查询公告失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('获取公告失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
