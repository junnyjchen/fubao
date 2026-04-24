/**
 * @fileoverview 用户密码 API
 * @description 处理用户密码修改
 * @module app/api/user/password/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 修改用户密码
 */
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '請填寫完整密碼信息' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '密碼長度至少6位' }, { status: 400 });
    }

    // 模拟用户ID（实际应从session获取）
    const userId = 1;

    // 验证当前密码
    const { data: user, error: fetchError } = await client
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 简单密码验证（实际应使用bcrypt等库）
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: '當前密碼錯誤' }, { status: 400 });
    }

    // 更新密码
    const { error: updateError } = await client
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: '密碼修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json({ error: '修改失敗' }, { status: 500 });
  }
}
