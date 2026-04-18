/**
 * @fileoverview 管理后台访问控制中间件
 * @description 保护所有 /admin 路由，除了登录页面
 * @module middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/** JWT 密钥 */
const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/**
 * 验证管理员 Token
 */
function verifyAdminToken(token: string): { adminId: number; username: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET + '-admin') as {
      adminId: number;
      username: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 验证用户 Token（用于禁止会员访问管理后台）
 */
function verifyUserToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只处理 /admin 路径
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 登录页面不需要验证
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 获取 Token
  const adminToken = request.cookies.get('admin_token')?.value;
  const userToken = request.cookies.get('auth_token')?.value;

  // 检查是否使用用户 Token 尝试访问管理后台（禁止）
  if (userToken && !adminToken) {
    const userPayload = verifyUserToken(userToken);
    if (userPayload) {
      // 普通会员用户，不能访问管理后台
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 检查管理员 Token
  if (!adminToken) {
    // 未登录，重定向到登录页面
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const adminPayload = verifyAdminToken(adminToken);

  if (!adminPayload) {
    // Token 无效或已过期
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }

  // Token 有效，继续请求
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
