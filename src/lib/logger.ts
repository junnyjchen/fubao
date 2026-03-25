/**
 * @fileoverview 日志工具函数
 * @description 统一的日志记录和管理工具
 * @module lib/logger
 */

import type { LogLevel, LogModule, SystemLog } from '@/app/api/admin/logs/route';

// 日志配置
interface LoggerConfig {
  enabled: boolean;
  apiUrl: string;
  batchSize: number;
  flushInterval: number; // ms
}

// 默认配置
const defaultConfig: LoggerConfig = {
  enabled: true,
  apiUrl: '/api/admin/logs',
  batchSize: 10,
  flushInterval: 5000,
};

// 日志缓冲区
let logBuffer: SystemLog[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let config: LoggerConfig = defaultConfig;

/**
 * 配置日志器
 */
export function configureLogger(newConfig: Partial<LoggerConfig>) {
  config = { ...config, ...newConfig };
}

/**
 * 写入日志
 */
export function log(
  level: LogLevel,
  module: LogModule,
  action: string,
  message: string,
  extra?: Partial<SystemLog>
) {
  if (!config.enabled) return;

  const logEntry: SystemLog = {
    level,
    module,
    action,
    message,
    ...extra,
    created_at: new Date().toISOString(),
  };

  // 开发环境直接输出到控制台
  if (process.env.NODE_ENV === 'development') {
    const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[logMethod](`[${level.toUpperCase()}] [${module}] ${action}:`, message, extra || '');
  }

  // 添加到缓冲区
  logBuffer.push(logEntry);

  // 达到批量大小时立即刷新
  if (logBuffer.length >= config.batchSize) {
    flushLogs();
  } else {
    // 启动定时刷新
    scheduleFlush();
  }
}

/**
 * 预设日志方法
 */
export const logger = {
  info: (module: LogModule, action: string, message: string, extra?: Partial<SystemLog>) =>
    log('info', module, action, message, extra),
  
  warn: (module: LogModule, action: string, message: string, extra?: Partial<SystemLog>) =>
    log('warn', module, action, message, extra),
  
  error: (module: LogModule, action: string, message: string, extra?: Partial<SystemLog>) =>
    log('error', module, action, message, extra),
  
  debug: (module: LogModule, action: string, message: string, extra?: Partial<SystemLog>) =>
    log('debug', module, action, message, extra),
};

/**
 * 安排定时刷新
 */
function scheduleFlush() {
  if (flushTimer) return;
  
  flushTimer = setTimeout(() => {
    flushLogs();
    flushTimer = null;
  }, config.flushInterval);
}

/**
 * 刷新日志缓冲区
 */
async function flushLogs() {
  if (logBuffer.length === 0) return;

  // 取出当前缓冲区的日志
  const logsToSend = [...logBuffer];
  logBuffer = [];

  // 清除定时器
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  // 发送日志
  try {
    // 批量发送
    for (const logEntry of logsToSend) {
      await fetch(config.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    }
  } catch (error) {
    console.error('Failed to flush logs:', error);
    // 失败时重新加入缓冲区
    logBuffer = [...logsToSend, ...logBuffer];
  }
}

/**
 * 手动刷新
 */
export async function flushLogger() {
  await flushLogs();
}

/**
 * 记录API请求日志
 */
export function logApiRequest(
  method: string,
  url: string,
  params?: Record<string, unknown>,
  userId?: string
) {
  logger.info('api', 'request', `${method} ${url}`, {
    user_id: userId,
    request_method: method,
    request_url: url,
    request_params: params,
  });
}

/**
 * 记录API响应日志
 */
export function logApiResponse(
  method: string,
  url: string,
  status: number,
  duration: number,
  userId?: string
) {
  const level: LogLevel = status >= 400 ? 'error' : 'info';
  log(level, 'api', 'response', `${method} ${url} - ${status} (${duration}ms)`, {
    user_id: userId,
    request_method: method,
    request_url: url,
    response_status: status,
  });
}

/**
 * 记录用户操作日志
 */
export function logUserAction(
  userId: string,
  userName: string,
  action: string,
  message: string,
  extra?: Partial<SystemLog>
) {
  logger.info('user', action, message, {
    user_id: userId,
    user_name: userName,
    ...extra,
  });
}

/**
 * 记录订单日志
 */
export function logOrder(
  orderId: string,
  action: string,
  message: string,
  userId?: string,
  extra?: Partial<SystemLog>
) {
  logger.info('order', action, message, {
    user_id: userId,
    request_params: { orderId },
    ...extra,
  });
}

/**
 * 记录支付日志
 */
export function logPayment(
  orderId: string,
  action: string,
  message: string,
  extra?: Partial<SystemLog>
) {
  logger.info('payment', action, message, {
    request_params: { orderId },
    ...extra,
  });
}

/**
 * 记录错误日志
 */
export function logError(
  module: LogModule,
  action: string,
  error: Error | unknown,
  extra?: Partial<SystemLog>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error(module, action, errorMessage, {
    error_stack: errorStack,
    ...extra,
  });
}

/**
 * 性能监控日志
 */
export function logPerformance(
  operation: string,
  duration: number,
  extra?: Record<string, unknown>
) {
  const level: LogLevel = duration > 1000 ? 'warn' : 'info';
  log(level, 'system', 'performance', `${operation} took ${duration}ms`, {
    request_params: { operation, duration, ...extra },
  });
}

/**
 * 测量函数执行时间
 */
export async function measureAndLog<T>(
  operation: string,
  fn: () => Promise<T>,
  extra?: Record<string, unknown>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logPerformance(operation, duration, extra);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logError('system', operation, error, {
      request_params: { operation, duration, ...extra },
    });
    throw error;
  }
}

// 页面卸载时刷新日志
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushLogs();
  });
}

// 导出便捷方法
export default logger;
