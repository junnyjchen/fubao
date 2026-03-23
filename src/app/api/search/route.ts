/**
 * @fileoverview 全局搜索 API
 * @description 提供商品、新闻等内容的搜索功能
 * @module app/api/search/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 全局搜索
 * @description 搜索商品和文章
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const type = searchParams.get('type') || 'all'; // all, goods, article
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  if (!keyword || !keyword.trim()) {
    return NextResponse.json({ 
      results: [], 
      total: 0,
      totalPages: 0,
      currentPage: 1,
    });
  }

  try {
    const client = getSupabaseClient();
    const searchTerm = keyword.trim();
    const results: any[] = [];

    // 搜索商品
    if (type === 'all' || type === 'goods') {
      let query = client
        .from('goods')
        .select(`
          id,
          name,
          subtitle,
          price,
          main_image,
          sales,
          type,
          purpose,
          is_certified,
          category:categories (name),
          merchant:merchants (name)
        `)
        .eq('status', true)
        .or(`name.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      // 排序
      if (sort === 'sales') {
        query = query.order('sales', { ascending: false });
      } else if (sort === 'price_asc') {
        query = query.order('price', { ascending: true });
      } else if (sort === 'price_desc') {
        query = query.order('price', { ascending: false });
      } else if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('sales', { ascending: false });
      }

      const { data: goods, error: goodsError } = await query.range(offset, offset + limit - 1);

      if (!goodsError && goods) {
        goods.forEach((g: any) => {
          results.push({
            id: g.id,
            type: 'goods',
            name: g.name,
            subtitle: g.subtitle,
            price: g.price,
            image: g.main_image,
            sales: g.sales,
            category: g.category?.name || g.purpose,
            merchant_name: g.merchant?.name,
            is_certified: g.is_certified,
          });
        });
      }
    }

    // 搜索文章（百科）
    if (type === 'all' || type === 'article') {
      const { data: articles, error: articleError } = await client
        .from('articles')
        .select('id, title, summary, cover_image, views, category:categories (name)')
        .eq('status', true)
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('views', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!articleError && articles) {
        articles.forEach((a: any) => {
          results.push({
            id: a.id,
            type: 'article',
            name: a.title,
            subtitle: a.summary,
            image: a.cover_image,
            views: a.views,
            category: a.category?.name,
          });
        });
      }
    }

    // 计算总数（简化处理）
    const total = results.length * 2; // 估算
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      results,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json({ error: '搜索失敗' }, { status: 500 });
  }
}
