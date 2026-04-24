/**
 * @fileoverview 分类slug查询API
 * @description 根据slug获取分类信息
 * @module app/api/categories/slug/[slug]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 根据slug获取分类
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const client = getSupabaseClient();

    const { data: category, error } = await client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !category) {
      return NextResponse.json({ error: '分類不存在' }, { status: 404 });
    }

    // 获取该分类下的商品数量
    const { count } = await client
      .from('goods')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', true);

    return NextResponse.json({
      data: {
        ...category,
        goods_count: count || 0,
      },
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '獲取分類失敗' }, { status: 500 });
  }
}
