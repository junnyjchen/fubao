/* @ts-nocheck */
/**
 * @fileoverview 购物车API
 * @description 购物车CRUD操作 - 支持本地模式
 */

import { NextRequest, NextResponse } from 'next/server';

// 本地模式购物车存储
const getMockCart = () => {
  if (!globalThis.mockCart) {
    globalThis.mockCart = [];
  }
  return globalThis.mockCart;
};

const getMockGoods = () => {
  if (!globalThis.mockGoods) {
    globalThis.mockGoods = [
      { id: 1, name: '五行開運符', price: 99, original_price: 199, images: ['/placeholder.svg'], stock: 100, status: true, merchant_id: 1 },
      { id: 2, name: '桃木劍', price: 299, original_price: 599, images: ['/placeholder.svg'], stock: 50, status: true, merchant_id: 1 },
      { id: 3, name: '風水羅盤', price: 599, original_price: 999, images: ['/placeholder.svg'], stock: 30, status: true, merchant_id: 1 },
    ];
  }
  return globalThis.mockGoods;
};

const getMockMerchants = () => {
  if (!globalThis.mockMerchants) {
    globalThis.mockMerchants = [
      { id: 1, name: '符寶官方店', logo: null, verified: true },
    ];
  }
  return globalThis.mockMerchants;
};

function getUserId(request?: NextRequest, body?: any) {
  // 尝试从 Authorization header 获取用户信息
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          if (payload.userId) return payload.userId;
        }
      } catch (e) {}
    }
  }
  // 从 body 获取
  if (body?.user_id) return body.user_id;
  // 从 query 获取
  if (request) {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('user_id');
    if (uid) return parseInt(uid);
  }
  return 1;
}

/**
 * GET - 获取购物车列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const cart = getMockCart();
    const goods = getMockGoods();
    const merchants = getMockMerchants();

    // 过滤当前用户的购物车
    const userCart = cart.filter(item => item.user_id === userId);

    // 按商户分组
    const groupedByMerchant = {};
    for (const item of userCart) {
      const g = goods.find(g => g.id === item.goods_id);
      if (!g) continue;

      const m = g.merchant_id ? merchants.find(m => m.id === g.merchant_id) : { id: 0, name: '自營', logo: null, verified: true };
      if (!m) continue;

      const merchantId = m.id;
      if (!groupedByMerchant[merchantId]) {
        groupedByMerchant[merchantId] = {
          merchant: { id: m.id, name: m.name, logo: m.logo, verified: m.verified },
          items: [],
          selectedAll: true,
        };
      }

      groupedByMerchant[merchantId].items.push({
        id: item.id,
        quantity: item.quantity,
        selected: item.selected,
        goods: {
          id: g.id,
          name: g.name,
          price: g.price,
          original_price: g.original_price,
          image: g.images?.[0] || null,
          stock: g.stock,
          status: g.status,
        },
      });

      if (!item.selected) {
        groupedByMerchant[merchantId].selectedAll = false;
      }
    }

    // 计算汇总
    let totalItems = 0, selectedItems = 0, totalPrice = 0, selectedPrice = 0;
    Object.values(groupedByMerchant).forEach((group: any) => {
      group.items.forEach((item: any) => {
        totalItems++;
        totalPrice += item.goods.price * item.quantity;
        if (item.selected) {
          selectedItems++;
          selectedPrice += item.goods.price * item.quantity;
        }
      });
    });

    return NextResponse.json({
      data: Object.values(groupedByMerchant),
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
    const body = await request.json();
    const userId = getUserId(request, body);
    const { goodsId, quantity = 1 } = body;

    if (!goodsId) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    const cart = getMockCart();
    const goods = getMockGoods();
    const g = goods.find(g => g.id === goodsId);

    if (!g) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    if (!g.status) {
      return NextResponse.json({ error: '商品已下架' }, { status: 400 });
    }

    // 检查是否已在购物车中
    const existing = cart.find(item => item.user_id === userId && item.goods_id === goodsId);

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      if (newQuantity > g.stock) {
        return NextResponse.json({ error: '庫存不足' }, { status: 400 });
      }
      existing.quantity = newQuantity;
      return NextResponse.json({ message: '已更新購物車', data: { quantity: newQuantity } });
    }

    if (quantity > g.stock) {
      return NextResponse.json({ error: '庫存不足' }, { status: 400 });
    }

    // 添加新商品
    cart.push({
      id: Date.now(),
      user_id: userId,
      goods_id: goodsId,
      quantity,
      selected: true,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ message: '已添加到購物車', data: { quantity } });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    return NextResponse.json({ error: '添加失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新购物车商品
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserId(request, body);
    const { cartItemId, quantity, selected } = body;

    if (!cartItemId) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    const cart = getMockCart();
    const item = cart.find(item => item.id === cartItemId && item.user_id === userId);

    if (!item) {
      return NextResponse.json({ error: '購物車項不存在' }, { status: 404 });
    }

    if (quantity !== undefined) {
      const goods = getMockGoods();
      const g = goods.find(g => g.id === item.goods_id);
      if (g && quantity > g.stock) {
        return NextResponse.json({ error: '庫存不足' }, { status: 400 });
      }
      item.quantity = quantity;
    }
    if (selected !== undefined) {
      item.selected = selected;
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新购物车失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除购物车商品
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');
    const clearAll = searchParams.get('clearAll');
    const cart = getMockCart();

    if (clearAll === 'true') {
      // 清空当前用户的购物车
      const indices = cart.reduce((acc, item, idx) => {
        if (item.user_id === userId) acc.push(idx);
        return acc;
      }, [] as number[]);
      indices.reverse().forEach(idx => cart.splice(idx, 1));
      return NextResponse.json({ message: '購物車已清空' });
    }

    if (!cartItemId) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    const idx = cart.findIndex(item => item.id === parseInt(cartItemId) && item.user_id === userId);
    if (idx === -1) {
      return NextResponse.json({ error: '購物車項不存在' }, { status: 404 });
    }

    cart.splice(idx, 1);
    return NextResponse.json({ message: '已刪除' });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
