/**
 * @fileoverview 新闻详情 API
 * @description 提供新闻的查询、更新和删除接口
 * @module app/api/news/[slug]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// Mock 数据
const mockNews: Record<string, any> = {
  '1': {
    id: 1,
    title: '符寶網正式上線，開啟玄門文化新時代',
    slug: 'fubao-launch',
    content: `<h2>符寶網正式上線</h2>
<p>符寶網作為全球首個專注於玄門文化的電商平台，正式宣佈上線運營。我們致力於弘揚中華傳統文化，讓更多人了解和體驗道教的精髓。</p>
<h3>平台特色</h3>
<ul>
<li><strong>正品保障</strong>：所有商品均經過正規渠道，品質保證</li>
<li><strong>文化傳承</strong>：弘揚道教文化，傳承千年智慧</li>
<li><strong>專業服務</strong>：提供專業的諮詢和售後服務</li>
</ul>
<h3>未來展望</h3>
<p>我們將持續優化平台功能，引入更多優質商品和服務，為用戶提供更好的體驗。</p>`,
    summary: '符寶網作為全球首個專注於玄門文化的電商平台，正式宣佈上線運營...',
    cover_image: 'https://picsum.photos/400/300?random=10',
    type: 1,
    views: 1256,
    published_at: new Date().toISOString(),
    category: { id: 1, name: '平台公告' },
  },
  '2': {
    id: 2,
    title: '道教文化走進現代生活',
    slug: 'taoism-modern-life',
    content: `<h2>道教文化與現代生活</h2>
<p>傳統道教文化如何與現代生活相結合？專家學者進行了深入探討。</p>
<h3>道家思想的核心</h3>
<p>道家思想強調「道法自然」，提倡人與自然和諧相處。這一理念在現代社會依然具有重要的指導意義。</p>
<h3>實踐應用</h3>
<ul>
<li>冥想與養生</li>
<li>風水與環境</li>
<li>中醫與草藥</li>
</ul>`,
    summary: '傳統道教文化如何與現代生活相結合，專家學者進行深入探討...',
    cover_image: 'https://picsum.photos/400/300?random=11',
    type: 2,
    views: 890,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    category: { id: 2, name: '行業資訊' },
  },
  '3': {
    id: 3,
    title: '符籙使用注意事項',
    slug: 'fuji-usage-tips',
    content: `<h2>符籙使用須知</h2>
<p>在使用符籙時，需要注意以下幾點：</p>
<h3>心誠則靈</h3>
<p>使用符籙時，心態必須端正，不可心存邪念。</p>
<h3>正確保存</h3>
<ul>
<li>避免受潮</li>
<li>避免陽光直射</li>
<li>放置於清潔處</li>
</ul>`,
    summary: '符籙使用時需要注意的事項，讓您更好地發揮符籙的效果...',
    cover_image: 'https://picsum.photos/400/300?random=12',
    type: 3,
    views: 567,
    published_at: new Date(Date.now() - 172800000).toISOString(),
    category: { id: 3, name: '活動資訊' },
  },
  '4': {
    id: 4,
    title: '新年祈福法會圓滿成功',
    slug: 'new-year-blessing',
    content: `<h2>新年祈福法會</h2>
<p>由符寶網舉辦的新年祈福法會已圓滿成功舉行，吸引了來自各地的善信參與。</p>
<h3>法會內容</h3>
<ul>
<li>祈福法事</li>
<li>送太歲</li>
<li>點燈祈福</li>
</ul>`,
    summary: '新年祈福法會圓滿舉辦，為善信祈福納祥...',
    cover_image: 'https://picsum.photos/400/300?random=13',
    type: 4,
    views: 432,
    published_at: new Date(Date.now() - 259200000).toISOString(),
    category: { id: 4, name: '互動活動' },
  },
};

/**
 * 获取新闻详情
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 新闻详情响应
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('news')
      .select('*');

    const isNumericId = /^\d+$/.test(slug);
    
    if (isNumericId) {
      query = query.eq('id', parseInt(slug));
    } else {
      query = query.eq('slug', slug);
    }

    const result = await query.maybeSingle();
    const { data: newsItem, error } = result || { data: null, error: null };

    if (error || !newsItem) {
      // 尝试返回 mock 数据
      const mockItem = mockNews[slug] || Object.values(mockNews).find((n: any) => n.slug === slug);
      if (mockItem) {
        return NextResponse.json({
          data: {
            ...mockItem,
            relatedNews: Object.values(mockNews).filter((n: any) => n.id !== mockItem.id).slice(0, 4),
          },
        });
      }
      return NextResponse.json({ error: '新聞不存在' }, { status: 404 });
    }

    // 更新阅读量（仅前台访问时）
    const referer = request.headers.get('referer') || '';
    if (!referer.includes('/admin')) {
      await client
        .from('news')
        .update({ views: newsItem.views + 1 })
        .eq('id', newsItem.id);
    }

    // 获取相关新闻
    const { data: relatedNews } = await client
      .from('news')
      .select('id, title, slug, cover_image, summary, type, views')
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
    // 发生错误时返回 mock 数据
    const mockItem = mockNews[slug] || Object.values(mockNews).find((n: any) => n.slug === slug);
    if (mockItem) {
      return NextResponse.json({
        data: {
          ...mockItem,
          relatedNews: Object.values(mockNews).filter((n: any) => n.id !== mockItem.id).slice(0, 4),
        },
      });
    }
    return NextResponse.json(
      { error: '獲取新聞失敗' },
      { status: 500 }
    );
  }
}

/**
 * 更新新闻
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 更新结果
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const client = getSupabaseClient();

    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的新聞ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.cover !== undefined) updateData.cover_image = body.cover;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
    if (body.sort !== undefined) updateData.sort = body.sort;

    const { data, error } = await client
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: '新聞更新成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '更新新聞失敗' },
      { status: 500 }
    );
  }
}

/**
 * 删除新闻
 * @param request - 请求对象
 * @param params - 路由参数
 * @returns 删除结果
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = getSupabaseClient();

    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的新聞ID' }, { status: 400 });
    }

    const { error } = await client
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: '新聞刪除成功' });
  } catch (error) {
    return NextResponse.json(
      { error: '刪除新聞失敗' },
      { status: 500 }
    );
  }
}
