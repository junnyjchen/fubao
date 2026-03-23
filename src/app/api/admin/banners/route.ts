/**
 * @fileoverview 管理后台轮播图API
 * @description 轮播图的CRUD操作
 * @module app/api/admin/banners/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET - 获取轮播图列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    let query = client
      .from('banners')
      .select('*')
      .order('sort', { ascending: true });

    if (position) {
      query = query.eq('position', position);
    }

    const { data: banners, error } = await query;

    if (error) {
      console.error('查询轮播图失败:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({ banners: banners || [] });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// POST - 创建轮播图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 验证必填字段
    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: '請填寫標題和圖片' },
        { status: 400 }
      );
    }

    // 获取最大排序值
    const { data: maxSort } = await client
      .from('banners')
      .select('sort')
      .order('sort', { ascending: false })
      .limit(1)
      .single();

    const sort = body.sort ?? (maxSort?.sort ?? 0) + 1;

    const { data, error } = await client
      .from('banners')
      .insert({
        title: body.title,
        subtitle: body.subtitle || null,
        image_url: body.image_url,
        link_url: body.link_url || null,
        link_type: body.link_type || 'none',
        position: body.position || 'home',
        sort,
        status: body.status !== false,
        start_time: body.start_time || null,
        end_time: body.end_time || null,
      })
      .select()
      .single();

    if (error) {
      console.error('创建轮播图失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error('创建轮播图失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}

// PUT - 更新轮播图
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    if (!body.id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.link_url !== undefined) updateData.link_url = body.link_url;
    if (body.link_type !== undefined) updateData.link_type = body.link_type;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.sort !== undefined) updateData.sort = body.sort;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.start_time !== undefined) updateData.start_time = body.start_time;
    if (body.end_time !== undefined) updateData.end_time = body.end_time;

    const { data, error } = await client
      .from('banners')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('更新轮播图失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

// DELETE - 删除轮播图
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少ID' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from('banners')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除轮播图失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
