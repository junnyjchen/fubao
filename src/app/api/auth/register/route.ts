/**
 * @fileoverview 用户注册API
 * @description 处理用户注册请求
 * @module app/api/auth/register/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hash } from 'bcryptjs';

/**
 * 用户注册
 * @param request - 请求对象
 * @returns 注册结果
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '請填寫郵箱和密碼' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: '請輸入有效的郵箱地址' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密碼長度至少6位' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查邮箱是否已注册
    const { data: existingUser } = await client
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '該郵箱已被註冊' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hash(password, 10);

    // 创建用户 - 字段名与数据库schema匹配
    const { data: user, error } = await client
      .from('users')
      .insert({
        name: name || email.split('@')[0], // 使用name字段，默认使用邮箱前缀
        email,
        phone: phone || null,
        password: hashedPassword,
        language: 'zh-TW',
        status: true,
      })
      .select('id, name, email, phone, language, status, created_at')
      .single();

    if (error) {
      console.error('创建用户失败:', error);
      return NextResponse.json(
        { error: '註冊失敗，請稍後重試' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '註冊成功',
      user,
    });
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '註冊失敗，請稍後重試' },
      { status: 500 }
    );
  }
}
