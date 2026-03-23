/**
 * @fileoverview 新闻列表 API
 * @description 提供新闻的查询和创建接口
 * @module app/api/news/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取新闻列表
 * @param request - 请求对象
 * @returns 新闻列表响应
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const isFeatured = searchParams.get('featured') === 'true';
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('news')
      .select('*', { count: 'exact' })
      .order('sort', { ascending: true })
      .order('published_at', { ascending: false });

    // 状态筛选
    if (status !== null && status !== 'all') {
      query = query.eq('status', status === 'true');
    } else if (status === null) {
      query = query.eq('status', true);
    }

    if (type) {
      query = query.eq('type', parseInt(type));
    }
    if (isFeatured) {
      query = query.eq('is_featured', true);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data, 
      page, 
      limit,
      total: count,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

/**
 * 创建新新闻
 * @param request - 请求对象
 * @returns 创建结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('news')
      .insert({
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
        summary: body.summary,
        content: body.content,
        cover: body.cover,
        type: body.type || 0,
        author: body.author || '管理員',
        status: body.status ?? true,
        is_featured: body.is_featured ?? false,
        sort: body.sort || 0,
        views: 0,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '新聞創建成功' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create news' },
      { status: 500 }
    );
  }
}
