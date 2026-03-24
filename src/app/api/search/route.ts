/**
 * @fileoverview 全局搜索 API
 * @description 提供商品、新闻、视频、百科等内容的搜索功能
 * @module app/api/search/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 全局搜索
 * @description 搜索商品、文章、视频、新闻等内容
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const type = searchParams.get('type') || 'all'; // all, goods, article, video, news, merchant
  const sort = searchParams.get('sort') || 'relevance';
  const categoryId = searchParams.get('category_id');
  const minPrice = searchParams.get('min_price');
  const maxPrice = searchParams.get('max_price');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = (page - 1) * limit;

  if (!keyword || !keyword.trim()) {
    return NextResponse.json({
      results: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      suggestions: [],
    });
  }

  try {
    const client = getSupabaseClient();
    const searchTerm = keyword.trim();
    const results: any[] = [];
    let totalCount = 0;

    // 搜索商品
    if (type === 'all' || type === 'goods') {
      let query = client
        .from('goods')
        .select('id, name, subtitle, price, original_price, main_image, sales, stock, purpose, is_certified, category_id, merchant_id', { count: 'exact' })
        .eq('status', true)
        .or(`name.ilike.%${searchTerm}%,subtitle.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);

      // 分类筛选
      if (categoryId) {
        query = query.eq('category_id', parseInt(categoryId));
      }

      // 价格区间筛选
      if (minPrice) {
        query = query.gte('price', parseFloat(minPrice));
      }
      if (maxPrice) {
        query = query.lte('price', parseFloat(maxPrice));
      }

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
        // 相关性排序：名称匹配优先
        query = query.order('sales', { ascending: false });
      }

      const { data: goods, error: goodsError, count } = await query.range(offset, offset + limit - 1);

      if (!goodsError && goods && goods.length > 0) {
        // 获取分类和商户信息
        const categoryIds = [...new Set(goods.map(g => g.category_id).filter(Boolean))];
        const merchantIds = [...new Set(goods.map(g => g.merchant_id).filter(Boolean))];
        
        let categoryMap = new Map();
        let merchantMap = new Map();
        
        if (categoryIds.length > 0) {
          const { data: categories } = await client
            .from('categories')
            .select('id, name');
          categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
        }
        
        if (merchantIds.length > 0) {
          const { data: merchants } = await client
            .from('merchants')
            .select('id, name, type');
          merchantMap = new Map(merchants?.map(m => [m.id, m]) || []);
        }

        goods.forEach((g: any) => {
          const category = categoryMap.get(g.category_id);
          const merchant = merchantMap.get(g.merchant_id);
          results.push({
            id: g.id,
            type: 'goods',
            name: g.name,
            subtitle: g.subtitle,
            price: g.price,
            original_price: g.original_price,
            image: g.main_image,
            sales: g.sales,
            stock: g.stock,
            category_id: g.category_id,
            category: category?.name || g.purpose,
            merchant_id: g.merchant_id,
            merchant_name: merchant?.name,
            merchant_type: merchant?.type,
            is_certified: g.is_certified,
          });
        });
        totalCount += count || 0;
      }
    }

    // 搜索视频
    if (type === 'all' || type === 'video') {
      const { data: videos, error: videoError, count } = await client
        .from('videos')
        .select('id, title, cover, url, duration, views, category_id', { count: 'exact' })
        .eq('status', true)
        .ilike('title', `%${searchTerm}%`)
        .order('views', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!videoError && videos) {
        // 获取分类信息
        const categoryIds = [...new Set(videos.map(v => v.category_id).filter(Boolean))];
        let categoryMap = new Map();
        if (categoryIds.length > 0) {
          const { data: categories } = await client
            .from('video_categories')
            .select('id, name');
          categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
        }

        videos.forEach((v: any) => {
          const category = categoryMap.get(v.category_id);
          results.push({
            id: v.id,
            type: 'video',
            name: v.title,
            subtitle: null,
            image: v.cover,
            duration: v.duration,
            views: v.views,
            category_id: v.category_id,
            category: category?.name,
          });
        });
        totalCount += count || 0;
      }
    }

    // 搜索百科文章
    if (type === 'all' || type === 'article') {
      const { data: articles, error: articleError, count } = await client
        .from('wiki_articles')
        .select('id, title, summary, cover_image, views, category_id', { count: 'exact' })
        .eq('status', true)
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('views', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!articleError && articles) {
        // 获取分类信息
        const categoryIds = [...new Set(articles.map(a => a.category_id).filter(Boolean))];
        let categoryMap = new Map();
        if (categoryIds.length > 0) {
          const { data: categories } = await client
            .from('wiki_categories')
            .select('id, name');
          categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
        }

        articles.forEach((a: any) => {
          const category = categoryMap.get(a.category_id);
          results.push({
            id: a.id,
            type: 'article',
            name: a.title,
            subtitle: a.summary,
            image: a.cover_image,
            views: a.views,
            category_id: a.category_id,
            category: category?.name,
          });
        });
        totalCount += count || 0;
      }
    }

    // 搜索新闻
    if (type === 'all' || type === 'news') {
      const { data: news, error: newsError, count } = await client
        .from('news')
        .select('id, title, summary, cover, views, published_at', { count: 'exact' })
        .eq('status', true)
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('published_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!newsError && news) {
        news.forEach((n: any) => {
          results.push({
            id: n.id,
            type: 'news',
            name: n.title,
            subtitle: n.summary,
            image: n.cover,
            views: n.views,
            published_at: n.published_at,
          });
        });
        totalCount += count || 0;
      }
    }

    // 搜索商户
    if (type === 'all' || type === 'merchant') {
      const { data: merchants, error: merchantError, count } = await client
        .from('merchants')
        .select('id, name, description, logo, type, is_verified', { count: 'exact' })
        .eq('status', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!merchantError && merchants) {
        merchants.forEach((m: any) => {
          results.push({
            id: m.id,
            type: 'merchant',
            name: m.name,
            subtitle: m.description,
            image: m.logo,
            merchant_type: m.type,
            is_verified: m.is_verified,
          });
        });
        totalCount += count || 0;
      }
    }

    // 搜索建议（热门关键词）
    const suggestions = await getSearchSuggestions(client, searchTerm);

    // 保存搜索记录（用于热门搜索）
    await saveSearchHistory(client, searchTerm);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      results,
      total: totalCount,
      totalPages,
      currentPage: page,
      suggestions,
    });
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json({ error: '搜索失敗' }, { status: 500 });
  }
}

/**
 * 获取搜索建议
 */
async function getSearchSuggestions(client: any, keyword: string): Promise<string[]> {
  const suggestions: string[] = [];

  // 从商品名称获取建议
  const { data: goods } = await client
    .from('goods')
    .select('name')
    .eq('status', true)
    .ilike('name', `${keyword}%`)
    .limit(5);

  if (goods) {
    goods.forEach((g: any) => {
      if (g.name && !suggestions.includes(g.name)) {
        suggestions.push(g.name);
      }
    });
  }

  return suggestions.slice(0, 5);
}

/**
 * 保存搜索记录
 */
async function saveSearchHistory(client: any, keyword: string): Promise<void> {
  try {
    // 更新或插入搜索热词
    await client
      .from('search_keywords')
      .upsert({
        keyword: keyword.toLowerCase(),
        count: 1,
        last_searched: new Date().toISOString(),
      }, {
        onConflict: 'keyword',
        ignoreDuplicates: false,
      });

    // 增加计数
    await client
      .rpc('increment_search_count', { keyword_text: keyword.toLowerCase() })
      .catch(() => {
        // 如果 RPC 不存在，忽略错误
      });
  } catch (error) {
    // 忽略保存错误
  }
}
