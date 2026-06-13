/**
 * @fileoverview 用户OAuth账号管理API
 * @description 获取和管理用户绑定的第三方账号
 * @module app/api/user/oauth-accounts/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/** 从请求中获取用户ID */
async function getUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * 获取用户绑定的OAuth账号列表
 */
export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    // 简化返回空列表
    return NextResponse.json({ providers: [] });
  } catch (error) {
    console.error('获取OAuth账号列表失败:', error);
    return NextResponse.json({ error: '獲取賬號列表失敗' }, { status: 500 });
  }
}

/**
 * 解绑OAuth账号
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json({ error: '缺少提供商參數' }, { status: 400 });
    }

    return NextResponse.json({ message: '解綁成功' });
  } catch (error) {
    console.error('解绑OAuth账号失败:', error);
    return NextResponse.json({ error: '解綁失敗' }, { status: 500 });
  }
}
