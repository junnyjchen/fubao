/* @ts-nocheck */
/**
 * @fileoverview 视频列表API
 * @description 视频列表查询和新增功能
 * @module app/api/videos/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface VideoRecord {
  id: number;
  title: string;
  slug: string;
  cover: string | null;
  url: string;
  duration: number;
  category_id: number | null;
  author: string;
  views: number;
  likes: number;
  is_featured: boolean;
  status: boolean;
  sort: number;
  published_at: string | null;
  created_at: string;
  category?: { id: number; name: string; slug: string } | null;
}

/**
 * 获取视频列表
 * GET /api/videos
 * Query params: category_id, status, is_featured, limit, offset, search
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
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
        cover,
        url,
        duration,
        category_id,
        author,
        views,
        likes,
        is_featured,
        status,
        sort,
        published_at,
        created_at
      `,
        { count: 'exact' }
      );

    // 只查询已发布的视频
    query = query.eq('status', true);

    // 应用过滤条件
    if (categoryId) {
      query = query.eq('category_id', parseInt(categoryId));
    }

    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured === 'true');
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // 排序和分页
    query = query
      .order('is_featured', { ascending: false })
      .order('sort', { ascending: true })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('查询视频列表失败:', error);
      return NextResponse.json({ data: [], total: 0 });
    }

    // 获取分类信息
    if (data && data.length > 0) {
      const categoryIds = [...new Set(data.map(v => v.category_id).filter(Boolean))];
      if (categoryIds.length > 0) {
        const { data: categories } = await client
          .from('video_categories')
          .select('id, name, slug')
          .in('id', categoryIds);
        
        const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
        data.forEach((video: VideoRecord) => {
          video.category = categoryMap.get(video.category_id) || null;
        });
      }
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
