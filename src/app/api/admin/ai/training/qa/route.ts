/**
 * AI 训练中心 - 问答对列表
 */
import { NextRequest, NextResponse } from 'next/server';
import { query, count } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const category = searchParams.get('category') || '';
    const knowledgeId = searchParams.get('knowledge_id') || '';

    let where = '1=1';
    const params: any[] = [];

    if (category) {
      where += ` AND category = ?`;
      params.push(category);
    }
    if (knowledgeId) {
      where += ` AND knowledge_id = ?`;
      params.push(parseInt(knowledgeId));
    }

    const total = await count('ai_qa', where, params);
    const list = await query(
      `SELECT * FROM ai_qa WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, pageSize, (page - 1) * pageSize]
    );

    return NextResponse.json({
      success: true,
      data: {
        list: list || [],
        total,
        page,
        page_size: pageSize,
      }
    });
  } catch (error) {
    console.error('获取问答对列表失败:', error);
    return NextResponse.json({ success: true, data: { list: [], total: 0, page: 1, page_size: 10 } });
  }
}
