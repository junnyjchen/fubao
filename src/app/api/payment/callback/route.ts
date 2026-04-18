/**
 * @fileoverview 支付回调 API
 * @description 处理支付成功、失败的回调
 * @module app/api/payment/callback/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 回调请求参数 */
interface CallbackRequest {
  payment_id: string;
  status: 'success' | 'failed' | 'cancelled';
  transaction_id?: string;
  sign?: string;
}

/**
 * 处理支付回调
 * @param request - 请求对象
 * @returns 处理结果
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body: CallbackRequest = await request.json();

    const { payment_id, status, transaction_id } = body;

    if (!payment_id || !status) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 查询支付记录
    const { data: payment, error: paymentError } = await client
      .from('payments')
      .select('*')
      .eq('payment_id', payment_id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: '支付記錄不存在' }, { status: 404 });
    }

    // 检查支付状态
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: '支付已處理' }, { status: 400 });
    }

    // 更新支付状态
    const { error: updatePaymentError } = await client
      .from('payments')
      .update({
        status: status,
        transaction_id: transaction_id || null,
        paid_at: status === 'success' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', payment_id);

    if (updatePaymentError) {
      console.error('更新支付状态失败:', updatePaymentError);
    }

    // 如果支付成功，更新订单状态
    if (status === 'success') {
      const { error: updateOrderError } = await client
        .from('orders')
        .update({
          pay_status: 1,
          order_status: 1, // 待发货
          pay_time: new Date().toISOString(),
          transaction_id: transaction_id || payment_id,
        })
        .eq('id', payment.order_id);

      if (updateOrderError) {
        console.error('更新订单状态失败:', updateOrderError);
      }

      // 记录支付成功日志
      console.log(`[Payment Success] payment_id: ${payment_id}, order_id: ${payment.order_id}, amount: ${payment.amount}`);
    }

    return NextResponse.json({
      message: status === 'success' ? '支付成功' : '支付失敗',
      data: {
        payment_id,
        status,
        order_id: payment.order_id,
      },
    });
  } catch (error) {
    console.error('处理支付回调失败:', error);
    return NextResponse.json({ error: '處理支付回調失敗' }, { status: 500 });
  }
}

/**
 * 模拟支付成功（用于测试）
 * @param request - 请求对象
 * @returns 处理结果
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json({ error: '缺少支付ID' }, { status: 400 });
    }

    // 查询支付记录
    const { data: payment } = await client
      .from('payments')
      .select('*')
      .eq('payment_id', payment_id)
      .single();

    if (!payment) {
      // 如果支付记录不存在，直接更新订单（兼容测试模式）
      const { data: order } = await client
        .from('orders')
        .select('*')
        .eq('order_no', payment_id.replace('PAY', 'FB'))
        .single();

      if (order) {
        await client
          .from('orders')
          .update({
            pay_status: 1,
            order_status: 1,
            pay_time: new Date().toISOString(),
          })
          .eq('id', order.id);

        return NextResponse.json({
          message: '模擬支付成功',
          data: { order_id: order.id },
        });
      }

      return NextResponse.json({ error: '記錄不存在' }, { status: 404 });
    }

    // 更新支付和订单状态
    await client
      .from('payments')
      .update({
        status: 'success',
        paid_at: new Date().toISOString(),
      })
      .eq('payment_id', payment_id);

    await client
      .from('orders')
      .update({
        pay_status: 1,
        order_status: 1,
        pay_time: new Date().toISOString(),
      })
      .eq('id', payment.order_id);

    return NextResponse.json({
      message: '模擬支付成功',
      data: {
        payment_id,
        order_id: payment.order_id,
      },
    });
  } catch (error) {
    console.error('模拟支付失败:', error);
    return NextResponse.json({ error: '模擬支付失敗' }, { status: 500 });
  }
}
