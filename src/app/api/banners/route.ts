/**
 * @fileoverview 轮播图 API
 * @description 处理轮播图的增删改查 - MySQL 实现
 * @module app/api/banners/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insert as dbInsert, update as dbUpdate, remove as dbRemove } from '@/lib/db';

/**
 * GET - 获取轮播图列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    const conditions: string[] = ['is_active = 1'];
    const params: unknown[] = [];

    if (position) {
      conditions.push('position = ?');
      params.push(position);
    }

    const whereClause = conditions.join(' AND ');
    const data = await query(
      `SELECT * FROM banners WHERE ${whereClause} ORDER BY sort_order ASC`,
      params
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取轮播图失败:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

/**
 * POST - 创建轮播图
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, image, link, sort_order, position, is_active } = body;

    if (!title || !image) {
      return NextResponse.json({ error: '標題和圖片不能為空' }, { status: 400 });
    }

    const id = await dbInsert('banners', {
      title,
      image,
      link: link || null,
      sort_order: sort_order || 0,
      position: position || 'home',
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : 1,
    });

    return NextResponse.json({ success: true, data: { id }, message: '輪播圖創建成功' });
  } catch (error) {
    console.error('创建轮播图失败:', error);
    return NextResponse.json({ error: '創建輪播圖失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新轮播图
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, image, link, sort_order, position, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少輪播圖ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (image !== undefined) updateData.image = image;
    if (link !== undefined) updateData.link = link;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (position !== undefined) updateData.position = position;
    if (is_active !== undefined) updateData.is_active = is_active ? 1 : 0;

    await dbUpdate('banners', updateData, { id });

    return NextResponse.json({ success: true, message: '輪播圖更新成功' });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    return NextResponse.json({ error: '更新輪播圖失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除轮播图
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少輪播圖ID' }, { status: 400 });
    }

    await dbRemove('banners', { id: parseInt(id) });

    return NextResponse.json({ success: true, message: '輪播圖刪除成功' });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    return NextResponse.json({ error: '刪除輪播圖失敗' }, { status: 500 });
  }
}
