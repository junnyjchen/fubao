/**
 * @fileoverview 商户详情 API
 * @description 提供商户详情查询、更新功能
 * @module app/api/merchants/[id]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取商户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchantId = parseInt(id);

    if (isNaN(merchantId)) {
      return NextResponse.json({ error: '無效的商戶ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 查询商户
    const { data: merchant, error } = await client
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .single();

    if (error || !merchant) {
      return NextResponse.json({ error: '商戶不存在' }, { status: 404 });
    }

    // 查询商户的商品
    const { data: goods } = await client
      .from('goods')
      .select('id, name, price, main_image')
      .eq('merchant_id', merchantId)
      .eq('status', true)
      .limit(10);

    return NextResponse.json({
      data: {
        ...merchant,
        goods: goods || [],
      },
    });
  } catch (error) {
    console.error('获取商户详情失败:', error);
    return NextResponse.json({ error: '獲取商戶詳情失敗' }, { status: 500 });
  }
}

/**
 * 更新商户
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchantId = parseInt(id);
    const body = await request.json();

    if (isNaN(merchantId)) {
      return NextResponse.json({ error: '無效的商戶ID' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 构建更新数据
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 只更新提供的字段
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.certification_level !== undefined) updateData.certification_level = body.certification_level;
    if (body.contact_name !== undefined) updateData.contact_name = body.contact_name;
    if (body.contact_phone !== undefined) updateData.contact_phone = body.contact_phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.province !== undefined) updateData.province = body.province;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.status !== undefined) updateData.status = body.status;

    // 执行更新
    const { data, error } = await client
      .from('merchants')
      .update(updateData)
      .eq('id', merchantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('更新商户失败:', error);
    return NextResponse.json({ error: '更新商戶失敗' }, { status: 500 });
  }
}
