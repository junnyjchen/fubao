/**
 * @fileoverview 免费领商品API
 * @description 免费领取商品 - MySQL 实现
 * @module app/api/free-gifts/route
 */

import { NextRequest } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate } from '@/lib/db';
import { successResponse, listResponse, errorResponse, messageResponse } from '@/lib/api-response';

/**
 * GET - 获取免费送活动列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * pageSize;

    const data = await query(
      'SELECT * FROM free_gifts WHERE status = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );

    const totalResult = await queryOne('SELECT COUNT(*) as cnt FROM free_gifts WHERE status = 1');
    const total = Number(totalResult?.cnt || 0);

    return listResponse(data, { total, page, pageSize });
  } catch (error) {
    console.error('获取免费送列表失败:', error);
    return listResponse([], { total: 0, page: 1, pageSize: 20 });
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
      return errorResponse('標題不能為空');
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

    return successResponse({ id }, '活動創建成功');
  } catch (error) {
    console.error('创建免费送活动失败:', error);
    return errorResponse('創建活動失敗', 500);
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
      return errorResponse('缺少活動ID');
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

    return messageResponse('活動更新成功');
  } catch (error) {
    console.error('更新免费送活动失败:', error);
    return errorResponse('更新活動失敗', 500);
  }
}
