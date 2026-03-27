/**
 * @fileoverview 订单 API
 * @description 处理订单的创建、查询、更新
 * @module app/api/orders/route
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取当前用户ID
 * @returns 用户ID或null
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

/** 临时用户ID（开发环境使用） */
const TEMP_USER_ID = 'guest-user-001';

/**
 * 生成订单号
 * @returns 订单号
 */
function generateOrderNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FB${timestamp}${random}`;
}

/**
 * 获取订单列表
 * @param request - 请求对象
 * @returns 订单列表
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    
    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 获取订单列表
    let query = client
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      const statusMap: Record<string, number> = {
        unpaid: 0,
        unshipped: 1,
        shipped: 2,
        completed: 3,
        cancelled: 4,
      };
      if (statusMap[status] !== undefined) {
        query = query.eq('order_status', statusMap[status]);
      }
    }

    const { data: orders, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 获取订单项
    if (orders && orders.length > 0) {
      const orderIds = orders.map(o => o.id);
      const { data: orderItems } = await client
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      // 合并订单项
      const ordersWithItems = orders.map(order => ({
        ...order,
        items: orderItems?.filter(item => item.order_id === order.id) || [],
      }));

      return NextResponse.json({
        data: ordersWithItems,
        page,
        limit,
        total: count || 0,
        total_pages: count ? Math.ceil(count / limit) : 0,
      });
    }

    return NextResponse.json({
      data: [],
      page,
      limit,
      total: 0,
    });
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json({ error: '獲取訂單失敗' }, { status: 500 });
  }
}

/**
 * 创建订单
 * @param request - 请求对象
 * @returns 创建结果
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    
    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }
    
    const body = await request.json();

    const { cartItemIds, address_id, shippingInfo, coupon_id, remark } = body;

    if (!cartItemIds || cartItemIds.length === 0) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    // 获取收货地址
    let shippingData = shippingInfo;
    if (address_id && !shippingInfo) {
      const { data: address } = await client
        .from('addresses')
        .select('*')
        .eq('id', address_id)
        .single();
      
      if (address) {
        shippingData = {
          name: address.name,
          phone: address.phone,
          address: `${address.province}${address.city}${address.district}${address.address}`,
        };
      }
    }

    if (!shippingData) {
      return NextResponse.json({ error: '請選擇收貨地址' }, { status: 400 });
    }

    // 获取购物车项目
    const { data: cartItems, error: cartError } = await client
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .in('id', cartItemIds);

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: '購物車數據錯誤' }, { status: 400 });
    }

    // 获取商品信息
    const goodsIds = cartItems.map(item => item.goods_id);
    const { data: goodsData } = await client
      .from('goods')
      .select('id, name, price, stock, status, merchant_id, main_image')
      .in('id', goodsIds);

    if (!goodsData || goodsData.length === 0) {
      return NextResponse.json({ error: '商品不存在' }, { status: 400 });
    }

    // 检查商品状态和库存
    const goodsMap = new Map(goodsData.map(g => [g.id, g]));
    for (const item of cartItems) {
      const goods = goodsMap.get(item.goods_id);
      if (!goods) {
        return NextResponse.json({ error: `商品不存在` }, { status: 400 });
      }
      if (!goods.status) {
        return NextResponse.json({ error: `${goods.name} 已下架` }, { status: 400 });
      }
      if (goods.stock < item.quantity) {
        return NextResponse.json({ error: `${goods.name} 庫存不足` }, { status: 400 });
      }
    }

    // 计算订单金额
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
      const goods = goodsMap.get(item.goods_id)!;
      const price = Number(goods.price);
      const totalPrice = price * item.quantity;
      totalAmount += totalPrice;
      return {
        goods_id: item.goods_id,
        goods_name: goods.name,
        goods_image: goods.main_image,
        price: price.toString(),
        quantity: item.quantity,
        total_price: totalPrice.toString(),
      };
    });

    // 计算运费（从系统设置获取）
    const freeShippingAmount = 500; // 默认免运费门槛
    const defaultShippingFee = 30; // 默认运费
    const shippingFee = totalAmount >= freeShippingAmount ? 0 : defaultShippingFee;
    const payAmount = totalAmount + shippingFee;

    // 获取商户ID（简化：取第一个商品的商户）
    const merchantId = goodsData[0].merchant_id;

    // 创建订单
    const orderNo = generateOrderNo();
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        order_no: orderNo,
        user_id: userId,
        merchant_id: merchantId,
        total_amount: totalAmount.toString(),
        pay_amount: payAmount.toString(),
        pay_status: 0,
        order_status: 0,
        shipping_name: shippingData.name,
        shipping_phone: shippingData.phone,
        shipping_address: shippingData.address,
        remark: remark || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '創建訂單失敗' }, { status: 500 });
    }

    // 创建订单项
    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems.map(item => ({
        ...item,
        order_id: order.id,
      })));

    if (itemsError) {
      // 回滚订单
      await client.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: '創建訂單項失敗' }, { status: 500 });
    }

    // 更新商品库存和销量
    for (const item of cartItems) {
      const goods = goodsMap.get(item.goods_id)!;
      await client
        .from('goods')
        .update({
          stock: goods.stock - item.quantity,
          sales: (goods as unknown as { sales?: number }).sales || 0 + item.quantity,
        })
        .eq('id', item.goods_id);
    }

    // 删除购物车项目
    await client
      .from('cart_items')
      .delete()
      .in('id', cartItemIds);

    return NextResponse.json({
      message: '訂單創建成功',
      data: {
        ...order,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '創建訂單失敗' }, { status: 500 });
  }
}
