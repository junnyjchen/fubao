/**
 * @fileoverview 管理后台 - 公告管理 API
 */
import { NextResponse } from 'next/server';
import { query, insert, update, remove } from '@/lib/db';

/** 获取公告列表 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const announcements = await query('SELECT * FROM announcements ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, (page - 1) * pageSize]);
    const totalResult = await query('SELECT COUNT(*) as cnt FROM announcements');
    const total = Array.isArray(totalResult) && totalResult[0] ? (totalResult[0] as Record<string, unknown>).cnt : 0;

    return NextResponse.json({
      success: true, data: Array.isArray(announcements) ? announcements : [],
      total: Number(total), page, pageSize,
    });
  } catch {
    return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20 });
  }
}

/** 创建公告 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, type = 'notice', is_active = 1 } = body;
    if (!title || !content) return NextResponse.json({ success: false, error: '標題和內容不能為空' }, { status: 400 });

    const id = await insert('announcements', {
      title, content, type, is_active,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: '創建失敗' }, { status: 500 });
  }
}

/** 更新公告 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await update('announcements', data, { id });
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch {
    return NextResponse.json({ success: false, error: '更新失敗' }, { status: 500 });
  }
}

/** 删除公告 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await remove('announcements', { id: Number(id) });
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch {
    return NextResponse.json({ success: false, error: '刪除失敗' }, { status: 500 });
  }
}
