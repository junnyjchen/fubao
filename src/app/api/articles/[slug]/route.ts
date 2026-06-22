/**
 * @fileoverview 文章详情 API - MySQL 实现
 * @module app/api/articles/[slug]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, update as dbUpdate, remove as dbRemove } from '@/lib/db';

/**
 * GET - 获取文章详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isNumericId = /^\d+$/.test(slug);

    const article = isNumericId
      ? await queryOne('SELECT * FROM articles WHERE id = ?', [parseInt(slug)])
      : await queryOne('SELECT * FROM articles WHERE slug = ?', [slug]);

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 更新阅读量（仅前台访问时）
    const referer = request.headers.get('referer') || '';
    if (!referer.includes('/admin')) {
      await dbUpdate('articles', { view_count: ((article.view_count as number) || 0) + 1 }, { id: article.id });
    }

    // 获取相关文章
    const relatedArticles = article.category
      ? await query(
          'SELECT id, title, slug, summary, cover_image, category, published_at FROM articles WHERE category = ? AND id != ? AND status = 1 LIMIT 4',
          [article.category, article.id]
        )
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        view_count: ((article.view_count as number) || 0) + 1,
        relatedArticles,
      },
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json({ error: '獲取文章失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新文章
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const isNumericId = /^\d+$/.test(slug);

    const article = isNumericId
      ? await queryOne('SELECT id FROM articles WHERE id = ?', [parseInt(slug)])
      : await queryOne('SELECT id FROM articles WHERE slug = ?', [slug]);

    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.status !== undefined) updateData.status = body.status;

    await dbUpdate('articles', updateData, { id: article.id });

    return NextResponse.json({ success: true, message: '文章更新成功' });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({ error: '更新文章失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除文章
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isNumericId = /^\d+$/.test(slug);

    if (isNumericId) {
      await dbRemove('articles', { id: parseInt(slug) });
    } else {
      // Need to find by slug first
      const article = await queryOne('SELECT id FROM articles WHERE slug = ?', [slug]);
      if (article) {
        await dbRemove('articles', { id: article.id });
      }
    }

    return NextResponse.json({ success: true, message: '文章刪除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '刪除文章失敗' }, { status: 500 });
  }
}
