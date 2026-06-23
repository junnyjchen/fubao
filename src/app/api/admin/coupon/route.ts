/**
 * @fileoverview 管理后台 - 优惠券管理 API
 */
import { NextResponse } from 'next/server';
import { query, insert, update, remove } from '@/lib/db';

/** 获取优惠券列表 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const coupons = await query('SELECT * FROM coupons ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, (page - 1) * pageSize]);
    const totalResult = await query('SELECT COUNT(*) as cnt FROM coupons');
    const total = Array.isArray(totalResult) && totalResult[0] ? (totalResult[0] as Record<string, unknown>).cnt : 0;

    return NextResponse.json({
      success: true, data: Array.isArray(coupons) ? coupons : [],
      total: Number(total), page, pageSize,
    });
  } catch {
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20 });
  }
}

/** 创建优惠券 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, type, value, min_amount, max_uses, starts_at, expires_at } = body;
    if (!code || !type || value === undefined) {
      return NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 });
    }

    const id = await insert('coupons', {
      code, type, value: Number(value), min_amount: Number(min_amount || 0),
      max_uses: Number(max_uses || 0), used_count: 0,
      starts_at: starts_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
      expires_at: expires_at || null, is_active: 1,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: '創建失敗' }, { status: 500 });
  }
}

/** 更新优惠券 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await update('coupons', data, { id });
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch {
    return NextResponse.json({ success: false, error: '更新失敗' }, { status: 500 });
  }
}

/** 删除优惠券 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await remove('coupons', { id: Number(id) });
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch {
    return NextResponse.json({ success: false, error: '刪除失敗' }, { status: 500 });
  }
}
