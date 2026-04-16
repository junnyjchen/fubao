/* @ts-nocheck */
/**
 * @fileoverview 文章列表 API
 * @description 提供文章的查询和创建接口
 * @module app/api/articles/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取文章列表
 * @param request - 请求对象
 * @returns 文章列表响应
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const isFeatured = searchParams.get('featured') === 'true';
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('articles')
      .select('*', { count: 'exact' })
      .order('sort', { ascending: true })
      .order('published_at', { ascending: false });

    // 状态筛选（后台管理不限制status）
    if (status !== null && status !== 'all') {
      query = query.eq('status', status === 'true');
    } else if (status === null) {
      // 前台调用只显示已发布
      query = query.eq('status', true);
    }

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
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
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

/**
 * 创建新文章
 * @param request - 请求对象
 * @returns 创建结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('articles')
      .insert({
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
        summary: body.summary,
        content: body.content,
        cover: body.cover,
        category_id: body.category_id,
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

    return NextResponse.json({ data, message: '文章創建成功' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
