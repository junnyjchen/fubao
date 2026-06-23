/**
 * @fileoverview 商品评价 API
 */

import { NextResponse } from 'next/server';
import { query, insert, count } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取评价列表 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goodsId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (goodsId) {
      whereClause += ' AND goods_id = ?';
      params.push(Number(goodsId));
    }

    const total = await count('reviews', goodsId ? `goods_id = ${Number(goodsId)}` : '').catch(() => 0);
    const reviews = await query(
      `SELECT * FROM reviews ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return NextResponse.json({
      success: true,
      data: Array.isArray(reviews) ? reviews : [],
      total: Number(total) || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('获取评价失败:', error);
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
  }
}

/** 创建评价 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { goodsId, orderId, rating, content } = body;

    if (!goodsId || !rating || !content) {
      return NextResponse.json({ success: false, error: '缺少必填字段' }, { status: 400 });
    }

    const id = await insert('reviews', {
      user_id: userId,
      goods_id: Number(goodsId),
      order_id: orderId ? Number(orderId) : null,
      rating: Number(rating),
      content,
      status: 1,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({
      success: true,
      message: '評價提交成功',
      data: { id },
    });
  } catch (error) {
    console.error('创建评价失败:', error);
    return NextResponse.json({ success: false, error: '評價提交失敗' }, { status: 500 });
  }
}
