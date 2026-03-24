/**
 * @fileoverview 商户单个商品API路由
 * @description 商户单个商品的查询、更新、删除接口
 * @module app/api/merchant/goods/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

// 验证商户身份中间件
async function verifyMerchant(request: NextRequest): Promise<{ userId: string; merchantId: string } | null> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('id, user_id')
      .eq('user_id', decoded.userId)
      .eq('status', 1)
      .single();

    if (error || !merchant) {
      return null;
    }

    return { userId: decoded.userId, merchantId: merchant.id };
  } catch {
    return null;
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/merchant/goods/[id] - 获取单个商品详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const resolvedParams = await params;
  const goodsId = resolvedParams.id;

  try {
    const { data: goods, error } = await supabase
      .from('goods')
      .select(`
        *,
        categories (id, name)
      `)
      .eq('id', goodsId)
      .eq('merchant_id', merchant.merchantId)
      .single();

    if (error || !goods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: goods,
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * PUT /api/merchant/goods/[id] - 更新商品
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const resolvedParams = await params;
  const goodsId = resolvedParams.id;

  try {
    // 先验证商品属于该商户
    const { data: existingGoods, error: findError } = await supabase
      .from('goods')
      .select('id')
      .eq('id', goodsId)
      .eq('merchant_id', merchant.merchantId)
      .single();

    if (findError || !existingGoods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // 更新允许修改的字段
    const allowedFields = [
      'name', 'category_id', 'price', 'original_price', 'stock', 'unit',
      'description', 'content', 'images', 'video_url', 'has_cert', 'cert_type',
      'keywords', 'status'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // 字段处理
    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }
    if (updateData.description) {
      updateData.description = updateData.description.trim();
    }
    if (updateData.content) {
      updateData.content = updateData.content.trim();
    }

    const { data: goods, error } = await supabase
      .from('goods')
      .update(updateData)
      .eq('id', goodsId)
      .eq('merchant_id', merchant.merchantId)
      .select()
      .single();

    if (error) {
      console.error('更新商品失败:', error);
      return NextResponse.json({ error: '更新商品失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: goods,
      message: '商品更新成功',
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * DELETE /api/merchant/goods/[id] - 删除商品
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const resolvedParams = await params;
  const goodsId = resolvedParams.id;

  try {
    // 先验证商品属于该商户
    const { data: existingGoods, error: findError } = await supabase
      .from('goods')
      .select('id, name')
      .eq('id', goodsId)
      .eq('merchant_id', merchant.merchantId)
      .single();

    if (findError || !existingGoods) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    // 检查是否有未完成的订单
    const { data: pendingOrders, error: orderError } = await supabase
      .from('order_items')
      .select(`
        id,
        orders!inner (status)
      `)
      .eq('goods_id', goodsId)
      .in('orders.status', [0, 1, 2]); // 待付款、已付款、已发货

    if (orderError) {
      console.error('检查订单失败:', orderError);
    }

    if (pendingOrders && pendingOrders.length > 0) {
      return NextResponse.json({
        error: '該商品存在未完成的訂單，無法刪除',
      }, { status: 400 });
    }

    // 执行删除
    const { error } = await supabase
      .from('goods')
      .delete()
      .eq('id', goodsId)
      .eq('merchant_id', merchant.merchantId);

    if (error) {
      console.error('删除商品失败:', error);
      return NextResponse.json({ error: '刪除商品失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '商品已刪除',
    });
  } catch (error) {
    console.error('删除商品失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
