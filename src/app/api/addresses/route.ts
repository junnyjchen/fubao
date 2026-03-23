/**
 * @fileoverview 用户地址 API
 * @description 处理用户收货地址的增删改查
 * @module app/api/addresses/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 临时用户ID */
const TEMP_USER_ID = 'guest-user-001';

/**
 * 获取用户地址列表
 * @returns 地址列表
 */
export async function GET() {
  try {
    const client = getSupabaseClient();

    const { data: addresses, error } = await client
      .from('addresses')
      .select('*')
      .eq('user_id', TEMP_USER_ID)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: addresses || [] });
  } catch (error) {
    console.error('获取地址失败:', error);
    return NextResponse.json({ error: '獲取地址失敗' }, { status: 500 });
  }
}

/**
 * 添加新地址
 * @param request - 请求对象
 * @returns 添加结果
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { name, phone, province, city, district, address, isDefault } = body;

    if (!name || !phone || !province || !city || !district || !address) {
      return NextResponse.json({ error: '請填寫完整的地址信息' }, { status: 400 });
    }

    // 如果设为默认，取消其他默认地址
    if (isDefault) {
      await client
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', TEMP_USER_ID);
    }

    const { data, error } = await client
      .from('addresses')
      .insert({
        user_id: TEMP_USER_ID,
        name,
        phone,
        province,
        city,
        district,
        address,
        is_default: isDefault || false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '添加成功', data });
  } catch (error) {
    console.error('添加地址失败:', error);
    return NextResponse.json({ error: '添加地址失敗' }, { status: 500 });
  }
}

/**
 * 更新地址
 * @param request - 请求对象
 * @returns 更新结果
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, name, phone, province, city, district, address, isDefault } = body;

    if (!id) {
      return NextResponse.json({ error: '地址ID不能為空' }, { status: 400 });
    }

    // 如果设为默认，取消其他默认地址
    if (isDefault) {
      await client
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', TEMP_USER_ID);
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (province) updateData.province = province;
    if (city) updateData.city = city;
    if (district) updateData.district = district;
    if (address) updateData.address = address;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    const { error } = await client
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', TEMP_USER_ID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新地址失败:', error);
    return NextResponse.json({ error: '更新地址失敗' }, { status: 500 });
  }
}

/**
 * 删除地址
 * @param request - 请求对象
 * @returns 删除结果
 */
export async function DELETE(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '地址ID不能為空' }, { status: 400 });
    }

    const { error } = await client
      .from('addresses')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', TEMP_USER_ID);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除地址失败:', error);
    return NextResponse.json({ error: '刪除地址失敗' }, { status: 500 });
  }
}
