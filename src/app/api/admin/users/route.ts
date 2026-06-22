/**
 * @fileoverview 用户管理 API - MySQL 实现
 * @module app/api/admin/users/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count, update as dbUpdate } from '@/lib/db';

/**
 * GET - 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (keyword && keyword.trim()) {
      conditions.push('(email LIKE ? OR nickname LIKE ? OR phone LIKE ?)');
      params.push(`%${keyword.trim()}%`, `%${keyword.trim()}%`, `%${keyword.trim()}%`);
    }

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status === 'active' ? 1 : 0);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = await count('users', conditions.length > 0 ? conditions.join(' AND ') : '1=1', params);

    const data = await query(
      `SELECT id, email, phone, nickname, role, points, status, language, created_at, updated_at FROM users ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, limit: 20 });
  }
}

/**
 * PUT - 更新用户状态
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少用戶ID' }, { status: 400 });
    }

    await dbUpdate('users', { status: status ? 1 : 0 }, { id });

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
