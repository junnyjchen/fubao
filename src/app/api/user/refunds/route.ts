/**
 * @fileoverview 用户售后API
 * @description 申请和管理售后
 * @module app/api/user/refunds/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取用户售后列表
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
      .from('refunds')
      .select(`
        id,
        order_id,
        type,
        reason,
        description,
        images,
        amount,
        status,
        merchant_reply,
        tracking_number,
        tracking_company,
        created_at,
        processed_at,
        completed_at,
        order:orders (order_no)
      `, { count: 'exact' })
      .eq('user_id', parseInt(userId));

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询售后失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({
      data,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取售后列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 申请售后
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, user_id, merchant_id, type, reason, description, images, amount } = body;

    if (!order_id || !type || !reason) {
      return NextResponse.json(
        { error: '請填寫完整信息' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查订单状态
    const { data: order } = await client
      .from('orders')
      .select('order_status, pay_status, user_id')
      .eq('id', order_id)
      .single();

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 400 });
    }

    if (order.order_status === 4) {
      return NextResponse.json({ error: '訂單已取消' }, { status: 400 });
    }

    // 检查是否已申请售后
    const { data: existingRefund } = await client
      .from('refunds')
      .select('id')
      .eq('order_id', order_id)
      .in('status', ['pending', 'processing', 'approved'])
      .single();

    if (existingRefund) {
      return NextResponse.json({ error: '該訂單已有進行中的售後申請' }, { status: 400 });
    }

    // 创建售后申请
    const { data, error } = await client
      .from('refunds')
      .insert({
        order_id,
        user_id: user_id || 1,
        merchant_id: merchant_id || 1,
        type,
        reason,
        description: description || null,
        images: images || null,
        amount: amount || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('创建售后失败:', error);
      return NextResponse.json({ error: '申請失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '申請成功',
      data,
    });
  } catch (error) {
    console.error('申请售后失败:', error);
    return NextResponse.json({ error: '申請失敗' }, { status: 500 });
  }
}
