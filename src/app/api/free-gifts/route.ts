/**
 * @fileoverview 免费领商品API
 * @description 免费领取商品 - MySQL 实现，完整 CRUD + 领取记录
 * @module app/api/free-gifts/route
 */

import { NextRequest } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate, count } from '@/lib/db';
import { successResponse, listResponse, errorResponse, messageResponse } from '@/lib/api-response';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 将数据库行映射为前端字段 */
function mapGiftRow(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name || row.title,
    title: row.title,
    description: row.description,
    image: row.image || row.cover_image,
    cover_image: row.cover_image,
    original_price: row.original_price,
    stock: row.remain_count,
    claimed: row.claimed,
    total_count: row.total_count,
    remain_count: row.remain_count,
    limit_per_user: row.limit_per_user || 1,
    shipping_fee: row.shipping_fee,
    points_required: row.points_required,
    merchant_id: row.merchant_id,
    category: row.category,
    is_new_user_only: row.is_new_user_only ? 1 : 0,
    is_active: row.is_active ?? (row.status === 1 ? 1 : 0),
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    created_at: row.created_at,
  };
}

/**
 * GET - 获取免费送活动列表（前台）或管理列表（admin=1）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * pageSize;
    const isAdmin = searchParams.get('admin') === '1';
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');

    let whereClause = isAdmin ? '1=1' : 'status = 1';
    const params: unknown[] = [];

    if (!isAdmin) {
      // 前台只显示上架且未过期的
      whereClause += ' AND (end_time IS NULL OR end_time > NOW())';
    }

    if (status !== null && status !== undefined && status !== '') {
      whereClause += ' AND status = ?';
      params.push(parseInt(status));
    }

    if (keyword) {
      whereClause += ' AND (title LIKE ? OR name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    const data = await query(
      `SELECT * FROM free_gifts WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );

    const totalResult = await queryOne(
      `SELECT COUNT(*) as cnt FROM free_gifts WHERE ${whereClause}`,
      params
    );
    const total = Number(totalResult?.cnt || 0);

    const mapped = (data as Record<string, unknown>[]).map(mapGiftRow);
    return listResponse(mapped, { total, page, pageSize });
  } catch (error) {
    console.error('获取免费送列表失败:', error);
    return listResponse([], { total: 0, page: 1, pageSize: 20 });
  }
}

/**
 * POST - 创建免费送活动（管理）或领取商品（前台）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 前台领取：有 gift_id
    if (body.gift_id) {
      return await handleClaim(request, body);
    }

    // 管理创建
    const { title, name, description, image, cover_image, original_price,
            total_count, remain_count, points_required, shipping_fee,
            limit_per_user, merchant_id, category, is_new_user_only,
            start_time, end_time, status } = body;

    if (!title && !name) {
      return errorResponse('標題不能為空');
    }

    const giftName = name || title;
    const totalCount = total_count || 0;

    const id = await dbInsert('free_gifts', {
      title: title || giftName,
      name: giftName,
      description: description || null,
      cover_image: cover_image || image || '',
      image: image || cover_image || '',
      original_price: original_price || 0,
      total_count: totalCount,
      remain_count: remain_count || totalCount,
      claimed: 0,
      limit_per_user: limit_per_user || 1,
      shipping_fee: shipping_fee || 0,
      points_required: points_required || 0,
      merchant_id: merchant_id || null,
      category: category || '',
      is_new_user_only: is_new_user_only || 0,
      is_active: 1,
      start_time: start_time || null,
      end_time: end_time || null,
      status: status ?? 1,
    });

    return successResponse({ id }, '活動創建成功');
  } catch (error) {
    console.error('创建免费送活动失败:', error);
    return errorResponse('創建活動失敗', 500);
  }
}

/** 前台领取商品 */
async function handleClaim(request: NextRequest, body: {
  gift_id: number;
  receive_type: 'shipping' | 'pickup';
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
}) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return errorResponse('請先登入', 401);
  }

  const { gift_id, receive_type, shipping_name, shipping_phone, shipping_address } = body;

  // 查询商品
  const gift = await queryOne('SELECT * FROM free_gifts WHERE id = ? AND status = 1', [gift_id]);
  if (!gift) {
    return errorResponse('商品不存在或已下架');
  }

  const remainCount = Number(gift.remain_count);
  if (remainCount <= 0) {
    return errorResponse('商品已領完');
  }

  // 检查过期
  if (gift.end_time && new Date(gift.end_time as string) < new Date()) {
    return errorResponse('活動已結束');
  }

  // 检查用户领取次数
  const limitPerUser = Number(gift.limit_per_user) || 1;
  const userClaimed = await count('free_gift_claims', `gift_id = ? AND user_id = ? AND status != 4`, [gift_id, userId]);
  if (userClaimed >= limitPerUser) {
    return errorResponse(`每人限領 ${limitPerUser} 次`);
  }

  // 生成领取编号
  const claimNo = `FG${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const payAmount = receive_type === 'shipping' ? Number(gift.shipping_fee) : 0;

  // 创建领取记录
  const claimId = await dbInsert('free_gift_claims', {
    gift_id,
    user_id: userId,
    receive_type,
    shipping_name: shipping_name || null,
    shipping_phone: shipping_phone || null,
    shipping_address: shipping_address || null,
    claim_no: claimNo,
    pay_amount: payAmount,
    status: payAmount > 0 ? 0 : 1, // 需要支付的待处理，免费直接确认
  });

  // 扣减库存
  await query(
    'UPDATE free_gifts SET remain_count = remain_count - 1, claimed = claimed + 1 WHERE id = ? AND remain_count > 0',
    [gift_id]
  );

  const giftName = (gift.name || gift.title) as string;

  return successResponse({
    claim_id: claimId,
    claim_no: claimNo,
    shipping_fee: gift.shipping_fee,
    pay_amount: payAmount,
    need_pay: payAmount > 0,
    pickup_address: receive_type === 'pickup' ? '門店自取' : null,
    gift_name: giftName,
  }, '領取成功');
}

/**
 * PUT - 更新免费送活动
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return errorResponse('缺少活動ID');
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'title', 'name', 'description', 'image', 'cover_image',
      'original_price', 'total_count', 'remain_count', 'claimed',
      'limit_per_user', 'shipping_fee', 'points_required',
      'merchant_id', 'category', 'is_new_user_only', 'is_active',
      'start_time', 'end_time', 'status',
    ];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    // 同步 name → title, image → cover_image
    if (updateData.name && !updateData.title) {
      updateData.title = updateData.name;
    }
    if (updateData.title && !updateData.name) {
      updateData.name = updateData.title;
    }
    if (updateData.image && !updateData.cover_image) {
      updateData.cover_image = updateData.image;
    }
    if (updateData.cover_image && !updateData.image) {
      updateData.image = updateData.cover_image;
    }

    if (Object.keys(updateData).length === 0) {
      return errorResponse('沒有需要更新的欄位');
    }

    await dbUpdate('free_gifts', updateData, { id });

    return messageResponse('活動更新成功');
  } catch (error) {
    console.error('更新免费送活动失败:', error);
    return errorResponse('更新活動失敗', 500);
  }
}

/**
 * DELETE - 删除免费送活动（软删除，设 status=0）
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少活動ID');
    }

    await dbUpdate('free_gifts', { status: 0 }, { id: parseInt(id) });

    return messageResponse('活動已刪除');
  } catch (error) {
    console.error('删除免费送活动失败:', error);
    return errorResponse('刪除活動失敗', 500);
  }
}
