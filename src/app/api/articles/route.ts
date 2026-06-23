/**
 * @fileoverview 文章API
 * @description 文章的增删改查 - MySQL 实现
 * @module app/api/articles/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, count, insert as dbInsert, update as dbUpdate, remove as dbRemove } from '@/lib/db';

/**
 * GET - 获取文章列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const conditions: string[] = ['status = 1'];
    const params: unknown[] = [];

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (keyword) {
      conditions.push('(title LIKE ? OR content LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const whereClause = conditions.join(' AND ');
    const total = await count('articles', whereClause, params);

    // published_at 列可能不存在（旧 schema），检测后决定字段
    let hasPublishedAt = false;
    try {
      const cols = await query("SHOW COLUMNS FROM articles LIKE 'published_at'");
      hasPublishedAt = Array.isArray(cols) && cols.length > 0;
    } catch { /* ignore */ }
    const publishedSelect = hasPublishedAt ? 'COALESCE(published_at, created_at) as published_at,' : '';

    const data = await query(
      `SELECT id, title, slug, summary, cover_image, category, author, tags, view_count, like_count, ${publishedSelect} created_at FROM articles WHERE ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return NextResponse.json({ success: true, data, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } });
  }
}

/**
 * POST - 创建文章
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, summary, cover_image, category, author, tags, status } = body;

    if (!title) {
      return NextResponse.json({ error: '標題不能為空' }, { status: 400 });
    }

    // 生成 slug
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const id = await dbInsert('articles', {
      title,
      slug,
      content: content || null,
      summary: summary || null,
      cover_image: cover_image || null,
      category: category || null,
      author: author || null,
      tags: tags ? JSON.stringify(tags) : null,
      status: status || 1,
      published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });

    return NextResponse.json({ success: true, data: { id, slug }, message: '文章創建成功' });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json({ error: '創建文章失敗' }, { status: 500 });
  }
}

/**
 * PUT - 更新文章
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, summary, cover_image, category, author, tags, status } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少文章ID' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (cover_image !== undefined) updateData.cover_image = cover_image;
    if (category !== undefined) updateData.category = category;
    if (author !== undefined) updateData.author = author;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (status !== undefined) updateData.status = status;

    await dbUpdate('articles', updateData, { id });

    return NextResponse.json({ success: true, message: '文章更新成功' });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({ error: '更新文章失敗' }, { status: 500 });
  }
}

/**
 * DELETE - 删除文章
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少文章ID' }, { status: 400 });
    }

    await dbRemove('articles', { id: parseInt(id) });

    return NextResponse.json({ success: true, message: '文章刪除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '刪除文章失敗' }, { status: 500 });
  }
}
