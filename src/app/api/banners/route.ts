/**
 * @fileoverview 轮播图 API
 * @description 提供轮播图的查询和创建接口
 * @module app/api/banners/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取轮播图列表
 * @param request - 请求对象
 * @returns 轮播图列表响应
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || 'home';
  const status = searchParams.get('status');

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('banners')
      .select('*')
      .order('sort', { ascending: true });

    // 后台管理可查看所有状态
    if (status !== null && status !== 'all') {
      query = query.eq('status', status === 'true');
    } else if (status === null) {
      // 前台只显示启用的
      query = query.eq('status', true);
    }

    if (position !== 'all') {
      query = query.eq('position', position);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

/**
 * 创建轮播图
 * @param request - 请求对象
 * @returns 创建结果
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('banners')
      .insert({
        title: body.title,
        image: body.image,
        link: body.link,
        position: body.position || 'home',
        status: body.status ?? true,
        sort: body.sort || 0,
        start_time: body.start_time,
        end_time: body.end_time,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '輪播圖創建成功' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}
