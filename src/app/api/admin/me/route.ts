/**
 * @fileoverview 管理员认证状态 API
 * @description 获取当前管理员登录状态和权限 - MySQL 实现
 * @module app/api/admin/me/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { queryOne } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

interface AdminRow {
  id: number;
  username: string;
  nickname: string | null;
  role_id: number;
  status: number;
}

interface RoleRow {
  id: number;
  name: string;
  code: string;
  permissions: string | null;
  is_super: number;
}

/**
 * GET - 获取当前管理员信息
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

    // 验证 Token
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET + '-admin');
    } catch {
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    // 从 MySQL 获取管理员详细信息
    const admin = await queryOne<AdminRow>(
      'SELECT id, username, nickname, role_id, status FROM admins WHERE id = ?',
      [payload.adminId]
    );

    if (!admin || !admin.status) {
      return NextResponse.json({ error: '賬號已被禁用' }, { status: 401 });
    }

    // 获取角色权限
    const role = await queryOne<RoleRow>(
      'SELECT id, name, code, permissions, is_super FROM admin_roles WHERE id = ?',
      [admin.role_id]
    );

    const permissions = role?.permissions ? JSON.parse(role.permissions) : payload.permissions || ['*'];

    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.nickname,
        role: {
          id: admin.role_id,
          name: role?.name || '未知角色',
          code: role?.code || 'unknown',
        },
        permissions,
      },
    });
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    return NextResponse.json({ error: '獲取信息失敗' }, { status: 500 });
  }
}
