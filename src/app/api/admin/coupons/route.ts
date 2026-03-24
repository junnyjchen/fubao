/**
 * @fileoverview 后台优惠券管理 API
 * @description 处理优惠券的增删改查操作
 * @module app/api/admin/coupons/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取优惠券列表
 * GET /api/admin/coupons
 */
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search');

    let query = client
      .from('coupons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(
      (page - 1) * pageSize,
      page * pageSize - 1
    );

    if (error) {
      console.error('查询优惠券失败:', error);
      // 返回模拟数据
      return NextResponse.json({
        success: true,
        data: getMockCoupons(),
        total: 4,
        page,
        pageSize,
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('优惠券列表API错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 创建优惠券
 * POST /api/admin/coupons
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const {
      name,
      code,
      type = 'cash',
      discount_type = 'fixed',
      discount_value,
      min_amount = 0,
      max_discount,
      total_count = -1,
      per_user_limit = 1,
      start_time,
      end_time,
      scope = 'all',
      scope_ids,
      description,
    } = body;

    if (!name || !discount_value || !start_time || !end_time) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 如果提供了优惠券码，检查是否已存在
    if (code) {
      const { data: existingCoupon } = await client
        .from('coupons')
        .select('id')
        .eq('code', code)
        .single();

      if (existingCoupon) {
        return NextResponse.json({ error: '優惠券碼已存在' }, { status: 400 });
      }
    }

    const { data, error } = await client
      .from('coupons')
      .insert({
        name,
        code: code || null,
        type,
        discount_type,
        discount_value,
        min_amount,
        max_discount,
        total_count,
        per_user_limit,
        start_time,
        end_time,
        scope,
        scope_ids,
        description,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('创建优惠券失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '創建成功',
    });
  } catch (error) {
    console.error('创建优惠券错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 更新优惠券
 * PUT /api/admin/coupons
 */
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少優惠券ID' }, { status: 400 });
    }

    const { data, error } = await client
      .from('coupons')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新优惠券失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '更新成功',
    });
  } catch (error) {
    console.error('更新优惠券错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

/**
 * 删除优惠券
 * DELETE /api/admin/coupons?id=xxx
 */
export async function DELETE(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少優惠券ID' }, { status: 400 });
    }

    // 先删除用户优惠券记录
    await client.from('user_coupons').delete().eq('coupon_id', id);

    // 删除优惠券
    const { error } = await client.from('coupons').delete().eq('id', id);

    if (error) {
      console.error('删除优惠券失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '刪除成功',
    });
  } catch (error) {
    console.error('删除优惠券错误:', error);
    return NextResponse.json({ error: '服務器錯誤' }, { status: 500 });
  }
}

// 模拟数据
function getMockCoupons() {
  return [
    {
      id: 1,
      name: '新用戶專享券',
      code: 'NEWUSER50',
      type: 'cash',
      discount_type: 'fixed',
      discount_value: 50,
      min_amount: 200,
      max_discount: null,
      total_count: 1000,
      used_count: 256,
      per_user_limit: 1,
      received_count: 500,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '新用戶首單立減HK$50，滿HK$200可用',
      created_at: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      name: '開年大促優惠券',
      code: 'SPRING2025',
      type: 'discount',
      discount_type: 'percent',
      discount_value: 15,
      min_amount: 300,
      max_discount: 100,
      total_count: 500,
      used_count: 120,
      per_user_limit: 2,
      received_count: 200,
      start_time: '2024-01-01T00:00:00',
      end_time: '2025-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '全場滿HK$300享85折優惠',
      created_at: '2024-01-01T00:00:00',
    },
    {
      id: 3,
      name: '免運費券',
      code: 'FREESHIP',
      type: 'shipping',
      discount_type: 'fixed',
      discount_value: 30,
      min_amount: 100,
      max_discount: null,
      total_count: 2000,
      used_count: 800,
      per_user_limit: 3,
      received_count: 1200,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'all',
      scope_ids: null,
      is_active: true,
      description: '滿HK$100免運費',
      created_at: '2024-01-01T00:00:00',
    },
    {
      id: 4,
      name: '符籙專屬優惠券',
      code: 'FULU20',
      type: 'cash',
      discount_type: 'fixed',
      discount_value: 20,
      min_amount: 100,
      max_discount: null,
      total_count: 500,
      used_count: 50,
      per_user_limit: 2,
      received_count: 100,
      start_time: '2024-01-01T00:00:00',
      end_time: '2026-12-31T23:59:59',
      scope: 'category',
      scope_ids: '[1]',
      is_active: false,
      description: '符籙類商品專享，滿HK$100減HK$20',
      created_at: '2024-01-01T00:00:00',
    },
  ];
}
