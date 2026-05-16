/**
 * @fileoverview API 路由用户认证辅助
 * @description 从请求头中提取并验证用户 JWT token，替代 Supabase auth
 */

import { verifyToken } from './utils';
import { mockStore } from './mockStore';

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
}

/**
 * 从请求中获取已认证的用户
 * 兼容本地 JWT 和 Supabase auth
 */
export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  // 1. 尝试从 Authorization header 获取本地 JWT token
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload?.userId) {
      // 从 mockStore 查找用户信息
      const user = mockStore.find(payload.email);
      return {
        userId: String(payload.userId),
        email: payload.email,
        name: user?.name || payload.email.split('@')[0],
      };
    }
  }

  // 2. 尝试从 Cookie 获取 token
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/(?:fubao_token|token)=([^;]+)/);
  if (tokenMatch) {
    const payload = verifyToken(tokenMatch[1]);
    if (payload?.userId) {
      const user = mockStore.find(payload.email);
      return {
        userId: String(payload.userId),
        email: payload.email,
        name: user?.name || payload.email.split('@')[0],
      };
    }
  }

  return null;
}

/**
 * 需要登录才能访问的 API 包装器
 */
export function withAuth(
  handler: (request: Request, user: AuthUser) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { error: '請先登錄', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    return handler(request, user);
  };
}
