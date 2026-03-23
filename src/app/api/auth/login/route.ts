/**
 * @fileoverview 用户登录 API
 * @description 处理用户登录、注册、登出
 * @module app/api/auth/login/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 用户登录
 * @param request - 请求对象
 * @returns 登录结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, action = 'login' } = body;
    const client = getSupabaseClient();

    if (action === 'register') {
      // 注册
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            language: 'zh-TW',
          },
        },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // 创建用户记录
      if (data.user) {
        await client.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          language: 'zh-TW',
          status: true,
        });
      }

      return NextResponse.json({
        message: '註冊成功，請查收驗證郵件',
        user: data.user,
      });
    } else {
      // 登录
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: '郵箱或密碼錯誤' }, { status: 401 });
      }

      return NextResponse.json({
        message: '登錄成功',
        user: data.user,
        session: data.session,
      });
    }
  } catch (error) {
    console.error('认证失败:', error);
    return NextResponse.json({ error: '操作失敗' }, { status: 500 });
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
