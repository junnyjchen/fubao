/**
 * @fileoverview API 响应工具函数
 * @description 统一的 API 响应格式和错误处理
 * @module lib/api-response
 */

import { NextResponse } from 'next/server';

/** API 响应数据结构 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  timestamp?: string;
}

/** 分页参数 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/** 分页响应 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * 成功响应
 * @param data - 响应数据
 * @param message - 成功消息
 * @param status - HTTP 状态码（默认 200）
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * 错误响应
 * @param error - 错误信息或对象
 * @param status - HTTP 状态码（默认 500）
 * @param code - 错误代码
 */
export function errorResponse(
  error: string | Error,
  status: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  const errorMessage = typeof error === 'string' ? error : error.message;

  // 记录错误日志
  if (status >= 500) {
    console.error(`API Error [${status}]:`, errorMessage);
    if (typeof error !== 'string') {
      console.error('Stack trace:', error.stack);
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * 验证错误响应
 * @param message - 错误消息
 * @param fields - 错误字段映射
 */
export function validationErrorResponse(
  message: string,
  fields?: Record<string, string>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      data: { fields },
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

/**
 * 未授权响应
 */
export function unauthorizedResponse(message: string = '未授權'): NextResponse<ApiResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * 禁止访问响应
 */
export function forbiddenResponse(message: string = '禁止訪問'): NextResponse<ApiResponse> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

/**
 * 未找到响应
 */
export function notFoundResponse(message: string = '資源不存在'): NextResponse<ApiResponse> {
  return errorResponse(message, 404, 'NOT_FOUND');
}

/**
 * 分页响应
 * @param data - 数据数组
 * @param page - 当前页码
 * @param limit - 每页数量
 * @param total - 总记录数
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  return successResponse({
    data,
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  });
}

/**
 * 计算分页参数
 * @param searchParams - URL 搜索参数
 * @param defaultLimit - 默认每页数量（默认 20）
 */
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 20
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || `${defaultLimit}`)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * 异步包装器 - 自动捕获异常
 * @param fn - 异步函数
 */
export function withErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<NextResponse<ApiResponse<R>>> {
  return async (...args: T): Promise<NextResponse<ApiResponse<R>>> => {
    try {
      const result = await fn(...args);
      return successResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        // 检查是否是特定的业务错误
        if ((error as any).statusCode) {
          return errorResponse(
            error.message,
            (error as any).statusCode,
            (error as any).code
          );
        }
        return errorResponse(error.message, 500, 'INTERNAL_ERROR');
      }
      return errorResponse('服務器錯誤', 500, 'INTERNAL_ERROR');
    }
  };
}

/**
 * 缓存控制头
 * @param maxAge - 最大缓存时间（秒）
 */
export function getCacheHeaders(maxAge: number = 3600): HeadersInit {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'CDN-Cache-Control': `max-age=${maxAge}`,
  };
}

/**
 * 无缓存头
 */
export function getNoCacheHeaders(): HeadersInit {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };
}
