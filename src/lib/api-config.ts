/**
 * API 配置 - 统一管理前后端 API 路由
 * 
 * 架构说明：
 * - 开发环境：前端 fetch('/api/xxx') → Next.js API Routes（无需 PHP）
 * - 生产环境：Nginx 将 /api/* 路由到 PHP-FPM，Next.js 只负责 SSR
 * 
 * 前端代码统一使用 fetch('/api/xxx')，无需区分环境。
 * 环境切换由 Nginx 配置和 next.config.ts rewrites 处理。
 */

export const API_CONFIG = {
  // API 基础路径（前端统一使用相对路径）
  baseUrl: '/api',

  // API 模式: 'local' | 'remote'
  // local: Next.js API Routes（开发环境默认）
  // remote: PHP API（生产环境由 Nginx 路由，此值仅用于测试）
  mode: (process.env.NEXT_PUBLIC_API_MODE || 'local') as 'local' | 'remote',

  // 远程 PHP API 地址（仅 remote 模式使用）
  remoteUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',

  // 超时时间（毫秒）
  timeout: 30000,

  // 重试次数
  retries: 1,
}

/**
 * 获取完整的 API 地址
 * 
 * 统一返回 /api/xxx 格式：
 * - 开发环境：由 Next.js API Routes 处理
 * - 生产环境：由 Nginx 反向代理到 PHP-FPM
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  if (API_CONFIG.mode === 'remote') {
    return `${API_CONFIG.remoteUrl}${cleanPath}`
  }
  return cleanPath
}

/**
 * 获取当前 API 模式
 */
export function getApiMode(): 'local' | 'remote' {
  return API_CONFIG.mode
}

/**
 * 是否使用远程 API
 */
export function isRemoteApi(): boolean {
  return API_CONFIG.mode === 'remote'
}
