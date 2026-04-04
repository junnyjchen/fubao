/**
 * @fileoverview 日志工具
 * @description 统一的日志记录和管理
 * @module lib/logger
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private readonly isDevelopment = process.env.NODE_ENV === 'development';
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    // 生产环境只记录 info 及以上级别
    return level === 'info' || level === 'warn' || level === 'error';
  }

  private addToLog(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    this.addToLog(level, message, context);

    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.debug(formattedMessage);
        break;
      case 'info':
        console.log(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | Record<string, any>, context?: Record<string, any>): void {
    const errorContext = error instanceof Error
      ? {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        }
      : { ...context, error };

    this.log('error', message, errorContext);
  }

  // API 日志
  apiLog(method: string, path: string, statusCode: number, duration: number, context?: Record<string, any>): void {
    const message = `${method} ${path} - ${statusCode} (${duration}ms)`;
    this.info(message, {
      ...context,
      method,
      path,
      statusCode,
      duration,
      type: 'api',
    });
  }

  // 数据库日志
  dbLog(operation: string, table: string, duration: number, context?: Record<string, any>): void {
    const message = `DB ${operation} on ${table} (${duration}ms)`;
    this.debug(message, {
      ...context,
      operation,
      table,
      duration,
      type: 'database',
    });
  }

  // 认证日志
  authLog(action: string, userId?: string, context?: Record<string, any>): void {
    const message = `Auth ${action}${userId ? ` - User: ${userId}` : ''}`;
    this.info(message, {
      ...context,
      action,
      userId,
      type: 'auth',
    });
  }

  // 性能日志
  performanceLog(name: string, duration: number, context?: Record<string, any>): void {
    const message = `Performance: ${name} took ${duration}ms`;
    this.warn(duration > 1000 ? message : `Slow ${message}`, {
      ...context,
      name,
      duration,
      type: 'performance',
      slow: duration > 1000,
    });
  }

  // 获取日志
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  // 清除日志
  clearLogs(): void {
    this.logs = [];
  }

  // 错误报告（生产环境可集成错误追踪服务）
  reportError(error: Error, context?: Record<string, any>): void {
    this.error('Error reported', error, context);

    // 这里可以集成 Sentry、LogRocket 等错误追踪服务
    if (this.isProduction) {
      // 示例：集成 Sentry
      // Sentry.captureException(error, { extra: context });
    }
  }
}

// 创建单例
const logger = new Logger();

// 导出单例和类
export { logger, Logger };
export default logger;
