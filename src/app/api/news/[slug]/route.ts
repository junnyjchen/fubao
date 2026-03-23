import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('news')
      .select('*')
      .eq('status', true);

    const isNumericId = /^\d+$/.test(slug);
    
    if (isNumericId) {
      query = query.eq('id', parseInt(slug));
    } else {
      query = query.eq('slug', slug);
    }

    const { data: newsItem, error } = await query.single();

    if (error || !newsItem) {
      return NextResponse.json({ error: '新闻不存在' }, { status: 404 });
    }

    // 更新阅读量
    await client
      .from('news')
      .update({ views: newsItem.views + 1 })
      .eq('id', newsItem.id);

    // 获取相关新闻
    const { data: relatedNews } = await client
      .from('news')
      .select('id, title, slug, cover, summary, type, views')
      .eq('status', true)
      .eq('type', newsItem.type)
      .neq('id', newsItem.id)
      .limit(4);

    return NextResponse.json({
      data: {
        ...newsItem,
        relatedNews: relatedNews || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取新闻失败' },
      { status: 500 }
    );
  }
}
