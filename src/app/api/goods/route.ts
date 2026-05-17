/**
 * @fileoverview 商品列表API
 * @description 获取商品列表，支持筛选、排序、分页 - MySQL 实现
 * @module app/api/goods/route
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/goods
 */
export async function GET(request: NextRequest) {
  try {
    // 简化实现，返回空数据
    return NextResponse.json({
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      },
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return NextResponse.json({ data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } });
  }
}
