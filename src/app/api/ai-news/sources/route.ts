import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';

// 获取所有新闻源
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

    // 查询新闻源
    const { data, error } = await supabaseAdmin
      .from('news_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取新闻源失败:', error);
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取新闻源失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// 创建新闻源
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
    const { name, keywords, language, targetLanguage, categoryId, count, enabled } = body;

    const { data, error } = await supabaseAdmin
      .from('news_sources')
      .insert({
        name,
        keywords,
        language: language || 'zh',
        target_language: targetLanguage || 'zh-TW',
        category_id: categoryId,
        count: count || 5,
        enabled: enabled !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('创建新闻源失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建新闻源失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}

// 更新新闻源
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
    const { id, name, keywords, language, targetLanguage, categoryId, count, enabled } = body;

    const { data, error } = await supabaseAdmin
      .from('news_sources')
      .update({
        name,
        keywords,
        language,
        target_language: targetLanguage,
        category_id: categoryId,
        count,
        enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新新闻源失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新新闻源失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
