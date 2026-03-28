/**
 * @fileoverview 购物车API
 * @description 购物车CRUD操作
 * @module app/api/cart/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * GET - 获取购物车列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取

    const client = getSupabaseClient();

    // 获取购物车商品 - 不使用嵌入查询
    const { data: cartItems, error } = await client
      .from('cart_items')
      .select(`
        id,
        quantity,
        selected,
        created_at,
        goods_id
      `)
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    // 分开查询商品和商户信息
    let enrichedCartItems: any[] = [];
    if (cartItems && cartItems.length > 0) {
      const goodsIds = [...new Set(cartItems.map(item => item.goods_id).filter(Boolean))];
      
      if (goodsIds.length > 0) {
        // 查询商品信息
        const { data: goodsData } = await client
          .from('goods')
          .select('id, name, price, original_price, images, stock, status, merchant_id')
          .in('id', goodsIds);

        if (goodsData && goodsData.length > 0) {
          // 获取商户ID
          const merchantIds = [...new Set(goodsData.map(g => g.merchant_id).filter(Boolean))];
          
          // 查询商户信息
          const { data: merchantsData } = merchantIds.length > 0
            ? await client.from('merchants').select('id, name, logo, verified').in('id', merchantIds)
            : { data: [] };

          // 创建映射表
          const goodsMap = new Map(goodsData.map(g => [g.id, g]));
          const merchantsMap = new Map((merchantsData || []).map(m => [m.id, m]));

          // 合并数据
          enrichedCartItems = cartItems.map(item => {
            const goods = goodsMap.get(item.goods_id);
            if (!goods) return null;
            return {
              ...item,
              goods: {
                ...goods,
                merchants: goods.merchant_id ? (merchantsMap.get(goods.merchant_id) || null) : null
              }
            };
          }).filter((item): item is NonNullable<typeof item> => item !== null);
        }
      }
    }

    // 按商户分组
    const groupedByMerchant = enrichedCartItems.reduce((acc: any, item: any) => {
      const merchant = item.goods?.merchants;
      if (!merchant) return acc;

      const merchantId = merchant.id;
      if (!acc[merchantId]) {
        acc[merchantId] = {
          merchant: {
            id: merchant.id,
            name: merchant.name,
            logo: merchant.logo,
            verified: merchant.verified,
          },
          items: [],
          selectedAll: true,
        };
      }

      const cartItem = {
        id: item.id,
        quantity: item.quantity,
        selected: item.selected,
        goods: {
          id: item.goods.id,
          name: item.goods.name,
          price: parseFloat(item.goods.price),
          original_price: item.goods.original_price ? parseFloat(item.goods.original_price) : null,
          image: item.goods.images?.[0] || null,
          stock: item.goods.stock,
          status: item.goods.status,
        },
      };

      acc[merchantId].items.push(cartItem);
      if (!cartItem.selected) {
        acc[merchantId].selectedAll = false;
      }

      return acc;
    }, {});

    // 计算汇总信息
    let totalItems = 0;
    let selectedItems = 0;
    let totalPrice = 0;
    let selectedPrice = 0;

    Object.values(groupedByMerchant).forEach((group: any) => {
      group.items.forEach((item: any) => {
        totalItems++;
        if (item.selected) {
          selectedItems++;
          selectedPrice += item.goods.price * item.quantity;
        }
        totalPrice += item.goods.price * item.quantity;
      });
    });

    return NextResponse.json({
      data: Object.values(groupedByMerchant),
      summary: {
        totalItems,
        selectedItems,
        totalPrice,
        selectedPrice,
      },
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

/**
 * POST - 添加商品到购物车
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.user_id || 1; // TODO: 从认证获取
    const { goodsId, quantity = 1 } = body;

    if (!goodsId) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查商品是否存在且在售
    const { data: goods, error: goodsError } = await client
      .from('goods')
      .select('id, name, price, stock, status')
      .eq('id', goodsId)
      .single();

    if (goodsError || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    if (!goods.status) {
      return NextResponse.json({ error: '商品已下架' }, { status: 400 });
    }

    // 检查是否已在购物车中
    const { data: existingItem } = await client
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('goods_id', goodsId)
      .single();

    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > goods.stock) {
        return NextResponse.json({ error: '庫存不足' }, { status: 400 });
      }

      const { error: updateError } = await client
        .from('cart_items')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', existingItem.id);

      if (updateError) {
        return NextResponse.json({ error: '更新失敗' }, { status: 500 });
      }

      return NextResponse.json({
        message: '已更新購物車',
        data: { quantity: newQuantity },
      });
    }

    // 添加新商品
    if (quantity > goods.stock) {
      return NextResponse.json({ error: '庫存不足' }, { status: 400 });
    }

    const { error: insertError } = await client.from('cart_items').insert({
      user_id: userId,
      goods_id: goodsId,
      quantity,
      selected: true,
    });

    if (insertError) {
      return NextResponse.json({ error: '添加失敗' }, { status: 500 });
    }

    return NextResponse.json({
      message: '已添加到購物車',
      data: { quantity },
    });
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
    const userId = body.user_id || 1; // TODO: 从认证获取
    const { cartItemId, quantity, selected } = body;

    if (!cartItemId) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 验证购物车项属于当前用户
    const { data: cartItem, error: itemError } = await client
      .from('cart_items')
      .select('id, goods_id, goods(stock)')
      .eq('id', cartItemId)
      .eq('user_id', userId)
      .single();

    if (itemError || !cartItem) {
      return NextResponse.json({ error: '購物車項不存在' }, { status: 404 });
    }

    // 更新
    const updateData: any = { updated_at: new Date().toISOString() };
    if (quantity !== undefined) {
      if (quantity > (cartItem.goods as any).stock) {
        return NextResponse.json({ error: '庫存不足' }, { status: 400 });
      }
      updateData.quantity = quantity;
    }
    if (selected !== undefined) {
      updateData.selected = selected;
    }

    const { error: updateError } = await client
      .from('cart_items')
      .update(updateData)
      .eq('id', cartItemId);

    if (updateError) {
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || '1'; // TODO: 从认证获取
    const cartItemId = searchParams.get('cartItemId');
    const clearAll = searchParams.get('clearAll');

    const client = getSupabaseClient();

    if (clearAll === 'true') {
      // 清空购物车
      const { error: deleteError } = await client
        .from('cart_items')
        .delete()
        .eq('user_id', parseInt(userId));

      if (deleteError) {
        return NextResponse.json({ error: '清空失敗' }, { status: 500 });
      }

      return NextResponse.json({ message: '購物車已清空' });
    }

    if (!cartItemId) {
      return NextResponse.json({ error: '請選擇商品' }, { status: 400 });
    }

    // 删除单个商品
    const { error: deleteError } = await client
      .from('cart_items')
      .delete()
      .eq('id', parseInt(cartItemId))
      .eq('user_id', parseInt(userId));

    if (deleteError) {
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '已刪除' });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
