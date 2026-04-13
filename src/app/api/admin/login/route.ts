/**
 * @fileoverview 管理员登录 API
 * @description 处理管理后台用户登录
 * @module app/api/admin/login/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

/** JWT密钥 */
const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/** 管理员 Token 过期时间 */
const ADMIN_TOKEN_EXPIRES_IN = '8h';

/** 管理员 Token 载荷 */
interface AdminTokenPayload {
  adminId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * 生成管理员 JWT 令牌
 */
function generateAdminToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET + '-admin', { expiresIn: ADMIN_TOKEN_EXPIRES_IN });
}

/**
 * 验证管理员 JWT 令牌
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET + '-admin') as AdminTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 管理员登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const client = getSupabaseClient();

    if (!username || !password) {
      return NextResponse.json(
        { error: '請輸入用戶名和密碼' },
        { status: 400 }
      );
    }

    // 查找管理员用户
    const { data: admins, error: fetchError } = await client
      .from('admin_users')
      .select('id, username, password, name, email, role, status')
      .eq('username', username)
      .eq('status', true)
      .limit(1);

    if (fetchError || !admins || admins.length === 0) {
      return NextResponse.json(
        { error: '用戶名或密碼錯誤' },
        { status: 401 }
      );
    }

    const admin = admins[0];

    // 验证密码
    const isValidPassword = await compare(password, admin.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: '用戶名或密碼錯誤' },
        { status: 401 }
      );
    }

    // 更新最后登录信息
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    await client
      .from('admin_users')
      .update({
        last_login_at: new Date().toISOString(),
        last_login_ip: clientIP,
      })
      .eq('id', admin.id);

    // 生成管理员 Token
    const token = generateAdminToken({
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
    });

    // 设置 HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.COZE_PROJECT_ENV === 'PROD',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8小时
      path: '/',
    });

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json({
      message: '登錄成功',
      admin: {
        ...adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('管理員登錄失敗:', error);
    return NextResponse.json({ error: '登錄失敗，請稍後重試' }, { status: 500 });
  }
}

/**
 * 管理员登出
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');

    return NextResponse.json({ message: '已退出登錄' });
  } catch (error) {
    console.error('管理員登出失敗:', error);
    return NextResponse.json({ error: '退出登錄失敗' }, { status: 500 });
  }
}
