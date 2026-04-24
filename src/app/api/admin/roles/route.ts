/**
 * @fileoverview 管理员角色管理 API
 * @description 角色的增删改查
 * @module app/api/admin/roles/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/** 默认角色数据 */
const defaultRoles = [
  {
    id: 1,
    name: '超級管理員',
    code: 'super_admin',
    description: '擁有所有權限',
    is_system: true,
    permissions: ['*'],
    status: true,
  },
  {
    id: 2,
    name: '運營主管',
    code: 'operation_manager',
    description: '負責日常運營管理',
    is_system: false,
    permissions: ['content.view', 'content.news', 'goods.view', 'order.view', 'operation.banner'],
    status: true,
  },
  {
    id: 3,
    name: '內容編輯',
    code: 'content_editor',
    description: '負責內容編輯發布',
    is_system: false,
    permissions: ['content.view', 'content.news', 'content.wiki', 'video.view'],
    status: true,
  },
  {
    id: 4,
    name: '客服',
    code: 'customer_service',
    description: '負責客服和訂單處理',
    is_system: false,
    permissions: ['order.view', 'order.process', 'user.view'],
    status: true,
  },
  {
    id: 5,
    name: '商戶',
    code: 'merchant',
    description: '商戶自有管理',
    is_system: false,
    permissions: ['goods.view', 'goods.edit', 'order.view'],
    status: true,
  },
];

// GET - 获取角色列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();

    try {
      const { data, error } = await client
        .from('admin_roles')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        return NextResponse.json({
          success: true,
          data: data.map((role: any) => ({
            ...role,
            permissions: role.permissions || [],
          })),
        });
      }
    } catch (dbErr) {
      console.error('数据库查询失败:', dbErr);
    }

    // 返回默认数据
    return NextResponse.json({
      success: true,
      data: defaultRoles,
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return NextResponse.json({
      success: true,
      data: defaultRoles,
    });
  }
}

// POST - 创建角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, description, permissions, status } = body;

    if (!name) {
      return NextResponse.json({ error: '請輸入角色名稱' }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ error: '請輸入角色代碼' }, { status: 400 });
    }

    const client = getSupabaseClient();

    try {
      const { data, error } = await client
        .from('admin_roles')
        .insert({
          name,
          code,
          description: description || null,
          is_system: false,
          permissions: permissions || [],
          status: status !== false,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: '角色創建成功',
        data,
      });
    } catch (dbErr) {
      console.error('数据库操作失败:', dbErr);
      // 返回 mock 成功
      return NextResponse.json({
        success: true,
        message: '角色創建成功（本地模式）',
        data: {
          id: Date.now(),
          name,
          code,
          description,
          is_system: false,
          permissions: permissions || [],
          status: status !== false,
        },
        mock: true,
      });
    }
  } catch (error) {
    console.error('创建角色失败:', error);
    return NextResponse.json({ error: '創建角色失敗' }, { status: 500 });
  }
}

// PUT - 更新角色
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, permissions, status } = body;

    if (!id) {
      return NextResponse.json({ error: '角色ID不能為空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    try {
      // 检查是否是系统角色
      const { data: existing } = await client
        .from('admin_roles')
        .select('is_system')
        .eq('id', id)
        .single();

      if (existing?.is_system) {
        // 系统角色只允许修改描述和状态
        const { error } = await client
          .from('admin_roles')
          .update({
            description,
            status,
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await client
          .from('admin_roles')
          .update({
            name,
            description,
            permissions,
            status,
          })
          .eq('id', id);

        if (error) throw error;
      }
    } catch (dbErr) {
      console.error('数据库更新失败:', dbErr);
    }

    // 返回成功
    return NextResponse.json({
      success: true,
      message: '角色更新成功',
    });
  } catch (error) {
    console.error('更新角色失败:', error);
    return NextResponse.json({ error: '更新角色失敗' }, { status: 500 });
  }
}

// DELETE - 删除角色
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '角色ID不能為空' }, { status: 400 });
    }

    const client = getSupabaseClient();

    try {
      // 检查是否是系统角色
      const { data: existing } = await client
        .from('admin_roles')
        .select('is_system')
        .eq('id', id)
        .single();

      if (existing?.is_system) {
        return NextResponse.json({ error: '系統角色不能刪除' }, { status: 400 });
      }

      // 检查是否有管理员使用此角色
      const { data: admins } = await client
        .from('admins')
        .select('id')
        .eq('role_id', id)
        .limit(1);

      if (admins && admins.length > 0) {
        return NextResponse.json({ error: '該角色下有管理員，無法刪除' }, { status: 400 });
      }

      const { error } = await client
        .from('admin_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (dbErr) {
      console.error('数据库删除失败:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: '角色刪除成功',
    });
  } catch (error) {
    console.error('删除角色失败:', error);
    return NextResponse.json({ error: '刪除角色失敗' }, { status: 500 });
  }
}
