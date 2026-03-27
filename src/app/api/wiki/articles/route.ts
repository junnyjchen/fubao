/**
 * @fileoverview 百科文章API
 * @description 百科文章列表和新增功能
 * @module app/api/wiki/articles/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取文章列表
 * GET /api/wiki/articles
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('category_id');
    const isFeatured = searchParams.get('is_featured');
    const slug = searchParams.get('slug');

    let query = client
      .from('wiki_articles')
      .select(`
        id,
        title,
        slug,
        category_id,
        summary,
        content,
        cover_image,
        author,
        views,
        is_featured,
        status,
        created_at,
        updated_at
      `, { count: 'exact' })
      .eq('status', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }
    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }
    if (slug) {
      query = query.eq('slug', slug);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('查询文章列表失败:', error);
      // 如果表不存在或查询失败，返回空数据
      return NextResponse.json({ data: [], total: 0 });
    }

    // 获取分类信息
    if (data && data.length > 0) {
      const categoryIds = [...new Set(data.map(a => a.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const { data: categories } = await client
          .from('wiki_categories')
          .select('id, name, slug');
        
        const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
        data.forEach(article => {
          (article as any).category = categoryMap.get(article.category_id) || null;
        });
      }
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 创建新文章
 * POST /api/wiki/articles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const {
      title,
      slug,
      category_id,
      summary,
      content,
      cover_image,
      author,
      is_published,
      is_featured,
      tags,
    } = body;

    // 验证必填字段
    if (!title || !category_id) {
      return NextResponse.json(
        { error: '請填寫完整信息' },
        { status: 400 }
      );
    }

    // 生成唯一slug
    let articleSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');

    // 检查slug是否已存在
    const { data: existing } = await client
      .from('wiki_articles')
      .select('id')
      .eq('slug', articleSlug)
      .single();

    if (existing) {
      articleSlug = `${articleSlug}-${Date.now()}`;
    }

    // 插入文章
    const { data, error } = await client
      .from('wiki_articles')
      .insert({
        title,
        slug: articleSlug,
        category_id,
        summary: summary || null,
        content: content || '',
        cover_image: cover_image || null,
        author: author || '符寶網編輯部',
        is_published: is_published ?? false,
        is_featured: is_featured ?? false,
        tags: tags || [],
        view_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建文章失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '文章創建成功',
      data,
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
