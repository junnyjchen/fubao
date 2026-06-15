/**
 * @fileoverview Pay Protocol 支付回调 API
 * @description 接收 Pay Protocol 异步支付回调通知，验证签名并更新订单状态
 * @module app/api/payprotocol/callback/route
 *
 * 回调流程:
 * 1. Pay Protocol 在用户支付完成后 POST 回调到此接口
 * 2. 验证签名合法性
 * 3. 更新支付记录和订单状态
 * 4. 返回 HTTP 200 确认
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  getPayProtocolConfig,
  verifyCallbackSignature,
  type PaymentCallbackData,
} from '@/lib/payprotocol';

/**
 * POST - Pay Protocol 支付回调
 */
export async function POST(request: NextRequest) {
  try {
    const body: PaymentCallbackData = await request.json();

    console.log('[PayProtocol] 收到回调:', JSON.stringify(body));

    // 获取配置
    const config = await getPayProtocolConfig();
    if (!config) {
      console.warn('[PayProtocol] 收到回調但支付未啟用或未配置，嘗試無簽名驗證處理');

      // 即使未配置签名验证，仍尝试处理回调（兼容场景：刚关闭配置但仍有未完成的回调）
      const { outTradeNo, outPaymentNo, paymentStatus } = body;

      if (!outTradeNo) {
        return NextResponse.json({ error: '缺少商戶訂單號' }, { status: 400 });
      }

      if (paymentStatus === 1) {
        console.log(`[PayProtocol] 回調支付成功（無簽名驗證）: outTradeNo=${outTradeNo}`);
      }

      // 返回 200 确认收到，但不处理订单
      return NextResponse.json({ code: 200, msg: '已接收但未配置' });
    }

    // 验证签名
    const receivedSign = body.sign || '';
    if (receivedSign && !verifyCallbackSignature(config.apiSecret, body, receivedSign)) {
      console.error('[PayProtocol] 回调签名验证失败');
      return NextResponse.json({ error: '簽名驗證失敗' }, { status: 401 });
    }

    const { outTradeNo, outPaymentNo, paymentStatus } = body;

    if (!outTradeNo) {
      return NextResponse.json({ error: '缺少商戶訂單號' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查找支付记录（通过 transaction_id 匹配 outPaymentNo，或通过备注匹配 outTradeNo）
    let payment: any = null;

    // 先通过 outPaymentNo 查找
    const { data: paymentByTxId } = await client
      .from('payments')
      .select('*')
      .eq('transaction_id', outPaymentNo)
      .single();

    if (paymentByTxId) {
      payment = paymentByTxId;
    } else {
      // 通过 payment_method + status=pending 查找最近的 Pay Protocol 支付
      const { data: pendingPayments } = await client
        .from('payments')
        .select('*')
        .eq('payment_method', 'payprotocol')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (pendingPayments && pendingPayments.length > 0) {
        payment = pendingPayments[0];
      }
    }

    if (!payment) {
      console.error('[PayProtocol] 回调处理: 未找到对应支付记录');
      return NextResponse.json({ error: '支付記錄不存在' }, { status: 404 });
    }

    // paymentStatus: 0=待支付, 1=已支付, 2=过期, 3=失败
    if (paymentStatus === 1) {
      // 支付成功
      console.log(`[PayProtocol] 支付成功: outTradeNo=${outTradeNo}, outPaymentNo=${outPaymentNo}`);

      // 更新支付记录
      await client
        .from('payments')
        .update({
          status: 'success',
          transaction_id: outPaymentNo,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq('payment_id', payment.payment_id);

      // 更新订单状态
      await client
        .from('orders')
        .update({
          pay_status: 1,
          order_status: 1, // 待发货
          pay_method: 'payprotocol',
          pay_time: new Date().toISOString(),
          transaction_id: outPaymentNo,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', payment.order_id);

      console.log(`[PayProtocol] 订单 ${payment.order_id} 状态已更新为已支付`);
    } else if (paymentStatus === 2) {
      // 订单过期
      await client
        .from('payments')
        .update({
          status: 'expired',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('payment_id', payment.payment_id);

      console.log(`[PayProtocol] 支付已过期: outTradeNo=${outTradeNo}`);
    } else if (paymentStatus === 3) {
      // 支付失败
      await client
        .from('payments')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        } as any)
        .eq('payment_id', payment.payment_id);

      console.log(`[PayProtocol] 支付失败: outTradeNo=${outTradeNo}`);
    }

    // 返回 200 确认收到回调
    return NextResponse.json({ code: 200, msg: '操作成功' });
  } catch (error: any) {
    console.error('[PayProtocol] 处理回调失败:', error);
    return NextResponse.json({ error: error.message || '處理回調失敗' }, { status: 500 });
  }
}

/**
 * GET - 支付状态查询（前端轮询）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');

    if (!orderId && !paymentId) {
      return NextResponse.json({ error: '缺少訂單ID或支付ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    let payment: any = null;

    if (paymentId) {
      const { data } = await client
        .from('payments')
        .select('*')
        .eq('payment_id', paymentId)
        .single();
      payment = data;
    } else if (orderId) {
      const { data } = await client
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .eq('payment_method', 'payprotocol')
        .order('created_at', { ascending: false })
        .limit(1);
      payment = Array.isArray(data) ? data[0] : data;
    }

    if (!payment) {
      return NextResponse.json({ status: 'not_found' });
    }

    return NextResponse.json({
      status: payment.status,
      paymentId: payment.payment_id,
      orderId: payment.order_id,
      amount: payment.amount,
      transactionId: payment.transaction_id,
    });
  } catch (error: any) {
    console.error('[PayProtocol] 查询支付状态失败:', error);
    return NextResponse.json({ error: error.message || '查詢失敗' }, { status: 500 });
  }
}
