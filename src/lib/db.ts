/**
 * @fileoverview MySQL 数据库连接工具
 * @description 提供统一的 MySQL 连接池和查询方法
 * @module lib/db
 */

import mysql from 'mysql2/promise';

/** MySQL 连接池单例 */
let pool: mysql.Pool | null = null;

/**
 * 获取 MySQL 连接池
 */
export function getPool(): mysql.Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'fubao',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+08:00',
    dateStrings: true,
  });

  return pool;
}

/**
 * 执行查询并返回结果集
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await (getPool() as any).execute(sql, params || []);
  return rows as T[];
}

/**
 * 执行查询并返回单行结果
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

/**
 * 执行 INSERT 并返回自增 ID
 */
export async function insert(
  table: string,
  data: Record<string, unknown>
): Promise<number> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const fields = keys.map(k => `\`${k}\``).join(', ');

  const sql = `INSERT INTO \`${table}\` (${fields}) VALUES (${placeholders})`;
  const [result] = await (getPool() as any).execute(sql, values);
  return (result as mysql.ResultSetHeader).insertId;
}

/**
 * 执行 UPDATE 并返回影响行数
 */
export async function update(
  table: string,
  data: Record<string, unknown>,
  where: Record<string, unknown>
): Promise<number> {
  const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(', ');
  const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
  const values = [...Object.values(data), ...Object.values(where)];

  const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
  const [result] = await (getPool() as any).execute(sql, values);
  return (result as mysql.ResultSetHeader).affectedRows;
}

/**
 * 执行 DELETE 并返回影响行数
 */
export async function remove(
  table: string,
  where: Record<string, unknown>
): Promise<number> {
  const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
  const values = Object.values(where);

  const sql = `DELETE FROM \`${table}\` WHERE ${whereClause}`;
  const [result] = await (getPool() as any).execute(sql, values);
  return (result as mysql.ResultSetHeader).affectedRows;
}

/**
 * 查询总数
 */
export async function count(
  table: string,
  where?: string,
  params?: unknown[]
): Promise<number> {
  let sql = `SELECT COUNT(*) as cnt FROM \`${table}\``;
  if (where) sql += ` WHERE ${where}`;
  const row = await queryOne<{ cnt: number }>(sql, params);
  return row?.cnt || 0;
}
