import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

let pool: Pool | null = null;

interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset?: string;
  connectionLimit?: number;
}

function getConfig(): MySQLConfig | null {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;

  if (!host || !user || !password || !database) {
    return null;
  }

  return {
    host,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user,
    password,
    database,
    charset: 'utf8mb4',
    connectionLimit: parseInt(process.env.MYSQL_POOL_SIZE || '10'),
  };
}

export function getPool(): Pool | null {
  const config = getConfig();
  if (!config) return null;

  if (!pool) {
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: config.charset,
      connectionLimit: config.connectionLimit,
      waitForConnections: true,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    pool.on('connection', (connection) => {
      connection.query('SET NAMES utf8mb4');
    });

    console.log(`[MySQL] 連接池已建立: ${config.host}:${config.port}/${config.database}`);
  }

  return pool;
}

export function isMySQLEnabled(): boolean {
  return getConfig() !== null;
}

/**
 * 執行 SQL 查詢 (SELECT)
 */
export async function mysqlQuery<T = RowDataPacket[]>(
  sql: string,
  params?: any[]
): Promise<T> {
  const p = getPool();
  if (!p) throw new Error('MySQL 未配置');

  const start = Date.now();
  try {
    const [rows] = await p.query(sql, params);
    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn(`[MySQL] 慢查詢 (${duration}ms): ${sql.substring(0, 100)}`);
    }
    return rows as unknown as T;
  } catch (error: any) {
    console.error(`[MySQL] 查詢錯誤: ${error.message}`, sql.substring(0, 200));
    throw error;
  }
}

/**
 * 執行 INSERT/UPDATE/DELETE
 */
export async function mysqlExecute(
  sql: string,
  params?: any[]
): Promise<ResultSetHeader> {
  const p = getPool();
  if (!p) throw new Error('MySQL 未配置');

  try {
    const [result] = await p.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (error: any) {
    console.error(`[MySQL] 執行錯誤: ${error.message}`, sql.substring(0, 200));
    throw error;
  }
}

/**
 * 獲取單條記錄
 */
export async function mysqlQueryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await mysqlQuery<RowDataPacket[]>(sql, params);
  return (rows.length > 0 ? rows[0] : null) as unknown as T | null;
}

/**
 * 測試連接
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const p = getPool();
    if (!p) return { success: false, message: 'MySQL 未配置，請設置環境變量' };

    const conn = await p.getConnection();
    await conn.ping();
    conn.release();

    return { success: true, message: 'MySQL 連接成功' };
  } catch (error: any) {
    return { success: false, message: `MySQL 連接失敗: ${error.message}` };
  }
}

/**
 * 執行建表 SQL
 */
export async function migrateSchema(sqlContent: string): Promise<{ success: boolean; message: string; errors: string[] }> {
  const errors: string[] = [];

  // 按分號分割，過濾空語句和註釋
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SET NAMES') && !s.startsWith('SET FOREIGN_KEY'));

  for (const stmt of statements) {
    try {
      await mysqlExecute(stmt);
    } catch (error: any) {
      // 忽略"表已存在"錯誤
      if (!error.message.includes('already exists')) {
        errors.push(`${error.message} | SQL: ${stmt.substring(0, 80)}...`);
      }
    }
  }

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? `遷移完成，執行 ${statements.length} 條語句` : `遷移完成，${errors.length} 個錯誤`,
    errors,
  };
}
