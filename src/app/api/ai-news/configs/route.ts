import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';

// 获取所有AI配置
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

    // 查询AI配置
    const { data, error } = await supabaseAdmin
      .from('ai_configurations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取AI配置失败:', error);
      return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取AI配置失败:', error);
    return NextResponse.json({ error: '獲取失敗' }, { status: 500 });
  }
}

// 创建AI配置
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
    const { name, provider, modelId, apiKey, baseUrl, enabled, isDefault, settings } = body;

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await supabaseAdmin
        .from('ai_configurations')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabaseAdmin
      .from('ai_configurations')
      .insert({
        name,
        provider,
        model_id: modelId,
        api_key: apiKey,
        base_url: baseUrl,
        enabled: enabled !== false,
        is_default: isDefault || false,
        settings: settings || {},
      })
      .select()
      .single();

    if (error) {
      console.error('创建AI配置失败:', error);
      return NextResponse.json({ error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('创建AI配置失败:', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}

// 更新AI配置
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
    const { id, name, provider, modelId, apiKey, baseUrl, enabled, isDefault, settings } = body;

    // 如果设为默认，先取消其他默认
    if (isDefault) {
      await supabaseAdmin
        .from('ai_configurations')
        .update({ is_default: false })
        .eq('is_default', true);
    }

    const { data, error } = await supabaseAdmin
      .from('ai_configurations')
      .update({
        name,
        provider,
        model_id: modelId,
        api_key: apiKey,
        base_url: baseUrl,
        enabled,
        is_default: isDefault,
        settings: settings || {},
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新AI配置失败:', error);
      return NextResponse.json({ error: '更新失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('更新AI配置失败:', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
