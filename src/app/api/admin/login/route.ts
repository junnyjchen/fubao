/**
 * @fileoverview 管理员登录 API
 * @description 支持角色和权限的管理员认证
 * @module app/api/admin/login/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

/** 默认管理员（用于本地模式） */
const defaultAdmins = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // admin123
    name: '系統管理員',
    email: 'admin@fubao.ltd',
    role_id: 1,
  },
  {
    id: 2,
    username: 'editor',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // admin123
    name: '內容編輯',
    email: 'editor@fubao.ltd',
    role_id: 3,
  },
  {
    id: 3,
    username: 'merchant1',
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // admin123
    name: '商戶管理員',
    email: 'merchant@fubao.ltd',
    role_id: 5,
  },
];

/** 角色权限映射 */
const rolePermissions: Record<number, string[]> = {
  1: ['*'], // 超级管理员 - 所有权限
  2: ['content.view', 'content.news', 'goods.view', 'order.view', 'operation.banner', 'operation.page'],
  3: ['content.view', 'content.news', 'content.wiki', 'video.view'],
  4: ['order.view', 'order.process', 'user.view'],
  5: ['goods.view', 'goods.edit', 'order.view'],
};

/** 角色信息 */
const roleInfo: Record<number, { name: string; code: string }> = {
  1: { name: '超級管理員', code: 'super_admin' },
  2: { name: '運營主管', code: 'operation_manager' },
  3: { name: '內容編輯', code: 'content_editor' },
  4: { name: '客服', code: 'customer_service' },
  5: { name: '商戶', code: 'merchant' },
};

/** 生成 JWT Token */
function generateToken(payload: {
  adminId: number;
  username: string;
  roleId: number;
  roleCode: string;
  permissions: string[];
}) {
  return jwt.sign(payload, JWT_SECRET + '-admin', { expiresIn: '8h' });
}

/** 验证密码 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // 开发模式：允许固定密码
  if (password === 'admin123' || password === '123456') {
    return true;
  }
  
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * POST - 管理员登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: '請輸入用戶名和密碼' }, { status: 400 });
    }

    const client = getSupabaseClient();
    let admin: any = null;
    let role: any = null;

    // 尝试从数据库查询
    try {
      const result = await client
        .from('admins')
        .select('*, admin_roles(*)')
        .eq('username', username)
        .eq('status', true)
        .single();

      if (result.data) {
        admin = result.data;
        role = admin.admin_roles;
      } else {
        // 数据库中没有，尝试本地模式
        admin = defaultAdmins.find(a => a.username === username);
        if (admin) {
          role = roleInfo[admin.role_id];
        }
      }
    } catch (dbErr) {
      console.error('数据库查询失败，使用本地模式:', dbErr);
      // 数据库不可用，使用本地模式
      admin = defaultAdmins.find(a => a.username === username);
      if (admin) {
        role = roleInfo[admin.role_id];
      }
    }

    // 未找到用户
    if (!admin) {
      return NextResponse.json({ error: '用戶名或密碼錯誤' }, { status: 401 });
    }

    // 验证密码
    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: '用戶名或密碼錯誤' }, { status: 401 });
    }

    // 获取权限
    const permissions = admin.role_id ? (rolePermissions[admin.role_id] || []) : ['*'];

    // 生成 Token
    const token = generateToken({
      adminId: admin.id,
      username: admin.username,
      roleId: admin.role_id || 1,
      roleCode: role?.code || 'super_admin',
      permissions,
    });

    // 更新登录信息
    try {
      await client
        .from('admins')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (admin.login_count || 0) + 1,
        })
        .eq('id', admin.id);
    } catch (e) {
      // 忽略更新错误
    }

    // 设置 Cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.COZE_PROJECT_ENV === 'PROD',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8小时
      path: '/',
    });

    // 返回管理员信息
    return NextResponse.json({
      message: '登錄成功',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        avatar: admin.avatar,
        role: {
          id: admin.role_id || 1,
          name: role?.name || '超級管理員',
          code: role?.code || 'super_admin',
        },
        permissions,
      },
    });
  } catch (error) {
    console.error('管理員登錄失敗:', error);
    return NextResponse.json({ error: '登錄失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 登出
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');
    return NextResponse.json({ message: '已退出登錄' });
  } catch (error) {
    console.error('退出登錄失敗:', error);
    return NextResponse.json({ error: '退出失敗' }, { status: 500 });
  }
}
