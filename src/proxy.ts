/**
 * @fileoverview 全局代理/中间件
 * @description 
 * 1. 为服务端组件提供 pathname 信息
 * 2. 管理后台访问控制
 * @module proxy
 */

import { NextRequest, NextResponse } from 'next/server';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 创建响应
  const response = pathname.startsWith('/admin') 
    ? handleAdminAccess(request, pathname)
    : NextResponse.next();
  
  // 为所有响应添加 pathname header（供服务端组件使用）
  response.headers.set('x-pathname', pathname);
  
  return response;
}

/**
 * 处理管理后台访问控制
 */
function handleAdminAccess(request: NextRequest, pathname: string) {
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
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
