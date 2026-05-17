/**
 * @fileoverview 商品详情 API
 * @description 获取单个商品详情 - MySQL 实现
 * @module app/api/goods/[id]/route
 */

import { NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 获取商品详情
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 获取商品基本信息
    const goods = await queryOne('SELECT * FROM goods WHERE id = ? AND status = 1', [parseInt(id)]);

    if (!goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 获取商户信息
    let merchant = null;
    if (goods.merchant_id) {
      merchant = await queryOne('SELECT id, name, logo, verified FROM merchants WHERE id = ?', [goods.merchant_id]);
    }

    // 获取分类信息
    let category = null;
    if (goods.category_id) {
      category = await queryOne('SELECT id, name, slug FROM categories WHERE id = ?', [goods.category_id]);
    }

    // 获取相关商品（同分类）
    let relatedGoods: unknown[] = [];
    if (goods.category_id) {
      relatedGoods = await query(
        'SELECT id, name, price, main_image, sales FROM goods WHERE category_id = ? AND id != ? AND status = 1 ORDER BY sales DESC LIMIT 4',
        [goods.category_id, parseInt(id)]
      );
    }

    return NextResponse.json({
      data: {
        ...goods,
        merchant,
        category,
        related_goods: relatedGoods,
      },
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 });
  }
}
