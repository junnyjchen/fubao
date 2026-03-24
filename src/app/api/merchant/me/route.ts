/**
 * @fileoverview 当前商户信息 API
 * @description 获取和更新当前登录商户的信息
 * @module app/api/merchant/me/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth/utils';

/**
 * 获取当前商户信息
 */
export async function GET(request: NextRequest) {
  try {
    // 从 Cookie 获取 token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 验证 token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const userId = payload.userId;

    // 根据 user_id 获取商户信息
    // 假设 users 表有 merchant_id 字段关联 merchants 表
    const { data: user, error: userError } = await client
      .from('users')
      .select('id, name, email, merchant_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 如果用户没有关联商户，返回未入驻状态
    if (!user.merchant_id) {
      return NextResponse.json({
        isMerchant: false,
        message: '您還未開通店鋪',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    }

    // 获取商户详细信息
    const { data: merchant, error: merchantError } = await client
      .from('merchants')
      .select(`
        id,
        name,
        type,
        logo,
        description,
        contact_name,
        contact_phone,
        contact_email,
        address,
        province,
        city,
        status,
        rating,
        total_sales,
        verified,
        qualifications,
        created_at
      `)
      .eq('id', user.merchant_id)
      .single();

    if (merchantError) {
      console.error('获取商户信息失败:', merchantError);
      return NextResponse.json({ error: '獲取商戶信息失敗' }, { status: 500 });
    }

    // 获取商户统计数据
    const [goodsResult, ordersResult] = await Promise.all([
      client
        .from('goods')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id),
      client
        .from('orders')
        .select('id, final_amount', { count: 'exact' })
        .eq('merchant_id', merchant.id),
    ]);

    const stats = {
      totalGoods: goodsResult.count || 0,
      totalOrders: ordersResult.count || 0,
      totalRevenue: ordersResult.data?.reduce((sum, o) => sum + (o.final_amount || 0), 0) || 0,
    };

    return NextResponse.json({
      isMerchant: true,
      merchant: {
        ...merchant,
        stats,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('获取商户信息失败:', error);
    return NextResponse.json({ error: '獲取商戶信息失敗' }, { status: 500 });
  }
}

/**
 * 更新当前商户信息
 */
export async function PUT(request: NextRequest) {
  try {
    // 从 Cookie 获取 token
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 验证 token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const userId = payload.userId;

    // 获取用户的商户ID
    const { data: user, error: userError } = await client
      .from('users')
      .select('merchant_id')
      .eq('id', userId)
      .single();

    if (userError || !user?.merchant_id) {
      return NextResponse.json({ error: '您還未開通店鋪' }, { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      description,
      logo,
      contact_name,
      contact_phone,
      contact_email,
      address,
      province,
      city,
      status,
    } = body;

    // 构建更新对象
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (contact_name !== undefined) updateData.contact_name = contact_name;
    if (contact_phone !== undefined) updateData.contact_phone = contact_phone;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (address !== undefined) updateData.address = address;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    updateData.updated_at = new Date().toISOString();

    // 更新商户信息
    const { error: updateError } = await client
      .from('merchants')
      .update(updateData)
      .eq('id', user.merchant_id);

    if (updateError) {
      console.error('更新商户信息失败:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新商户信息失败:', error);
    return NextResponse.json({ error: '更新商戶信息失敗' }, { status: 500 });
  }
}
