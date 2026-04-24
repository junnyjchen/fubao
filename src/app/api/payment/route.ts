/* @ts-nocheck */
/**
 * @fileoverview 支付创建 API
 * @description 创建支付订单，生成支付链接或二维码
 * @module app/api/payment/route
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
 * 生成支付ID
 * @returns 支付ID
 */
function generatePaymentId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY${timestamp}${random}`;
}

/**
 * 生成模拟支付二维码
 * @param paymentId - 支付ID
 * @returns 二维码URL
 */
function generateMockQRCode(paymentId: string): string {
  // 在实际项目中，这里会调用第三方支付API生成真实二维码
  // 这里使用模拟数据
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentId}`;
}

/**
 * 支付方式配置
 */
const PAYMENT_METHODS = {
  alipay: {
    name: '支付宝',
    icon: 'alipay',
    type: 'qr',
  },
  wechat: {
    name: '微信支付',
    icon: 'wechat',
    type: 'qr',
  },
  balance: {
    name: '余额支付',
    icon: 'wallet',
    type: 'balance',
  },
  paypal: {
    name: 'PayPal',
    icon: 'paypal',
    type: 'redirect',
  },
  stripe: {
    name: '信用卡',
    icon: 'credit-card',
    type: 'card',
  },
};

/**
 * 创建支付订单
 * @param request - 请求对象
 * @returns 支付信息
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { order_id, payment_method = 'alipay' } = body;
    
    if (!order_id) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
    }

    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 查询订单
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 检查订单状态
    if (order.pay_status === 1) {
      return NextResponse.json({ error: '訂單已支付' }, { status: 400 });
    }

    if (order.order_status === 4) {
      return NextResponse.json({ error: '訂單已取消' }, { status: 400 });
    }

    // 检查是否已有支付记录
    const { data: existingPayment } = await client
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .eq('status', 'pending')
      .single();

    if (existingPayment) {
      // 返回现有支付记录
      return NextResponse.json({
        success: true,
        data: {
          payment_id: existingPayment.payment_id,
          amount: existingPayment.amount,
          status: existingPayment.status,
          qr_code: existingPayment.qr_code,
          expire_time: existingPayment.expire_time,
          payment_method: existingPayment.payment_method,
        },
      });
    }

    // 生成新的支付记录
    const paymentId = generatePaymentId();
    const now = new Date();
    const expireTime = new Date(now.getTime() + 15 * 60 * 1000); // 15分钟后过期

    // 生成支付凭证
    let qrCode: string | null = null;
    let redirectUrl: string | null = null;
    let clientSecret: string | null = null;

    switch (payment_method) {
      case 'alipay':
      case 'wechat':
        qrCode = generateMockQRCode(paymentId);
        break;
      case 'paypal':
        // 在实际项目中，这里会调用PayPal API创建支付订单
        redirectUrl = `${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/payment/${paymentId}/paypal`;
        break;
      case 'stripe':
        // 在实际项目中，这里会调用Stripe API创建支付意向
        clientSecret = `pi_${Math.random().toString(36).substring(2)}`;
        break;
      case 'balance':
        // 余额支付直接检查余额
        const { data: user } = await client
          .from('users')
          .select('balance')
          .eq('id', userId)
          .single();

        if (!user || parseFloat(user.balance || '0') < parseFloat(order.total_amount)) {
          return NextResponse.json({ error: '餘額不足' }, { status: 400 });
        }
        break;
      default:
        return NextResponse.json({ error: '不支持的支付方式' }, { status: 400 });
    }

    // 创建支付记录
    const { data: payment, error: paymentError } = await client
      .from('payments')
      .insert({
        payment_id: paymentId,
        order_id: order_id,
        user_id: userId,
        amount: order.pay_amount,
        payment_method: payment_method,
        status: 'pending',
        qr_code: qrCode,
        redirect_url: redirectUrl,
        client_secret: clientSecret,
        expire_time: expireTime.toISOString(),
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('创建支付记录失败:', paymentError);
      return NextResponse.json({ error: '創建支付失敗' }, { status: 500 });
    }

    // 如果是余额支付，直接完成支付
    if (payment_method === 'balance') {
      // 扣除余额
      await client
        .from('users')
        .update({
          balance: `balance - ${order.total_amount}::numeric`,
          updated_at: now.toISOString(),
        })
        .eq('id', userId);

      // 更新支付状态
      await client
        .from('payments')
        .update({
          status: 'success',
          paid_at: now.toISOString(),
          transaction_id: `BAL${paymentId}`,
        })
        .eq('payment_id', paymentId);

      // 更新订单状态
      await client
        .from('orders')
        .update({
          pay_status: 1,
          order_status: 1,
          pay_time: now.toISOString(),
          transaction_id: `BAL${paymentId}`,
        })
        .eq('id', order_id);

      return NextResponse.json({
        success: true,
        data: {
          payment_id: paymentId,
          amount: order.pay_amount,
          status: 'success',
          redirect_to: `/order/${order_id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        payment_id: paymentId,
        amount: order.pay_amount,
        status: 'pending',
        qr_code: qrCode,
        redirect_url: redirectUrl,
        client_secret: clientSecret,
        expire_time: expireTime.toISOString(),
        payment_method: payment_method,
        method_info: PAYMENT_METHODS[payment_method as keyof typeof PAYMENT_METHODS],
      },
    });
  } catch (error) {
    console.error('创建支付失败:', error);
    return NextResponse.json({ error: '創建支付失敗' }, { status: 500 });
  }
}
