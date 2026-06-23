/**
 * @fileoverview 积分 API
 */
import { NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/auth/apiAuth';
import { query } from '@/lib/db';

/** 获取积分记录 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const points = await query('SELECT * FROM points WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, pageSize, (page - 1) * pageSize]);
    const totalResult = await query('SELECT COUNT(*) as cnt FROM points WHERE user_id = ?', [userId]);
    const total = Array.isArray(totalResult) && totalResult[0] ? (totalResult[0] as Record<string, unknown>).cnt : 0;

    return NextResponse.json({
      success: true, data: Array.isArray(points) ? points : [],
      total: Number(total), page, pageSize,
    });
  } catch {
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20 });
  }
}
