/**
 * @fileoverview 商品列表 API
 * @module app/api/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const categoryId = searchParams.get('category_id');
    const keyword = searchParams.get('keyword');
    const type = searchParams.get('type');
    const purpose = searchParams.get('purpose');
    const offset = (page - 1) * pageSize;

    const conditions: string[] = ['status = ?'];
    const params: unknown[] = [1];

    if (categoryId) {
      conditions.push('category_id = ?');
      params.push(parseInt(categoryId));
    }
    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (type) {
      conditions.push('purpose = ?');
      params.push(type);
    }
    if (purpose) {
      conditions.push('purpose = ?');
      params.push(purpose);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

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
