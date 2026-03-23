/**
 * @fileoverview 视频详情API
 * @description 视频详情查询、更新和删除功能
 * @module app/api/videos/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取视频详情
 * GET /api/videos/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // 尝试通过ID或slug查找
    const isNumeric = !isNaN(parseInt(id));

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
        updated_at,
        category:video_categories(id, name, slug)
      `
      );

    if (isNumeric) {
      query = query.eq('id', parseInt(id));
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json(
        { error: '未找到該視頻' },
        { status: 404 }
      );
    }

    // 增加观看次数
    await client
      .from('videos')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', data.id);

    // 获取相关视频
    const { data: relatedVideos } = await client
      .from('videos')
      .select(
        `
        id,
        title,
        slug,
        cover_image,
        duration,
        author,
        view_count,
        category:video_categories(id, name)
      `
      )
      .eq('is_published', true)
      .neq('id', data.id)
      .order('view_count', { ascending: false })
      .limit(6);

    return NextResponse.json({
      data: {
        ...data,
        view_count: (data.view_count || 0) + 1,
      },
      related: relatedVideos || [],
    });
  } catch (error) {
    console.error('获取视频详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 更新视频
 * PUT /api/videos/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = {};

    const allowedFields = [
      'title',
      'slug',
      'category_id',
      'description',
      'cover_image',
      'video_url',
      'duration',
      'author',
      'author_avatar',
      'is_published',
      'is_featured',
      'tags',
      'sort_order',
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '沒有需要更新的內容' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('videos')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新视频失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('更新视频失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * 删除视频
 * DELETE /api/videos/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('videos')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除视频失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '刪除成功',
    });
  } catch (error) {
    console.error('删除视频失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
