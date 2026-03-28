/**
 * @fileoverview 售后详情API
 * @description 查看和更新售后状态
 * @module app/api/refunds/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - 获取售后详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const client = getSupabaseClient();

    // 先查询售后基本信息
    const { data: refund, error: refundError } = await client
      .from('refunds')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (refundError || !refund) {
      console.error('查询售后详情失败:', refundError);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // 分开查询关联数据
    const [orderResult, userResult, merchantResult] = await Promise.all([
      // 查询订单信息
      client
        .from('orders')
        .select('id, order_no, total_amount, pay_amount')
        .eq('id', refund.order_id)
        .single(),
      // 查询用户信息
      client
        .from('users')
        .select('nickname, phone, email')
        .eq('id', refund.user_id)
        .single(),
      // 查询商户信息
      client
        .from('merchants')
        .select('name, logo')
        .eq('id', refund.merchant_id)
        .single(),
    ]);

    // 查询订单项
    let orderItems: any[] = [];
    if (orderResult.data) {
      const { data: items } = await client
        .from('order_items')
        .select('goods_id, goods_name, goods_image, price, quantity')
        .eq('order_id', refund.order_id);
      orderItems = items || [];
    }

    // 合并数据
    const data = {
      ...refund,
      order: orderResult.data ? {
        ...orderResult.data,
        items: orderItems,
      } : null,
      user: userResult.data || null,
      merchant: merchantResult.data || null,
    };

    return NextResponse.json({ data });
  } catch (error) {
    console.error('获取售后详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新售后状态
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, merchant_reply, admin_reply, tracking_number, tracking_company } = body;

    const client = getSupabaseClient();

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (merchant_reply) updateData.merchant_reply = merchant_reply;
    if (admin_reply) updateData.admin_reply = admin_reply;
    if (tracking_number) updateData.tracking_number = tracking_number;
    if (tracking_company) updateData.tracking_company = tracking_company;

    if (status === 'approved' || status === 'rejected') {
      updateData.processed_at = new Date().toISOString();
    }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await client
      .from('refunds')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新售后失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '更新成功',
      data,
    });
  } catch (error) {
    console.error('更新售后失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
