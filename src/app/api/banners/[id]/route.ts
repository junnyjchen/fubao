/**
 * @fileoverview 轮播图详情 API
 * @description 提供轮播图的查询、更新和删除接口
 * @module app/api/banners/[id]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取轮播图详情
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 轮播图详情响应
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('banners')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '輪播圖不存在' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: '獲取輪播圖失敗' },
      { status: 500 }
    );
  }
}

/**
 * 更新轮播图
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 更新结果
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sort !== undefined) updateData.sort = body.sort;
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;

    const { data, error } = await client
      .from('banners')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '輪播圖更新成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '更新輪播圖失敗' },
      { status: 500 }
    );
  }
}

/**
 * 删除轮播图
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 删除结果
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const client = getSupabaseClient();

    const { error } = await client
      .from('banners')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '輪播圖刪除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '刪除輪播圖失敗' },
      { status: 500 }
    );
  }
}
