/**
 * @fileoverview 数据库迁移管理API
 * @description 管理数据库表结构迁移
 * @module app/api/admin/migrations/route
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { migrations, getMigrationStatus, runMigrations, rollbackMigration } from '@/lib/database/migration';

/**
 * 获取迁移状态
 * GET /api/admin/migrations
 */
export async function GET() {
  try {
    // 仅允许开发环境或管理员访问
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: '生產環境禁止訪問' }, { status: 403 });
    }

    const status = await getMigrationStatus();
    
    // 统计
    const total = status.migrations.length;
    const executed = status.migrations.filter(m => m.status === 'executed').length;
    const pending = total - executed;

    return NextResponse.json({
      migrations: status.migrations,
      summary: {
        total,
        executed,
        pending,
      },
    });
  } catch (error) {
    console.error('获取迁移状态失败:', error);
    return NextResponse.json(
      { error: '獲取遷移狀態失敗' },
      { status: 500 }
    );
  }
}

/**
 * 执行迁移
 * POST /api/admin/migrations
 */
export async function POST(request: NextRequest) {
  try {
    // 仅允许开发环境或管理员访问
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: '生產環境禁止執行' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, migrationId } = body;

    if (action === 'run') {
      // 执行所有待执行的迁移
      const result = await runMigrations();
      
      return NextResponse.json({
        success: result.success,
        message: result.message,
        executed: result.executed,
      });
    }

    if (action === 'rollback' && migrationId) {
      // 回滚指定迁移
      const result = await rollbackMigration(migrationId);
      
      return NextResponse.json({
        success: result.success,
        message: result.message,
      });
    }

    if (action === 'reset') {
      // 重置数据库（危险操作）
      return NextResponse.json({
        error: '重置操作需要單獨確認',
      }, { status: 400 });
    }

    return NextResponse.json({
      error: '無效的操作',
    }, { status: 400 });
  } catch (error) {
    console.error('执行迁移失败:', error);
    return NextResponse.json(
      { error: '執行遷移失敗' },
      { status: 500 }
    );
  }
}
