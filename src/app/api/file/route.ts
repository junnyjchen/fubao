/**
 * @fileoverview 文件访问 API - 提供本地文件访问
 * @description 用于富文本中图片的动态URL生成
 * 路由: GET /api/file?key=xxx 或 GET /api/file?path=folder/name.png
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 通过 key/path 获取文件并返回
 * GET /api/file?key=xxx
 * GET /api/file?path=folder/name.png
 */
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key') || request.nextUrl.searchParams.get('path');
    if (!key) {
      return NextResponse.json({ error: '缺少key参数' }, { status: 400 });
    }

    // 本地文件路径（uploads 目录）
    const filePath = `/workspace/projects/public/uploads/${key.replace(/^\/+/, '')}`;

    // 尝试读取文件
    try {
      const fs = await import('fs/promises');
      const fileBuffer = await fs.readFile(filePath);
      
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
      // 文件不存在，返回 404
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }
  } catch (error) {
    console.error('[File API] 获取文件失败:', error);
    return NextResponse.json({ error: '获取文件失败' }, { status: 500 });
  }
}
