/**
 * @fileoverview 商户订单API路由
 * @description 商户订单的查询、管理接口，支持数据隔离
 * @module app/api/merchant/orders/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

// 验证商户身份中间件
async function verifyMerchant(request: NextRequest): Promise<{ userId: string; merchantId: string } | null> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('id, user_id')
      .eq('user_id', decoded.userId)
      .eq('status', 1)
      .single();

    if (error || !merchant) {
      return null;
    }

    return { userId: decoded.userId, merchantId: merchant.id };
  } catch {
    return null;
  }
}

/**
 * GET /api/merchant/orders - 获取商户订单列表
 */
export async function GET(request: NextRequest) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const orderNo = searchParams.get('orderNo') || '';
  const status = searchParams.get('status');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    // 查询商户商品ID列表
    const { data: goodsIds, error: goodsError } = await supabase
      .from('goods')
      .select('id')
      .eq('merchant_id', merchant.merchantId);

    if (goodsError) {
      console.error('获取商品列表失败:', goodsError);
      return NextResponse.json({ error: '獲取訂單失敗' }, { status: 500 });
    }

    const goodsIdList = goodsIds?.map((g: { id: number }) => g.id) || [];
    if (goodsIdList.length === 0) {
      return NextResponse.json({
        success: true,
        data: { list: [], total: 0, page, pageSize },
      });
    }

    // 查询订单项（通过商品ID关联）
    let orderItemsQuery = supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        goods_id,
        goods_name,
        goods_image,
        price,
        quantity,
        total_price,
        goods (id, merchant_id)
      `)
      .in('goods_id', goodsIdList);

    // 获取订单ID列表
    const { data: orderItems, error: itemsError } = await orderItemsQuery;

    if (itemsError) {
      console.error('获取订单项失败:', itemsError);
      return NextResponse.json({ error: '獲取訂單失敗' }, { status: 500 });
    }

    const orderIds = [...new Set(orderItems?.map((item: { order_id: number }) => item.order_id) || [])];

    if (orderIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { list: [], total: 0, page, pageSize },
      });
    }

    // 构建订单查询
    let ordersQuery = supabase
      .from('orders')
      .select(`
        id,
        order_no,
        user_id,
        total_amount,
        pay_amount,
        pay_type,
        status,
        pay_time,
        ship_time,
        receive_time,
        created_at,
        users (id, nickname, phone, email)
      `, { count: 'exact' })
      .in('id', orderIds);

    // 订单号搜索
    if (orderNo) {
      ordersQuery = ordersQuery.ilike('order_no', `%${orderNo}%`);
    }

    // 状态筛选
    if (status !== null && status !== undefined) {
      ordersQuery = ordersQuery.eq('status', parseInt(status));
    }

    // 日期范围
    if (startDate) {
      ordersQuery = ordersQuery.gte('created_at', startDate);
    }
    if (endDate) {
      ordersQuery = ordersQuery.lte('created_at', endDate + ' 23:59:59');
    }

    // 排序和分页
    const { data: orders, error: ordersError, count } = await ordersQuery
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (ordersError) {
      console.error('获取订单列表失败:', ordersError);
      return NextResponse.json({ error: '獲取訂單失敗' }, { status: 500 });
    }

    // 组装数据：为每个订单添加商品项
    const orderItemsMap: Record<number, typeof orderItems> = {};
    orderItems?.forEach((item: any) => {
      if (!orderItemsMap[item.order_id]) {
        orderItemsMap[item.order_id] = [];
      }
      orderItemsMap[item.order_id].push(item);
    });

    const list = (orders || []).map((order: any) => ({
      ...order,
      items: orderItemsMap[order.id] || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        list,
        total: count || 0,
        page,
        pageSize,
      },
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
