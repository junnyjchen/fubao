/**
 * @fileoverview 浏览历史 API
 * @description 用户浏览历史记录管理
 */

import { NextResponse } from 'next/server';
import { query, insert, remove } from '@/lib/db';
import { getAuthUserId } from '@/lib/auth/apiAuth';

/** 获取浏览历史 */
export async function GET(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await query(
      'SELECT * FROM browse_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('获取浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '獲取瀏覽歷史失敗' }, { status: 500 });
  }
}

/** 记录浏览历史 */
export async function POST(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const body = await request.json();
    const { goods_id, goods_name, goods_image } = body;

    if (!goods_id) {
      return NextResponse.json({ success: false, error: '缺少商品ID' }, { status: 400 });
    }

    // 检查是否已有记录，有则更新时间
    const existing = await query(
      'SELECT id FROM browse_history WHERE user_id = ? AND goods_id = ?',
      [userId, Number(goods_id)]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      // 更新浏览时间
      await query(
        'UPDATE browse_history SET created_at = NOW() WHERE user_id = ? AND goods_id = ?',
        [userId, Number(goods_id)]
      );
      return NextResponse.json({ success: true, message: '瀏覽記錄已更新' });
    }

    // 新增浏览记录
    await insert('browse_history', {
      user_id: userId,
      goods_id: Number(goods_id),
      goods_name: goods_name || '',
      goods_image: goods_image || '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '瀏覽記錄已保存' });
  } catch (error) {
    console.error('记录浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '記錄瀏覽歷史失敗' }, { status: 500 });
  }
}

/** 删除浏览历史 */
export async function DELETE(request: Request) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: '請先登錄' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const goodsId = searchParams.get('goods_id');

    if (goodsId) {
      // 删除单条记录
      await remove('browse_history', {
        user_id: userId,
        goods_id: Number(goodsId),
      });
      return NextResponse.json({ success: true, message: '刪除成功' });
    }

    // 清空所有记录
    await query('DELETE FROM browse_history WHERE user_id = ?', [userId]);

    return NextResponse.json({ success: true, message: '瀏覽歷史已清空' });
  } catch (error) {
    console.error('删除浏览历史失败:', error);
    return NextResponse.json({ success: false, error: '刪除瀏覽歷史失敗' }, { status: 500 });
  }
}
