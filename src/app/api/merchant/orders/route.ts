import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-secret-key-2025';

function verifyMerchant(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'merchant') return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET: 获取商家订单
export async function GET(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '请先登录商家后台' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    // 获取该商家商品的订单
    let whereConditions = ['oi.goods_id IN (SELECT id FROM goods WHERE merchant_id = ?)'];
    let params: any[] = [merchant.merchantId];

    if (status) {
      whereConditions.push('o.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const orders = await query(
      `SELECT o.*, GROUP_CONCAT(oi.goods_name) as goods_names FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE ${whereClause} 
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT o.id) as total FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    return NextResponse.json({ success: true, data: orders, total, page, limit });
  } catch (error: any) {
    console.error('获取商家订单失败:', error);
    return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
  }
}
