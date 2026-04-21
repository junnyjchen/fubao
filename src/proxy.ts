/**
 * @fileoverview 管理后台访问控制代理
 * @description 简化版本：只检查是否有 admin_token cookie存在，不做严格验证
 * 真正的验证在 API 层和前端完成
 * @module proxy
 */

import { NextRequest, NextResponse } from 'next/server';

export default async function proxy(request: NextRequest) {
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

  // 简化验证：只检查 token 是否存在，不验证内容
  // 真正的验证在前端 /api/admin/me 中完成
  if (!adminToken) {
    // 未登录，重定向到登录页面
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token 存在，继续请求
  // 真正的验证在 API 层完成
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
