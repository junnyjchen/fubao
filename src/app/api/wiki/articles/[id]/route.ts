/**
 * @fileoverview 单篇文章API
 * @description 文章详情、更新、删除操作
 * @module app/api/wiki/articles/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取单篇文章详情
 * GET /api/wiki/articles/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
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
        view_count,
        is_published,
        is_featured,
        tags,
        created_at,
        updated_at,
        category:wiki_categories (
          id,
          name,
          slug,
          description
        )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 处理关联数据
    const article = {
      ...data,
      category: Array.isArray(data.category) ? data.category[0] : data.category,
    };

    return NextResponse.json({ data: article });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 更新文章信息
 * PUT /api/wiki/articles/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // 可更新字段
    if (body.title) updateData.title = body.title;
    if (body.slug) updateData.slug = body.slug;
    if (body.category_id) updateData.category_id = body.category_id;
    if (body.summary !== undefined) updateData.summary = body.summary || null;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image || null;
    if (body.author) updateData.author = body.author;
    if (body.is_published !== undefined) updateData.is_published = body.is_published;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.tags !== undefined) updateData.tags = body.tags;

    const { data, error } = await client
      .from('wiki_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新文章失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '文章已更新',
      data,
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * 删除文章
 * DELETE /api/wiki/articles/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('wiki_articles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除文章失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '文章已刪除' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
