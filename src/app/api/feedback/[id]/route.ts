/**
 * @fileoverview 反馈详情API
 * @description 更新反馈状态和回复
 * @module app/api/feedback/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { DbRecord } from '@/types/common';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT - 更新反馈状态（后台处理）
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reply } = body;

    const client = getSupabaseClient();

    const updateData: DbRecord = {};
    if (status) updateData.status = status;
    if (reply) updateData.reply = reply;
    if (reply) updateData.reply_time = new Date().toISOString();

    const { data, error } = await client
      .from('feedback')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新反馈失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('更新反馈失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除反馈
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const client = getSupabaseClient();

    const { error } = await client
      .from('feedback')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除反馈失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除反馈失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
