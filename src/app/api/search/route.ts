/**
 * @fileoverview 全站搜索API
 * @description 综合搜索商品、百科、视频、商户
 * @module app/api/search/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 综合搜索
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || '';
    const type = searchParams.get('type') || 'all'; // all, goods, wiki, videos, merchants
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    if (!keyword.trim()) {
      return NextResponse.json({
        data: {
          goods: [],
          wiki: [],
          videos: [],
          merchants: [],
        },
        pagination: { page, limit, total: 0, total_pages: 0 },
      });
    }

    const client = getSupabaseClient();
    const keywordPattern = `%${keyword}%`;

    // 并行搜索各类型数据
    const [goodsResult, wikiResult, videosResult, merchantsResult] = await Promise.all([
      // 搜索商品 - 不使用嵌入查询
      (type === 'all' || type === 'goods')
        ? client
            .from('goods')
            .select(`
              id,
              name,
              price,
              original_price,
              images,
              sales,
              has_cert,
              merchant_id
            `, { count: 'exact' })
            .eq('status', 'active')
            .or(`name.ilike.${keywordPattern},description.ilike.${keywordPattern}`)
            .order('sales', { ascending: false })
            .range(offset, offset + limit - 1)
        : Promise.resolve({ data: [], error: null, count: 0 }),

      // 搜索百科 - 不使用嵌入查询
      (type === 'all' || type === 'wiki')
        ? client
            .from('wiki_articles')
            .select(`
              id,
              title,
              slug,
              summary,
              cover_image,
              views,
              category_id
            `, { count: 'exact' })
            .eq('status', 'published')
            .or(`title.ilike.${keywordPattern},content.ilike.${keywordPattern}`)
            .order('views', { ascending: false })
            .range(offset, offset + limit - 1)
        : Promise.resolve({ data: [], error: null, count: 0 }),

      // 搜索视频
      (type === 'all' || type === 'videos')
        ? client
            .from('videos')
            .select(`
              id,
              title,
              cover_image,
              duration,
              author,
              views,
              is_free
            `, { count: 'exact' })
            .eq('status', 'published')
            .or(`title.ilike.${keywordPattern},description.ilike.${keywordPattern}`)
            .order('views', { ascending: false })
            .range(offset, offset + limit - 1)
        : Promise.resolve({ data: [], error: null, count: 0 }),

      // 搜索商户
      (type === 'all' || type === 'merchants')
        ? client
            .from('merchants')
            .select(`
              id,
              name,
              logo,
              type,
              rating,
              total_sales,
              verified
            `, { count: 'exact' })
            .eq('status', 'active')
            .or(`name.ilike.${keywordPattern},description.ilike.${keywordPattern}`)
            .order('rating', { ascending: false })
            .range(offset, offset + limit - 1)
        : Promise.resolve({ data: [], error: null, count: 0 }),
    ]);

    // 记录搜索关键词
    await recordSearchKeyword(client, keyword);

    // 分开查询商户和分类信息
    const merchantIds = [...new Set((goodsResult.data || []).map((g: any) => g.merchant_id).filter(Boolean))];
    const categoryIds = [...new Set((wikiResult.data || []).map((w: any) => w.category_id).filter(Boolean))];
    
    const [merchantsData, categoriesData] = await Promise.all([
      merchantIds.length > 0
        ? client.from('merchants').select('id, name').in('id', merchantIds)
        : { data: [] },
      categoryIds.length > 0
        ? client.from('wiki_categories').select('id, name').in('id', categoryIds)
        : { data: [] }
    ]);

    const merchantsMap = new Map((merchantsData.data || []).map(m => [m.id, m]));
    const categoriesMap = new Map((categoriesData.data || []).map(c => [c.id, c]));

    // 格式化商品数据
    const goods = (goodsResult.data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      original_price: item.original_price,
      image: item.images?.[0] || '/images/placeholder.png',
      merchant_name: item.merchant_id ? (merchantsMap.get(item.merchant_id)?.name || '未知商戶') : '未知商戶',
      sales: item.sales || 0,
      has_cert: item.has_cert || false,
    }));

    // 格式化百科数据
    const wiki = (wikiResult.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      cover_image: item.cover_image,
      category_name: item.category_id ? (categoriesMap.get(item.category_id)?.name || '未分類') : '未分類',
      views: item.views || 0,
    }));

    // 格式化视频数据
    const videos = (videosResult.data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      cover_image: item.cover_image || '/images/placeholder.png',
      duration: item.duration || 0,
      author: item.author,
      views: item.views || 0,
      is_free: item.is_free || false,
    }));

    // 格式化商户数据
    const merchants = (merchantsResult.data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      logo: item.logo,
      type: item.type,
      rating: item.rating || 5.0,
      total_sales: item.total_sales || 0,
      verified: item.verified || false,
    }));

    // 计算分页信息
    const goodsTotal = goodsResult.count || 0;
    const wikiTotal = wikiResult.count || 0;
    const videosTotal = videosResult.count || 0;
    const merchantsTotal = merchantsResult.count || 0;

    // 根据当前类型计算分页信息
    let paginationTotal = 0;
    if (type === 'all') {
      // 全部模式下，使用商品总数作为分页参考（或可以根据当前展示的主要内容）
      paginationTotal = goodsTotal + wikiTotal + videosTotal + merchantsTotal;
    } else if (type === 'goods') {
      paginationTotal = goodsTotal;
    } else if (type === 'wiki') {
      paginationTotal = wikiTotal;
    } else if (type === 'videos') {
      paginationTotal = videosTotal;
    } else if (type === 'merchants') {
      paginationTotal = merchantsTotal;
    }

    return NextResponse.json({
      data: { goods, wiki, videos, merchants },
      keyword,
      pagination: {
        page,
        limit,
        total: paginationTotal,
        total_pages: Math.ceil(paginationTotal / limit),
      },
      counts: {
        goods: goodsTotal,
        wiki: wikiTotal,
        videos: videosTotal,
        merchants: merchantsTotal,
      },
    });
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json({ error: '搜索失敗' }, { status: 500 });
  }
}

/**
 * 记录搜索关键词
 */
async function recordSearchKeyword(client: any, keyword: string) {
  try {
    // 尝试更新已有记录
    const { data: existing } = await client
      .from('search_keywords')
      .select('id, count')
      .eq('keyword', keyword)
      .single();

    if (existing) {
      await client
        .from('search_keywords')
        .update({ count: existing.count + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await client.from('search_keywords').insert({
        keyword,
        count: 1,
      });
    }
  } catch {
    // 忽略记录失败
  }
}
