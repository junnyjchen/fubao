/**
 * @fileoverview 管理后台订单列表API
 * @description 获取订单列表和统计数据
 * @module app/api/admin/orders/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');

    const offset = (page - 1) * limit;

    const client = getSupabaseClient();
    
    // 构建查询
    let query = client
      .from('orders')
      .select(`
        id,
        order_no,
        status,
        payment_status,
        shipping_status,
        total_amount,
        shipping_fee,
        discount_amount,
        payment_method,
        shipping_address,
        shipping_name,
        shipping_phone,
        tracking_no,
        remark,
        created_at,
        paid_at,
        shipped_at,
        user:users (
          id,
          nickname,
          email
        )
      `, { count: 'exact' });

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 关键词搜索
    if (keyword) {
      query = query.or(`order_no.ilike.%${keyword}%,shipping_name.ilike.%${keyword}%`);
    }

    // 排序和分页
    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('查询订单失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    // 获取订单商品
    const orderIds = orders?.map(o => o.id) || [];
    const { data: orderItems } = await client
      .from('order_items')
      .select(`
        id,
        order_id,
        goods_name,
        quantity,
        price,
        goods_id
      `)
      .in('order_id', orderIds);

    // 组装数据
    const ordersWithItems = orders?.map(order => ({
      ...order,
      items: orderItems?.filter(item => item.order_id === order.id) || [],
    }));

    return NextResponse.json({
      orders: ordersWithItems,
      total: count,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
