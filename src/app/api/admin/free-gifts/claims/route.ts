/**
 * @fileoverview 免费领领取记录管理API
 * @module app/api/admin/free-gifts/claims/route
 */

import { NextRequest } from 'next/server';
import { query, queryOne, update as dbUpdate } from '@/lib/db';
import { successResponse, listResponse, errorResponse, messageResponse } from '@/lib/api-response';

/**
 * GET - 获取领取记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * pageSize;
    const giftId = searchParams.get('gift_id');
    const status = searchParams.get('status');

    let whereClause = '1=1';
    const params: unknown[] = [];

    if (giftId) {
      whereClause += ' AND c.gift_id = ?';
      params.push(parseInt(giftId));
    }
    if (status !== null && status !== '') {
      whereClause += ' AND c.status = ?';
      params.push(parseInt(status as string));
    }

    const data = await query(
      `SELECT c.*, g.name as gift_name, g.title as gift_title, g.cover_image as gift_image
       FROM free_gift_claims c
       LEFT JOIN free_gifts g ON c.gift_id = g.id
       WHERE ${whereClause}
       ORDER BY c.claimed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const totalResult = await queryOne(
      `SELECT COUNT(*) as cnt FROM free_gift_claims c WHERE ${whereClause}`,
      params
    );
    const total = Number(totalResult?.cnt || 0);

    return listResponse(data, { total, page, pageSize });
  } catch (error) {
    console.error('获取领取记录失败:', error);
    return listResponse([], { total: 0, page: 1, pageSize: 20 });
  }
}

/**
 * PUT - 更新领取记录状态（确认/发货/完成/取消）
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return errorResponse('缺少記錄ID');
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) {
      updateData.status = status;
    }

    // 完成时记录时间
    if (status === 3) {
      updateData.completed_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    // 取消时恢复库存
    if (status === 4) {
      const claim = await queryOne('SELECT gift_id FROM free_gift_claims WHERE id = ?', [id]);
      if (claim) {
        await query(
          'UPDATE free_gifts SET remain_count = remain_count + 1, claimed = GREATEST(claimed - 1, 0) WHERE id = ?',
          [claim.gift_id]
        );
      }
    }

    await dbUpdate('free_gift_claims', updateData, { id });

    return messageResponse('狀態更新成功');
  } catch (error) {
    console.error('更新领取记录失败:', error);
    return errorResponse('更新失敗', 500);
  }
}
