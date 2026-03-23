/**
 * @fileoverview 视频列表API
 * @description 视频列表查询和新增功能
 * @module app/api/videos/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取视频列表
 * GET /api/videos
 * Query params: category_id, is_published, is_featured, limit, offset, search
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('category_id');
    const isPublished = searchParams.get('is_published');
    const isFeatured = searchParams.get('is_featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // 构建查询
    let query = client
      .from('videos')
      .select(
        `
        id,
        title,
        slug,
        description,
        cover_image,
        video_url,
        duration,
        author,
        author_avatar,
        view_count,
        like_count,
        is_published,
        is_featured,
        tags,
        sort_order,
        created_at,
        category:video_categories(id, name, slug)
      `,
        { count: 'exact' }
      )
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    // 应用过滤条件
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }

    if (isPublished !== null) {
      query = query.eq('is_published', isPublished === 'true');
    }

    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 分页
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('查询视频列表失败:', error);
      return NextResponse.json({ data: [], total: 0 });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('获取视频列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 创建新视频
 * POST /api/videos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const {
      title,
      slug,
      category_id,
      description,
      cover_image,
      video_url,
      duration,
      author,
      author_avatar,
      is_published,
      is_featured,
      tags,
      sort_order,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: '請填寫視頻標題' },
        { status: 400 }
      );
    }

    // 生成唯一slug
    let videoSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-|-$/g, '');

    // 检查slug是否已存在
    const { data: existing } = await client
      .from('videos')
      .select('id')
      .eq('slug', videoSlug)
      .single();

    if (existing) {
      videoSlug = `${videoSlug}-${Date.now()}`;
    }

    const { data, error } = await client
      .from('videos')
      .insert({
        title,
        slug: videoSlug,
        category_id: category_id || null,
        description: description || null,
        cover_image: cover_image || null,
        video_url: video_url || null,
        duration: duration || 0,
        author: author || '符寶網官方',
        author_avatar: author_avatar || null,
        is_published: is_published ?? false,
        is_featured: is_featured ?? false,
        tags: tags || [],
        sort_order: sort_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建视频失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '視頻創建成功',
      data,
    });
  } catch (error) {
    console.error('创建视频失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
