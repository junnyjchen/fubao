import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate, count, remove as dbRemove } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/apiAuth';

function generateOrderNo() {
  const now = new Date();
  const ts = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FB${ts}${rand}`;
}

/**
 * GET - 查询订单列表
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    const userId = authUser.userId;
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * pageSize;

    let whereClause = 'user_id = ?';
    const params: any[] = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const totalRow = await queryOne(
      `SELECT COUNT(*) as cnt FROM orders WHERE ${whereClause}`,
      params
    );
    const total = totalRow?.cnt || 0;

    const orders = await query(
      `SELECT * FROM orders WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

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
 * 支持两种模式：
 * 1. items: [{goods_id, quantity}] - 直接指定商品
 * 2. cart_item_ids: [id1, id2] - 从购物车选择
 * 3. goods_id + quantity - 单商品直接购买
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    const userId = authUser.userId;
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { address_id, items, cart_item_ids, goods_id, quantity, remark, payment_method } = body;

    // 解析购买商品列表
    let orderItemsInput: Array<{ goods_id: number; quantity: number }> = [];

    if (items && Array.isArray(items) && items.length > 0) {
      // 模式1: 直接传 items
      orderItemsInput = items;
    } else if (cart_item_ids && Array.isArray(cart_item_ids) && cart_item_ids.length > 0) {
      // 模式2: 从购物车获取
      for (const cid of cart_item_ids) {
        const cartItem = await queryOne('SELECT * FROM cart_items WHERE id = ? AND user_id = ?', [cid, userId]) as any;
        if (cartItem) {
          orderItemsInput.push({ goods_id: cartItem.goods_id, quantity: cartItem.quantity });
        }
      }
    } else if (goods_id) {
      // 模式3: 单商品直接购买
      orderItemsInput = [{ goods_id: Number(goods_id), quantity: Number(quantity) || 1 }];
    }

    if (orderItemsInput.length === 0) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    // 获取地址 - 如果没有传address_id，尝试获取默认地址
    let address: any = null;
    if (address_id) {
      address = await queryOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [address_id, userId]);
    }
    if (!address) {
      address = await queryOne('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC LIMIT 1', [userId]);
    }
    if (!address) {
      // 自动创建一个默认地址
      const addrId = await dbInsert('addresses', {
        user_id: userId,
        name: '默認收件人',
        phone: '0000000000',
        province: '香港',
        city: '九龍',
        district: '觀塘區',
        address: '請補充詳細地址',
        is_default: 1,
      });
      address = await queryOne('SELECT * FROM addresses WHERE id = ?', [addrId]);
    }

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of orderItemsInput) {
      const goods = await queryOne('SELECT id, name, main_image, price, stock, status FROM goods WHERE id = ?', [item.goods_id]) as any;
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

      // 减库存、增销量
      await query('UPDATE goods SET stock = GREATEST(stock - ?, 0), sales = sales + ? WHERE id = ?', [oi.quantity, oi.quantity, oi.goods_id]);
    }

    // 清除已购买的购物车项
    if (cart_item_ids && Array.isArray(cart_item_ids)) {
      for (const cid of cart_item_ids) {
        try {
          await dbRemove('cart_items', { id: cid, user_id: userId });
        } catch {
          // 忽略
        }
      }
    } else {
      // 按商品ID清除购物车
      for (const item of orderItemsInput) {
        try {
          await dbRemove('cart_items', { user_id: userId, goods_id: item.goods_id });
        } catch {
          // 忽略
        }
      }
    }

    return NextResponse.json({
      data: {
        id: orderId,
        order_no: orderNo,
        total_amount: totalAmount.toFixed(2),
        pay_amount: payAmount.toFixed(2),
        shipping_fee: shippingFee.toFixed(2),
        status: 'pending',
        payment_method: payment_method || 'alipay',
      },
      message: '下單成功',
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '創建訂單失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新订单状态
 */
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }
    const userId = authUser.userId;
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, status, cancel_reason } = body;

    if (!order_id) {
      return NextResponse.json({ error: '缺少訂單ID' }, { status: 400 });
    }

    const order = await queryOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [order_id, userId]) as any;
    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (status === 'cancelled') {
      // 取消订单 - 恢复库存
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [order_id]) as any[];
      for (const item of items) {
        await query('UPDATE goods SET stock = stock + ?, sales = GREATEST(sales - ?, 0) WHERE id = ?', [item.quantity, item.quantity, item.goods_id]);
      }
      await dbUpdate('orders', order_id, {
        status: 'cancelled',
        cancel_reason: cancel_reason || '用戶取消',
        cancelled_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
      return NextResponse.json({ message: '訂單已取消' });
    }

    if (status === 'confirmed') {
      await dbUpdate('orders', order_id, {
        status: 'confirmed',
        confirmed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
      return NextResponse.json({ message: '訂單已確認收貨' });
    }

    return NextResponse.json({ error: '不支持的狀態變更' }, { status: 400 });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新訂單失敗' }, { status: 500 });
  }
}
