/**
 * @fileoverview 发票 API
 */
import { NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取发票列表 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });

    const invoices = await query('SELECT * FROM invoices WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return NextResponse.json({ success: true, data: Array.isArray(invoices) ? invoices : [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

/** 申请开票 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });

    const body = await request.json();
    const { orderId, type, title, taxId } = body;
    if (!orderId) return NextResponse.json({ success: false, error: '缺少訂單ID' }, { status: 400 });

    const id = await insert('invoices', {
      user_id: userId, order_id: Number(orderId), type: type || 'personal',
      title: title || '', tax_id: taxId || '', status: 'pending',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '申請成功', data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: '申請失敗' }, { status: 500 });
  }
}
