/**
 * API 配置
 * 
 * 用于配置前端 API 请求的目标地址
 * 
 * 使用方式：
 * 1. 本地开发模式：使用 Next.js API Routes
 * 2. 远程 PHP 模式：使用独立的 PHP 后端服务
 */

export const API_CONFIG = {
  // API 模式: 'local' | 'remote'
  mode: process.env.NEXT_PUBLIC_API_MODE || 'local',
  
  // 远程 PHP API 地址
  // 在 .env.local 中设置: NEXT_PUBLIC_API_URL=https://api.your-domain.com
  remoteUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  
  // API 前缀
  localPrefix: '/api',
  remotePrefix: '/api',
  
  // 超时时间（毫秒）
  timeout: 30000,
  
  // 重试次数
  retries: 1,
}

/**
 * 获取完整的 API 地址
 */
export function getApiUrl(path: string): string {
  if (API_CONFIG.mode === 'remote') {
    // 远程模式：直接请求 PHP 后端
    // path 格式: /api/auth/login -> {remoteUrl}/api/auth/login
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${API_CONFIG.remoteUrl}${cleanPath}`
  }
  
  // 本地模式：通过 Next.js API Routes
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_CONFIG.localPrefix}${cleanPath}`
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
