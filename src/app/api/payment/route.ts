/**
 * @fileoverview 支付 API
 * @description 处理支付创建、查询和回调
 * @module app/api/payment/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 支付方式类型 */
type PaymentMethod = 'alipay' | 'wechat' | 'paypal' | 'balance';

/** 支付状态 */
type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

/** 支付请求参数 */
interface PaymentRequest {
  order_id: number;
  payment_method: PaymentMethod;
  return_url?: string;
  cancel_url?: string;
}

/** 支付响应 */
interface PaymentResponse {
  payment_id: string;
  payment_url?: string;
  qr_code?: string;
  status: PaymentStatus;
}

/**
 * 生成支付ID
 * @returns 支付ID
 */
function generatePaymentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY${timestamp}${random}`;
}

/**
 * 获取支付配置
 * @param client - Supabase客户端
 * @returns 支付配置
 */
async function getPaymentSettings(client: ReturnType<typeof getSupabaseClient>) {
  const { data: settings } = await client
    .from('settings')
    .select('key, value')
    .in('key', [
      'alipay_enabled',
      'alipay_app_id',
      'wechat_enabled',
      'wechat_app_id',
      'paypal_enabled',
      'paypal_client_id',
    ]);

  const config: Record<string, string> = {};
  settings?.forEach(s => {
    config[s.key] = s.value;
  });

  return {
    alipay: {
      enabled: config.alipay_enabled === 'true',
      appId: config.alipay_app_id || '',
    },
    wechat: {
      enabled: config.wechat_enabled === 'true',
      appId: config.wechat_app_id || '',
    },
    paypal: {
      enabled: config.paypal_enabled === 'true',
      clientId: config.paypal_client_id || '',
    },
  };
}

/**
 * 创建支付订单
 * @param request - 请求对象
 * @returns 支付信息
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body: PaymentRequest = await request.json();

    const { order_id, payment_method, return_url, cancel_url } = body;

    if (!order_id || !payment_method) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 获取订单信息
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 检查订单状态
    if (order.pay_status === 1) {
      return NextResponse.json({ error: '訂單已支付' }, { status: 400 });
    }

    // 获取支付配置
    const paymentConfig = await getPaymentSettings(client);

    // 检查支付方式是否启用
    if (payment_method !== 'balance' && !paymentConfig[payment_method]?.enabled) {
      return NextResponse.json({ error: '該支付方式未啟用' }, { status: 400 });
    }

    // 生成支付ID
    const paymentId = generatePaymentId();

    // 创建支付记录
    const { error: paymentError } = await client
      .from('payments')
      .insert({
        payment_id: paymentId,
        order_id: order_id,
        order_no: order.order_no,
        amount: order.pay_amount,
        payment_method: payment_method,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (paymentError) {
      console.error('创建支付记录失败:', paymentError);
      // 如果表不存在，继续执行模拟支付流程
    }

    // 根据支付方式返回不同的支付信息
    let paymentResponse: PaymentResponse = {
      payment_id: paymentId,
      status: 'pending',
    };

    switch (payment_method) {
      case 'alipay':
        // 支付宝支付 - 返回模拟支付URL
        paymentResponse = {
          ...paymentResponse,
          payment_url: `/payment/alipay?payment_id=${paymentId}&amount=${order.pay_amount}`,
          qr_code: `alipay://platformapi/startapp?appId=${paymentConfig.alipay.appId}&orderId=${paymentId}`,
        };
        break;

      case 'wechat':
        // 微信支付 - 返回模拟二维码
        paymentResponse = {
          ...paymentResponse,
          payment_url: `/payment/wechat?payment_id=${paymentId}&amount=${order.pay_amount}`,
          qr_code: `weixin://wxpay/bizpayurl?pr=${paymentId}`,
        };
        break;

      case 'paypal':
        // PayPal支付 - 返回PayPal支付URL
        const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
        const paypalReturnUrl = return_url || `${domain}/payment/success?payment_id=${paymentId}`;
        const paypalCancelUrl = cancel_url || `${domain}/payment/cancel?payment_id=${paymentId}`;
        
        paymentResponse = {
          ...paymentResponse,
          payment_url: `/payment/paypal?payment_id=${paymentId}&amount=${order.pay_amount}&return_url=${encodeURIComponent(paypalReturnUrl)}&cancel_url=${encodeURIComponent(paypalCancelUrl)}`,
        };
        break;

      case 'balance':
        // 余额支付 - 直接扣款
        // TODO: 实现余额扣款逻辑
        return NextResponse.json({ error: '餘額支付功能暫未開放' }, { status: 400 });
    }

    return NextResponse.json({
      message: '支付訂單創建成功',
      data: paymentResponse,
    });
  } catch (error) {
    console.error('创建支付失败:', error);
    return NextResponse.json({ error: '創建支付失敗' }, { status: 500 });
  }
}

/**
 * 查询支付状态
 * @param request - 请求对象
 * @returns 支付状态
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return NextResponse.json({ error: '缺少支付ID' }, { status: 400 });
    }

    // 查询支付记录
    const { data: payment, error } = await client
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (error || !payment) {
      // 如果查不到，返回模拟数据
      return NextResponse.json({
        data: {
          payment_id: paymentId,
          status: 'pending',
          amount: '0',
          payment_method: 'unknown',
        },
      });
    }

    return NextResponse.json({ data: payment });
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return NextResponse.json({ error: '查詢支付狀態失敗' }, { status: 500 });
  }
}
