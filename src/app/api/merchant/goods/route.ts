import { NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove } from '@/lib/db';

// 验证商家身份
function verifyMerchant(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fubao-secret-key-2025');
    if (decoded.type !== 'merchant') return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET: 获取商家自己的商品列表
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
    const keyword = searchParams.get('keyword');
    const offset = (page - 1) * limit;

    let whereConditions = ['merchant_id = ?'];
    let params: any[] = [merchant.merchantId];

    if (status !== null && status !== undefined && status !== '') {
      whereConditions.push('status = ?');
      params.push(parseInt(status));
    }

    if (keyword) {
      whereConditions.push('name LIKE ?');
      params.push(`%${keyword}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    const goods = await query(
      `SELECT * FROM goods WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM goods WHERE ${whereClause}`,
      params
    );
    const total = countResult[0]?.total || 0;

    return NextResponse.json({ success: true, data: goods, total, page, limit });
  } catch (error: any) {
    console.error('获取商家商品失败:', error);
    return NextResponse.json({ error: '获取商品列表失败' }, { status: 500 });
  }
}

// POST: 商家发布商品
export async function POST(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '请先登录商家后台' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name, subtitle, price, original_price, stock, category_id,
      type, purpose, description, main_image, images, is_certified,
      specifications
    } = body;

    if (!name || !price || !stock) {
      return NextResponse.json({ error: '商品名称、价格和库存为必填项' }, { status: 400 });
    }

    const id = await insert('goods', {
      name, subtitle: subtitle || '', price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      stock: parseInt(stock), category_id: category_id || null,
      merchant_id: merchant.merchantId,
      type: type || 1, purpose: purpose || '',
      description: description || '',
      main_image: main_image || '', images: images || '',
      is_certified: is_certified ? 1 : 0,
      specifications: specifications ? JSON.stringify(specifications) : null,
      status: 1, sales: 0
    });

    return NextResponse.json({ success: true, id, message: '商品发布成功' });
  } catch (error: any) {
    console.error('商家发布商品失败:', error);
    return NextResponse.json({ error: '发布商品失败' }, { status: 500 });
  }
}

// PUT: 商家更新商品
export async function PUT(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '请先登录商家后台' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, subtitle, price, original_price, stock, category_id,
      type, purpose, description, main_image, images, is_certified, status, specifications } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    // 验证商品属于该商家
    const existing = await queryOne('SELECT * FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);
    if (!existing) {
      return NextResponse.json({ error: '商品不存在或不屬於該商家' }, { status: 403 });
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (original_price !== undefined) updateData.original_price = original_price ? parseFloat(original_price) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (category_id !== undefined) updateData.category_id = category_id;
    if (type !== undefined) updateData.type = type;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (description !== undefined) updateData.description = description;
    if (main_image !== undefined) updateData.main_image = main_image;
    if (images !== undefined) updateData.images = images;
    if (is_certified !== undefined) updateData.is_certified = is_certified ? 1 : 0;
    if (status !== undefined) updateData.status = parseInt(status);
    if (specifications !== undefined) updateData.specifications = specifications ? JSON.stringify(specifications) : null;

    await update('goods', id, updateData);

    return NextResponse.json({ success: true, message: '商品更新成功' });
  } catch (error: any) {
    console.error('商家更新商品失败:', error);
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
  }
}

// DELETE: 商家删除商品
export async function DELETE(request: Request) {
  const merchant = verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '请先登录商家后台' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    // 验证商品属于该商家
    const existing = await queryOne('SELECT * FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);
    if (!existing) {
      return NextResponse.json({ error: '商品不存在或不属于该商家' }, { status: 403 });
    }

    await query('DELETE FROM goods WHERE id = ? AND merchant_id = ?', [id, merchant.merchantId]);

    return NextResponse.json({ success: true, message: '商品已删除' });
  } catch (error: any) {
    console.error('商家删除商品失败:', error);
    return NextResponse.json({ error: '删除商品失败' }, { status: 500 });
  }
}
