/**
 * @fileoverview 订单API
 * @description 订单创建和管理 - MySQL 实现
 * @module app/api/orders/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate } from '@/lib/db';
import { verifyToken } from '@/lib/auth/utils';

/** 从请求获取用户ID */
function getUserId(request: NextRequest): number | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload?.userId) return parseInt(String(payload.userId));
  }
  return null;
}

/** 生成订单号 */
function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `FB${dateStr}${random}`;
}

/**
 * GET - 获取订单列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions: string[] = ['o.user_id = ?'];
    const params: unknown[] = [userId];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }

    const whereClause = conditions.join(' AND ');

    // 查询总数
    const totalRow = await queryOne<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM orders o WHERE ${whereClause}`,
      params
    );
    const total = totalRow?.cnt || 0;

    // 查询订单
    const orders = await query(
      `SELECT o.* FROM orders o WHERE ${whereClause} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    // 为每个订单查询商品项
    const ordersWithItems = [];
    for (const order of orders as any[]) {
      const items = await query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      ordersWithItems.push({ ...order, items });
    }

    return NextResponse.json({ data: ordersWithItems, total, page, page_size: pageSize });
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, page_size: 10 });
  }
}

/**
 * POST - 创建订单
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { address_id, items, remark } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    // 获取地址
    const address = await queryOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [address_id, userId]);
    if (!address) {
      return NextResponse.json({ error: '請選擇收貨地址' }, { status: 400 });
    }

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const goods = await queryOne('SELECT id, name, main_image, price, stock, status FROM goods WHERE id = ?', [item.goods_id]);
      if (!goods) {
        return NextResponse.json({ error: `商品ID ${item.goods_id} 不存在` }, { status: 404 });
      }
      if (!goods.status) {
        return NextResponse.json({ error: `商品「${goods.name}」已下架` }, { status: 400 });
      }
      if (item.quantity > goods.stock) {
        return NextResponse.json({ error: `商品「${goods.name}」庫存不足` }, { status: 400 });
      }

      const itemTotal = parseFloat(String(goods.price)) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        goods_id: goods.id,
        goods_name: goods.name,
        goods_image: goods.main_image,
        price: goods.price,
        quantity: item.quantity,
        total: itemTotal.toFixed(2),
      });
    }

    // 运费
    const shippingFee = totalAmount >= 99 ? 0 : 10;
    const payAmount = totalAmount + shippingFee;

    const orderNo = generateOrderNo();

    // 创建订单
    const orderId = await dbInsert('orders', {
      order_no: orderNo,
      user_id: userId,
      total_amount: totalAmount.toFixed(2),
      pay_amount: payAmount.toFixed(2),
      shipping_fee: shippingFee.toFixed(2),
      discount_amount: '0.00',
      status: 'pending',
      address_snapshot: JSON.stringify(address),
      remark: remark || null,
    });

    // 创建订单项
    for (const oi of orderItems) {
      await dbInsert('order_items', {
        order_id: orderId,
        goods_id: oi.goods_id,
        goods_name: oi.goods_name,
        goods_image: oi.goods_image,
        price: oi.price,
        quantity: oi.quantity,
        total: oi.total,
      });

      // 减库存、增销量 - 使用原始SQL
      await query('UPDATE goods SET stock = GREATEST(stock - ?, 0), sales = sales + ? WHERE id = ?', [oi.quantity, oi.quantity, oi.goods_id]);
    }

    // 清除已购买的购物车项
    for (const item of items) {
      try {
        const { remove: dbRemove } = await import('@/lib/db');
        await dbRemove('cart_items', { user_id: userId, goods_id: item.goods_id });
      } catch {
        // 忽略
      }
    }

    return NextResponse.json({
      data: { id: orderId, order_no: orderNo, total_amount: totalAmount, pay_amount: payAmount, status: 'pending' },
      message: '下單成功',
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '創建訂單失敗' }, { status: 500 });
  }
}
