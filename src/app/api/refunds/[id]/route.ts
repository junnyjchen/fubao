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

    const { data, error } = await client
      .from('refunds')
      .select(`
        *,
        order:orders (
          id,
          order_no,
          total_amount,
          pay_amount,
          items:order_items (
            goods_id,
            goods_name,
            goods_image,
            price,
            quantity
          )
        ),
        user:users (nickname, phone, email),
        merchant:merchants (name, logo)
      `)
      .eq('id', parseInt(id))
      .single();

    if (error) {
      console.error('查询售后详情失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

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
