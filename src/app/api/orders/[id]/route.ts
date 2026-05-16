/* @ts-nocheck */
/**
 * @fileoverview 订单详情 API
 * @description 处理单个订单的查询和更新 - 支持本地模式
 */

import { NextRequest, NextResponse } from 'next/server';

const getMockOrders = () => globalThis.mockOrders || [];

function getUserId(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.userId) return payload.userId;
      }
    } catch (e) {}
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
    const orders = getMockOrders();

    const order = orders.find(o => o.id === parseInt(id));

    if (!order) {
      // 返回一个默认订单
      return NextResponse.json({
        data: {
          id: parseInt(id),
          order_no: `FX${id}`,
          status: 'pending',
          total_amount: 0,
          items: [],
          address: { name: '默認地址', phone: '', detail: '' },
          remark: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json({ error: '獲取訂單詳情失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新订单
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const orders = getMockOrders();
    const order = orders.find(o => o.id === parseInt(id));

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    Object.assign(order, body, { updated_at: new Date().toISOString() });

    return NextResponse.json({ message: '更新成功', data: order });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
