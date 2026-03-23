/**
 * @fileoverview 用户地址 API
 * @description 提供用户地址的增删改查功能
 * @module app/api/addresses/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取用户地址列表
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'guest-user-001';

  try {
    const client = getSupabaseClient();

    const { data: addresses, error } = await client
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: addresses || [] });
  } catch (error) {
    console.error('获取地址列表失败:', error);
    return NextResponse.json({ error: '獲取地址列表失敗' }, { status: 500 });
  }
}

/**
 * 添加地址
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId = 'guest-user-001',
      name,
      phone,
      province,
      city,
      district,
      address,
      isDefault = false,
    } = body;

    // 验证必填字段
    if (!name || !phone || !province || !city || !district || !address) {
      return NextResponse.json({ error: '請填寫完整地址信息' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 如果设为默认，先取消其他默认地址
    if (isDefault) {
      await client
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    // 添加地址
    const { data, error } = await client
      .from('addresses')
      .insert({
        user_id: userId,
        name,
        phone,
        province,
        city,
        district,
        address,
        is_default: isDefault,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('添加地址失败:', error);
    return NextResponse.json({ error: '添加地址失敗' }, { status: 500 });
  }
}

/**
 * 更新地址
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      userId = 'guest-user-001',
      name,
      phone,
      province,
      city,
      district,
      address,
      isDefault,
    } = body;

    if (!id) {
      return NextResponse.json({ error: '地址ID不存在' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // 如果设为默认，先取消其他默认地址
    if (isDefault) {
      await client
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);
    }

    // 更新地址
    const { data, error } = await client
      .from('addresses')
      .update({
        name,
        phone,
        province,
        city,
        district,
        address,
        is_default: isDefault,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('更新地址失败:', error);
    return NextResponse.json({ error: '更新地址失敗' }, { status: 500 });
  }
}

/**
 * 删除地址
 */
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId') || 'guest-user-001';

  if (!id) {
    return NextResponse.json({ error: '地址ID不存在' }, { status: 400 });
  }

  try {
    const client = getSupabaseClient();

    const { error } = await client
      .from('addresses')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除地址失败:', error);
    return NextResponse.json({ error: '刪除地址失敗' }, { status: 500 });
  }
}
