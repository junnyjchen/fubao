/**
 * @fileoverview 商品列表API
 * @description 获取商品列表，支持筛选、排序、分页 - MySQL 实现
 * @module app/api/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

/**
 * GET /api/goods
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('category_id');
    const merchantId = searchParams.get('merchant_id');
    const type = searchParams.get('type');
    const hot = searchParams.get('hot') === 'true';
    const isCertified = searchParams.get('is_certified');
    const keyword = searchParams.get('keyword');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const sort = searchParams.get('sort') || (hot ? 'sales' : 'created_at');
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // 构建 WHERE 条件
    const conditions: string[] = ['status = 1'];
    const params: unknown[] = [];

    if (categoryId) {
      conditions.push('category_id = ?');
      params.push(parseInt(categoryId));
    }

    if (merchantId) {
      conditions.push('merchant_id = ?');
      params.push(parseInt(merchantId));
    }

    if (type) {
      conditions.push('type = ?');
      params.push(parseInt(type));
    }

    if (isCertified !== null && isCertified !== undefined) {
      conditions.push('is_certified = ?');
      params.push(isCertified === 'true' ? 1 : 0);
    }

    if (keyword) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (minPrice) {
      conditions.push('price >= ?');
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      conditions.push('price <= ?');
      params.push(parseFloat(maxPrice));
    }

    // 排序字段白名单
    const allowedSorts = ['price', 'sales', 'created_at', 'name'];
    const sortColumn = allowedSorts.includes(sort) ? sort : 'created_at';
    const orderDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = conditions.join(' AND ');

    // 查询总数
    const total = await count('goods', whereClause, params);

    // 查询数据
    const data = await query(
      `SELECT id, name, subtitle, main_image, price, original_price, is_certified, sales, stock, type, purpose, merchant_id, category_id, created_at FROM goods WHERE ${whereClause} ORDER BY ${sortColumn} ${orderDir} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } });
  }
}
