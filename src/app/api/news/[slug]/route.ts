/**
 * @fileoverview 新闻详情 API - MySQL 实现
 * @module app/api/news/[slug]/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query, update as dbUpdate, remove as dbRemove } from '@/lib/db';

/**
 * GET - 获取新闻详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isNumericId = /^\d+$/.test(slug);

    const newsItem = isNumericId
      ? await queryOne('SELECT * FROM news WHERE id = ?', [parseInt(slug)])
      : await queryOne('SELECT * FROM news WHERE slug = ?', [slug]);

    if (!newsItem) {
      return NextResponse.json({ error: '新聞不存在' }, { status: 404 });
    }

    // 更新阅读量
    await dbUpdate('news', { view_count: ((newsItem.view_count as number) || 0) + 1 }, { id: newsItem.id });

    // 获取相关新闻
    const relatedNews = newsItem.category
      ? await query(
          'SELECT id, title, slug, summary, cover_image, category, published_at FROM news WHERE category = ? AND id != ? AND status = 1 LIMIT 4',
          [newsItem.category, newsItem.id]
        )
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...newsItem,
        view_count: ((newsItem.view_count as number) || 0) + 1,
        relatedNews,
      },
    });
  } catch (error) {
    console.error('获取新闻详情失败:', error);
    return NextResponse.json({ error: '獲取新聞失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新新闻
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const isNumericId = /^\d+$/.test(slug);

    const newsItem = isNumericId
      ? await queryOne('SELECT id FROM news WHERE id = ?', [parseInt(slug)])
      : await queryOne('SELECT id FROM news WHERE slug = ?', [slug]);

    if (!newsItem) {
      return NextResponse.json({ error: '新聞不存在' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.tags !== undefined) updateData.tags = JSON.stringify(body.tags);
    if (body.status !== undefined) updateData.status = body.status;

    await dbUpdate('news', updateData, { id: newsItem.id });

    return NextResponse.json({ success: true, message: '新聞更新成功' });
  } catch (error) {
    console.error('更新新闻失败:', error);
    return NextResponse.json({ error: '更新新聞失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除新闻
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isNumericId = /^\d+$/.test(slug);

    if (isNumericId) {
      await dbRemove('news', { id: parseInt(slug) });
    } else {
      const newsItem = await queryOne('SELECT id FROM news WHERE slug = ?', [slug]);
      if (newsItem) {
        await dbRemove('news', { id: newsItem.id });
      }
    }

    return NextResponse.json({ success: true, message: '新聞刪除成功' });
  } catch (error) {
    console.error('删除新闻失败:', error);
    return NextResponse.json({ error: '刪除新聞失敗' }, { status: 500 });
  }
}
