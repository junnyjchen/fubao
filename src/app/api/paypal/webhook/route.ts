/**
 * @fileoverview PayPal Webhook 回调 API
 * @description 接收 PayPal 异步支付通知，验证签名并更新订单状态
 * @module app/api/paypal/webhook/route
 * 
 * PayPal Webhook 事件类型:
 * - CHECKOUT.ORDER.APPROVED: 买家批准支付
 * - PAYMENT.CAPTURE.COMPLETED: 支付捕获完成
 * - PAYMENT.CAPTURE.DENIED: 支付捕获被拒
 * - PAYMENT.CAPTURE.REFUNDED: 支付退款
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getPayPalConfig, verifyPayPalWebhookSignature, capturePayPalOrder } from '@/lib/paypal';

/**
 * POST - PayPal Webhook 回调
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    console.log('[PayPal Webhook] 收到回调:', headers['paypal-transmission-id']);

    // 解析事件
    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      console.error('[PayPal Webhook] 解析事件失败');
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const eventType = event.event_type;
    console.log('[PayPal Webhook] 事件类型:', eventType);

    // 获取配置
    const paypalConfig = await getPayPalConfig();
    if (!paypalConfig) {
      console.warn('[PayPal Webhook] PayPal 未配置，跳过处理');
      return NextResponse.json({ received: true });
    }

    // 验证 Webhook 签名
    const isValid = await verifyPayPalWebhookSignature(paypalConfig, headers, body);
    if (!isValid && !paypalConfig.sandbox) {
      console.error('[PayPal Webhook] 签名验证失败');
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
    }

    const client = getSupabaseClient();

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // 买家在 PayPal 页面批准了支付，需要捕获
        const paypalOrderId = event.resource?.id;
        console.log('[PayPal Webhook] 订单已批准，尝试捕获:', paypalOrderId);

        if (paypalOrderId) {
          try {
            const captureResult = await capturePayPalOrder(paypalConfig, paypalOrderId);
            console.log('[PayPal Webhook] 捕获结果:', captureResult.status);

            if (captureResult.status === 'COMPLETED') {
              const referenceId = event.resource?.purchase_units?.[0]?.reference_id;
              const captureId = captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id;

              if (referenceId) {
                // 更新订单状态
                await client
                  .from('orders')
                  .update({
                    pay_status: 1,
                    order_status: 1,
                    pay_method: 'paypal',
                    pay_time: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', referenceId);

                // 更新支付记录
                await client
                  .from('payments')
                  .update({
                    status: 'completed',
                    transaction_id: captureId || paypalOrderId,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('client_secret', paypalOrderId)
                  .eq('payment_method', 'paypal');

                console.log('[PayPal Webhook] 订单更新成功:', referenceId);
              }
            }
          } catch (captureError) {
            console.error('[PayPal Webhook] 捕获失败:', captureError);
          }
        }
        break;
      }

      case 'PAYMENT.CAPTURE.COMPLETED': {
        // 支付捕获完成
        const captureId = event.resource?.id;
        const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
        console.log('[PayPal Webhook] 支付捕获完成:', captureId);

        // 查找对应的支付记录并更新
        if (paypalOrderId) {
          await client
            .from('payments')
            .update({
              status: 'completed',
              transaction_id: captureId,
              updated_at: new Date().toISOString(),
            })
            .eq('client_secret', paypalOrderId)
            .eq('payment_method', 'paypal');
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED': {
        // 支付被拒绝
        const deniedCaptureId = event.resource?.id;
        console.log('[PayPal Webhook] 支付被拒绝:', deniedCaptureId);

        if (deniedCaptureId) {
          await client
            .from('payments')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('transaction_id', deniedCaptureId)
            .eq('payment_method', 'paypal');
        }
        break;
      }

      case 'PAYMENT.CAPTURE.REFUNDED': {
        // 退款
        const refundCaptureId = event.resource?.links?.find(
          (l: any) => l.rel === 'up'
        )?.href?.split('/')?.pop();
        console.log('[PayPal Webhook] 退款:', refundCaptureId);

        if (refundCaptureId) {
          await client
            .from('payments')
            .update({
              status: 'refunded',
              updated_at: new Date().toISOString(),
            })
            .eq('transaction_id', refundCaptureId)
            .eq('payment_method', 'paypal');
        }
        break;
      }

      default:
        console.log('[PayPal Webhook] 未处理的事件类型:', eventType);
    }

    // PayPal 要求返回 200 OK 确认收到
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[PayPal Webhook] 处理失败:', error);
    // 仍然返回 200 避免 PayPal 重试
    return NextResponse.json({ received: true, error: error.message });
  }
}

/**
 * GET - PayPal 支付返回页面（买家从 PayPal 页面返回后）
 * 用于前端轮询支付状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paypalOrderId = searchParams.get('paypalOrderId');

    if (!paypalOrderId) {
      return NextResponse.json({ error: '缺少PayPal訂單ID' }, { status: 400 });
    }

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
      orderId: payment.order_id,
      amount: payment.amount,
      transactionId: payment.transaction_id,
    });
  } catch (error: any) {
    console.error('[PayPal] 查询支付状态失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
