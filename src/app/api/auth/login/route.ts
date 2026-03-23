/**
 * @fileoverview 用户登录 API
 * @description 处理用户登录、登出
 * @module app/api/auth/login/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { compare } from 'bcryptjs';

/**
 * 用户登录
 * @param request - 请求对象
 * @returns 登录结果
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password } = body;
    const client = getSupabaseClient();

    // 查找用户
    let query = client
      .from('users')
      .select('id, nickname, email, phone, password, role, status, avatar')
      .eq('status', true);

    if (email) {
      query = query.eq('email', email);
    } else if (phone) {
      query = query.eq('phone', phone);
    } else {
      return NextResponse.json(
        { error: '請輸入郵箱或手機號碼' },
        { status: 400 }
      );
    }

    const { data: users, error: fetchError } = await query.limit(1);

    if (fetchError || !users || users.length === 0) {
      return NextResponse.json(
        { error: '賬號不存在或已被禁用' },
        { status: 401 }
      );
    }

    const user = users[0];

    // 验证密码
    if (!user.password) {
      return NextResponse.json(
        { error: '賬號異常，請聯繫客服' },
        { status: 401 }
      );
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '密碼錯誤' },
        { status: 401 }
      );
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: '登錄成功',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({ error: '登錄失敗，請稍後重試' }, { status: 500 });
  }
}

/**
 * 用户登出
 * @param request - 请求对象
 * @returns 登出结果
 */
export async function DELETE() {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '登出成功' });
  } catch (error) {
    console.error('登出失败:', error);
    return NextResponse.json({ error: '登出失敗' }, { status: 500 });
  }
}
