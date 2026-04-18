/**
 * @fileoverview 订单取消 API
 * @description 取消未支付的订单
 * @module app/api/orders/[id]/cancel/route
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

/**
 * 取消订单
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 取消结果
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const client = getSupabaseClient();
    const body = await request.json();
    const { reason } = body;

    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 查询订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 检查订单状态
    if (order.order_status === 4) {
      return NextResponse.json({ error: '訂單已取消' }, { status: 400 });
    }

    if (order.pay_status === 1 && order.order_status >= 1) {
      // 已支付且已发货，不能直接取消
      if (order.order_status === 1) {
        // 待发货状态，允许取消并退款
        return await cancelWithRefund(client, order, reason);
      } else {
        return NextResponse.json({ error: '訂單已發貨，無法取消' }, { status: 400 });
      }
    }

    // 未支付，直接取消
    const now = new Date();
    const { error: updateError } = await client
      .from('orders')
      .update({
        order_status: 4,
        cancelled_at: now.toISOString(),
        cancel_reason: reason || '用戶主動取消',
        updated_at: now.toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('取消订单失败:', updateError);
      return NextResponse.json({ error: '取消訂單失敗' }, { status: 500 });
    }

    // 如果有待处理的支付记录，取消支付
    await client
      .from('payments')
      .update({
        status: 'cancelled',
        updated_at: now.toISOString(),
      })
      .eq('order_id', orderId)
      .eq('status', 'pending');

    // 恢复库存
    await restoreStock(client, order.id);

    return NextResponse.json({
      success: true,
      message: '訂單已取消',
      data: { order_id: orderId },
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    return NextResponse.json({ error: '取消訂單失敗' }, { status: 500 });
  }
}

/**
 * 取消订单并退款
 * @param client - Supabase客户端
 * @param order - 订单信息
 * @param reason - 取消原因
 * @returns 结果
 */
async function cancelWithRefund(
  client: any,
  order: any,
  reason?: string
) {
  const now = new Date();

  // 创建退款记录
  const refundId = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const { error: refundError } = await client
    .from('refunds')
    .insert({
      refund_id: refundId,
      order_id: order.id,
      user_id: order.user_id,
      amount: order.pay_amount,
      reason: reason || '用戶申請退款',
      status: 'pending',
      created_at: now.toISOString(),
    });

  if (refundError) {
    console.error('创建退款记录失败:', refundError);
    return NextResponse.json({ error: '創建退款記錄失敗' }, { status: 500 });
  }

  // 更新订单状态
  await client
    .from('orders')
    .update({
      order_status: 4,
      cancelled_at: now.toISOString(),
      cancel_reason: reason || '用戶申請退款',
      updated_at: now.toISOString(),
    })
    .eq('id', order.id);

  // 恢复库存
  await restoreStock(client, order.id);

  // TODO: 在实际项目中，这里会调用第三方支付API进行退款
  // 目前直接标记退款成功
  await client
    .from('refunds')
    .update({
      status: 'success',
      processed_at: now.toISOString(),
    })
    .eq('refund_id', refundId);

  // 退还用户余额或原路退回
  const { data: payment } = await client
    .from('payments')
    .select('*')
    .eq('order_id', order.id)
    .eq('status', 'success')
    .single();

  if (payment && payment.payment_method === 'balance') {
    // 余额支付，退回余额
    await client
      .from('users')
      .update({
        balance: `(${order.user.balance}::numeric + ${order.pay_amount}::numeric)::text`,
        updated_at: now.toISOString(),
      })
      .eq('id', order.user_id);
  }

  return NextResponse.json({
    success: true,
    message: '訂單已取消，退款已處理',
    data: {
      order_id: order.id,
      refund_id: refundId,
      refund_amount: order.pay_amount,
    },
  });
}

/**
 * 恢复库存
 * @param client - Supabase客户端
 * @param orderId - 订单ID
 */
async function restoreStock(client: any, orderId: number) {
  try {
    // 查询订单项
    const { data: orderItems } = await client
      .from('order_items')
      .select('goods_id, quantity')
      .eq('order_id', orderId);

    if (orderItems && orderItems.length > 0) {
      // 逐个恢复库存
      for (const item of orderItems) {
        await client
          .from('goods')
          .update({
            stock: `stock + ${item.quantity}`,
          })
          .eq('id', item.goods_id);
      }
    }
  } catch (error) {
    console.error('恢复库存失败:', error);
  }
}
