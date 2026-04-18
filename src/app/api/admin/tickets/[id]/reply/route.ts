/**
 * @fileoverview 客服回复API
 * @description 客服回复工单
 * @module app/api/admin/tickets/[id]/reply/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * POST - 客服回复
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, images, resolve } = body;

    if (!content) {
      return NextResponse.json({ error: '請輸入回覆內容' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 添加客服回复
    const { error } = await client.from('ticket_replies').insert({
      ticket_id: parseInt(id),
      user_id: null,
      is_staff: true,
      content,
      images: images || [],
    });

    if (error) {
      console.error('添加回复失败:', error);
      return NextResponse.json({ error: '回覆失敗' }, { status: 500 });
    }

    // 更新工单状态
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (resolve) {
      updateData.status = 'resolved';
      updateData.resolved_at = new Date().toISOString();
    } else {
      updateData.status = 'processing';
    }

    await client
      .from('tickets')
      .update(updateData)
      .eq('id', parseInt(id));

    return NextResponse.json({ message: '回覆成功' });
  } catch (error) {
    console.error('客服回复失败:', error);
    return NextResponse.json({ error: '回覆失敗' }, { status: 500 });
  }
}
