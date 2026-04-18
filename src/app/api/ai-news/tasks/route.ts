import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';

// 获取所有定时任务
export async function GET() {
  try {
    const { data: session } = await supabaseAdmin.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 检查管理员权限
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '無權訪問' }, { status: 403 });
    }

    // 查询定时任务
    const { data, error } = await supabaseAdmin
      .from('auto_publish_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取定时任务失败:', error);
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取定时任务失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// 创建定时任务
export async function POST(request: NextRequest) {
  try {
    const { data: session } = await supabaseAdmin.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 检查管理员权限
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '無權訪問' }, { status: 403 });
    }

    const body = await request.json();
    const { name, sourceIds, schedule, status, autoPublish } = body;

    const { data, error } = await supabaseAdmin
      .from('auto_publish_tasks')
      .insert({
        name,
        source_ids: sourceIds || [],
        schedule,
        status: status || 'active',
        auto_publish: autoPublish || false,
      })
      .select()
      .single();

    if (error) {
      console.error('创建定时任务失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建定时任务失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}

// 更新定时任务
export async function PUT(request: NextRequest) {
  try {
    const { data: session } = await supabaseAdmin.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 检查管理员权限
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '無權訪問' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, sourceIds, schedule, status, autoPublish } = body;

    const { data, error } = await supabaseAdmin
      .from('auto_publish_tasks')
      .update({
        name,
        source_ids: sourceIds,
        schedule,
        status,
        auto_publish: autoPublish,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新定时任务失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新定时任务失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

// 删除定时任务
export async function DELETE(request: NextRequest) {
  try {
    const { data: session } = await supabaseAdmin.auth.getSession();
    const user = session?.session?.user;

    if (!user) {
      return NextResponse.json({ error: '未授權' }, { status: 401 });
    }

    // 检查管理员权限
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '無權訪問' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少任務ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('auto_publish_tasks')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('删除定时任务失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除定时任务失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
