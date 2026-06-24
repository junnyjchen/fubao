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

/**
 * 确保 API 返回的数据是数组
 * 防止 .map() 调用非数组数据导致崩溃
 * 
 * @example
 * const items = ensureArray(response.data);
 * items.map(item => ...); // 安全
 */
export function ensureArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  // 如果是 { success: true, data: [...] } 格式，尝试提取内层数组
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data as T[];
    // 如果 data 是对象但不是数组，返回空数组
    if (data.data !== undefined && !Array.isArray(data.data)) return [];
  }
  return [];
}

/**
 * 安全地从 API 响应中提取数组数据
 * 同时处理响应提取和数组类型保护
 * 
 * @example
 * const goods = extractArray<Goods>(response);
 * goods.map(g => ...); // 安全，goods 一定是数组
 */
export function extractArray<T = any>(data: any): T[] {
  const extracted = extractData<T[]>(data);
  return ensureArray<T>(extracted);
}
