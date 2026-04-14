/**
 * 搜索 API
 * GET /api/search?q=keyword&type=goods|articles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type') || 'goods';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // 检查 supabase 是否有效
    if (!supabase || typeof supabase.from !== 'function') {
      return NextResponse.json({
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        message: 'Database unavailable',
      });
    }

    const keyword = q.trim();

    if (type === 'goods') {
      // 搜索商品
      const { data, error } = await supabase
        .from('goods')
        .select(`
          id,
          name,
          subtitle,
          main_image,
          price,
          original_price,
          is_certified,
          sales,
          stock,
          merchant_id
        `, { count: 'exact' })
        .eq('status', 1)
        .ilike('name', `%${keyword}%`)
        .order('sales', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // 获取商户信息
      let merchantNames: Record<number, string> = {};
      if (data && data.length > 0) {
        const merchantIds = [...new Set(data.map((item: any) => item.merchant_id).filter(Boolean))];
        if (merchantIds.length > 0) {
          const { data: merchants } = await supabase
            .from('merchants')
            .select('id, name')
            .in('id', merchantIds);
          
          if (merchants) {
            merchantNames = merchants.reduce((acc: Record<number, string>, m: any) => {
              acc[m.id] = m.name;
              return acc;
            }, {});
          }
        }
      }

      const enrichedData = data?.map((item: any) => ({
        ...item,
        merchant_name: merchantNames[item.merchant_id] || '未知商家',
      })) || [];

      return NextResponse.json({
        data: enrichedData,
        pagination: {
          page,
          limit,
          total: data?.length || 0,
          totalPages: Math.ceil((data?.length || 0) / limit),
        },
      });
    } else if (type === 'articles') {
      // 搜索文章
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          summary,
          cover_image,
          author,
          views,
          likes,
          published_at,
          category_id
        `, { count: 'exact' })
        .eq('status', 1)
        .ilike('title', `%${keyword}%`)
        .order('views', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return NextResponse.json({
        data: data || [],
        pagination: {
          page,
          limit,
          total: data?.length || 0,
          totalPages: Math.ceil((data?.length || 0) / limit),
        },
      });
    } else {
      // 搜索全部
      const goodsPromise = supabase
        .from('goods')
        .select('id, name, main_image, price, type', { count: 'exact' })
        .eq('status', 1)
        .ilike('name', `%${keyword}%`)
        .limit(5);

      const articlesPromise = supabase
        .from('articles')
        .select('id, title, cover_image, type', { count: 'exact' })
        .eq('status', 1)
        .ilike('title', `%${keyword}%`)
        .limit(5);

      const [goodsResult, articlesResult] = await Promise.all([goodsPromise, articlesPromise]);

      return NextResponse.json({
        goods: goodsResult.data || [],
        articles: articlesResult.data || [],
        pagination: {
          goods_total: goodsResult.data?.length || 0,
          articles_total: articlesResult.data?.length || 0,
        },
      });
    }
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
