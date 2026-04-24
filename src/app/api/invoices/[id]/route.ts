/**
 * @fileoverview 发票详情 API
 * @description 处理单个发票的查询和更新
 * @module app/api/invoices/[id]/route
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取当前用户ID
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return token ? verifyToken(token)?.userId || null : null;
  } catch {
    return null;
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取发票详情
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { id } = await params;

    const { data: invoice, error } = await client
      .from('invoices')
      .select(`
        *,
        orders (
          id,
          order_no,
          pay_amount,
          created_at
        )
      `)
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ error: '發票不存在' }, { status: 404 });
    }

    return NextResponse.json({ data: invoice });
  } catch (error) {
    console.error('获取发票详情失败:', error);
    return NextResponse.json({ error: '獲取發票詳情失敗' }, { status: 500 });
  }
}

/**
 * 取消发票申请
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const client = getSupabaseClient();
    const userId = await getCurrentUserId();
    
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { id } = await params;

    const { data: invoice, error: fetchError } = await client
      .from('invoices')
      .select('*')
      .eq('id', parseInt(id))
      .eq('user_id', userId)
      .single();

    if (fetchError || !invoice) {
      return NextResponse.json({ error: '發票不存在' }, { status: 404 });
    }

    if (invoice.status === 'issued') {
      return NextResponse.json({ error: '已開具的發票無法取消' }, { status: 400 });
    }

    const { error } = await client
      .from('invoices')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: '取消失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '已取消發票申請' });
  } catch (error) {
    console.error('取消发票失败:', error);
    return NextResponse.json({ error: '取消失敗' }, { status: 500 });
  }
}
