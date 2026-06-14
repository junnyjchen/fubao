/**
 * @fileoverview 知识库文档详情 API
 * GET /api/admin/ai-knowledge/[id] - 获取文档内容
 */

import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeDocs } from '@/lib/ai/store';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'data', 'knowledge');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const docs = getKnowledgeDocs();
    const doc = docs.find(d => d.id === id);
    if (!doc) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    const filePath = join(UPLOAD_DIR, doc.fileName);
    const content = existsSync(filePath) ? readFileSync(filePath, 'utf-8') : '';

    return NextResponse.json({ ...doc, content });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
