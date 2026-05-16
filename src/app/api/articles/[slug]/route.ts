/**
 * @fileoverview 文章详情 API
 * @description 提供文章的查询、更新和删除接口，支持本地 mock 模式
 * @module app/api/articles/[slug]/route
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

function getMockArticles() {
  return (globalThis as Record<string, unknown>).mockArticles as Record<string, unknown>[];
}

function setMockArticles(articles: Record<string, unknown>[]) {
  (globalThis as Record<string, unknown>).mockArticles = articles;
}

/**
 * 获取文章详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    try {
      const client = getSupabaseClient();
      let query = client.from('articles').select('*');
      const isNumericId = /^\d+$/.test(slug);
      if (isNumericId) {
        query = query.eq('id', parseInt(slug));
      } else {
        query = query.eq('slug', slug);
      }
      const { data: article, error } = await query.single();
      if (!error && article) {
        // 更新阅读量（仅前台访问时）
        const referer = request.headers.get('referer') || '';
        if (!referer.includes('/admin')) {
          await client.from('articles').update({ views: (article as Record<string, unknown>).views + 1 }).eq('id', (article as Record<string, unknown>).id);
        }
        return NextResponse.json({ data: article });
      }
    } catch {
      // 数据库不可用，使用 mock
    }

    // Mock fallback
    const articles = getMockArticles();
    const isNumericId = /^\d+$/.test(slug);
    const article = articles.find((a: Record<string, unknown>) =>
      isNumericId ? a.id === parseInt(slug) : a.slug === slug
    );

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 获取相关文章
    const relatedArticles = articles
      .filter((a: Record<string, unknown>) => a.id !== article.id && a.category === article.category && a.status === true)
      .slice(0, 4);

    return NextResponse.json({
      data: {
        ...article,
        views: ((article.views as number) || 0) + 1,
        relatedArticles,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: '獲取文章失敗' }, { status: 500 });
  }
}

/**
 * 更新文章
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const body = await request.json();
    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的文章ID' }, { status: 400 });
    }

    try {
      const client = getSupabaseClient();
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) updateData.title = body.title;
      if (body.slug !== undefined) updateData.slug = body.slug;
      if (body.summary !== undefined) updateData.summary = body.summary;
      if (body.content !== undefined) updateData.content = body.content;
      if (body.cover !== undefined) updateData.cover = body.cover;
      if (body.category_id !== undefined) updateData.category_id = body.category_id;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.is_featured !== undefined) updateData.is_featured = body.is_featured;
      if (body.sort !== undefined) updateData.sort = body.sort;

      const { data, error } = await client.from('articles').update(updateData).eq('id', id).select().single();
      if (!error && data) {
        return NextResponse.json({ data, message: '文章更新成功' });
      }
    } catch {
      // 数据库不可用，使用 mock
    }

    // Mock fallback
    const articles = getMockArticles();
    const index = articles.findIndex((a: Record<string, unknown>) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    const article = articles[index];
    articles[index] = {
      ...article,
      ...(body.title !== undefined && { title: body.title }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.summary !== undefined && { summary: body.summary }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.cover !== undefined && { cover: body.cover }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.is_featured !== undefined && { is_featured: body.is_featured }),
      updated_at: new Date().toISOString(),
    };
    setMockArticles(articles);

    return NextResponse.json({ data: articles[index], message: '文章更新成功（本地模式）' });
  } catch (error) {
    return NextResponse.json({ error: '更新文章失敗' }, { status: 500 });
  }
}

/**
 * 删除文章
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const isNumericId = /^\d+$/.test(slug);
    const id = isNumericId ? parseInt(slug) : null;

    if (!id) {
      return NextResponse.json({ error: '無效的文章ID' }, { status: 400 });
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client.from('articles').delete().eq('id', id);
      if (!error) {
        return NextResponse.json({ message: '文章刪除成功' });
      }
    } catch {
      // 数据库不可用，使用 mock
    }

    // Mock fallback
    const articles = getMockArticles();
    const index = articles.findIndex((a: Record<string, unknown>) => a.id === id);
    if (index === -1) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    articles.splice(index, 1);
    setMockArticles(articles);

    return NextResponse.json({ message: '文章刪除成功（本地模式）' });
  } catch (error) {
    return NextResponse.json({ error: '刪除文章失敗' }, { status: 500 });
  }
}
