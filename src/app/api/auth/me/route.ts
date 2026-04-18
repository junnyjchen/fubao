/**
 * @fileoverview 获取当前用户信息 API
 * @description 获取当前登录用户的详细信息
 * @module app/api/auth/me/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 临时用户ID（开发环境使用） */
const TEMP_USER_ID = 'guest-user-001';

/**
 * 获取当前用户信息
 * @returns 用户信息
 */
export async function GET() {
  try {
    const client = getSupabaseClient();

    // 尝试获取认证用户
    const { data: { user: authUser }, error: authError } = await client.auth.getUser();

    if (authError || !authUser) {
      // 开发环境返回临时用户
      if (process.env.NODE_ENV !== 'production') {
        const { data: user } = await client
          .from('users')
          .select('*')
          .eq('id', TEMP_USER_ID)
          .single();

        if (!user) {
          // 创建临时用户
          await client.from('users').insert({
            id: TEMP_USER_ID,
            email: 'guest@fubao.ltd',
            name: '訪客用戶',
            language: 'zh-TW',
            status: true,
          });
        }

        return NextResponse.json({
          user: {
            id: TEMP_USER_ID,
            email: 'guest@fubao.ltd',
            name: '訪客用戶',
            language: 'zh-TW',
            isGuest: true,
          },
        });
      }

      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 获取用户详细信息
    const { data: userInfo } = await client
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return NextResponse.json({
      user: {
        ...userInfo,
        email: authUser.email,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '獲取用戶信息失敗' }, { status: 500 });
  }
}

/**
 * 更新用户信息
 * @param request - 请求对象
 * @returns 更新结果
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { data: { user: authUser } } = await client.auth.getUser();
    const userId = authUser?.id || TEMP_USER_ID;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name) updateData.name = body.name;
    if (body.avatar) updateData.avatar = body.avatar;
    if (body.language) updateData.language = body.language;
    if (body.phone) updateData.phone = body.phone;

    const { error } = await client
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
