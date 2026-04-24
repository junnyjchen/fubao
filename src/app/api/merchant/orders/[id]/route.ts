/**
 * @fileoverview 商户订单详情API路由
 * @description 商户单个订单的查询和操作接口
 * @module app/api/merchant/orders/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import type { DbRecord } from '@/types/common';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-jwt-secret-key-2026';

// 验证商户身份中间件
async function verifyMerchant(request: NextRequest): Promise<{ userId: string; merchantId: string } | null> {
  const token = request.cookies.get('auth_token')?.value;

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
 * GET /api/merchant/orders/[id] - 获取订单详情
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  try {
    // 获取订单基本信息
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        users (id, nickname, phone, email, avatar),
        addresses (id, name, phone, province, city, district, address)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 获取订单项
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        goods (id, merchant_id, name)
      `)
      .eq('order_id', orderId);

    if (itemsError) {
      console.error('获取订单项失败:', itemsError);
    }

    // 验证订单中是否有该商户的商品
    const merchantItems = (orderItems || []).filter(
      (item: { goods?: { merchant_id?: string } }) => item.goods?.merchant_id === merchant.merchantId
    );

    if (merchantItems.length === 0) {
      return NextResponse.json({ error: '無權查看該訂單' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: merchantItems,
        // 商户只能看到自己商品的部分金额
        merchant_amount: merchantItems.reduce((sum: number, item: { total_price: number }) => sum + item.total_price, 0),
      },
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * PUT /api/merchant/orders/[id] - 更新订单状态
 * @description 商户操作：发货、备注等
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const merchant = await verifyMerchant(request);
  if (!merchant) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  try {
    const body = await request.json();
    const { action, logistics_company, logistics_no, merchant_remark } = body;

    // 获取订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        order_items (
          goods_id,
          goods (merchant_id)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    // 验证权限
    const hasPermission = (order.order_items as Array<{ goods?: { merchant_id?: string } }>)?.some(
      item => item.goods?.merchant_id === merchant.merchantId
    );

    if (!hasPermission) {
      return NextResponse.json({ error: '無權操作該訂單' }, { status: 403 });
    }

    const updateData: DbRecord = {
      updated_at: new Date().toISOString(),
    };

    // 根据操作类型更新
    switch (action) {
      case 'ship':
        // 发货
        if (order.status !== 1) {
          return NextResponse.json({ error: '訂單狀態不允許發貨' }, { status: 400 });
        }
        if (!logistics_company || !logistics_no) {
          return NextResponse.json({ error: '請填寫物流信息' }, { status: 400 });
        }
        updateData.status = 2;
        updateData.logistics_company = logistics_company;
        updateData.logistics_no = logistics_no;
        updateData.ship_time = new Date().toISOString();
        break;

      case 'remark':
        // 商户备注
        updateData.merchant_remark = merchant_remark;
        break;

      default:
        return NextResponse.json({ error: '無效的操作' }, { status: 400 });
    }

    // 执行更新
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('更新订单失败:', updateError);
      return NextResponse.json({ error: '操作失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '操作成功',
    });
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}
