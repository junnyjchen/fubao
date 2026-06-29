/**
 * AI 训练中心 - 知识库列表 & 创建
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, count, insert } from '@/lib/db';

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

    if (category) {
      where += ` AND category = ?`;
      params.push(category);
    }
    if (status) {
      where += ` AND status = ?`;
      params.push(status);
    }
    if (keyword) {
      where += ` AND (title LIKE ? OR content LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    const total = await count('ai_knowledge', where, params);
    const list = await query(
      `SELECT * FROM ai_knowledge WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return NextResponse.json({
      success: true,
      data: {
        list: (list as any[] || []).map(item => ({
          ...item,
          tags: typeof item.tags === 'string' ? JSON.parse(item.tags || '[]') : (item.tags || []),
        })),
        total,
        page,
        page_size: pageSize,
      }
    });
  } catch (error) {
    console.error('獲取知識庫列表失敗:', error);
    return NextResponse.json({ success: true, data: { list: [], total: 0, page: 1, page_size: 10 } });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, source_type, source_url, tags, status } = body;

    if (!title || !content) {
      return NextResponse.json({ success: false, error: '標題和內容不能為空' }, { status: 400 });
    }

    const id = await insert('ai_knowledge', {
      title,
      content,
      category: category || 'general',
      source_type: source_type || 'manual',
      source_url: source_url || '',
      tags: JSON.stringify(tags || []),
      status: status || 'active',
    });

    if (!id || id === 0) {
      return NextResponse.json({ success: false, error: '創建失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '創建成功', data: { id } });
  } catch (error) {
    console.error('創建知識庫失敗:', error);
    const msg = error instanceof Error ? error.message : '創建失敗';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
