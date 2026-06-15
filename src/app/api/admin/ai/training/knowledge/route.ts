/**
 * AI 训练中心 - 知识库列表
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const keyword = searchParams.get('keyword') || '';

    let where = '1=1';
    const params: any[] = [];
    let paramIdx = 0;

    if (category) {
      paramIdx++;
      where += ` AND category = ?`;
      params.push(category);
    }
    if (status) {
      paramIdx++;
      where += ` AND status = ?`;
      params.push(status);
    }
    if (keyword) {
      paramIdx++;
      where += ` AND (title LIKE ? OR content LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const total = await count('ai_knowledge', where, params);
    const list = await query(
      `SELECT * FROM ai_knowledge WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return NextResponse.json({
      list: list || [],
      total,
      page,
      page_size: pageSize,
    });
  } catch (error) {
    console.error('获取知识库列表失败:', error);
    return NextResponse.json({ list: [], total: 0, page: 1, page_size: 10 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, source_type, source_url, tags, status } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await query(
      `INSERT INTO ai_knowledge (title, content, category, source_type, source_url, tags, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, content, category || 'general', source_type || 'manual', source_url || '', JSON.stringify(tags || []), status || 'active', now, now]
    );

    return NextResponse.json({ success: true, message: '创建成功' });
  } catch (error) {
    console.error('创建知识库失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
