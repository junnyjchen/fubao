/**
 * @fileoverview 文件访问 API - 动态路径模式
 * @description 处理 /api/file/{key} 格式的文件访问请求
 * 前端使用 /api/file/goods/xxx.png 格式引用上传的图片
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const { key: keyParts } = await params;
    if (!keyParts || keyParts.length === 0) {
      return NextResponse.json({ error: '缺少文件路径' }, { status: 400 });
    }

    const key = keyParts.join('/');

    // 本地文件路径（uploads 目录）
    // 优先使用 COZE_WORKSPACE_PATH，fallback 到 process.cwd()
    const basePath = process.env.COZE_WORKSPACE_PATH || process.cwd();
    const safeKey = key.replace(/\.\./g, '').replace(/\/\//g, '/');
    const filePath = path.join(basePath, 'public', 'uploads', safeKey);

    try {
      const fileBuffer = await readFile(filePath);

      // 根据扩展名设置 Content-Type
      const ext = key.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'pdf': 'application/pdf',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
      };

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeTypes[ext || ''] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }
  } catch (error) {
    console.error('[File API] 获取文件失败:', error);
    return NextResponse.json({ error: '獲取文件失敗' }, { status: 500 });
  }
}
