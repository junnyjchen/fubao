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
      console.error('查詢輪播圖失敗:', error);
      return NextResponse.json({ error: '查詢失敗' }, { status: 500 });
    }

    return NextResponse.json({ banners: banners || [] });
  } catch (error) {
    console.error('獲取輪播圖列表失敗:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// POST - 创建轮播图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 验证必填字段
    if (!body.image) {
      return NextResponse.json(
        { error: '請上傳輪播圖片' },
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
        title: body.title || null,
        image: body.image,
        link: body.link || null,
        position: body.position || 'home',
        sort,
        status: body.status !== false,
        start_date: body.start_date || null,
        end_date: body.end_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error('創建輪播圖失敗:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error('創建輪播圖失敗:', error);
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

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.image !== undefined) updateData.image = body.image;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.sort !== undefined) updateData.sort = body.sort;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;

    const { data, error } = await client
      .from('banners')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      console.error('更新輪播圖失敗:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ banner: data });
  } catch (error) {
    console.error('更新輪播圖失敗:', error);
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
      console.error('刪除輪播圖失敗:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除輪播圖失敗:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
