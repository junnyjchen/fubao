/**
 * @fileoverview 知识库文档详情 API
 * GET /api/admin/ai-knowledge/[id] - 获取文档内容
 */

import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeContent } from '@/lib/ai/store';
import { queryOne } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 从数据库读取
    const row = await queryOne('SELECT * FROM ai_knowledge WHERE id = ?', [Number(id)]);
    if (!row) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    const doc = row as any;
    return NextResponse.json({
      id: String(doc.id),
      title: doc.title || '',
      content: doc.content || '',
      category: doc.category || '',
      tags: doc.tags || '[]',
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
