/**
 * @fileoverview 管理员认证状态 API
 * @description 获取当前管理员登录状态
 * @module app/api/admin/me/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '../login/route';

/**
 * 获取当前管理员信息
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未登錄' }, { status: 401 });
    }

    const payload = verifyAdminToken(token);

    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    return NextResponse.json({
      admin: {
        id: payload.adminId,
        username: payload.username,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('獲取管理員信息失敗:', error);
    return NextResponse.json({ error: '獲取信息失敗' }, { status: 500 });
  }
}
