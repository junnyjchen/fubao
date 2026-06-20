/**
 * @fileoverview 文件上传 API
 * @description 处理图片文件上传，存储到本地 public/uploads 目录
 * @module app/api/upload/route
 */

import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

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

/** 上传目录 */
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

/**
 * 上传图片
 * @param request - 请求对象
 * @returns 上传结果
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'images';

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

    // 确保上传目录存在
    const targetDir = path.join(UPLOAD_DIR, folder);
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}_${randomStr}.${ext}`;

    // 写入文件
    const arrayBuffer = await file.arrayBuffer();
    const filePath = path.join(targetDir, fileName);
    await writeFile(filePath, Buffer.from(arrayBuffer));

    // 生成访问URL
    const url = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      message: '上傳成功',
      data: {
        key: `${folder}/${fileName}`,
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

    // 安全检查：防止路径穿越
    const safeKey = key.replace(/\.\./g, '').replace(/\/\//g, '/');
    const filePath = path.join(UPLOAD_DIR, safeKey);

    if (existsSync(filePath)) {
      await unlink(filePath);
    }

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

    if (!key) {
      return NextResponse.json({ error: '缺少文件key' }, { status: 400 });
    }

    // 安全检查：防止路径穿越
    const safeKey = key.replace(/\.\./g, '').replace(/\/\//g, '/');
    const filePath = path.join(UPLOAD_DIR, safeKey);

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const url = `/uploads/${safeKey}`;

    return NextResponse.json({ data: { key: safeKey, url } });
  } catch (error) {
    console.error('获取文件URL失败:', error);
    return NextResponse.json(
      { error: '獲取文件URL失敗' },
      { status: 500 }
    );
  }
}
