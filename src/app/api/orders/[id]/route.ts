/**
 * @fileoverview 订单详情 API - MySQL 实现
 * @module app/api/orders/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, update as dbUpdate } from '@/lib/db';
import { verifyToken } from '@/lib/auth/utils';

function getUserId(request: NextRequest): number | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload?.userId) return parseInt(String(payload.userId));
  }
  return null;
}

/**
 * GET - 获取订单详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserId(request);

    const order = await queryOne(
      'SELECT * FROM orders WHERE id = ?' + (userId ? ' AND user_id = ?' : ''),
      userId ? [id, userId] : [id]
    );

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 获取订单项
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [id]);

    // 解析地址快照
    let address = null;
    if (order.address_snapshot) {
      try {
        address = typeof order.address_snapshot === 'string'
          ? JSON.parse(order.address_snapshot)
          : order.address_snapshot;
      } catch {
        address = null;
      }
    }

    return NextResponse.json({
      data: {
        ...order,
        items,
        address,
      },
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json({ error: '獲取訂單詳情失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新订单（取消、确认收货等）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserId(request);
    const body = await request.json();

    const order = await queryOne(
      'SELECT * FROM orders WHERE id = ?' + (userId ? ' AND user_id = ?' : ''),
      userId ? [id, userId] : [id]
    );

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'cancelled') updateData.updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
      if (body.status === 'delivered') updateData.delivered_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    if (body.remark !== undefined) updateData.remark = body.remark;

    await dbUpdate('orders', updateData, { id: parseInt(id) });

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
