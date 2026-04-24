/**
 * @fileoverview 用户资料 API
 * @description 处理用户资料的更新
 * @module app/api/user/profile/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 更新用户资料
 */
export async function PUT(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { nickname, email, phone } = body;

    // 模拟用户ID（实际应从session获取）
    const userId = 1;

    const updateData: Record<string, unknown> = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    const { data, error } = await client
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功', user: data });
  } catch (error) {
    console.error('更新用户资料失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
