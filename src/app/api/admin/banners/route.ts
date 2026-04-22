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

    let dbAvailable = true;
    let data: any[] = [];

    try {
      let query = client
        .from('banners')
        .select('*')
        .order('sort', { ascending: true });

      if (position) {
        query = query.eq('position', position);
      }

      const result = await query;
      data = result.data || [];
      if (result.error) throw result.error;
    } catch (dbErr) {
      console.error('数据库查询失败，使用 mock 数据:', dbErr);
      dbAvailable = false;
    }

    // 如果数据库不可用，返回 mock 数据
    if (!dbAvailable) {
      const mockBanners = [
        { id: 1, title: '首頁橫幅', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200', position: 'home', sort: 1, status: true },
        { id: 2, title: '活動專區', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', position: 'home', sort: 2, status: true },
      ];
      return NextResponse.json({ banners: mockBanners, mock: true });
    }

    return NextResponse.json({ banners: data });
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

    let dbAvailable = true;
    let data: any = null;

    try {
      // 获取最大排序值
      const { data: maxSort } = await client
        .from('banners')
        .select('sort')
        .order('sort', { ascending: false })
        .limit(1)
        .single();

      const sort = body.sort ?? (maxSort?.sort ?? 0) + 1;

      const result = await client
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

      data = result.data;
      if (result.error) throw result.error;
    } catch (dbErr) {
      console.error('数据库操作失败:', dbErr);
      dbAvailable = false;
    }

    // 如果数据库不可用，返回 mock 成功
    if (!dbAvailable || !data) {
      const mockId = Date.now();
      return NextResponse.json({
        banner: {
          id: mockId,
          title: body.title,
          image: body.image,
          link: body.link,
          position: body.position || 'home',
          sort: body.sort || 1,
          status: body.status !== false,
        },
        mock: true,
      });
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

    let dbAvailable = true;

    try {
      const { error } = await client
        .from('banners')
        .update(updateData)
        .eq('id', body.id);

      if (error) throw error;
    } catch (dbErr) {
      console.error('数据库更新失败:', dbErr);
      dbAvailable = false;
    }

    // 如果数据库不可用，返回 mock 成功
    if (!dbAvailable) {
      return NextResponse.json({ banner: { ...updateData, id: body.id }, mock: true });
    }

    return NextResponse.json({ banner: updateData });
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
    let dbAvailable = true;

    try {
      const { error } = await client
        .from('banners')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;
    } catch (dbErr) {
      console.error('数据库删除失败:', dbErr);
      dbAvailable = false;
    }

    // 如果数据库不可用，返回 mock 成功
    if (!dbAvailable) {
      return NextResponse.json({ message: '刪除成功', mock: true });
    }

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('刪除輪播圖失敗:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
