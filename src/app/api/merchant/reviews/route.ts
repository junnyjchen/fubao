import { NextRequest, NextResponse } from 'next/server';
import { query, insert, update, remove, count } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

// GET /api/merchant/reviews - 获取商家评价列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get('merchant_id');
    const goodsId = searchParams.get('goods_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (merchantId) { where += ' AND r.merchant_id = ?'; params.push(parseInt(merchantId)); }
    if (goodsId) { where += ' AND r.goods_id = ?'; params.push(parseInt(goodsId)); }

    const reviews = await query(
      `SELECT r.*, u.nickname as user_name, u.avatar as user_avatar,
              g.name as goods_name, g.main_image as goods_image
       FROM merchant_reviews r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN goods g ON r.goods_id = g.id
       ${where}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    let countWhere = '1=1';
    let countParams: unknown[] = [];
    if (merchantId) { countWhere = 'r.merchant_id = ?'; countParams = [parseInt(merchantId)]; }
    else if (goodsId) { countWhere = 'r.goods_id = ?'; countParams = [parseInt(goodsId)]; }
    const total = await count('merchant_reviews r', countWhere, countParams);

    return NextResponse.json({ reviews, total, page, limit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/merchant/reviews - 提交评价
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) return NextResponse.json({ error: '請先登錄' }, { status: 401 });

    const { merchant_id, goods_id, order_id, rating, content, images } = await request.json();

    if (!merchant_id || !rating) {
      return NextResponse.json({ error: '商家ID和评分必填' }, { status: 400 });
    }

    const id = await insert('merchant_reviews', {
      merchant_id, goods_id: goods_id || null, order_id: order_id || null,
      user_id: userId, rating, content: content || '', images: JSON.stringify(images || []),
    });

    // 更新商家评分
    const stats = await query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM merchant_reviews WHERE merchant_id = ?',
      [merchant_id]
    );
    if (stats && stats.length > 0) {
      await update('merchants', {
        rating: Math.round((stats[0].avg_rating || 0) * 10) / 10,
        review_count: stats[0].review_count || 0,
      }, { id: merchant_id });
    }

    return NextResponse.json({ success: true, id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
