/**
 * @fileoverview 商家 API
 * @module app/api/merchants/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status !== null && status !== undefined && status !== '') {
      conditions.push('status = ?');
      params.push(parseInt(status));
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR contact_name LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const data = await query(
      `SELECT * FROM merchants ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const total = await count(
      `SELECT COUNT(*) as cnt FROM merchants ${whereClause}`,
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
    console.error('获取商家列表失败:', error);
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20, total_pages: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, type = 'enterprise', contact_name, contact_phone, contact_email,
      description = '', address = '', license_number = '', user_id
    } = body;

    if (!name || !contact_name) {
      return NextResponse.json({ error: '商家名稱和聯繫人姓名為必填項' }, { status: 400 });
    }

    // 检查是否已存在同名商家
    const existing = await queryOne('SELECT id FROM merchants WHERE name = ?', [name]);
    if (existing) {
      return NextResponse.json({ error: '該商家名稱已存在' }, { status: 400 });
    }

    const id = await insert('merchants', {
      name,
      type,
      contact_name,
      contact_phone: contact_phone || '',
      contact_email: contact_email || '',
      description,
      address,
      license_number,
      verified: 0,
      status: 1,
      user_id: user_id || null,
    });

    const merchant = await queryOne('SELECT * FROM merchants WHERE id = ?', [id]);

    return NextResponse.json({ success: true, data: merchant, message: '商家創建成功' }, { status: 201 });
  } catch (error) {
    console.error('创建商家失败:', error);
    return NextResponse.json({ error: '創建商家失敗' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少商家ID' }, { status: 400 });
    }

    const merchant = await queryOne('SELECT id FROM merchants WHERE id = ?', [id]);
    if (!merchant) {
      return NextResponse.json({ error: '商家不存在' }, { status: 404 });
    }

    // 只更新提供的字段
    const fields: Record<string, unknown> = {};
    const allowedFields = ['name', 'type', 'contact_name', 'contact_phone', 'contact_email', 'description', 'address', 'license_number', 'verified', 'status'];
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields[field] = updateData[field];
      }
    }

    if (Object.keys(fields).length > 0) {
      await update('merchants', fields, { id });
    }

    const updated = await queryOne('SELECT * FROM merchants WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: updated, message: '商家更新成功' });
  } catch (error) {
    console.error('更新商家失败:', error);
    return NextResponse.json({ error: '更新商家失敗' }, { status: 500 });
  }
}
