/**
 * @fileoverview 免费领商品API
 * @description 免费领取商品 - MySQL 实现
 * @module app/api/free-gifts/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate } from '@/lib/db';

/**
 * GET - 获取免费送活动列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const data = await query(
      'SELECT * FROM free_gifts WHERE status = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const totalResult = await queryOne<{ cnt: number }>('SELECT COUNT(*) as cnt FROM free_gifts WHERE status = 1');
    const total = Number(totalResult?.cnt || 0);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('获取免费送列表失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 20, total_pages: 0 });
  }
}

/**
 * POST - 创建免费送活动
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image, total_count, remaining_count, points_required, start_time, end_time, status } = body;

    if (!title) {
      return NextResponse.json({ error: '標題不能為空' }, { status: 400 });
    }

    const id = await dbInsert('free_gifts', {
      title,
      description: description || null,
      image: image || null,
      total_count: total_count || 0,
      remaining_count: remaining_count || total_count || 0,
      points_required: points_required || 0,
      start_time: start_time || null,
      end_time: end_time || null,
      status: status || 1,
    });

    return NextResponse.json({ data: { id }, message: '活動創建成功' });
  } catch (error) {
    console.error('创建免费送活动失败:', error);
    return NextResponse.json({ error: '創建活動失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新免费送活动
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, image, total_count, remaining_count, points_required, start_time, end_time, status } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少活動ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (total_count !== undefined) updateData.total_count = total_count;
    if (remaining_count !== undefined) updateData.remaining_count = remaining_count;
    if (points_required !== undefined) updateData.points_required = points_required;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (status !== undefined) updateData.status = status;

    await dbUpdate('free_gifts', updateData, { id });

    return NextResponse.json({ message: '活動更新成功' });
  } catch (error) {
    console.error('更新免费送活动失败:', error);
    return NextResponse.json({ error: '更新活動失敗' }, { status: 500 });
  }
}
