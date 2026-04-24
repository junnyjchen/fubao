/**
 * @fileoverview 订单取消API
 * @description 用户取消订单
 * @module app/api/orders/cancel/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/orders/cancel
 * 取消订单
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, reason } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: '訂單ID不能為空' },
        { status: 400 }
      );
    }

    // 获取订单信息
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, order_status, pay_status, pay_amount')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '訂單不存在' },
        { status: 404 }
      );
    }

    // 验证订单归属
    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: '無權操作此訂單' },
        { status: 403 }
      );
    }

    // 验证订单状态（只有待付款和待发货状态可以取消）
    if (order.order_status !== 0 && order.order_status !== 1) {
      return NextResponse.json(
        { error: '訂單狀態不允許取消' },
        { status: 400 }
      );
    }

    // 如果已支付，需要退款
    let refundAmount = 0;
    if (order.pay_status === 1) {
      refundAmount = parseFloat(order.pay_amount);

      // 创建退款记录
      await supabase
        .from('refunds')
        .insert({
          order_id: order_id,
          user_id: user.id,
          amount: refundAmount,
          reason: reason || '用戶取消訂單',
          status: 'pending',
          created_at: new Date().toISOString(),
        });
    }

    // 获取订单项，恢复库存
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('goods_id, quantity')
      .eq('order_id', order_id);

    if (orderItems && orderItems.length > 0) {
      for (const item of orderItems) {
        // 获取商品当前库存
        const { data: goods } = await supabase
          .from('goods')
          .select('stock, sales')
          .eq('id', item.goods_id)
          .single();

        if (goods) {
          // 恢复库存
          await supabase
            .from('goods')
            .update({
              stock: goods.stock + item.quantity,
              sales: Math.max(0, goods.sales - item.quantity),
            })
            .eq('id', item.goods_id);
        }
      }
    }

    // 更新订单状态
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        order_status: 4, // 已取消
        cancel_reason: reason || '用戶取消',
        cancel_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('更新订单失败:', updateError);
      return NextResponse.json(
        { error: '取消訂單失敗' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '訂單已取消',
      data: {
        order_id,
        status: 4,
        refund_amount: refundAmount,
      },
    });
  } catch (error) {
    console.error('取消订单API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
