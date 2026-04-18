/**
 * @fileoverview 订单确认收货API
 * @description 用户确认收货
 * @module app/api/orders/confirm/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/orders/confirm
 * 确认收货
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: '訂單ID不能為空' },
        { status: 400 }
      );
    }

    // 获取订单信息
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, order_status, pay_amount')
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

    // 验证订单状态
    if (order.order_status !== 2) {
      return NextResponse.json(
        { error: '訂單狀態不允許確認收貨' },
        { status: 400 }
      );
    }

    // 更新订单状态
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        order_status: 3, // 已完成
        confirm_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      console.error('更新订单失败:', updateError);
      return NextResponse.json(
        { error: '確認收貨失敗' },
        { status: 500 }
      );
    }

    // 发放积分奖励（消费金额的1%）
    const points = Math.floor(parseFloat(order.pay_amount) * 0.01);
    if (points > 0) {
      // 获取用户当前积分
      const { data: userPoints } = await supabase
        .from('user_points')
        .select('points, total_points')
        .eq('user_id', user.id)
        .single();

      if (userPoints) {
        await supabase
          .from('user_points')
          .update({
            points: userPoints.points + points,
            total_points: userPoints.total_points + points,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        // 记录积分变动
        await supabase
          .from('point_records')
          .insert({
            user_id: user.id,
            points,
            type: 'consume',
            remark: `訂單完成獎勵`,
            created_at: new Date().toISOString(),
          });
      } else {
        // 创建积分记录
        await supabase
          .from('user_points')
          .insert({
            user_id: user.id,
            points,
            total_points: points,
            created_at: new Date().toISOString(),
          });
      }
    }

    // 发送通知给商户
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'order',
        title: '訂單已完成',
        content: `訂單 #${order_id} 已確認收貨，交易完成。`,
        link: `/merchant/dashboard/orders/${order_id}`,
        is_read: false,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({
      message: '確認收貨成功',
      data: {
        order_id,
        status: 3,
        points_earned: points,
      },
    });
  } catch (error) {
    console.error('确认收货API错误:', error);
    return NextResponse.json(
      { error: '服務器錯誤' },
      { status: 500 }
    );
  }
}
