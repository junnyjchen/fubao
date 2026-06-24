/**
 * @fileoverview 管理后台 - 提现管理 API
 */
import { NextResponse } from 'next/server';
import { query, update } from '@/lib/db';

/** 获取提现列表 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');

    let sql = 'SELECT w.*, u.username as username FROM withdrawals w LEFT JOIN users u ON w.user_id = u.id';
    const params: unknown[] = [];
    if (status) {
      sql += ' WHERE w.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSize, (page - 1) * pageSize);

    const withdrawals = await query(sql, params);
    return NextResponse.json({
      success: true, data: Array.isArray(withdrawals) ? withdrawals : [],
      page, pageSize,
    });
  } catch {
    return NextResponse.json({ success: true, data: [], page: 1, pageSize: 20 });
  }
}

/** 审核提现 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, remark } = body;
    if (!id || !status) return NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 });

    await update('withdrawals', {
      status, remark: remark || '',
      processed_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }, { id });

    return NextResponse.json({ success: true, message: '審核成功' });
  } catch {
    return NextResponse.json({ success: false, error: '審核失敗' }, { status: 500 });
  }
}
