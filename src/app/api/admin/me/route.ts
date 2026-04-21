/**
 * @fileoverview 管理员认证状态 API
 * @description 获取当前管理员登录状态
 * @module app/api/admin/me/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/** JWT 密钥 */
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
 * Mock 管理员数据
 */
const mockAdmins = [
  {
    id: 1,
    username: 'admin',
    name: '超級管理員',
    email: 'admin@fubao.ltd',
    role: 'super_admin',
  },
];

/**
 * 获取当前管理员信息
 */
export async function GET(request: NextRequest) {
  try {
    // 优先从 Authorization Header 获取 token
    const authHeader = request.headers.get('Authorization');
    let token = authHeader?.replace('Bearer ', '');

    // 如果没有 header token，尝试从 cookie 获取
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get('admin_token')?.value;
    }

    if (!token) {
      return NextResponse.json({ error: '未登錄' }, { status: 401 });
    }

    const payload = verifyAdminToken(token);

    if (!payload) {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    // 查找管理员信息
    const admin = mockAdmins.find(a => a.id === payload.adminId);

    return NextResponse.json({
      admin: {
        id: payload.adminId,
        username: payload.username,
        role: payload.role,
        name: admin?.name || payload.username,
        email: admin?.email,
      },
      token, // 返回 token 让前端使用
    });
  } catch (error) {
    console.error('獲取管理員信息失敗:', error);
    return NextResponse.json({ error: '獲取信息失敗' }, { status: 500 });
  }
}
