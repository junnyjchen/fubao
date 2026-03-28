/**
 * @fileoverview 待评价订单API
 * @description 获取用户已完成但未评价的订单商品
 * @module app/api/user/reviews/pending/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface OrderItem {
  goods_id: number;
  goods_name: string;
  goods_image: string | null;
  price: number;
  quantity: number;
}

interface OrderRecord {
  id: number;
  order_no: string;
  created_at: string;
  items?: OrderItem[];
}

interface ReviewRecord {
  order_id: number;
  goods_id: number;
}

/**
 * GET - 获取待评价的订单商品
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取

    const client = getSupabaseClient();

    // 查询已完成的订单
    const { data: orders, error: ordersError } = await client
      .from('orders')
      .select(`
        id,
        order_no,
        created_at,
        items:order_items (
          goods_id,
          goods_name,
          goods_image,
          price,
          quantity
        )
      `)
      .eq('user_id', parseInt(userId))
      .eq('order_status', 3) // 已完成
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('查询订单失败:', ordersError);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 获取已评价的订单商品
    const orderIds = orders.map((o: OrderRecord) => o.id);
    const { data: reviewedItems } = await client
      .from('reviews')
      .select('order_id, goods_id')
      .in('order_id', orderIds)
      .eq('user_id', parseInt(userId));

    // 创建已评价集合
    const reviewedSet = new Set(
      reviewedItems?.map((r: ReviewRecord) => `${r.order_id}-${r.goods_id}`) || []
    );

    // 筛选未评价的商品
    const pendingItems: Array<{
      order_id: number;
      order_no: string;
      goods_id: number;
      goods_name: string;
      goods_image: string | null;
      price: number;
      quantity: number;
      order_time: string;
    }> = [];
    orders.forEach((order: OrderRecord) => {
      order.items?.forEach((item: OrderItem) => {
        const key = `${order.id}-${item.goods_id}`;
        if (!reviewedSet.has(key)) {
          pendingItems.push({
            order_id: order.id,
            order_no: order.order_no,
            goods_id: item.goods_id,
            goods_name: item.goods_name,
            goods_image: item.goods_image,
            price: item.price,
            quantity: item.quantity,
            order_time: order.created_at,
          });
        }
      });
    });

    return NextResponse.json({ data: pendingItems });
  } catch (error) {
    console.error('获取待评价商品失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}
