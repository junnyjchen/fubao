/**
 * @fileoverview 热门搜索API
 * @description 获取热门搜索关键词
 * @module app/api/search/hot-keywords/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取热门搜索关键词
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('search_keywords')
      .select('keyword, count')
      .order('count', { ascending: false })
      .limit(limit);

    if (error) {
      // 如果表不存在，返回默认热门关键词
      return NextResponse.json({
        data: [
          { keyword: '太極符', count: 100 },
          { keyword: '平安符', count: 95 },
          { keyword: '招財符', count: 88 },
          { keyword: '桃花符', count: 75 },
          { keyword: '文昌符', count: 60 },
          { keyword: '化煞符', count: 55 },
          { keyword: '道家法器', count: 50 },
          { keyword: '開光物品', count: 45 },
        ],
      });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('获取热门搜索失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
