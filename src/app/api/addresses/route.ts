/**
 * @fileoverview 用户地址 API
 * @description 处理用户收货地址的增删改查，支持本地模式
 * @module app/api/addresses/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyUserToken } from '@/lib/auth/apiAuth';

/**
 * 获取当前用户ID（本地模式优先）
 */
async function getUserId(request?: NextRequest): Promise<number> {
  // 先尝试本地 JWT 验证
  if (request) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'fubao_secret_key_2024';
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number; email?: string };
        if (decoded.userId) return decoded.userId;
      } catch {
        // token 验证失败，继续尝试其他方式
      }
    }
  }

  // 尝试 Supabase
  try {
    const { createClient } = require('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return parseInt(user.id) || 1;
  } catch {
    // Supabase 不可用
  }

  // 默认用户
  return 1;
}

/**
 * 获取 mock 地址列表
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

// 初始化 mock 地址存储
if (!(globalThis as any).mockAddresses) {
  (globalThis as any).mockAddresses = getMockAddresses();
}

/**
 * 获取用户地址列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    // 先尝试 Supabase
    try {
      const { createClient } = require('@/lib/supabase/server');
      const supabase = await createClient();
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId.toString())
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && addresses && addresses.length > 0) {
        return NextResponse.json({ data: addresses });
      }
    } catch {
      // Supabase 不可用，使用 mock
    }

    // 返回 mock 地址
    return NextResponse.json({ data: (globalThis as any).mockAddresses || getMockAddresses() });
  } catch (error) {
    console.error('获取地址失败:', error);
    return NextResponse.json({ data: (globalThis as any).mockAddresses || getMockAddresses() });
  }
}

/**
 * 添加新地址
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const body = await request.json();
    const { name, phone, province, city, district, address, isDefault, tag } = body;

    if (!name || !phone || !address) {
      return NextResponse.json({ error: '請填寫完整的地址信息' }, { status: 400 });
    }

    // 尝试 Supabase
    try {
      const { createClient } = require('@/lib/supabase/server');
      const supabase = await createClient();

      if (isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId.toString());
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId.toString(),
          name,
          phone,
          province: province || '九龍',
          city: city || '香港',
          district: district || '油尖旺區',
          address,
          is_default: isDefault || false,
          tag: tag || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ message: '添加成功', data });
      }
    } catch {
      // Supabase 不可用，使用 mock
    }

    // Mock 模式
    const mockAddresses = (globalThis as any).mockAddresses || getMockAddresses();
    const newAddress = {
      id: Date.now(),
      name,
      phone,
      province: province || '九龍',
      city: city || '香港',
      district: district || '油尖旺區',
      address,
      is_default: isDefault || false,
      tag: tag || null,
      created_at: new Date().toISOString(),
    };

    if (isDefault) {
      mockAddresses.forEach((a: any) => { a.is_default = false; });
    }

    mockAddresses.push(newAddress);
    (globalThis as any).mockAddresses = mockAddresses;

    return NextResponse.json({ message: '添加成功（本地模式）', data: newAddress });
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
    const userId = await getUserId(request);
    const body = await request.json();
    const { id, name, phone, province, city, district, address, isDefault, tag } = body;

    if (!id) {
      return NextResponse.json({ error: '地址ID不能為空' }, { status: 400 });
    }

    // 尝试 Supabase
    try {
      const { createClient } = require('@/lib/supabase/server');
      const supabase = await createClient();

      if (isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId.toString());
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
        .eq('user_id', userId.toString());

      if (!error) {
        return NextResponse.json({ message: '更新成功' });
      }
    } catch {
      // Supabase 不可用
    }

    // Mock 模式
    const mockAddresses = (globalThis as any).mockAddresses || getMockAddresses();
    const idx = mockAddresses.findIndex((a: any) => a.id === id);
    if (idx >= 0) {
      if (isDefault) {
        mockAddresses.forEach((a: any) => { a.is_default = false; });
      }
      if (name) mockAddresses[idx].name = name;
      if (phone) mockAddresses[idx].phone = phone;
      if (province) mockAddresses[idx].province = province;
      if (city) mockAddresses[idx].city = city;
      if (district) mockAddresses[idx].district = district;
      if (address) mockAddresses[idx].address = address;
      if (isDefault !== undefined) mockAddresses[idx].is_default = isDefault;
      if (tag !== undefined) mockAddresses[idx].tag = tag;
      (globalThis as any).mockAddresses = mockAddresses;
    }

    return NextResponse.json({ message: '更新成功（本地模式）' });
  } catch (error) {
    console.error('更新地址失败:', error);
    return NextResponse.json({ error: '更新地址失敗' }, { status: 500 });
  }
}

/**
 * 删除地址
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '地址ID不能為空' }, { status: 400 });
    }

    // 尝试 Supabase
    try {
      const { createClient } = require('@/lib/supabase/server');
      const supabase = await createClient();
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', parseInt(id))
        .eq('user_id', userId.toString());

      if (!error) {
        return NextResponse.json({ message: '刪除成功' });
      }
    } catch {
      // Supabase 不可用
    }

    // Mock 模式
    const mockAddresses = (globalThis as any).mockAddresses || getMockAddresses();
    (globalThis as any).mockAddresses = mockAddresses.filter((a: any) => a.id !== parseInt(id));

    return NextResponse.json({ message: '刪除成功（本地模式）' });
  } catch (error) {
    console.error('删除地址失败:', error);
    return NextResponse.json({ error: '刪除地址失敗' }, { status: 500 });
  }
}
