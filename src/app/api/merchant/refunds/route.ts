/**
 * @fileoverview 商户售后API
 * @description 商户处理售后申请
 * @module app/api/merchant/refunds/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取商户售后列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id') || '1'; // TODO: 从认证获取
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
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
        tracking_number,
        tracking_company,
        created_at,
        processed_at,
        order:orders (order_no),
        user:users (nickname, phone, avatar)
      `, { count: 'exact' })
      .eq('merchant_id', parseInt(merchantId));

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
    console.error('获取商户售后列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
