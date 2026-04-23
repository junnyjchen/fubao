/**
 * @fileoverview 管理员认证状态 API
 * @description 获取当前管理员登录状态和权限
 * @module app/api/admin/me/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || 'fubao-ltd-jwt-secret-key-2024';

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
    } catch (jwtError) {
      console.error('JWT 验证失败:', jwtError);
      return NextResponse.json({ error: '登錄已過期' }, { status: 401 });
    }

    // 获取管理员详细信息
    const client = getSupabaseClient();
    let admin: any = null;
    let role: any = null;

    try {
      const result = await client
        .from('admins')
        .select('*, admin_roles(*)')
        .eq('id', payload.adminId)
        .single();

      if (result.data) {
        admin = result.data;
        role = admin.admin_roles;
      }
    } catch (dbErr) {
      console.error('数据库查询失败，使用 token 数据:', dbErr);
      // 数据库不可用时，使用 token 中的数据
    }

    // 如果数据库没有返回数据，但 token 有效，使用 token 中的数据
    if (!admin) {
      admin = {
        id: payload.adminId,
        username: payload.username,
        name: payload.username,
        role_id: payload.roleId,
      };
      role = roleInfo[payload.roleId] || { name: '未知角色', code: 'unknown' };
    }

    // 获取权限
    const permissions = role?.permissions || rolePermissions[payload.roleId] || ['*'];
    const roleData = role || roleInfo[payload.roleId] || { name: '未知角色', code: 'unknown' };

    return NextResponse.json({
      admin: {
        id: admin?.id || payload.adminId,
        username: admin?.username || payload.username,
        name: admin?.name || payload.username,
        email: admin?.email || null,
        phone: admin?.phone || null,
        avatar: admin?.avatar || null,
        role: {
          id: admin?.role_id || payload.roleId,
          name: roleData.name,
          code: roleData.code,
        },
        permissions,
      },
      token,
    });
  } catch (error) {
    console.error('獲取管理員信息失敗:', error);
    return NextResponse.json({ error: '獲取信息失敗' }, { status: 500 });
  }
}
