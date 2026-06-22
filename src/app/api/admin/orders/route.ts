/**
 * @fileoverview 管理后台订单列表API - MySQL 实现
 * @module app/api/admin/orders/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count, update as dbUpdate } from '@/lib/db';

/**
 * GET - 获取订单列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status && status !== 'all') {
      conditions.push('o.status = ?');
      params.push(status);
    }

    if (keyword) {
      conditions.push('(o.order_no LIKE ? OR o.remark LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = await count('orders o', conditions.length > 0 ? conditions.join(' AND ') : '1=1', params);

    const orders = await query(
      `SELECT o.*, u.nickname as user_nickname, u.email as user_email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ${whereClause} 
       ORDER BY o.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // 获取订单项
    const orderIds = orders.map((o: Record<string, unknown>) => o.id);
    let orderItems: Record<string, unknown>[] = [];
    if (orderIds.length > 0) {
      orderItems = await query(
        `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`,
        orderIds
      );
    }

    // 组装数据
    const data = orders.map((order: Record<string, unknown>) => ({
      ...order,
      items: orderItems.filter((item: Record<string, unknown>) => item.order_id === order.id),
    }));

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, limit: 10 });
  }
}

/**
 * PUT - 更新订单
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, tracking_no, remark } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少訂單ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'shipped') updateData.shipped_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      if (status === 'delivered') updateData.delivered_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    if (tracking_no !== undefined) updateData.payment_no = tracking_no;
    if (remark !== undefined) updateData.remark = remark;

    await dbUpdate('orders', updateData, { id });

    return NextResponse.json({ success: true, message: '訂單更新成功' });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新訂單失敗' }, { status: 500 });
  }
}
