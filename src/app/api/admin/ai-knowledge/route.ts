/**
 * @fileoverview AI 知识库 API
 * GET    /api/admin/ai-knowledge        - 获取所有文档
 * POST   /api/admin/ai-knowledge        - 上传文档
 * DELETE /api/admin/ai-knowledge?id=xxx  - 删除文档
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, insert, remove, queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // 获取单个文档内容
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
    }

    // 获取所有文档列表
    const rows = await query('SELECT id, title, category, tags, file_type, file_size, chunk_count, created_at, updated_at FROM ai_knowledge ORDER BY created_at DESC');
    const documents = (rows as any[]).map(row => ({
      id: String(row.id),
      title: row.title || '',
      category: row.category || '',
      tags: row.tags || '[]',
      fileType: row.file_type || '',
      fileSize: row.file_size || 0,
      chunkCount: row.chunk_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const category = formData.get('category') as string || '通用';

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());
    const content = buffer.toString('utf-8');

    // 支持的文件类型
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const supportedTypes = ['txt', 'md', 'json', 'csv', 'html', 'xml', 'yaml', 'yml'];
    if (!supportedTypes.includes(ext)) {
      return NextResponse.json({
        error: `不支持的文件类型 .${ext}，支持: ${supportedTypes.join(', ')}`
      }, { status: 400 });
    }

    // 分块存储（用于知识检索）
    const chunks = splitIntoChunks(content, 500);

    const result = await insert('ai_knowledge', {
      title: title || file.name,
      content,
      category,
      tags: JSON.stringify([]),
      file_type: ext,
      file_size: buffer.length,
      chunk_count: chunks.length,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: String(result),
        title: title || file.name,
        category,
        fileType: ext,
        fileSize: buffer.length,
        chunkCount: chunks.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: '缺少文档 ID' }, { status: 400 });
    }

    await remove('ai_knowledge', { id: Number(id) });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * 将文本按字符数分块
 */
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}
