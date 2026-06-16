/**
 * @fileoverview PayPal 支付 API
 * @description 使用 PayPal REST API v2 创建支付订单、捕获支付
 * @module app/api/payments/paypal/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getAuthUserId } from '@/lib/auth/apiAuth';
import {
  getPayPalConfig,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalApprovalUrl,
} from '@/lib/paypal';




/**
 * POST - 创建 PayPal 支付订单
 * 
 * 请求体:
 * { orderId: number, amount?: string }
 * 
 * 返回:
 * { data: { paypalOrderId, approvalUrl } }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單ID' }, { status: 400 });
    }

    // 获取 PayPal 配置
    const paypalConfig = await getPayPalConfig();
    if (!paypalConfig) {
      return NextResponse.json(
        { error: 'PayPal 支付未啟用或未配置，請在後台設置中開啟並填寫 Client ID 和 Secret' },
        { status: 400 }
      );
    }

    // 查询订单
    const client = getSupabaseClient();
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (order.pay_status === 1) {
      return NextResponse.json({ error: '訂單已支付' }, { status: 400 });
    }

    const paymentAmount = amount || order.pay_amount || order.total_amount;
    const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || `http://localhost:${process.env.DEPLOY_RUN_PORT || 5000}`;
    const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;

    // 创建 PayPal 订单
    const paypalOrder = await createPayPalOrder(paypalConfig, {
      orderId: order.id,
      orderNo: order.order_no || `ORD-${order.id}`,
      amount: String(paymentAmount),
      currency: 'HKD',
      description: `符寶網訂單 ${order.order_no || order.id}`,
      returnUrl: `${baseUrl}/payment/success?orderId=${order.id}&method=paypal`,
      cancelUrl: `${baseUrl}/payment?orderId=${order.id}&cancelled=true`,
    });

    const approvalUrl = getPayPalApprovalUrl(paypalOrder);

    // 保存 PayPal 订单ID到支付记录
    const paymentId = `PAY-PPL-${Date.now()}-${orderId}`;
    const now = new Date();
    const expireTime = new Date(now.getTime() + 30 * 60 * 1000); // PayPal 链接30分钟有效

    await client.from('payments').insert({
      payment_id: paymentId,
      order_id: orderId,
      user_id: userId,
      amount: paymentAmount,
      payment_method: 'paypal',
      status: 'pending',
      redirect_url: approvalUrl,
      client_secret: paypalOrder.id, // 保存 PayPal Order ID
      expire_time: expireTime.toISOString(),
      created_at: now.toISOString(),
    });

    return NextResponse.json({
      data: {
        paypalOrderId: paypalOrder.id,
        approvalUrl,
        status: paypalOrder.status,
      },
    });
  } catch (error: any) {
    console.error('[PayPal] 创建支付失败:', error);
    return NextResponse.json(
      { error: `PayPal 支付創建失敗: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * PUT - 捕获 PayPal 支付（买家在 PayPal 页面批准后调用）
 * 
 * 请求体:
 * { orderId: number, paypalOrderId: string }
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paypalOrderId } = body;

    if (!orderId || !paypalOrderId) {
      return NextResponse.json({ error: '缺少訂單ID或PayPal訂單ID' }, { status: 400 });
    }

    // 获取 PayPal 配置
    const paypalConfig = await getPayPalConfig();
    if (!paypalConfig) {
      return NextResponse.json({ error: 'PayPal 未配置' }, { status: 400 });
    }

    // 捕获 PayPal 支付
    const captureResult = await capturePayPalOrder(paypalConfig, paypalOrderId);

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `PayPal 支付未完成，狀態: ${captureResult.status}` },
        { status: 400 }
      );
    }

    // 更新订单状态
    const client = getSupabaseClient();
    const captureId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id || paypalOrderId;

    await client
      .from('orders')
      .update({
        pay_status: 1,
        order_status: 1,
        pay_method: 'paypal',
        pay_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // 更新支付记录状态
    await client
      .from('payments')
      .update({
        status: 'completed',
        transaction_id: captureId,
        updated_at: new Date().toISOString(),
      })
      .eq('client_secret', paypalOrderId)
      .eq('payment_method', 'paypal');

    return NextResponse.json({
      data: {
        success: true,
        captureId,
        status: captureResult.status,
      },
    });
  } catch (error: any) {
    console.error('[PayPal] 捕获支付失败:', error);
    return NextResponse.json(
      { error: `PayPal 支付驗證失敗: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * GET - 查询 PayPal 支付状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paypalOrderId = searchParams.get('paypalOrderId');

    if (!paypalOrderId) {
      return NextResponse.json({ error: '缺少PayPal訂單ID' }, { status: 400 });
    }

    // 查询本地支付记录
    const client = getSupabaseClient();
    const { data: payment } = await client
      .from('payments')
      .select('*')
      .eq('client_secret', paypalOrderId)
      .eq('payment_method', 'paypal')
      .single();

    if (!payment) {
      return NextResponse.json({ status: 'not_found' });
    }

    return NextResponse.json({
      status: payment.status,
      paymentId: payment.payment_id,
      amount: payment.amount,
      transactionId: payment.transaction_id,
    });
  } catch (error: any) {
    console.error('[PayPal] 查询支付状态失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
