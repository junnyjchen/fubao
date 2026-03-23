/**
 * @fileoverview 全局搜索 API
 * @description 提供商品、新闻等内容的搜索功能
 * @module app/api/search/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 全局搜索
 * @description 搜索商品和新闻
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const type = searchParams.get('type') || 'all'; // all, goods, news
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!keyword || !keyword.trim()) {
    return NextResponse.json({ 
      goods: [], 
      news: [],
      total: 0 
    });
  }

  try {
    const client = getSupabaseClient();
    const searchTerm = keyword.trim();
    const results = {
      goods: [] as unknown[],
      news: [] as unknown[],
      total: 0,
    };

    // 搜索商品
    if (type === 'all' || type === 'goods') {
      const { data: goods, error: goodsError } = await client
        .from('goods')
        .select('id, name, price, main_image, sales, type, purpose')
        .eq('status', true)
        .or(`name.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('sales', { ascending: false })
        .limit(limit);

      if (!goodsError && goods) {
        results.goods = goods;
        results.total += goods.length;
      }
    }

    // 搜索新闻
    if (type === 'all' || type === 'news') {
      const { data: news, error: newsError } = await client
        .from('news')
        .select('id, title, summary, cover_image, created_at')
        .eq('status', true)
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (!newsError && news) {
        results.news = news;
        results.total += news.length;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json({ error: '搜索失敗' }, { status: 500 });
  }
}
