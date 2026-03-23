/**
 * @fileoverview 单个分类API
 * @description 分类详情、更新、删除操作
 * @module app/api/wiki/categories/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取单个分类详情
 * GET /api/wiki/categories/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('wiki_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '分類不存在' }, { status: 404 });
    }

    // 获取文章数量
    const { count } = await client
      .from('wiki_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    return NextResponse.json({
      data: {
        ...data,
        article_count: count || 0,
      },
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 更新分类信息
 * PUT /api/wiki/categories/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, any> = {};

    // 可更新字段
    if (body.name) updateData.name = body.name;
    if (body.slug) updateData.slug = body.slug;
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.parent_id !== undefined) updateData.parent_id = body.parent_id || null;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '無更新內容' }, { status: 400 });
    }

    const { data, error } = await client
      .from('wiki_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新分类失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '分類已更新',
      data,
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * 删除分类
 * DELETE /api/wiki/categories/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // 检查是否有文章
    const { count } = await client
      .from('wiki_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: '該分類下有文章，無法刪除' },
        { status: 400 }
      );
    }

    // 检查是否有子分类
    const { count: childCount } = await client
      .from('wiki_categories')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);

    if (childCount && childCount > 0) {
      return NextResponse.json(
        { error: '該分類下有子分類，無法刪除' },
        { status: 400 }
      );
    }

    const { error } = await client
      .from('wiki_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除分类失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '分類已刪除' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
