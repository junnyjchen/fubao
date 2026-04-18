import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';

// 获取单个AI生成的文章
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { data, error } = await supabaseAdmin
      .from('ai_generated_articles')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) {
      console.error('获取文章详情失败:', error);
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// 更新AI生成的文章
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { translatedTitle, translatedContent, summary, cover, categoryId, status } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (translatedTitle !== undefined) updateData.translated_title = translatedTitle;
    if (translatedContent !== undefined) updateData.translated_content = translatedContent;
    if (summary !== undefined) updateData.summary = summary;
    if (cover !== undefined) updateData.cover = cover;
    if (categoryId !== undefined) updateData.category_id = categoryId;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabaseAdmin
      .from('ai_generated_articles')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('更新文章失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

// 删除AI生成的文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const { error } = await supabaseAdmin
      .from('ai_generated_articles')
      .delete()
      .eq('id', parseInt(id));

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
