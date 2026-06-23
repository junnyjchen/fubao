/**
 * @fileoverview PayPal 支付 API
 * 占位实现 — 对接 PayPal 时替换
 */

import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 创建 PayPal 支付订单 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ success: false, error: '缺少訂單信息' }, { status: 400 });
    }

    // TODO: 对接 PayPal SDK
    // const paypalOrder = await createPayPalOrder(amount);
    
    return NextResponse.json({
      success: false,
      error: 'PayPal 支付暫未開通，請使用其他支付方式',
    }, { status: 501 });
  } catch (error) {
    console.error('PayPal支付失败:', error);
    return NextResponse.json({ success: false, error: '支付失敗' }, { status: 500 });
  }
}
