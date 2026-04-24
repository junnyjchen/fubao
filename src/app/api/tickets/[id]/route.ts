/**
 * @fileoverview 工单详情API
 * @description 查看工单详情和回复
 * @module app/api/tickets/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取工单详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // 获取工单信息
    const { data: ticket, error } = await client
      .from('tickets')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: '工單不存在' }, { status: 404 });
    }

    // 获取回复列表
    const { data: replies } = await client
      .from('ticket_replies')
      .select('*')
      .eq('ticket_id', parseInt(id))
      .order('created_at', { ascending: true });

    return NextResponse.json({
      data: {
        ...ticket,
        replies: replies || [],
      },
    });
  } catch (error) {
    console.error('获取工单详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 回复工单
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_id, content, images } = body;

    if (!content) {
      return NextResponse.json({ error: '請輸入回覆內容' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 添加回复
    const { error } = await client.from('ticket_replies').insert({
      ticket_id: parseInt(id),
      user_id: user_id ? parseInt(user_id) : null,
      is_staff: false,
      content,
      images: images || [],
    });

    if (error) {
      console.error('添加回复失败:', error);
      return NextResponse.json({ error: '回覆失敗' }, { status: 500 });
    }

    // 更新工单状态
    await client
      .from('tickets')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id));

    return NextResponse.json({ message: '回覆成功' });
  } catch (error) {
    console.error('回复工单失败:', error);
    return NextResponse.json({ error: '回覆失敗' }, { status: 500 });
  }
}
