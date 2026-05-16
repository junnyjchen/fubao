/* @ts-nocheck */
/**
 * @fileoverview 订单API
 * @description 订单创建和管理 - 支持本地模式
 */

import { NextRequest, NextResponse } from 'next/server';

// 本地模式订单存储
const getMockOrders = () => {
  if (!globalThis.mockOrders) {
    globalThis.mockOrders = [];
  }
  return globalThis.mockOrders;
};

const getMockCart = () => globalThis.mockCart || [];
const getMockGoods = () => globalThis.mockGoods || [];

function getUserId(request?: NextRequest, body?: any) {
  if (request) {
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
  }
  if (body?.user_id) return body.user_id;
  return 1;
}

/**
 * GET - 获取订单列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');

    const orders = getMockOrders();
    const goods = getMockGoods();

    // 过滤当前用户的订单
    let userOrders = orders.filter(o => o.user_id === userId);
    if (status) {
      userOrders = userOrders.filter(o => o.status === status);
    }

    // 分页
    const total = userOrders.length;
    const start = (page - 1) * pageSize;
    const pagedOrders = userOrders.slice(start, start + pageSize);

    return NextResponse.json({
      data: pagedOrders,
      total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, page_size: 10 });
  }
}

/**
 * POST - 创建订单（从购物车结算）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserId(request, body);
    const { address_id, items, remark } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    const orders = getMockOrders();
    const goods = getMockGoods();
    const cart = getMockCart();

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const g = goods.find(g => g.id === item.goods_id);
      if (!g) {
        return NextResponse.json({ error: `商品ID ${item.goods_id} 不存在` }, { status: 404 });
      }
      if (!g.status) {
        return NextResponse.json({ error: `商品「${g.name}」已下架` }, { status: 400 });
      }
      if (item.quantity > g.stock) {
        return NextResponse.json({ error: `商品「${g.name}」庫存不足` }, { status: 400 });
      }

      const itemTotal = g.price * item.quantity;
      totalAmount += itemTotal;
      orderItems.push({
        goods_id: g.id,
        goods_name: g.name,
        price: g.price,
        quantity: item.quantity,
        image: g.images?.[0] || null,
        total: itemTotal,
      });

      // 减库存
      g.stock -= item.quantity;
    }

    // 创建订单
    const order = {
      id: Date.now(),
      order_no: `FX${Date.now()}${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      status: 'pending',
      total_amount: totalAmount,
      items: orderItems,
      address_id: address_id || 1,
      remark: remark || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    orders.unshift(order);

    // 从购物车中移除已购买的商品
    for (const item of items) {
      const idx = cart.findIndex(c => c.user_id === userId && c.goods_id === item.goods_id);
      if (idx !== -1) {
        cart.splice(idx, 1);
      }
    }

    return NextResponse.json({
      message: '下單成功',
      data: order,
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '下單失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新订单状态
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, status } = body;

    if (!order_id) {
      return NextResponse.json({ error: '請提供訂單ID' }, { status: 400 });
    }

    const orders = getMockOrders();
    const order = orders.find(o => o.id === order_id);

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    order.status = status || order.status;
    order.updated_at = new Date().toISOString();

    return NextResponse.json({ message: '更新成功', data: order });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 取消订单
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ error: '請提供訂單ID' }, { status: 400 });
    }

    const orders = getMockOrders();
    const order = orders.find(o => o.id === parseInt(orderId));

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();

    return NextResponse.json({ message: '訂單已取消' });
  } catch (error) {
    console.error('取消订单失败:', error);
    return NextResponse.json({ error: '取消失敗' }, { status: 500 });
  }
}
