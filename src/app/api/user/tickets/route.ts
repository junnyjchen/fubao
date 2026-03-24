/**
 * @fileoverview 用户工单API
 * @description 用户提交和查询工单
 * @module app/api/user/tickets/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 工单类型 */
const TICKET_TYPES = ['訂單問題', '商品諮詢', '售後投訴', '賬戶問題', '其他'];

/** 工单状态 */
const TICKET_STATUS: Record<string, string> = {
  pending: '待處理',
  processing: '處理中',
  resolved: '已解決',
  closed: '已關閉',
};

/** 工单优先级 */
const TICKET_PRIORITY: Record<string, string> = {
  low: '低',
  normal: '普通',
  high: '高',
  urgent: '緊急',
};

/**
 * GET - 获取工单列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const client = getSupabaseClient();

    let query = client
      .from('tickets')
      .select('*', { count: 'exact' })
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('查询工单失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // 转换状态显示
    const tickets = data?.map((ticket) => ({
      ...ticket,
      status_text: TICKET_STATUS[ticket.status] || ticket.status,
      priority_text: TICKET_PRIORITY[ticket.priority] || ticket.priority,
    }));

    return NextResponse.json({
      data: tickets,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取工单列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 创建工单
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, type, priority, content, images } = body;

    // 验证
    if (!user_id || !title || !type || !content) {
      return NextResponse.json({ error: '請填寫完整信息' }, { status: 400 });
    }

    if (!TICKET_TYPES.includes(type)) {
      return NextResponse.json({ error: '無效的工單類型' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 创建工单
    const { data, error } = await client
      .from('tickets')
      .insert({
        user_id: parseInt(user_id),
        title,
        type,
        priority: priority || 'normal',
        content,
        images: images || [],
      })
      .select()
      .single();

    if (error) {
      console.error('创建工单失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '工單已提交',
      data,
    });
  } catch (error) {
    console.error('创建工单失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}
