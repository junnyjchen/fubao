/**
 * @fileoverview 用户管理 API
 * @description 处理用户的查询和管理
 * @module app/api/admin/users/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取用户列表
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');

    const client = getSupabaseClient();

    let query = client
      .from('users')
      .select('*', { count: 'exact' });

    // 关键字搜索
    if (keyword && keyword.trim()) {
      query = query.or(`username.ilike.%${keyword.trim()}%,email.ilike.%${keyword.trim()}%,nickname.ilike.%${keyword.trim()}%`);
    }

    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status === 'active');
    }

    // 排序和分页
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      // 如果表不存在，返回空数组
      if (error.code === '42P01') {
        return NextResponse.json({ data: [], total: 0 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 移除敏感信息
    const safeUsers = users?.map(user => {
      const { password, ...safeUser } = user as { password?: string; [key: string]: unknown };
      return safeUser;
    }) || [];

    return NextResponse.json({ 
      data: safeUsers, 
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取用户失败:', error);
    return NextResponse.json({ error: '獲取用戶失敗' }, { status: 500 });
  }
}

/**
 * 更新用户状态
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: '用戶ID不能為空' }, { status: 400 });
    }

    const { error } = await client
      .from('users')
      .update({ status })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    return NextResponse.json({ error: '更新用戶失敗' }, { status: 500 });
  }
}
