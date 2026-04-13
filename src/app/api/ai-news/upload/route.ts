import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-server';

// 上传图片到AI新闻文章
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const articleId = formData.get('articleId') as string;

    if (!file) {
      return NextResponse.json({ error: '請上傳圖片' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支援的圖片格式' }, { status: 400 });
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '圖片大小不能超過 5MB' }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `ai-news/${articleId || 'temp'}/${timestamp}-${randomStr}.${ext}`;

    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到 Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('public')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('上傳圖片失敗:', error);
      return NextResponse.json({ error: '上傳失敗' }, { status: 500 });
    }

    // 获取公开URL
    const { data: urlData } = supabaseAdmin.storage
      .from('public')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error('上傳圖片失敗:', error);
    return NextResponse.json({ error: '上傳失敗' }, { status: 500 });
  }
}
