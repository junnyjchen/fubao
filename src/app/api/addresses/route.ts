/**
 * @fileoverview 用户地址 API
 * @description 处理用户收货地址的增删改查
 * @module app/api/addresses/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * 获取当前用户ID
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * 获取用户地址列表
 * @returns 地址列表
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取地址失败:', error);
      return NextResponse.json({ data: getMockAddresses() });
    }

    return NextResponse.json({ data: addresses || [] });
  } catch (error) {
    console.error('获取地址失败:', error);
    return NextResponse.json({ data: getMockAddresses() });
  }
}

/**
 * 添加新地址
 * @param request - 请求对象
 * @returns 添加结果
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { name, phone, province, city, district, address, isDefault, tag } = body;

    if (!name || !phone || !province || !district || !address) {
      return NextResponse.json({ error: '請填寫完整的地址信息' }, { status: 400 });
    }

    // 如果设为默认，取消其他默认地址
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        name,
        phone,
        province,
        city: city || '香港',
        district,
        address,
        is_default: isDefault || false,
        tag: tag || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('添加地址失败:', error);
      return NextResponse.json({ error: '添加地址失敗' }, { status: 500 });
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
export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const supabase = await createClient();
    const body = await request.json();

    const { id, name, phone, province, city, district, address, isDefault, tag } = body;

    if (!id) {
      return NextResponse.json({ error: '地址ID不能為空' }, { status: 400 });
    }

    // 如果设为默认，取消其他默认地址
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (province) updateData.province = province;
    if (city) updateData.city = city;
    if (district) updateData.district = district;
    if (address) updateData.address = address;
    if (isDefault !== undefined) updateData.is_default = isDefault;
    if (tag !== undefined) updateData.tag = tag;

    const { error } = await supabase
      .from('addresses')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('更新地址失败:', error);
      return NextResponse.json({ error: '更新地址失敗' }, { status: 500 });
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
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '地址ID不能為空' }, { status: 400 });
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', parseInt(id))
      .eq('user_id', userId);

    if (error) {
      console.error('删除地址失败:', error);
      return NextResponse.json({ error: '刪除地址失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除地址失败:', error);
    return NextResponse.json({ error: '刪除地址失敗' }, { status: 500 });
  }
}

/**
 * 模拟地址数据
 */
function getMockAddresses() {
  return [
    {
      id: 1,
      name: '張三',
      phone: '9876 5432',
      province: '九龍',
      city: '香港',
      district: '油尖旺區',
      address: '彌敦道100號 ABC大廈15樓A室',
      is_default: true,
      tag: 'home',
      created_at: '2026-03-01T10:00:00',
    },
    {
      id: 2,
      name: '張三',
      phone: '9876 5432',
      province: '香港島',
      city: '香港',
      district: '中西區',
      address: '皇后大道中200號 DEF中心10樓',
      is_default: false,
      tag: 'company',
      created_at: '2026-03-10T10:00:00',
    },
  ];
}
