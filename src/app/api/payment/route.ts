/**
 * @fileoverview 支付创建API
 * @description 创建支付订单
 * @module app/api/payment/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * POST - 创建支付订单
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, method } = body;

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 检查订单状态
    if (order.pay_status !== 0) {
      return NextResponse.json({ error: '訂單已支付' }, { status: 400 });
    }

    // 生成支付ID
    const paymentId = `PAY${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // 计算过期时间（30分钟后）
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // 创建支付记录
    const { data: payment, error: paymentError } = await client
      .from('payments')
      .insert({
        payment_id: paymentId,
        order_id: orderId,
        method: method || 'alipay',
        amount: parseFloat(order.pay_amount),
        status: 'pending',
        expire_time: expireTime,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error('创建支付记录失败:', paymentError);
      return NextResponse.json({ error: '創建支付失敗' }, { status: 500 });
    }

    // 返回支付信息
    return NextResponse.json({
      message: '支付訂單已創建',
      data: {
        payment_id: paymentId,
        amount: parseFloat(order.pay_amount),
        status: 'pending',
        expire_time: expireTime,
        qr_code: null, // 实际项目中这里应该是支付二维码
      },
    });
  } catch (error) {
    console.error('创建支付失败:', error);
    return NextResponse.json({ error: '創建支付失敗' }, { status: 500 });
  }
}

/**
 * GET - 查询支付状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: '缺少支付ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { data: payment, error } = await client
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (error || !payment) {
      return NextResponse.json({ error: '支付記錄不存在' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        payment_id: payment.payment_id,
        amount: payment.amount,
        status: payment.status,
        expire_time: payment.expire_time,
        order_id: payment.order_id,
      },
    });
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
