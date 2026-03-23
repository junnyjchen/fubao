/**
 * @fileoverview 商户列表 API
 * @description 提供商户列表查询功能
 * @module app/api/merchants/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取商户列表
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  try {
    const client = getSupabaseClient();
    
    // 获取总数
    const { count } = await client
      .from('merchants')
      .select('*', { count: 'exact', head: true });

    // 查询商户列表
    const { data: merchants, error } = await client
      .from('merchants')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      data: merchants || [], 
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('获取商户列表失败:', error);
    return NextResponse.json({ error: '獲取商戶列表失敗' }, { status: 500 });
  }
}
