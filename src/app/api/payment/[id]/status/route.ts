/**
 * @fileoverview 支付状态查询 API
 * @description 查询支付订单状态
 * @module app/api/payment/[id]/status/route
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
 * 查询支付状态
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 支付状态信息
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;
    const client = getSupabaseClient();

    // 获取当前用户ID
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 查询支付记录
    const { data: payment, error: paymentError } = await client
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('user_id', userId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: '支付記錄不存在' }, { status: 404 });
    }

    // 检查是否过期
    const now = new Date();
    const expireTime = new Date(payment.expire_time);
    const isExpired = now > expireTime;

    if (payment.status === 'pending' && isExpired) {
      // 更新为已过期
      await client
        .from('payments')
        .update({
          status: 'expired',
          updated_at: now.toISOString(),
        })
        .eq('payment_id', paymentId);

      return NextResponse.json({
        success: true,
        status: 'expired',
        message: '支付已過期',
      });
    }

    return NextResponse.json({
      success: true,
      status: payment.status,
      data: {
        payment_id: payment.payment_id,
        order_id: payment.order_id,
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.payment_method,
        created_at: payment.created_at,
        expire_time: payment.expire_time,
        paid_at: payment.paid_at,
        transaction_id: payment.transaction_id,
      },
    });
  } catch (error) {
    console.error('查询支付状态失败:', error);
    return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
  }
}
