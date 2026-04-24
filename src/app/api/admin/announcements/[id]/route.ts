/**
 * @fileoverview 后台公告详情API
 * @description 更新和删除公告
 * @module app/api/admin/announcements/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { DbRecord } from '@/types/common';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT - 更新公告
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const client = getSupabaseClient();

    // 构建更新数据
    const updateData: DbRecord = {};
    
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content.trim();
    if (body.type !== undefined) updateData.type = body.type;
    if (body.is_pinned !== undefined) updateData.is_pinned = body.is_pinned;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.start_time !== undefined) updateData.start_time = body.start_time || null;
    if (body.end_time !== undefined) updateData.end_time = body.end_time || null;

    const { data, error } = await client
      .from('announcements')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新公告失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('更新公告失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除公告
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const client = getSupabaseClient();

    const { error } = await client
      .from('announcements')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除公告失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除公告失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
