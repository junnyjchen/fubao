/**
 * @fileoverview 轮播图 API
 * @description 处理轮播图的增删改查
 * @module app/api/banners/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 获取轮播图列表
 */
export async function GET() {
  try {
    const client = getSupabaseClient();

    const { data: banners, error } = await client
      .from('banners')
      .select('*')
      .order('sort', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // 如果表不存在，返回空数组
      if (error.code === '42P01') {
        return NextResponse.json({ data: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: banners || [] });
  } catch (error) {
    console.error('获取轮播图失败:', error);
    return NextResponse.json({ error: '獲取輪播圖失敗' }, { status: 500 });
  }
}

/**
 * 创建轮播图
 */
export async function POST(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { title, image_url, link_url, position, sort, status } = body;

    if (!image_url) {
      return NextResponse.json({ error: '請上傳輪播圖片' }, { status: 400 });
    }

    const { data, error } = await client
      .from('banners')
      .insert({
        title: title || null,
        image_url,
        link_url: link_url || null,
        position: position || 'home',
        sort: sort || 0,
        status: status !== false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('创建轮播图失败:', error);
    return NextResponse.json({ error: '創建輪播圖失敗' }, { status: 500 });
  }
}

/**
 * 更新轮播图
 */
export async function PUT(request: Request) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();

    const { id, title, image_url, link_url, position, sort, status } = body;

    if (!id) {
      return NextResponse.json({ error: '輪播圖ID不能為空' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (position !== undefined) updateData.position = position;
    if (sort !== undefined) updateData.sort = sort;
    if (status !== undefined) updateData.status = status;

    const { error } = await client
      .from('banners')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    return NextResponse.json({ error: '更新輪播圖失敗' }, { status: 500 });
  }
}

/**
 * 删除轮播图
 */
export async function DELETE(request: Request) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '輪播圖ID不能為空' }, { status: 400 });
    }

    const { error } = await client
      .from('banners')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    return NextResponse.json({ error: '刪除輪播圖失敗' }, { status: 500 });
  }
}
