/**
 * @fileoverview 商品详情 API
 * @description 提供商品详情查询、更新、删除功能
 * @module app/api/goods/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取商品详情
 * @param request - 请求对象
 * @param params - 路由参数
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);

    if (isNaN(goodsId)) {
      return NextResponse.json({ error: '無效的商品ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询商品
    const { data: goods, error } = await client
      .from('goods')
      .select('*')
      .eq('id', goodsId)
      .single();

    if (error || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 查询商户信息
    const { data: merchant } = await client
      .from('merchants')
      .select('id, name, type, logo, certification_level, rating, total_sales')
      .eq('id', goods.merchant_id)
      .single();

    // 查询认证证书
    const { data: certificates } = await client
      .from('certificates')
      .select('*')
      .eq('goods_id', goodsId);

    return NextResponse.json({
      data: {
        ...goods,
        merchants: merchant || null,
        certificates: certificates || [],
      },
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json({ error: '獲取商品詳情失敗' }, { status: 500 });
  }
}

/**
 * 更新商品
 * @param request - 请求对象
 * @param params - 路由参数
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);
    const body = await request.json();

    if (isNaN(goodsId)) {
      return NextResponse.json({ error: '無效的商品ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查商品是否存在
    const { data: existing } = await client
      .from('goods')
      .select('id')
      .eq('id', goodsId)
      .single();

    if (!existing) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 构建更新数据
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    if (body.name !== undefined) updateData.name = body.name;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.price !== undefined) updateData.price = String(body.price);
    if (body.original_price !== undefined) updateData.original_price = body.original_price ? String(body.original_price) : null;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.main_image !== undefined) updateData.main_image = body.main_image;
    if (body.images !== undefined) updateData.images = body.images;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.is_certified !== undefined) updateData.is_certified = body.is_certified;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sort !== undefined) updateData.sort = body.sort;

    // 执行更新
    const { data, error } = await client
      .from('goods')
      .update(updateData)
      .eq('id', goodsId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
  }
}

/**
 * 删除商品
 * @param request - 请求对象
 * @param params - 路由参数
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goodsId = parseInt(id);

    if (isNaN(goodsId)) {
      return NextResponse.json({ error: '無效的商品ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 检查是否有关联的订单
    const { data: orderItems } = await client
      .from('order_items')
      .select('id')
      .eq('goods_id', goodsId)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      // 有订单关联，改为下架
      const { error } = await client
        .from('goods')
        .update({ status: false, updated_at: new Date().toISOString() })
        .eq('id', goodsId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ 
        data: { id: goodsId },
        message: '商品已下架（存在關聯訂單）' 
      });
    }

    // 无关联，直接删除
    const { error } = await client
      .from('goods')
      .delete()
      .eq('id', goodsId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: { id: goodsId },
      message: '商品已刪除' 
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
  }
}
