import { NextRequest } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate, count, remove as dbRemove } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import { sendOrderConfirmationEmail } from '@/lib/email/service';
import { successResponse, listResponse, errorResponse, messageResponse } from '@/lib/api-response';

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
    if (!authUser) return errorResponse('請先登錄', 401);
    const userId = authUser.userId;
    if (!userId) {
      return errorResponse('請先登錄', 401);
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    // 单条订单查询（用于 buy now 直接下单后跳转结账页）
    if (orderId) {
      const order = await queryOne(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [orderId, userId]
      ) as any;
      if (!order) {
        return errorResponse('訂單不存在', 404);
      }
      const items = await query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id]
      );
      return successResponse({ ...order, items });
    }

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

    return listResponse(ordersWithItems, { total, page, pageSize });
  } catch (error) {
    console.error('获取订单失败:', error);
    return listResponse([], { total: 0, page: 1, pageSize: 10 });
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
    const body = await request.json();
    const { address_id, items, cart_item_ids, goods_id, quantity, remark, payment_method, guest_address } = body;

    // 游客下单模式
    const isGuest = !!guest_address;
    let userId: number | string;
    let authUser: any = null;

    if (isGuest) {
      // 游客使用 user_id = 0 或创建一个临时用户
      // 先尝试获取或创建游客用户
      const guestEmail = guest_address.email || `guest_${Date.now()}@temp.fubao.ltd`;
      const guestName = guest_address.name || '遊客';
      const guestPhone = guest_address.phone || '';

      // 查找是否已有该邮箱的游客账号
      let guestUser = await queryOne(
        'SELECT id FROM users WHERE email = ?',
        [guestEmail]
      ) as any;

      if (!guestUser) {
        // 创建游客用户
        const guestId = await dbInsert('users', {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          password: '',
          role: 'guest',
          status: 1,
        });
        userId = guestId;
      } else {
        userId = guestUser.id;
      }
      authUser = { userId, email: guestEmail, name: guestName };
    } else {
      authUser = await getAuthUser(request);
      if (!authUser) {
        console.log('[Orders POST] 認證失敗: Authorization=', request.headers.get('Authorization')?.slice(0, 20) + '..., cookie=', request.headers.get('cookie')?.slice(0, 50) + '...');
        return errorResponse('請先登錄', 401);
      }
      userId = authUser.userId;
      if (!userId) {
        return errorResponse('請先登錄', 401);
      }
      console.log('[Orders POST] 認證成功: userId=', userId);
    }

    // 解析购买商品列表
    let orderItemsInput: Array<{ goods_id: number; quantity: number }> = [];

    if (items && Array.isArray(items) && items.length > 0) {
      // 模式1: 直接传 items
      orderItemsInput = items;
    } else if (cart_item_ids && Array.isArray(cart_item_ids) && cart_item_ids.length > 0) {
      // 模式2: 从购物车获取
      for (const cid of cart_item_ids) {
        const cartItem = await queryOne('SELECT * FROM cart WHERE id = ? AND user_id = ?', [cid, userId]) as any;
        if (cartItem) {
          orderItemsInput.push({ goods_id: cartItem.goods_id, quantity: cartItem.quantity });
        }
      }
    } else if (goods_id) {
      // 模式3: 单商品直接购买
      orderItemsInput = [{ goods_id: Number(goods_id), quantity: Number(quantity) || 1 }];
    }

    if (orderItemsInput.length === 0) {
      return errorResponse('請選擇商品');
    }

    // 获取地址
    let address: any = null;
    if (isGuest && guest_address) {
      // 游客模式：直接使用传入的地址信息
      address = {
        name: guest_address.name || '遊客',
        phone: guest_address.phone || '',
        province: guest_address.province || '',
        city: guest_address.city || '',
        district: guest_address.district || '',
        address: guest_address.address || '',
        is_default: 1,
      };
    } else if (address_id) {
      address = await queryOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [address_id, userId]);
    }
    if (!address) {
      address = await queryOne('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC LIMIT 1', [userId]);
    }
    if (!address && !isGuest) {
      // 自动创建一个默认地址（仅登录用户）
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
    if (!address) {
      return errorResponse('請填寫收貨地址');
    }

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = [];

    for (const item of orderItemsInput) {
      const goods = await queryOne('SELECT id, name, main_image, price, stock, status FROM goods WHERE id = ?', [item.goods_id]) as any;
      if (!goods) {
        return errorResponse(`商品ID ${item.goods_id} 不存在`, 404);
      }
      if (!goods.status) {
        return errorResponse(`商品「${goods.name}」已下架`);
      }
      if (item.quantity > goods.stock) {
        return errorResponse(`商品「${goods.name}」庫存不足`);
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

    // 检查 orders 表是否有 address_snapshot 列
    let hasAddressSnapshot = false;
    try {
      const cols = await query("SHOW COLUMNS FROM orders LIKE 'address_snapshot'");
      hasAddressSnapshot = Array.isArray(cols) && cols.length > 0;
    } catch { /* ignore */ }

    const orderData: Record<string, any> = {
      order_no: orderNo,
      user_id: userId,
      total_amount: totalAmount.toFixed(2),
      pay_amount: payAmount.toFixed(2),
      shipping_fee: shippingFee.toFixed(2),
      discount_amount: '0.00',
      status: 'pending',
      note: remark || null,
    };
    if (hasAddressSnapshot) {
      orderData.address_snapshot = JSON.stringify(address);
    }

    // 创建订单
    const orderId = await dbInsert('orders', orderData);

    // 创建订单项
    for (const oi of orderItems) {
      await dbInsert('order_items', {
        order_id: orderId,
        goods_id: oi.goods_id,
        goods_name: oi.goods_name,
        goods_image: oi.goods_image,
        price: oi.price,
        quantity: oi.quantity,
      });

      // 减库存、增销量
      await query('UPDATE goods SET stock = GREATEST(stock - ?, 0), sales = sales + ? WHERE id = ?', [oi.quantity, oi.quantity, oi.goods_id]);
    }

    // 清除已购买的购物车项
    if (cart_item_ids && Array.isArray(cart_item_ids)) {
      for (const cid of cart_item_ids) {
        try {
          await dbRemove('cart', { id: cid, user_id: userId });
        } catch {
          // 忽略
        }
      }
    } else {
      // 按商品ID清除购物车
      for (const item of orderItemsInput) {
        try {
          await dbRemove('cart', { user_id: userId, goods_id: item.goods_id });
        } catch {
          // 忽略
        }
      }
    }

    // 异步发送订单确认邮件（不阻塞响应）
    const userEmail = authUser.email || '';
    if (userEmail) {
      try {
        const addressObj = address as any;
        await sendOrderConfirmationEmail(userEmail, {
          orderId: orderNo,
          items: orderItems.map(oi => ({ name: oi.goods_name, quantity: oi.quantity, price: parseFloat(oi.price) })),
          totalAmount: payAmount,
          shippingAddress: addressObj ? `${addressObj.province || ''}${addressObj.city || ''}${addressObj.district || ''}${addressObj.address || ''}` : undefined,
        });
      } catch (emailError) {
        console.error('[Orders] 发送订单确认邮件失败:', emailError);
        // 邮件发送失败不影响订单创建
      }
    }

    return successResponse({
      id: orderId,
      order_no: orderNo,
      total_amount: totalAmount.toFixed(2),
      pay_amount: payAmount.toFixed(2),
      shipping_fee: shippingFee.toFixed(2),
      status: 'pending',
      payment_method: payment_method || 'alipay',
    }, '下單成功');
  } catch (error) {
    console.error('创建订单失败:', error);
    return errorResponse('創建訂單失敗', 500);
  }
}

/**
 * PUT - 更新订单状态
 */
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return errorResponse('請先登錄', 401);
    }
    const userId = authUser.userId;
    if (!userId) {
      return errorResponse('請先登錄', 401);
    }

    const body = await request.json();
    const { id, order_id, status, cancel_reason, address_id, coupon_id, payment_method, payment_no, remark } = body;

    const effectiveOrderId = id || order_id;
    if (!effectiveOrderId) {
      return errorResponse('缺少訂單ID');
    }

    const order = await queryOne('SELECT * FROM orders WHERE id = ? AND user_id = ?', [effectiveOrderId, userId]) as any;
    if (!order) {
      return errorResponse('訂單不存在', 404);
    }

    // 更新订单信息（待付款状态下可修改地址、支付方式等）
    if (address_id || payment_method || remark !== undefined) {
      if (order.status !== 'pending') {
        return errorResponse('僅待付款訂單可修改');
      }
      const updates: Record<string, any> = {};
      if (address_id) {
        const addr = await queryOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [address_id, userId]) as any;
        if (!addr) return errorResponse('地址不存在', 404);
        // 检查是否有 address_snapshot 列
        let hasAddrCol = false;
        try {
          const cols = await query("SHOW COLUMNS FROM orders LIKE 'address_snapshot'");
          hasAddrCol = Array.isArray(cols) && cols.length > 0;
        } catch { /* ignore */ }
        if (hasAddrCol) {
          updates.address_snapshot = JSON.stringify(addr);
        }
      }
      if (payment_method) updates.payment_method = payment_method;
      if (remark !== undefined) updates.note = remark || null;
      if (coupon_id) updates.coupon_id = coupon_id;
      await dbUpdate('orders', effectiveOrderId, updates);
      return messageResponse('訂單已更新');
    }

    if (status === 'cancelled') {
      // 取消订单 - 恢复库存
      const items = await query('SELECT * FROM order_items WHERE order_id = ?', [effectiveOrderId]) as any[];
      for (const item of items) {
        await query('UPDATE goods SET stock = stock + ?, sales = GREATEST(sales - ?, 0) WHERE id = ?', [item.quantity, item.quantity, item.goods_id]);
      }
      const cancelUpdates: Record<string, any> = {
        status: 'cancelled',
        cancel_reason: cancel_reason || '用戶取消',
      };
      // cancelled_at 列可能不存在，尝试更新
      try {
        const cols = await query("SHOW COLUMNS FROM orders LIKE 'cancelled_at'");
        if (Array.isArray(cols) && cols.length > 0) {
          cancelUpdates.cancelled_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
      } catch { /* ignore */ }
      await dbUpdate('orders', effectiveOrderId, cancelUpdates);
      return messageResponse('訂單已取消');
    }

    if (status === 'paid') {
      // 支付成功
      const updates: Record<string, any> = {
        status: 'paid',
        payment_status: 'paid',
      };
      if (payment_method) updates.payment_method = payment_method;
      if (payment_no) updates.payment_no = payment_no;
      // paid_at 列可能不存在，尝试更新
      try {
        const cols = await query("SHOW COLUMNS FROM orders LIKE 'paid_at'");
        if (Array.isArray(cols) && cols.length > 0) {
          updates.paid_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
      } catch { /* ignore */ }
      await dbUpdate('orders', effectiveOrderId, updates);
      return messageResponse('支付成功');
    }

    if (status === 'confirmed') {
      const confirmUpdates: Record<string, any> = { status: 'confirmed' };
      // confirmed_at 列可能不存在，尝试更新
      try {
        const cols = await query("SHOW COLUMNS FROM orders LIKE 'confirmed_at'");
        if (Array.isArray(cols) && cols.length > 0) {
          confirmUpdates.confirmed_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }
      } catch { /* ignore */ }
      await dbUpdate('orders', effectiveOrderId, confirmUpdates);
      return messageResponse('訂單已確認收貨');
    }

    return errorResponse('不支持的狀態變更');
  } catch (error) {
    console.error('更新订单失败:', error);
    return errorResponse('更新訂單失敗', 500);
  }
}
