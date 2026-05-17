/**
 * @fileoverview 商户 API
 * @description 处理商户的增删改查 - MySQL 实现
 * @module app/api/merchants/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count, insert as dbInsert } from '@/lib/db';

/**
 * 获取商户列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (keyword && keyword.trim()) {
      conditions.push('(name LIKE ? OR contact_name LIKE ?)');
      params.push(`%${keyword.trim()}%`, `%${keyword.trim()}%`);
    }

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status === 'active' ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = await count('merchants', conditions.length > 0 ? conditions.join(' AND ') : undefined, conditions.length > 0 ? params : undefined);

    const data = await query(
      `SELECT * FROM merchants ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('获取商户失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 20 });
  }
}

/**
 * 创建商户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, contact_name, contact_phone, contact_email, description, address, license_number, user_id } = body;

    if (!name) {
      return NextResponse.json({ error: '商戶名稱不能為空' }, { status: 400 });
    }

    const id = await dbInsert('merchants', {
      name,
      type: type || 'individual',
      contact_name: contact_name || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      description: description || null,
      address: address || null,
      license_number: license_number || null,
      user_id: user_id || null,
      status: 1,
      verified: 0,
    });

    return NextResponse.json({ data: { id, name }, message: '商戶創建成功' });
  } catch (error) {
    console.error('创建商户失败:', error);
    return NextResponse.json({ error: '創建商戶失敗' }, { status: 500 });
  }
}
