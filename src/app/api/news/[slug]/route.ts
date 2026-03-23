/**
 * @fileoverview 新闻详情 API
 * @description 提供新闻的查询、更新和删除接口
 * @module app/api/news/[slug]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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

    const { data: newsItem, error } = await query.single();

    if (error || !newsItem) {
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
    if (body.cover !== undefined) updateData.cover = body.cover;
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
