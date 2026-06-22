/**
 * API 响应工具函数
 * 用于前端统一处理 API 响应格式
 */

/**
 * 检查 API 响应是否成功
 * 兼容多种响应格式：
 * - { success: true, data } — 标准
 * - { data, message } — 无 success 字段但有 data
 * - { error } — 错误响应
 */
export function isApiSuccess(data: any): boolean {
  // 显式失败
  if (data?.success === false) return false;
  if (data?.error) return false;
  // 显式成功
  if (data?.success === true) return true;
  // 隐式成功（有 data 或 message 字段但无 error）
  if (data?.data !== undefined) return true;
  if (data?.message && !data?.error) return true;
  // 兜底
  return true;
}

/**
 * 从 API 响应中提取数据
 * 兼容多种包裹格式
 */
export function extractData<T = any>(data: any): T {
  if (data?.data !== undefined) return data.data as T;
  return data as T;
}
