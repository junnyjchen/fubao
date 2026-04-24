/**
 * @fileoverview 视频分类API
 * @description 视频分类列表和新增功能
 * @module app/api/videos/categories/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取分类列表
 * GET /api/videos/categories
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('video_categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('查询视频分类列表失败:', error);
      return NextResponse.json({ data: [] });
    }

    // 获取每个分类的视频数量
    const categoriesWithCount = await Promise.all(
      (data || []).map(async (category) => {
        const { count } = await client
          .from('videos')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', category.id)
          .eq('is_published', true);

        return {
          ...category,
          video_count: count || 0,
        };
      })
    );

    return NextResponse.json({
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error('获取视频分类列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 创建新分类
 * POST /api/videos/categories
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { name, slug, description, icon, sort_order } = body;

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
      .from('video_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (existing) {
      categorySlug = `${categorySlug}-${Date.now()}`;
    }

    const { data, error } = await client
      .from('video_categories')
      .insert({
        name,
        slug: categorySlug,
        description: description || null,
        icon: icon || null,
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建视频分类失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '分類創建成功',
      data,
    });
  } catch (error) {
    console.error('创建视频分类失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
