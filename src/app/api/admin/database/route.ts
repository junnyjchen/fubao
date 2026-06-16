import { NextResponse } from 'next/server';
import { getPool, isMySQLEnabled, testConnection, migrateSchema } from '@/lib/mysql';
import fs from 'fs';
import path from 'path';

/**
 * 数据库管理 API
 * GET  - 查看数据库状态
 * POST - 执行初始化/迁移
 */
export async function GET() {
  const available = await isMySQLEnabled();

  if (!available) {
    return NextResponse.json({
      engine: 'mock',
      mysql: { available: false, message: 'MySQL 未配置，使用内存 Mock DB' },
      tip: '请设置环境变量 MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE 后重启服务'
    });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT 1 as ok');
    const [tables] = await pool.execute('SHOW TABLES');

    return NextResponse.json({
      engine: 'mysql',
      mysql: {
        available: true,
        connected: (rows as any[])[0]?.ok === 1,
        tables: (tables as any[]).length
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      engine: 'mock',
      mysql: { available: false, error: message }
    });
  }
}

export async function POST(request: Request) {
  const available = await isMySQLEnabled();
  if (!available) {
    return NextResponse.json(
      { success: false, error: 'MySQL 未配置，无法执行迁移' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'migrate';

    if (action === 'migrate') {
      return await executeMigrate();
    } else if (action === 'seed') {
      return await executeSeed();
    } else if (action === 'reset') {
      return await executeReset();
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function executeMigrate(): Promise<NextResponse> {
  const pool = getPool();
  const schemaPath = path.join(process.cwd(), 'sql', 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    return NextResponse.json(
      { success: false, error: 'sql/schema.sql 文件不存在' },
      { status: 500 }
    );
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

  // 按分号分割并逐条执行
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let successCount = 0;
  const errors: string[] = [];

  for (const stmt of statements) {
    try {
      await pool.execute(stmt);
      successCount++;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      // 忽略"表已存在"等非致命错误
      if (msg.includes('already exists') || msg.includes('Duplicate')) {
        successCount++;
      } else {
        errors.push(`${stmt.substring(0, 60)}... → ${msg}`);
      }
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    message: `執行 ${successCount}/${statements.length} 條SQL成功`,
    errors: errors.length > 0 ? errors : undefined
  });
}

async function executeSeed(): Promise<NextResponse> {
  const pool = getPool();
  const seedPath = path.join(process.cwd(), 'sql', 'seed.sql');

  if (!fs.existsSync(seedPath)) {
    return NextResponse.json(
      { success: false, error: 'sql/seed.sql 文件不存在，請先執行 migrate 創建表' },
      { status: 500 }
    );
  }

  const seedSql = fs.readFileSync(seedPath, 'utf-8');
  const statements = seedSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  let successCount = 0;
  const errors: string[] = [];

  for (const stmt of statements) {
    try {
      await pool.execute(stmt);
      successCount++;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('Duplicate') || msg.includes('already exists')) {
        successCount++;
      } else {
        errors.push(`${stmt.substring(0, 60)}... → ${msg}`);
      }
    }
  }

  return NextResponse.json({
    success: errors.length === 0,
    message: `種子數據 ${successCount}/${statements.length} 條執行成功`,
    errors: errors.length > 0 ? errors : undefined
  });
}

async function executeReset(): Promise<NextResponse> {
  const pool = getPool();

  // 获取所有表名
  const [tables] = await pool.execute('SHOW TABLES') as [any[], any];
  const tableNames = tables.map((t: any) => Object.values(t)[0] as string);

  // 禁用外键检查，删除所有表，再重新启用
  await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
  for (const name of tableNames) {
    await pool.execute(`DROP TABLE IF EXISTS \`${name}\``);
  }
  await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

  // 重新执行建表和种子数据
  const migrateResult = await executeMigrate();
  const migrateData = await migrateResult.json();

  if (!migrateData.success) {
    return NextResponse.json({
      success: false,
      message: '重置後建表失敗',
      errors: migrateData.errors
    });
  }

  const seedResult = await executeSeed();
  const seedData = await seedResult.json();

  return NextResponse.json({
    success: true,
    message: `數據庫已重置並重新初始化 (${tableNames.length} 個表已刪除重建)`,
    seedErrors: seedData.errors
  });
}
