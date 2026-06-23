/**
 * @fileoverview 充值 API
 */
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth/apiAuth';
import { query, insert } from '@/lib/db';

/** 获取充值记录 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });

    const records = await query('SELECT * FROM recharges WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return NextResponse.json({ success: true, data: Array.isArray(records) ? records : [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

/** 创建充值订单 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });

    const body = await request.json();
    const { amount, paymentMethod } = body;
    if (!amount || amount <= 0) return NextResponse.json({ success: false, error: '充值金額無效' }, { status: 400 });

    const id = await insert('recharges', {
      user_id: userId, amount: Number(amount), payment_method: paymentMethod || 'alipay',
      status: 'pending',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '充值訂單已創建', data: { id, amount } });
  } catch {
    return NextResponse.json({ success: false, error: '充值失敗' }, { status: 500 });
  }
}
