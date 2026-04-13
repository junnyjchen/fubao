/**
 * @fileoverview 搜索建议API
 * @description 提供实时搜索建议
 * @module app/api/search/suggestions/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const client = getSupabaseClient();
    const suggestions: Array<{
      type: 'goods' | 'wiki' | 'videos' | 'merchants' | 'keyword';
      id?: number;
      name: string;
      subtitle?: string;
      image?: string;
      url?: string;
    }> = [];

    const queryLower = query.toLowerCase();

    // 搜索商品 (最多3条)
    const { data: goods } = await client
      .from('goods')
      .select('id, name, price, image')
      .eq('status', 'active')
      .ilike('name', `%${query}%`)
      .limit(3);

    if (goods && goods.length > 0) {
      goods.forEach((item) => {
        suggestions.push({
          type: 'goods',
          id: item.id,
          name: item.name,
          subtitle: `$${item.price.toFixed(2)}`,
          image: item.image,
          url: `/shop/${item.id}`,
        });
      });
    }

    // 搜索百科文章 (最多2条)
    const { data: wiki } = await client
      .from('wiki_articles')
      .select('id, title, slug')
      .eq('status', 'published')
      .ilike('title', `%${query}%`)
      .limit(2);

    if (wiki && wiki.length > 0) {
      wiki.forEach((item) => {
        suggestions.push({
          type: 'wiki',
          id: item.id,
          name: item.title,
          url: `/wiki/${item.slug || item.id}`,
        });
      });
    }

    // 搜索视频 (最多2条)
    const { data: videos } = await client
      .from('videos')
      .select('id, title, cover_image')
      .eq('status', 'published')
      .ilike('title', `%${query}%`)
      .limit(2);

    if (videos && videos.length > 0) {
      videos.forEach((item) => {
        suggestions.push({
          type: 'videos',
          id: item.id,
          name: item.title,
          image: item.cover_image,
          url: `/video/${item.id}`,
        });
      });
    }

    // 搜索商家 (最多2条)
    const { data: merchants } = await client
      .from('merchants')
      .select('id, name, logo')
      .eq('status', 'approved')
      .ilike('name', `%${query}%`)
      .limit(2);

    if (merchants && merchants.length > 0) {
      merchants.forEach((item) => {
        suggestions.push({
          type: 'merchants',
          id: item.id,
          name: item.name,
          image: item.logo,
          url: `/merchant/${item.id}`,
        });
      });
    }

    // 添加关键词建议
    if (suggestions.length > 0) {
      suggestions.unshift({
        type: 'keyword',
        name: query,
        url: `/search?q=${encodeURIComponent(query)}`,
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
