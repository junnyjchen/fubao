/**
 * @fileoverview 统一 API 响应工具
 * @description 确保所有 API 返回格式一致：{ success: true/false, data?, message?, error? }
 */

import { NextResponse } from 'next/server';

/** 成功响应 - 有数据 */
export function successResponse<T>(data: T, message?: string, status = 200) {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status }
  );
}

/** 成功响应 - 列表（带分页） */
export function listResponse<T>(
  data: T[],
  options: {
    total: number;
    page: number;
    pageSize?: number;
    limit?: number;
    page_size?: number;
    [key: string]: unknown;
  }
) {
  const pageSize = options.pageSize || options.limit || options.page_size || 20;
  const total_pages = Math.ceil(options.total / pageSize);
  return NextResponse.json({
    success: true,
    data,
    total: options.total,
    page: options.page,
    pageSize,
    total_pages,
    ...Object.fromEntries(
      Object.entries(options).filter(
        ([k]) => !['total', 'page', 'pageSize', 'limit', 'page_size'].includes(k)
      )
    ),
  });
}

/** 成功响应 - 仅消息（写操作） */
export function messageResponse(message: string, status = 200) {
  return NextResponse.json({ success: true, message }, { status });
}

/** 错误响应 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}
