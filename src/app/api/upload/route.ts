/**
 * @fileoverview 文件上传 API
 * @description 处理图片文件上传，返回存储URL
 * @module app/api/upload/route
 */

import { NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

/** 初始化对象存储客户端 */
const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: '',
  secretKey: '',
  bucketName: process.env.COZE_BUCKET_NAME,
  region: 'cn-beijing',
});

/** 支持的图片类型 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/** 最大文件大小 (5MB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * 上传图片
 * @param request - 请求对象
 * @returns 上传结果
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string || 'images';

    if (!file) {
      return NextResponse.json({ error: '請選擇文件' }, { status: 400 });
    }

    // 验证文件类型
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件類型，僅支持 JPG、PNG、GIF、WebP、SVG' },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件大小不能超過 5MB' },
        { status: 400 }
      );
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(arrayBuffer);

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${timestamp}_${randomStr}.${ext}`;

    // 上传文件
    const fileKey = await storage.uploadFile({
      fileContent,
      fileName,
      contentType: file.type,
    });

    // 生成访问URL (有效期7天)
    const url = await storage.generatePresignedUrl({
      key: fileKey,
      expireTime: 7 * 24 * 60 * 60, // 7天
    });

    return NextResponse.json({
      message: '上傳成功',
      data: {
        key: fileKey,
        url,
        name: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      { error: '上傳失敗，請重試' },
      { status: 500 }
    );
  }
}

/**
 * 删除文件
 * @param request - 请求对象
 * @returns 删除结果
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: '缺少文件key' }, { status: 400 });
    }

    await storage.deleteFile({ fileKey: key });

    return NextResponse.json({ message: '刪除成功' });
  } catch (error) {
    console.error('删除文件失败:', error);
    return NextResponse.json(
      { error: '刪除失敗' },
      { status: 500 }
    );
  }
}

/**
 * 获取文件访问URL
 * @param request - 请求对象
 * @returns 文件URL
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const expireTime = parseInt(searchParams.get('expireTime') || '86400');

    if (!key) {
      return NextResponse.json({ error: '缺少文件key' }, { status: 400 });
    }

    // 检查文件是否存在
    const exists = await storage.fileExists({ fileKey: key });
    if (!exists) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    // 生成访问URL
    const url = await storage.generatePresignedUrl({
      key,
      expireTime,
    });

    return NextResponse.json({ data: { key, url } });
  } catch (error) {
    console.error('获取文件URL失败:', error);
    return NextResponse.json(
      { error: '獲取文件URL失敗' },
      { status: 500 }
    );
  }
}
