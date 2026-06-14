import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
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

// GET: 获取商家信息
export async function GET(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '请先登录商家后台' }, { status: 401 });
  }

  try {
    const info = await queryOne('SELECT * FROM merchants WHERE id = ?', [merchant.merchantId]);
    if (!info) {
      return NextResponse.json({ error: '商家信息不存在' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: info });
  } catch (error: any) {
    console.error('获取商家信息失败:', error);
    return NextResponse.json({ error: '获取商家信息失败' }, { status: 500 });
  }
}

// PUT: 更新商家信息
export async function PUT(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '请先登录商家后台' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, contact_name, contact_phone, contact_email, address, description, logo, type } = body;

    await query(
      `UPDATE merchants SET name=?, contact_name=?, contact_phone=?, contact_email=?, address=?, description=?, logo=?, type=?, updated_at=NOW() WHERE id=?`,
      [name, contact_name, contact_phone, contact_email, address, description, logo, type, merchant.merchantId]
    );

    return NextResponse.json({ success: true, message: '商家信息更新成功' });
  } catch (error: any) {
    console.error('更新商家信息失败:', error);
    return NextResponse.json({ error: '更新商家信息失败' }, { status: 500 });
  }
}
