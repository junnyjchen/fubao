/**
 * @fileoverview 视频分类详情API
 * @description 视频分类更新和删除功能
 * @module app/api/videos/categories/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取分类详情
 * GET /api/videos/categories/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('video_categories')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: '未找到該分類' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * 更新分类
 * PUT /api/videos/categories/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = {};

    const allowedFields = ['name', 'slug', 'description', 'icon', 'sort_order'];

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
      .from('video_categories')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新分类失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * 删除分类
 * DELETE /api/videos/categories/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('video_categories')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除分类失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '刪除成功',
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
