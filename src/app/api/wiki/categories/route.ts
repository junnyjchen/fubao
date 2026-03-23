/**
 * @fileoverview 百科分类API
 * @description 百科分类列表和新增功能
 * @module app/api/wiki/categories/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取分类列表
 * GET /api/wiki/categories
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('wiki_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('查询分类列表失败:', error);
      // 如果表不存在或查询失败，返回空数据
      return NextResponse.json({ data: [] });
    }

    // 获取每个分类的文章数量
    const categoriesWithCount = await Promise.all(
      (data || []).map(async (category) => {
        const { count } = await client
          .from('wiki_articles')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id);

        return {
          ...category,
          article_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 创建新分类
 * POST /api/wiki/categories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { name, slug, description, parent_id, sort_order } = body;

    // 验证必填字段
    if (!name) {
      return NextResponse.json(
        { error: '請填寫分類名稱' },
        { status: 400 }
      );
    }

    // 生成唯一slug
    let categorySlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');

    // 检查slug是否已存在
    const { data: existing } = await client
      .from('wiki_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (existing) {
      categorySlug = `${categorySlug}-${Date.now()}`;
    }

    // 插入分类
    const { data, error } = await client
      .from('wiki_categories')
      .insert({
        name,
        slug: categorySlug,
        description: description || null,
        parent_id: parent_id || null,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建分类失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '分類創建成功',
      data,
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
