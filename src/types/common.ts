/**
 * @fileoverview 通用类型定义
 * @description 项目中使用的通用类型
 */

/**
 * 数据库记录通用类型
 * 用于动态构建的更新数据对象
 */
export type DbRecord = Record<string, unknown>;

/**
 * JSON 值类型
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

/**
 * 数据库查询结果类型
 */
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * API 错误响应
 */
export interface ApiError {
  error: string;
  details?: unknown;
}

/**
 * 文件上传结果
 */
export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}
