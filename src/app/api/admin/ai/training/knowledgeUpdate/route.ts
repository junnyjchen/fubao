/**
 * AI 训练中心 - 知识库更新
 */
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, category, source_type, source_url, tags, status } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少id参数' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (source_type !== undefined) { updates.push('source_type = ?'); params.push(source_type); }
    if (source_url !== undefined) { updates.push('source_url = ?'); params.push(source_url); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(JSON.stringify(tags)); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    params.push(id);
    await query(`UPDATE ai_knowledge SET ${updates.join(', ')} WHERE id = ?`, params);

    return NextResponse.json({ success: true, message: '更新成功' });
  } catch (error) {
    console.error('更新知识库失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
