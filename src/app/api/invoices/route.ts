/* @ts-nocheck */
/**
 * @fileoverview 发票 API
 * @description 处理发票申请、查询、管理
 * @module app/api/invoices/route
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取当前用户ID
 * @returns 用户ID或null
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

/**
 * 生成发票号码
 * @returns 发票号码
 */
function generateInvoiceNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV${timestamp}${random}`;
}

/**
 * 获取发票列表
 * @param request - 请求对象
 * @returns 发票列表
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = client
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      page,
      limit,
      total: count || 0,
    });
  } catch (error) {
    console.error('获取发票列表失败:', error);
    return NextResponse.json({ error: '獲取發票列表失敗' }, { status: 500 });
  }
}

/**
 * 申请发票
 * @param request - 请求对象
 * @returns 申请结果
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const {
      order_id,
      invoice_type,
      title_type,
      title,
      tax_no,
      email,
      address,
      phone,
      bank_name,
      bank_account,
      remark,
    } = body;

    // 参数验证
    if (!order_id) {
      return NextResponse.json({ error: '請選擇訂單' }, { status: 400 });
    }

    if (!invoice_type || !['electronic', 'paper'].includes(invoice_type)) {
      return NextResponse.json({ error: '請選擇發票類型' }, { status: 400 });
    }

    if (!title_type || !['personal', 'company'].includes(title_type)) {
      return NextResponse.json({ error: '請選擇抬頭類型' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: '請填寫發票抬頭' }, { status: 400 });
    }

    if (title_type === 'company' && !tax_no) {
      return NextResponse.json({ error: '企業發票需填寫稅號' }, { status: 400 });
    }

    // 查询订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (order.pay_status !== 1) {
      return NextResponse.json({ error: '訂單未支付，無法開具發票' }, { status: 400 });
    }

    // 检查是否已开票
    const { data: existingInvoice } = await client
      .from('invoices')
      .select('*')
      .eq('order_id', order_id)
      .eq('status', 'issued')
      .single();

    if (existingInvoice) {
      return NextResponse.json({ error: '該訂單已開具發票' }, { status: 400 });
    }

    // 生成发票号码
    const invoiceNo = generateInvoiceNo();

    // 创建发票
    const { data: invoice, error } = await client
      .from('invoices')
      .insert({
        invoice_no: invoiceNo,
        order_id,
        user_id: userId,
        invoice_type,
        title_type,
        title,
        tax_no: tax_no || null,
        amount: order.pay_amount,
        status: 'pending',
        email: email || null,
        address: address || null,
        phone: phone || null,
        bank_name: bank_name || null,
        bank_account: bank_account || null,
        remark: remark || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '申請發票失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '發票申請成功',
      data: invoice,
    });
  } catch (error) {
    console.error('申请发票失败:', error);
    return NextResponse.json({ error: '申請發票失敗' }, { status: 500 });
  }
}
