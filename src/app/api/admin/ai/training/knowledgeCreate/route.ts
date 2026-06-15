/**
 * AI 训练中心 - 知识库创建
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
