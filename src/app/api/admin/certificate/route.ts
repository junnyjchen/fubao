/**
 * @fileoverview 管理后台 - 证书管理 API
 */
import { NextResponse } from 'next/server';
import { query, insert, update, remove } from '@/lib/db';

/** 获取证书列表 */
export async function GET(request: Request) {
  try {
    const certificates = await query('SELECT * FROM certificates ORDER BY created_at DESC');
    return NextResponse.json({ success: true, data: Array.isArray(certificates) ? certificates : [] });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

/** 创建证书 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, goods_id, image, description } = body;
    if (!name) return NextResponse.json({ success: false, error: '證書名稱不能為空' }, { status: 400 });

    const id = await insert('certificates', {
      name, goods_id: goods_id || null, image: image || '', description: description || '',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: '創建失敗' }, { status: 500 });
  }
}

/** 更新证书 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await update('certificates', data, { id });
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch {
    return NextResponse.json({ success: false, error: '更新失敗' }, { status: 500 });
  }
}

/** 删除证书 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await remove('certificates', { id: Number(id) });
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch {
    return NextResponse.json({ success: false, error: '刪除失敗' }, { status: 500 });
  }
}
