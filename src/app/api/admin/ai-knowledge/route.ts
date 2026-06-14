/**
 * @fileoverview AI 知识库 API
 * GET    /api/admin/ai-knowledge        - 获取所有文档
 * POST   /api/admin/ai-knowledge        - 上传文档
 * DELETE /api/admin/ai-knowledge?id=xxx  - 删除文档
 * GET    /api/admin/ai-knowledge/[id]   - 获取文档内容
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadKnowledge, saveKnowledge, type KnowledgeDocument } from '@/lib/ai/store';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'data', 'knowledge');

// 确保上传目录存在
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // 获取单个文档内容
      const docs = loadKnowledge();
      const doc = docs.find(d => d.id === id);
      if (!doc) {
        return NextResponse.json({ error: '文档不存在' }, { status: 404 });
      }
      // 读取文件内容
      const filePath = join(UPLOAD_DIR, doc.fileName);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath, 'utf-8');
        return NextResponse.json({ ...doc, content });
      }
      return NextResponse.json({ ...doc, content: '' });
    }

    const docs = loadKnowledge();
    return NextResponse.json({ documents: docs });
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

    const now = new Date().toISOString();
    const docId = `doc-${Date.now()}`;
    const fileName = `${docId}.${ext}`;

    // 保存文件
    writeFileSync(join(UPLOAD_DIR, fileName), buffer);

    // 分块存储（用于知识检索）
    const chunks = splitIntoChunks(content, 500);

    const doc: KnowledgeDocument = {
      id: docId,
      title: title || file.name,
      content,
      fileName,
      originalName: file.name,
      fileType: ext,
      fileSize: buffer.length,
      category,
      size: buffer.length,
      chunks,
      chunkCount: chunks.length,
      tags: [],
      createdAt: now,
      updatedAt: now,
    };

    const docs = loadKnowledge();
    docs.push(doc);
    saveKnowledge(docs);

    return NextResponse.json({ success: true, document: { ...doc, content: undefined } });
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

    const docs = loadKnowledge();
    const doc = docs.find(d => d.id === id);
    if (!doc) {
      return NextResponse.json({ error: '文档不存在' }, { status: 404 });
    }

    // 删除文件
    const filePath = join(UPLOAD_DIR, doc.fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    const filtered = docs.filter(d => d.id !== id);
    saveKnowledge(filtered);

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
