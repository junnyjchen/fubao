/**
 * @fileoverview 购物车 API
 * @description 提供购物车的增删改查接口
 * @module app/api/cart/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 用户ID（临时方案，后续从认证获取） */
const TEMP_USER_ID = 'guest-user-001';

/**
 * 获取购物车列表
 * @param request - 请求对象
 * @returns 购物车列表响应
 */
export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();

    // 获取购物车项目
    const { data: cartItems, error } = await client
      .from('cart_items')
      .select(`
        id,
        goods_id,
        quantity,
        selected,
        created_at
      `)
      .eq('user_id', TEMP_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果购物车为空，直接返回
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 获取商品详情
    const goodsIds = cartItems.map(item => item.goods_id);
    const { data: goodsData } = await client
      .from('goods')
      .select('id, name, price, main_image, stock, status, merchant_id')
      .in('id', goodsIds);

    // 获取商户信息
    const merchantIds = [...new Set(goodsData?.map(g => g.merchant_id) || [])];
    const { data: merchantsData } = merchantIds.length > 0 
      ? await client.from('merchants').select('id, name').in('id', merchantIds)
      : { data: [] };

    // 合并数据
    const goodsMap = new Map(goodsData?.map(g => [g.id, g]) || []);
    const merchantsMap = new Map(merchantsData?.map(m => [m.id, m]) || []);

    // 格式化返回数据
    const formattedItems = cartItems.map((item: Record<string, unknown>) => {
      const goods = goodsMap.get(item.goods_id as number);
      const merchant = goods ? merchantsMap.get(goods.merchant_id as number) : null;
      
      return {
        id: item.id,
        goodsId: item.goods_id,
        goodsName: goods?.name || '',
        goodsImage: goods?.main_image || null,
        price: goods?.price || '0',
        quantity: item.quantity,
        selected: item.selected ?? true,
        stock: goods?.stock || 0,
        merchantId: goods?.merchant_id || 0,
        merchantName: merchant?.name || '',
        status: goods?.status ?? true,
      };
    });

    return NextResponse.json({ data: formattedItems });
  } catch (error) {
    return NextResponse.json(
      { error: '獲取購物車失敗' },
      { status: 500 }
    );
  }
}

/**
 * 添加商品到购物车
 * @param request - 请求对象
 * @returns 添加结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { goodsId, quantity = 1 } = body;

    if (!goodsId) {
      return NextResponse.json({ error: '商品ID不能為空' }, { status: 400 });
    }

    // 检查商品是否存在且上架
    const { data: goods, error: goodsError } = await client
      .from('goods')
      .select('id, stock, status')
      .eq('id', goodsId)
      .single();

    if (goodsError || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    if (!goods.status) {
      return NextResponse.json({ error: '商品已下架' }, { status: 400 });
    }

    // 检查购物车中是否已存在
    const { data: existingItem } = await client
      .from('cart_items')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .eq('goods_id', goodsId)
      .single();

    if (existingItem) {
      // 更新数量
      const newQuantity = Math.min(
        (existingItem.quantity || 0) + quantity,
        goods.stock
      );

      const { error: updateError } = await client
        .from('cart_items')
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingItem.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ message: '購物車已更新', quantity: newQuantity });
    } else {
      // 新增购物车项目
      const { error: insertError } = await client
        .from('cart_items')
        .insert({
          user_id: TEMP_USER_ID,
          goods_id: goodsId,
          quantity: Math.min(quantity, goods.stock),
          selected: true,
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ message: '已添加到購物車' });
    }
  } catch (error) {
    return NextResponse.json(
      { error: '添加到購物車失敗' },
      { status: 500 }
    );
  }
}

/**
 * 更新购物车项目
 * @param request - 请求对象
 * @returns 更新结果
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { id, quantity, selected } = body;

    if (!id) {
      return NextResponse.json({ error: '購物車項目ID不能為空' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (quantity !== undefined) {
      // 检查库存
      const { data: cartItem } = await client
        .from('cart_items')
        .select('goods_id')
        .eq('id', id)
        .single();

      if (cartItem) {
        const { data: goods } = await client
          .from('goods')
          .select('stock')
          .eq('id', cartItem.goods_id)
          .single();

        if (goods && quantity > goods.stock) {
          return NextResponse.json({ error: '庫存不足' }, { status: 400 });
        }
      }

      updateData.quantity = Math.max(1, quantity);
    }

    if (selected !== undefined) {
      updateData.selected = selected;
    }

    const { error } = await client
      .from('cart_items')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', TEMP_USER_ID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '更新購物車失敗' },
      { status: 500 }
    );
  }
}

/**
 * 删除购物车项目
 * @param request - 请求对象
 * @returns 删除结果
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const client = getSupabaseClient();

    if (id) {
      // 删除单个项目
      const { error } = await client
        .from('cart_items')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', TEMP_USER_ID);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // 清空购物车
      const { error } = await client
        .from('cart_items')
        .delete()
        .eq('user_id', TEMP_USER_ID);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '刪除購物車項目失敗' },
      { status: 500 }
    );
  }
}
