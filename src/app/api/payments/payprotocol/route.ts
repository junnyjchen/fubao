/**
 * @fileoverview Pay Protocol 支付创建 API
 * @description 创建 Pay Protocol 加密货币支付订单，返回支付链接
 * @module app/api/payments/payprotocol/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';
import {
  getPayProtocolConfig,
  createPaymentOrder,
  getPaymentPageUrl,
} from '@/lib/payprotocol';

/**
 * 获取当前用户ID
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const payload = verifyToken(token);
    return payload?.userId || null;
  } catch {
    return null;
  }
}

/**
 * POST - 创建 Pay Protocol 支付订单
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: '缺少訂單ID或金額' }, { status: 400 });
    }

    // 获取用户
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 获取 Pay Protocol 配置
    const config = await getPayProtocolConfig();
    if (!config) {
      return NextResponse.json({ error: 'Pay Protocol 支付未啟用或未配置，請在後台設置中開啟並填寫API Key和Secret' }, { status: 400 });
    }

    // 查询订单
    const client = getSupabaseClient();
    const { data: order, error } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (order.pay_status === 1) {
      return NextResponse.json({ error: '訂單已支付' }, { status: 400 });
    }

    // 生成商户订单号
    const outTradeNo = `FB${Date.now()}${orderId}`;

    // 构建回调地址
    const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || `http://localhost:${process.env.DEPLOY_RUN_PORT || 5000}`;
    const notifyUrl = `${domain.startsWith('http') ? domain : `https://${domain}`}/api/payprotocol/callback`;
    const redirectionUrl = `${domain.startsWith('http') ? domain : `https://${domain}`}/payment/success?orderId=${orderId}`;

    // 创建 Pay Protocol 支付订单
    const result = await createPaymentOrder(config, {
      outTradeNo,
      description: `符寶網訂單 ${order.order_no || orderId}`,
      quoteAmount: String(amount),
      notifyUrl,
      redirectionUrl,
    });

    // 获取完整支付页面 URL
    const fullPaymentUrl = getPaymentPageUrl(config, result.data.paymentUrl);

    // 保存支付记录到数据库
    const paymentId = `PAYPP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date();
    const expireTime = new Date(now.getTime() + 30 * 60 * 1000); // 30分钟过期

    await client.from('payments').insert({
      payment_id: paymentId,
      order_id: orderId,
      user_id: userId,
      amount: String(amount),
      payment_method: 'payprotocol',
      status: 'pending',
      redirect_url: fullPaymentUrl,
      transaction_id: result.data.outPaymentNo,
      expire_time: expireTime.toISOString(),
      created_at: now.toISOString(),
    } as any);

    return NextResponse.json({
      data: {
        paymentId,
        outPaymentNo: result.data.outPaymentNo,
        paymentUrl: fullPaymentUrl,
        walletAddress: result.data.userWalletAddress,
        amount: String(amount),
        currency: config.currency,
        orderId,
      },
    });
  } catch (error: any) {
    console.error('[PayProtocol] 创建支付失败:', error);
    return NextResponse.json(
      { error: error.message || '創建Pay Protocol支付失敗' },
      { status: 500 }
    );
  }
}

/**
 * PUT - 查询 Pay Protocol 支付状态
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询订单
    const { data: order, error: fetchError } = await client
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 更新订单状态为已支付
    const { data: updatedOrder, error: updateError } = await client
      .from('orders')
      .update({
        pay_status: 1,
        order_status: 1,
        pay_method: 'payprotocol',
        pay_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: (updateError as any).message || '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      data: updatedOrder,
      message: '支付成功',
    });
  } catch (error: any) {
    console.error('[PayProtocol] 更新支付状态失败:', error);
    return NextResponse.json({ error: error.message || '操作失敗' }, { status: 500 });
  }
}
