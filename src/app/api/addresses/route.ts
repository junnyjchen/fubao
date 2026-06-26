/**
 * @fileoverview 用户地址 API
 * @description 处理用户收货地址的增删改查 - MySQL 实现
 * @module app/api/addresses/route
 */

import { NextRequest } from 'next/server';
import { query, queryOne, insert as dbInsert, update as dbUpdate, remove as dbRemove } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';
import { successResponse, errorResponse, messageResponse } from '@/lib/api-response';



/**
 * 获取用户地址列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return errorResponse('請先登錄', 401);
    }

    const data = await query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    return successResponse(data);
  } catch (error) {
    console.error('获取地址失败:', error);
    return successResponse([]);
  }
}

/**
 * 添加新地址
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return errorResponse('請先登錄', 401);
    }

    const body = await request.json();
    const { name, phone, province, city, district, address, is_default, tag } = body;

    if (!name || !address) {
      return errorResponse('請填寫完整地址信息');
    }

    // 如果设为默认地址，取消其他默认
    if (is_default) {
      await dbUpdate('addresses', { is_default: 0 }, { user_id: userId, is_default: 1 });
    }

    const insertData: Record<string, unknown> = {
      user_id: userId,
      name,
      phone: phone || '',
      province: province || null,
      city: city || null,
      district: district || null,
      address,
      is_default: is_default ? 1 : 0,
    };
    // tag 列可能不存在，尝试添加
    try {
      insertData.tag = tag || null;
    } catch { /* ignore */ }

    const id = await dbInsert('addresses', insertData);

    return successResponse({ id }, '地址添加成功');
  } catch (error) {
    console.error('添加地址失败:', error);
    return errorResponse('添加地址失敗', 500);
  }
}

/**
 * 更新地址
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return errorResponse('請先登錄', 401);
    }

    const body = await request.json();
    const { id, name, phone, province, city, district, address, is_default, tag } = body;

    if (!id) {
      return errorResponse('缺少地址ID');
    }

    // 验证地址归属
    const existing = await queryOne('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return errorResponse('地址不存在', 404);
    }

    // 如果设为默认地址，取消其他默认
    if (is_default) {
      await dbUpdate('addresses', { is_default: 0 }, { user_id: userId, is_default: 1 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || '';
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (address !== undefined) updateData.address = address;
    if (is_default !== undefined) updateData.is_default = is_default ? 1 : 0;
    if (tag !== undefined) updateData.tag = tag;

    await dbUpdate('addresses', updateData, { id, user_id: userId });

    return messageResponse('地址更新成功');
  } catch (error) {
    console.error('更新地址失败:', error);
    return errorResponse('更新地址失敗', 500);
  }
}

/**
 * 删除地址
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return errorResponse('請先登錄', 401);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('缺少地址ID');
    }

    await dbRemove('addresses', { id: parseInt(id), user_id: userId });

    return messageResponse('地址刪除成功');
  } catch (error) {
    console.error('删除地址失败:', error);
    return errorResponse('刪除地址失敗', 500);
  }
}
