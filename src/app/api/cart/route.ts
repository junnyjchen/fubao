/**
 * @fileoverview 购物车API
 * @description 购物车CRUD操作 - MySQL 实现
 * @module app/api/cart/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate, remove as dbRemove } from '@/lib/db';
import { verifyToken } from '@/lib/auth/utils';

/** 从请求获取用户ID */
function getUserId(request: NextRequest): number | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload?.userId) return parseInt(String(payload.userId));
  }
  return null;
}

/**
 * GET - 获取购物车列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const items = await query(
      `SELECT ci.id, ci.goods_id, ci.quantity, ci.selected,
              g.name as goods_name, g.price, g.original_price, g.main_image, g.stock, g.status,
              m.id as merchant_id, m.name as merchant_name, m.logo as merchant_logo, m.verified as merchant_verified
       FROM cart_items ci
       LEFT JOIN goods g ON ci.goods_id = g.id
       LEFT JOIN merchants m ON g.merchant_id = m.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    // 按商户分组
    const grouped: Record<number, { merchant: { id: number; name: string; logo: string | null; verified: number }; items: unknown[]; selectedAll: boolean }> = {};
    let totalItems = 0;
    let selectedItems = 0;
    let totalPrice = 0;
    let selectedPrice = 0;

    for (const item of items as any[]) {
      const mid = item.merchant_id || 0;
      if (!grouped[mid]) {
        grouped[mid] = {
          merchant: { id: mid, name: item.merchant_name || '自營', logo: item.merchant_logo, verified: item.merchant_verified || 0 },
          items: [],
          selectedAll: true,
        };
      }

      grouped[mid].items.push({
        id: item.id,
        quantity: item.quantity,
        selected: !!item.selected,
        goods: {
          id: item.goods_id,
          name: item.goods_name,
          price: parseFloat(item.price),
          original_price: parseFloat(item.original_price),
          image: item.main_image,
          stock: item.stock,
          status: item.status,
        },
      });

      totalItems++;
      totalPrice += parseFloat(item.price) * item.quantity;
      if (item.selected) {
        selectedItems++;
        selectedPrice += parseFloat(item.price) * item.quantity;
      } else {
        grouped[mid].selectedAll = false;
      }
    }

    return NextResponse.json({
      data: Object.values(grouped),
      summary: { totalItems, selectedItems, totalPrice, selectedPrice },
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    return NextResponse.json({ data: [], summary: { totalItems: 0, selectedItems: 0, totalPrice: 0, selectedPrice: 0 } });
  }
}

/**
 * POST - 添加商品到购物车
 */
export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { goods_id, quantity = 1 } = await request.json();
    if (!goods_id) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    // 检查商品是否存在
    const goods = await queryOne('SELECT id, stock, status FROM goods WHERE id = ?', [goods_id]);
    if (!goods || !goods.status) {
      return NextResponse.json({ error: '商品不存在或已下架' }, { status: 404 });
    }

    // 检查是否已在购物车
    const existing = await queryOne('SELECT id, quantity FROM cart_items WHERE user_id = ? AND goods_id = ?', [userId, goods_id]);

    if (existing) {
      // 更新数量
      await dbUpdate('cart_items', { quantity: (existing as any).quantity + quantity }, { id: (existing as any).id });
    } else {
      // 新增
      await dbInsert('cart_items', { user_id: userId, goods_id, quantity, selected: 1 });
    }

    return NextResponse.json({ message: '已添加到購物車' });
  } catch (error) {
    console.error('添加购物车失败:', error);
    return NextResponse.json({ error: '添加購物車失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新购物车项
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { id, quantity, selected } = await request.json();

    if (!id) {
      return NextResponse.json({ error: '缺少購物車項ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (selected !== undefined) updateData.selected = selected ? 1 : 0;

    await dbUpdate('cart_items', updateData, { id, user_id: userId });

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新购物车失败:', error);
    return NextResponse.json({ error: '更新購物車失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除购物车项
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await dbRemove('cart_items', { id: parseInt(id), user_id: userId });
    } else {
      // 清空购物车
      await dbRemove('cart_items', { user_id: userId });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除购物车失败:', error);
    return NextResponse.json({ error: '刪除購物車失敗' }, { status: 500 });
  }
}
