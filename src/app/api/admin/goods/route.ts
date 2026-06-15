/**
 * @fileoverview 管理后台 - 商品管理 API
 * @module app/api/admin/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('category_id');
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status !== null && status !== undefined && status !== '') {
      conditions.push('status = ?');
      params.push(parseInt(status));
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (categoryId) {
      conditions.push('category_id = ?');
      params.push(parseInt(categoryId));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const data = await query(
      `SELECT * FROM goods ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const total = await count(
      `SELECT COUNT(*) as cnt FROM goods ${whereClause}`,
      undefined,
      params
    );

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      total_pages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, total_pages: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, subtitle = '', description = '', main_image = '', images = '',
      price, original_price, stock = 0, category_id, merchant_id,
      purpose = '', type = 'physical', is_certified = 0,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: '商品名稱和價格為必填項' }, { status: 400 });
    }

    const id = await insert('goods', {
      name,
      subtitle,
      description,
      main_image,
      images,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      stock: parseInt(stock),
      category_id: category_id ? parseInt(category_id) : null,
      merchant_id: merchant_id ? parseInt(merchant_id) : null,
      purpose,
      type,
      is_certified: parseInt(is_certified),
      status: 1,
      sales: 0,
      views: 0,
    });

    const goods = await queryOne('SELECT * FROM goods WHERE id = ?', [id]);

    return NextResponse.json({ data: goods, message: '商品創建成功' }, { status: 201 });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json({ error: '創建商品失敗' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    const goods = await queryOne('SELECT id FROM goods WHERE id = ?', [id]);
    if (!goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const fields: Record<string, unknown> = {};
    const allowedFields = ['name', 'subtitle', 'description', 'main_image', 'images', 'price', 'original_price', 'stock', 'category_id', 'merchant_id', 'purpose', 'type', 'is_certified', 'status'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (['price', 'original_price'].includes(field)) {
          fields[field] = parseFloat(updateData[field]);
        } else if (['stock', 'category_id', 'merchant_id', 'is_certified', 'status'].includes(field)) {
          fields[field] = parseInt(updateData[field]);
        } else {
          fields[field] = updateData[field];
        }
      }
    }

    if (Object.keys(fields).length > 0) {
      await update('goods', fields, { id });
    }

    const updated = await queryOne('SELECT * FROM goods WHERE id = ?', [id]);
    return NextResponse.json({ data: updated, message: '商品更新成功' });
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    await remove('goods', { id });
    return NextResponse.json({ message: '商品刪除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
  }
}
