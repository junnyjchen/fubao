/**
 * @fileoverview 收藏 API
 * @description 用户收藏管理 - 添加/查询/删除收藏
 */

import { NextResponse } from 'next/server';
import { query, insert, remove, count } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取收藏列表 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType') || '';
    const targetId = searchParams.get('targetId');

    let sql = 'SELECT * FROM favorites WHERE user_id = ?';
    const params: (string | number)[] = [userId];

    if (targetType) {
      sql += ' AND target_type = ?';
      params.push(targetType);
    }
    if (targetId) {
      sql += ' AND target_id = ?';
      params.push(Number(targetId));
    }

    sql += ' ORDER BY created_at DESC';

    const favorites = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({ success: false, error: '獲取收藏失敗' }, { status: 500 });
  }
}

/** 添加收藏 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId } = body;

    if (!targetType || !targetId) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    // 检查是否已收藏
    const existing = await query(
      'SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?',
      [userId, targetType, Number(targetId)]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ success: true, message: '已收藏', data: existing[0] });
    }

    const result = await insert('favorites', {
      user_id: userId,
      target_type: targetType,
      target_id: Number(targetId),
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({
      success: true,
      message: '收藏成功',
      data: { id: result },
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ success: false, error: '收藏失敗' }, { status: 500 });
  }
}

/** 取消收藏 */
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType');
    const targetId = searchParams.get('targetId');

    if (!targetType || !targetId) {
      return NextResponse.json({ success: false, error: '缺少必要參數' }, { status: 400 });
    }

    await remove('favorites', {
      user_id: userId,
      target_type: targetType,
      target_id: Number(targetId),
    });

    return NextResponse.json({ success: true, message: '取消收藏成功' });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ success: false, error: '取消收藏失敗' }, { status: 500 });
  }
}
