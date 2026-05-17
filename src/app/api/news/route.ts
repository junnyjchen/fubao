/**
 * @fileoverview 新闻资讯 API
 * @description 新闻的增删改查 - MySQL 实现
 * @module app/api/news/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count, insert as dbInsert, update as dbUpdate, remove as dbRemove } from '@/lib/db';

/**
 * GET - 获取新闻列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const includeAll = searchParams.get('includeAll') === 'true';
    const category = searchParams.get('category');

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (!includeAll) {
      conditions.push('status = 1');
    }
    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = await count('news', conditions.length > 0 ? conditions.join(' AND ') : '1=1', params);

    const data = await query(
      `SELECT * FROM news ${whereClause} ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('获取新闻失败:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, limit: 20, total_pages: 0 });
  }
}

/**
 * POST - 创建新闻
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, summary, cover_image, category, author, source, tags, status } = body;

    if (!title) {
      return NextResponse.json({ error: '標題不能為空' }, { status: 400 });
    }

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const id = await dbInsert('news', {
      title,
      slug,
      content: content || null,
      summary: summary || null,
      cover_image: cover_image || null,
      category: category || null,
      author: author || null,
      source: source || null,
      tags: tags ? JSON.stringify(tags) : null,
      status: status || 1,
      published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ data: { id, slug }, message: '新聞創建成功' });
  } catch (error) {
    console.error('创建新闻失败:', error);
    return NextResponse.json({ error: '創建新聞失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新新闻
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, summary, cover_image, category, author, source, tags, status } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少新聞ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (category !== undefined) updateData.category = category;
    if (author !== undefined) updateData.author = author;
    if (source !== undefined) updateData.source = source;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (status !== undefined) updateData.status = status;

    await dbUpdate('news', updateData, { id });

    return NextResponse.json({ message: '新聞更新成功' });
  } catch (error) {
    console.error('更新新闻失败:', error);
    return NextResponse.json({ error: '更新新聞失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除新闻
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少新聞ID' }, { status: 400 });
    }

    await dbRemove('news', { id: parseInt(id) });

    return NextResponse.json({ message: '新聞刪除成功' });
  } catch (error) {
    console.error('删除新闻失败:', error);
    return NextResponse.json({ error: '刪除新聞失敗' }, { status: 500 });
  }
}
