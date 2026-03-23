/**
 * @fileoverview 分类 API
 * @description 处理分类的增删改查
 * @module app/api/categories/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取分类列表
 */
export async function GET() {
  try {
    const client = getSupabaseClient();

    const { data: categories, error } = await client
      .from('categories')
      .select('*')
      .order('sort', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: categories || [] });
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '獲取分類失敗' }, { status: 500 });
  }
}

/**
 * 创建分类
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { name, slug, parentId, icon, sort, status } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: '請填寫分類名稱和別名' }, { status: 400 });
    }

    const { data, error } = await client
      .from('categories')
      .insert({
        name,
        slug,
        parent_id: parentId || null,
        icon: icon || null,
        sort: sort || 0,
        status: status !== undefined ? status : true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '創建分類失敗' }, { status: 500 });
  }
}

/**
 * 更新分类
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, name, slug, parentId, icon, sort, status } = body;

    if (!id) {
      return NextResponse.json({ error: '分類ID不能為空' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (parentId !== undefined) updateData.parent_id = parentId;
    if (icon !== undefined) updateData.icon = icon;
    if (sort !== undefined) updateData.sort = sort;
    if (status !== undefined) updateData.status = status;

    const { error } = await client
      .from('categories')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新分類失敗' }, { status: 500 });
  }
}

/**
 * 删除分类
 */
export async function DELETE(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '分類ID不能為空' }, { status: 400 });
    }

    // 检查是否有子分类
    const { data: children } = await client
      .from('categories')
      .select('id')
      .eq('parent_id', parseInt(id));

    if (children && children.length > 0) {
      return NextResponse.json({ error: '該分類下有子分類，無法刪除' }, { status: 400 });
    }

    // 检查是否有商品
    const { data: goods } = await client
      .from('goods')
      .select('id')
      .eq('category_id', parseInt(id))
      .limit(1);

    if (goods && goods.length > 0) {
      return NextResponse.json({ error: '該分類下有商品，無法刪除' }, { status: 400 });
    }

    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '刪除分類失敗' }, { status: 500 });
  }
}
