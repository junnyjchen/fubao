/**
 * @fileoverview 用户登录 API
 * @description 处理用户登录、登出
 * @module app/api/auth/login/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { compare } from 'bcryptjs';
import { generateToken } from '@/lib/auth/utils';

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
      .select('id, name, email, phone, password, status, avatar, language')
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

    const { data: users, error: fetchError } = await query.execute().then(r => ({ data: r.data, error: r.error }));limit(1);

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

    // 生成JWT令牌
    const token = generateToken({
      userId: user.id,
      email: user.email || '',
    });

    // 设置HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.COZE_PROJECT_ENV === 'PROD',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: '登錄成功',
      user: {
        ...userWithoutPassword,
        isGuest: false,
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json({ error: '登錄失敗，請稍後重試' }, { status: 500 });
  }
}

/**
 * 用户登出
 * @returns 登出结果
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  
  return NextResponse.json({ message: '登出成功' });
}
