import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';

// 获取所有AI生成的文章
export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabaseAdmin
      .from('ai_generated_articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('获取文章列表失败:', error);
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// 批量更新文章状态
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
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '缺少文章ID列表' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('ai_generated_articles')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select();

    if (error) {
      console.error('批量更新文章状态失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('批量更新文章状态失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

// 批量删除文章
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
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: '缺少文章ID' }, { status: 400 });
    }

    const idArray = ids.split(',').map(id => parseInt(id));

    const { error } = await supabaseAdmin
      .from('ai_generated_articles')
      .delete()
      .in('id', idArray);

    if (error) {
      console.error('删除文章失败:', error);
      return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '刪除失敗' }, { status: 500 });
  }
}
