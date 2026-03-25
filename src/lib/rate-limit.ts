/**
 * @fileoverview API限流中间件
 * @description 防止API被滥用，实现请求频率限制
 * @module lib/rate-limit
 */

import { NextRequest, NextResponse } from 'next/server';

// 限流配置
interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  message?: string; // 自定义错误消息
  skipFailedRequests?: boolean; // 是否跳过失败请求
  keyGenerator?: (request: NextRequest) => string; // 自定义键生成器
}

// 默认配置
const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1分钟
  maxRequests: 100, // 每分钟100次
  message: '請求過於頻繁，請稍後再試',
  skipFailedRequests: false,
};

// 内存存储（生产环境应使用Redis）
const requestStore = new Map<string, { count: number; resetTime: number }>();

// 清理过期记录
function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime < now) {
      requestStore.delete(key);
    }
  }
}

// 定期清理
setInterval(cleanupExpired, 60 * 1000);

/**
 * 默认键生成器（基于IP）
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `rate_limit_${ip}`;
}

/**
 * 创建限流中间件
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const finalConfig: RateLimitConfig = {
    ...defaultConfig,
    ...config,
  };

  const keyGenerator = finalConfig.keyGenerator || defaultKeyGenerator;

  return async function rateLimiter(
    request: NextRequest,
    next?: () => Promise<NextResponse>
  ): Promise<NextResponse | null> {
    const key = keyGenerator(request);
    const now = Date.now();
    const resetTime = now + finalConfig.windowMs;

    // 获取当前请求记录
    const record = requestStore.get(key);

    if (!record || record.resetTime < now) {
      // 新建或过期重置
      requestStore.set(key, { count: 1, resetTime });
      return null; // 继续处理请求
    }

    // 检查是否超限
    if (record.count >= finalConfig.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: finalConfig.message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(finalConfig.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
          },
        }
      );
    }

    // 增加计数
    record.count++;
    requestStore.set(key, record);

    // 继续处理请求
    return null;
  };
}

/**
 * 预设限流配置
 */
export const rateLimitPresets = {
  // 宽松：每分钟200次
  relaxed: {
    windowMs: 60 * 1000,
    maxRequests: 200,
  },

  // 标准：每分钟100次
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },

  // 严格：每分钟30次
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },

  // 登录：每分钟5次
  login: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: '登錄嘗試次數過多，請稍後再試',
  },

  // 注册：每小时10次
  register: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: '註冊請求過於頻繁，請稍後再試',
  },

  // 上传：每分钟10次
  upload: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: '上傳請求過於頻繁，請稍後再試',
  },

  // 支付：每分钟5次
  payment: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: '支付請求過於頻繁，請稍後再試',
  },

  // 搜索：每分钟30次
  search: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: '搜索請求過於頻繁，請稍後再試',
  },
};

/**
 * 组合多个中间件
 */
export function composeMiddleware(
  ...middlewares: Array<
    (req: NextRequest, next?: () => Promise<NextResponse>) => Promise<NextResponse | null>
  >
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        return result;
      }
    }

    // 如果所有中间件都通过，返回一个成功响应
    return NextResponse.next();
  };
}

/**
 * 用户级限流（基于用户ID）
 */
export function createUserRateLimiter(
  maxRequests: number,
  windowMs: number = 60 * 1000
) {
  return createRateLimiter({
    windowMs,
    maxRequests,
    keyGenerator: (request: NextRequest) => {
      // 从请求中获取用户ID（假设在header中）
      const userId = request.headers.get('x-user-id') || 'anonymous';
      return `user_rate_${userId}`;
    },
  });
}

/**
 * API端点限流（基于路径）
 */
export function createEndpointRateLimiter(
  endpoints: Record<string, RateLimitConfig>
) {
  return async function endpointRateLimiter(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const pathname = new URL(request.url).pathname;

    // 查找匹配的端点配置
    for (const [pattern, config] of Object.entries(endpoints)) {
      if (pathname.match(new RegExp(pattern))) {
        const limiter = createRateLimiter(config);
        return limiter(request);
      }
    }

    return null;
  };
}

/**
 * 限流装饰器（用于API路由）
 */
export function withRateLimit(config: Partial<RateLimitConfig> = {}) {
  const limiter = createRateLimiter(config);

  return function <T extends (req: NextRequest) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (req: NextRequest) => {
      const result = await limiter(req);
      if (result) return result;
      return handler(req);
    }) as T;
  };
}

/**
 * 获取限流状态
 */
export function getRateLimitStatus(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {}
): {
  remaining: number;
  reset: number;
  limited: boolean;
} {
  const finalConfig = { ...defaultConfig, ...config };
  const keyGenerator = finalConfig.keyGenerator || defaultKeyGenerator;
  const key = keyGenerator(request);
  const record = requestStore.get(key);
  const now = Date.now();

  if (!record || record.resetTime < now) {
    return {
      remaining: finalConfig.maxRequests,
      reset: Math.floor((now + finalConfig.windowMs) / 1000),
      limited: false,
    };
  }

  return {
    remaining: Math.max(0, finalConfig.maxRequests - record.count),
    reset: Math.floor(record.resetTime / 1000),
    limited: record.count >= finalConfig.maxRequests,
  };
}

/**
 * 重置限流
 */
export function resetRateLimit(request: NextRequest, config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  const keyGenerator = finalConfig.keyGenerator || defaultKeyGenerator;
  const key = keyGenerator(request);
  requestStore.delete(key);
}

// 导出默认限流器
export const rateLimiter = createRateLimiter();
