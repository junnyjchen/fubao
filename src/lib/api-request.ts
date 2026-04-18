/**
 * API 请求封装
 * @module lib/api-request
 */

import { getApiUrl } from './api-config';

// 请求选项
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/**
 * 基础请求函数
 */
export async function request<T = any>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, headers = {} } = options;
  
  let url = getApiUrl(path);
  
  // GET 请求添加查询参数
  if (method === 'GET' && params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * API 请求便捷方法
 */
export const api = {
  get: <T = any>(path: string, params?: Record<string, string | number | boolean>) =>
    request<T>('GET', path, { params }),
  
  post: <T = any>(path: string, data?: any) =>
    request<T>('POST', path, { body: data }),
  
  put: <T = any>(path: string, data?: any) =>
    request<T>('PUT', path, { body: data }),
  
  delete: <T = any>(path: string, data?: any) =>
    request<T>('DELETE', path, { body: data }),
};

/**
 * 导出 API 请求方法
 */
export { api as default };
