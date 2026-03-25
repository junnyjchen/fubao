/**
 * @fileoverview 系统健康检查API
 * @description 系统状态监控和健康检查
 * @module app/api/health/route
 */

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 健康检查结果接口
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'error';
      used: number;
      total: number;
      percentage: number;
    };
    storage: {
      status: 'ok' | 'warning' | 'error';
      message?: string;
    };
  };
}

/**
 * 检查数据库连接
 */
async function checkDatabase(): Promise<{ status: 'ok' | 'error'; latency?: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      return { status: 'error', latency, error: error.message };
    }

    return { status: 'ok', latency };
  } catch (error) {
    return { status: 'error', error: String(error) };
  }
}

/**
 * 检查内存使用
 */
function checkMemory(): { status: 'ok' | 'warning' | 'error'; used: number; total: number; percentage: number } {
  // 在Node.js环境中
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    const used = mem.heapUsed;
    const total = mem.heapTotal;
    const percentage = (used / total) * 100;

    let status: 'ok' | 'warning' | 'error' = 'ok';
    if (percentage > 90) {
      status = 'error';
    } else if (percentage > 75) {
      status = 'warning';
    }

    return {
      status,
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  // 浏览器环境或无法获取
  return {
    status: 'ok',
    used: 0,
    total: 0,
    percentage: 0,
  };
}

/**
 * 检查存储状态
 */
async function checkStorage(): Promise<{ status: 'ok' | 'warning' | 'error'; message?: string }> {
  try {
    // 检查Supabase存储
    const { error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { status: 'warning', message: error.message };
    }

    return { status: 'ok', message: 'Storage service is available' };
  } catch (error) {
    return { status: 'error', message: String(error) };
  }
}

// 启动时间
const startTime = Date.now();

/**
 * 系统健康检查
 */
export async function GET() {
  try {
    // 并行执行所有检查
    const [dbCheck, storageCheck] = await Promise.all([
      checkDatabase(),
      checkStorage(),
    ]);

    const memoryCheck = checkMemory();

    // 确定整体状态
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (dbCheck.status === 'error' || memoryCheck.status === 'error' || storageCheck.status === 'error') {
      overallStatus = 'unhealthy';
    } else if (
      memoryCheck.status === 'warning' ||
      storageCheck.status === 'warning'
    ) {
      overallStatus = 'degraded';
    }

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: dbCheck,
        memory: memoryCheck,
        storage: storageCheck,
      },
    };

    // 根据状态返回不同的HTTP状态码
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: String(error),
      },
      { status: 503 }
    );
  }
}

/**
 * 简单的存活检查（用于负载均衡器）
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
