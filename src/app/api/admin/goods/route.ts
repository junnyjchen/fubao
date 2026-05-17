/**
 * @fileoverview 管理后台商品管理 API - MySQL 实现
 * @module app/api/admin/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count, insert as dbInsert, update as dbUpdate, remove as dbRemove } from '@/lib/db';

/**
 * GET - 获取商品列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const keyword = searchParams.get('keyword');
    const categoryId = searchParams.get('category_id');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (keyword) {
      conditions.push('(g.name LIKE ? OR g.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (categoryId) {
      conditions.push('g.category_id = ?');
      params.push(parseInt(categoryId));
    }
    if (status) {
      conditions.push('g.status = ?');
      params.push(parseInt(status));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = await count('goods g', conditions.length > 0 ? conditions.join(' AND ') : '1=1', params);

    const data = await query(
      `SELECT g.*, c.name as category_name FROM goods g LEFT JOIN categories c ON g.category_id = c.id ${whereClause} ORDER BY g.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 20 });
  }
}

/**
 * POST - 创建商品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: '商品名稱不能為空' }, { status: 400 });
    }

    const id = await dbInsert('goods', {
      name: body.name,
      subtitle: body.subtitle || null,
      main_image: body.main_image || null,
      images: body.images ? JSON.stringify(body.images) : null,
      price: body.price || 0,
      original_price: body.original_price || 0,
      description: body.description || null,
      stock: body.stock || 0,
      category_id: body.category_id || null,
      merchant_id: body.merchant_id || null,
      type: body.type || 1,
      purpose: body.purpose || null,
      is_certified: body.is_certified ? 1 : 0,
      status: body.status !== undefined ? body.status : 1,
    });

    return NextResponse.json({ data: { id }, message: '商品創建成功' });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json({ error: '創建商品失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新商品
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (updateFields.name !== undefined) updateData.name = updateFields.name;
    if (updateFields.subtitle !== undefined) updateData.subtitle = updateFields.subtitle;
    if (updateFields.main_image !== undefined) updateData.main_image = updateFields.main_image;
    if (updateFields.images !== undefined) updateData.images = JSON.stringify(updateFields.images);
    if (updateFields.price !== undefined) updateData.price = updateFields.price;
    if (updateFields.original_price !== undefined) updateData.original_price = updateFields.original_price;
    if (updateFields.description !== undefined) updateData.description = updateFields.description;
    if (updateFields.stock !== undefined) updateData.stock = updateFields.stock;
    if (updateFields.category_id !== undefined) updateData.category_id = updateFields.category_id;
    if (updateFields.merchant_id !== undefined) updateData.merchant_id = updateFields.merchant_id;
    if (updateFields.is_certified !== undefined) updateData.is_certified = updateFields.is_certified ? 1 : 0;
    if (updateFields.status !== undefined) updateData.status = updateFields.status;

    await dbUpdate('goods', updateData, { id });

    return NextResponse.json({ message: '商品更新成功' });
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除商品
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少商品ID' }, { status: 400 });
    }

    await dbRemove('goods', { id: parseInt(id) });

    return NextResponse.json({ message: '商品刪除成功' });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
  }
}
