import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();
    
    // 先尝试通过 slug 查找
    let query = client
      .from('articles')
      .select('*')
      .eq('status', true);

    // 判断是否为数字 ID
    const isNumericId = /^\d+$/.test(slug);
    
    if (isNumericId) {
      query = query.eq('id', parseInt(slug));
    } else {
      query = query.eq('slug', slug);
    }

    const { data: article, error } = await query.single();

    if (error || !article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 更新阅读量
    await client
      .from('articles')
      .update({ views: article.views + 1 })
      .eq('id', article.id);

    // 获取相关文章
    const { data: relatedArticles } = await client
      .from('articles')
      .select('id, title, slug, cover, summary, views')
      .eq('status', true)
      .eq('category_id', article.category_id)
      .neq('id', article.id)
      .limit(4);

    return NextResponse.json({
      data: {
        ...article,
        relatedArticles: relatedArticles || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}
