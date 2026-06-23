/**
 * @fileoverview 管理后台 - 角色管理 API
 */
import { NextResponse } from 'next/server';
import { query, insert, update, remove } from '@/lib/db';

/** 获取角色列表 */
export async function GET() {
  try {
    const roles = await query('SELECT * FROM admin_roles ORDER BY id');
    return NextResponse.json({ success: true, data: Array.isArray(roles) ? roles : [] });
  } catch {
    // Mock 数据
    const roles = [
      { id: 1, name: 'super_admin', label: '超級管理員', permissions: '*', is_default: 0 },
      { id: 2, name: 'admin', label: '管理員', permissions: 'goods,orders,users,news', is_default: 0 },
      { id: 3, name: 'editor', label: '編輯', permissions: 'goods,news', is_default: 1 },
    ];
    return NextResponse.json({ success: true, data: roles });
  }
}

/** 创建角色 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, label, permissions } = body;
    if (!name || !label) return NextResponse.json({ success: false, error: '缺少必要欄位' }, { status: 400 });

    const id = await insert('admin_roles', { name, label, permissions: permissions || '' });
    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch {
    return NextResponse.json({ success: false, error: '創建失敗' }, { status: 500 });
  }
}

/** 更新角色 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await update('admin_roles', data, { id });
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch {
    return NextResponse.json({ success: false, error: '更新失敗' }, { status: 500 });
  }
}

/** 删除角色 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });

    await remove('admin_roles', { id: Number(id) });
    return NextResponse.json({ success: true, message: '刪除成功' });
  } catch {
    return NextResponse.json({ success: false, error: '刪除失敗' }, { status: 500 });
  }
}
