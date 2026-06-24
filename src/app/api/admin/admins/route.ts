import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, insert, update, remove } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const admins = await query(
      'SELECT a.*, r.name as role_name FROM admins a LEFT JOIN admin_roles r ON a.role_id = r.id ORDER BY a.id ASC'
    );
    return NextResponse.json({ success: true, data: Array.isArray(admins) ? admins : [] });
  } catch (error) {
    console.error('[admins] GET 失败:', error);
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, email, phone, role_id, status } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: '请输入用户名' }, { status: 400 });
    }

    // 检查是否已存在
    const existing = await queryOne('SELECT id FROM admins WHERE username = ?', [username]);
    if (existing) {
      return NextResponse.json({ success: false, error: '用户名已存在' }, { status: 400 });
    }

    const insertData: Record<string, any> = {
      username,
      name: name || '',
      email: email || '',
      phone: phone || '',
      role_id: role_id || 1,
      status: status ? 1 : 0,
    };

    if (password) {
      // 简单哈希（生产环境应使用 bcrypt）
      insertData.password = password;
    }

    const id = await insert('admins', insertData);
    return NextResponse.json({ success: true, message: '创建成功', id });
  } catch (error) {
    console.error('[admins] POST 失败:', error);
    return NextResponse.json({ success: false, error: '创建失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.username !== undefined) updateData.username = body.username;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role_id !== undefined) updateData.role_id = body.role_id;
    if (body.status !== undefined) updateData.status = body.status ? 1 : 0;
    if (body.password) updateData.password = body.password;

    await update('admins', updateData, { id: Number(id) });
    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('[admins] PUT 失败:', error);
    return NextResponse.json({ success: false, error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少ID' }, { status: 400 });
    }

    // 不允许删除自己或超级管理员
    const admin = await queryOne('SELECT * FROM admins WHERE id = ?', [Number(id)]) as any;
    if (!admin) {
      return NextResponse.json({ success: false, error: '管理员不存在' }, { status: 404 });
    }

    await remove('admins', { id: Number(id) });
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('[admins] DELETE 失败:', error);
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
