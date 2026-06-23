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

    const conditions: string[] = ['status = 1'];
    const params: unknown[] = [];

    // position 列可能不存在（旧 schema），先查列是否存在
    let hasPositionColumn = false;
    try {
      const columns = await query("SHOW COLUMNS FROM banners LIKE 'position'");
      hasPositionColumn = Array.isArray(columns) && columns.length > 0;
    } catch {
      // 查询失败忽略
    }

    if (position && hasPositionColumn) {
      conditions.push('position = ?');
      params.push(position);
    }

    const whereClause = conditions.join(' AND ');
    let data = await query(
      `SELECT * FROM banners WHERE ${whereClause} ORDER BY sort_order ASC`,
      params
    );

    // 确保 data 是数组
    if (!Array.isArray(data)) {
      data = [];
    }

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
    const { title, image, link, sort_order, position, is_active: isActive } = body;

    if (!title || !image) {
      return NextResponse.json({ error: '標題和圖片不能為空' }, { status: 400 });
    }

    const insertData: Record<string, unknown> = {
      title,
      image,
      link: link || null,
      sort_order: sort_order || 0,
      status: isActive !== undefined ? (isActive ? 1 : 0) : 1,
    };
    // position 列可能不存在（旧 schema），安全添加
    if (position) {
      insertData.position = position;
    }

    const id = await dbInsert('banners', insertData);

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
    const { id, title, image, link, sort_order, position, is_active: isActive } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少輪播圖ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (image !== undefined) updateData.image = image;
    if (link !== undefined) updateData.link = link;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (isActive !== undefined) updateData.status = isActive ? 1 : 0;
    // position 列可能不存在（旧 schema），只有非空时才写入
    if (position) updateData.position = position;

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
