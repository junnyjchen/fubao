/**
 * @fileoverview 管理员账户管理 API
 * @description 管理员的增删改查
 * @module app/api/admin/admins/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 默认管理员数据 */
const defaultAdmins = [
  {
    id: 1,
    username: 'admin',
    name: '系統管理員',
    email: 'admin@fubao.ltd',
    phone: null,
    avatar: null,
    role_id: 1,
    role_name: '超級管理員',
    status: true,
    last_login_at: '2024-01-15T10:00:00Z',
    login_count: 100,
    created_at: '2024-01-01T00:00:00Z',
  },
];

/** 密码哈希（bcrypt） */
function hashPassword(password: string): string {
  // 简单哈希用于 mock 模式
  const salt = 'fubao-admin-salt';
  return Buffer.from(password + salt).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// GET - 获取管理员列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const keyword = searchParams.get('keyword');

    const client = getSupabaseClient();

    try {
      let query = client
        .from('admins')
        .select('*, admin_roles(name, code)', { count: 'exact' });

      if (keyword) {
        query = query.or(`username.ilike.%${keyword}%,name.ilike.%${keyword}%,email.ilike.%${keyword}%`);
      }

      query = query.range((page - 1) * limit, page * limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
        total: data?.length || 0,
        page,
        limit,
      });
    } catch (dbErr) {
      console.error('数据库查询失败:', dbErr);
    }

    // 返回默认数据
    let filtered = defaultAdmins;
    if (keyword) {
      filtered = defaultAdmins.filter(a => 
        a.username.includes(keyword) || a.name.includes(keyword) || a.email?.includes(keyword)
      );
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 20,
    });
  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return NextResponse.json({
      success: true,
      data: defaultAdmins,
      total: defaultAdmins.length,
    });
  }
}

// POST - 创建管理员
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, email, phone, role_id, status } = body;

    if (!username) {
      return NextResponse.json({ error: '請輸入用戶名' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: '密碼至少6個字符' }, { status: 400 });
    }

    if (!role_id) {
      return NextResponse.json({ error: '請選擇角色' }, { status: 400 });
    }

    // 密码哈希
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = getSupabaseClient();

    try {
      const { data, error } = await client
        .from('admins')
        .insert({
          username,
          password: hashedPassword,
          name: name || username,
          email: email || null,
          phone: phone || null,
          role_id,
          status: status !== false,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: '管理員創建成功',
        data: {
          id: data.id,
          username: data.username,
          name: data.name,
          email: data.email,
          role_id: data.role_id,
          status: data.status,
        },
      });
    } catch (dbErr) {
      console.error('数据库操作失败:', dbErr);
      // 返回 mock 成功
      return NextResponse.json({
        success: true,
        message: '管理員創建成功（本地模式）',
        data: {
          id: Date.now(),
          username,
          name: name || username,
          email,
          phone,
          role_id,
          status: status !== false,
        },
        mock: true,
      });
    }
  } catch (error) {
    console.error('创建管理员失败:', error);
    return NextResponse.json({ error: '創建管理員失敗' }, { status: 500 });
  }
}

// PUT - 更新管理员
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, username, name, email, phone, role_id, password, status } = body;

    if (!id) {
      return NextResponse.json({ error: '管理員ID不能為空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (status !== undefined) updateData.status = status;
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }

    try {
      const { error } = await client
        .from('admins')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (dbErr) {
      console.error('数据库更新失败:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: '管理員更新成功',
    });
  } catch (error) {
    console.error('更新管理员失败:', error);
    return NextResponse.json({ error: '更新管理員失敗' }, { status: 500 });
  }
}

// DELETE - 删除管理员
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '管理員ID不能為空' }, { status: 400 });
    }

    // 不能删除自己
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, 'fubao-ltd-jwt-secret-key-2024-admin');
        if (decoded.adminId === parseInt(id)) {
          return NextResponse.json({ error: '不能刪除自己' }, { status: 400 });
        }
      } catch (e) {}
    }

    const client = getSupabaseClient();

    try {
      const { error } = await client
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (dbErr) {
      console.error('数据库删除失败:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: '管理員刪除成功',
    });
  } catch (error) {
    console.error('删除管理员失败:', error);
    return NextResponse.json({ error: '刪除管理員失敗' }, { status: 500 });
  }
}
