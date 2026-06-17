/**
 * @fileoverview 文件访问 API - 通过key获取签名URL并重定向
 * @description 用于富文本中图片的动态URL生成，避免签名URL过期
 * 路由: GET /api/file?key=xxx 或 GET /api/file/folder/timestamp_name.png
 * @module app/api/file/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

/**
 * 通过 key 获取文件签名 URL 并重定向
 * GET /api/file?key=xxx
 * GET /api/file?path=folder/name.png
 */
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key') || request.nextUrl.searchParams.get('path');
    if (!key) {
      return NextResponse.json({ error: '缺少key参数' }, { status: 400 });
    }

    const url = await storage.generatePresignedUrl({
      key,
      expireTime: 3600, // 1小时有效期
    });

    // 302重定向到签名URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('[File API] 获取签名URL失败:', error);
    return NextResponse.json({ error: '获取文件URL失败' }, { status: 500 });
  }
}
