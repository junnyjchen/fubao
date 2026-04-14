/**
 * @fileoverview MySQL 数据库客户端
 * @description 用于服务器端数据库操作
 * @module storage/database/mysql-client
 */

import mysql from 'mysql2/promise';

/** MySQL 连接池 */
let pool: mysql.Pool | null = null;

/**
 * 获取 MySQL 连接池
 */
export function getMySQLPool(): mysql.Pool {
  if (pool) {
    return pool;
  }

  const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || process.env.DB_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'fubao';

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
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
 * 执行查询
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<{ data: T[]; error: null } | { data: null; error: any }> {
  try {
    const [rows] = await getMySQLPool().execute(sql, params);
    return { data: rows as T[], error: null };
  } catch (error) {
    console.error('MySQL query error:', error);
    return { data: null, error };
  }
}

/**
 * 执行单行查询
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<{ data: T | null; error: null } | { data: null; error: any }> {
  try {
    const [rows] = await getMySQLPool().execute(sql, params);
    const rowArray = rows as T[];
    return { data: rowArray[0] || null, error: null };
  } catch (error) {
    console.error('MySQL queryOne error:', error);
    return { data: null, error };
  }
}

/**
 * 执行插入并返回插入ID
 */
export async function insertAndGetId(
  table: string,
  data: Record<string, any>
): Promise<{ id: number; error: null } | { id: null; error: any }> {
  try {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const fields = keys.map(k => `\`${k}\``).join(', ');

    const sql = `INSERT INTO \`${table}\` (${fields}) VALUES (${placeholders})`;
    const [result] = await getMySQLPool().execute(sql, values);

    return { id: (result as mysql.ResultSetHeader).insertId, error: null };
  } catch (error) {
    console.error('MySQL insertAndGetId error:', error);
    return { id: null, error };
  }
}

/**
 * 执行更新
 */
export async function update(
  table: string,
  data: Record<string, any>,
  where: Record<string, any>
): Promise<{ affected: number; error: null } | { affected: null; error: any }> {
  try {
    const setKeys = Object.keys(data);
    const whereKeys = Object.keys(where);
    const values = [...Object.values(data), ...Object.values(where)];

    const setClause = setKeys.map(k => `\`${k}\` = ?`).join(', ');
    const whereClause = whereKeys.map(k => `\`${k}\` = ?`).join(' AND ');

    const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
    const [result] = await getMySQLPool().execute(sql, values);

    return { affected: (result as mysql.ResultSetHeader).affectedRows, error: null };
  } catch (error) {
    console.error('MySQL update error:', error);
    return { affected: null, error };
  }
}

/**
 * 执行删除
 */
export async function remove(
  table: string,
  where: Record<string, any>
): Promise<{ affected: number; error: null } | { affected: null; error: any }> {
  try {
    const whereKeys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = whereKeys.map(k => `\`${k}\` = ?`).join(' AND ');

    const sql = `DELETE FROM \`${table}\` WHERE ${whereClause}`;
    const [result] = await getMySQLPool().execute(sql, values);

    return { affected: (result as mysql.ResultSetHeader).affectedRows, error: null };
  } catch (error) {
    console.error('MySQL remove error:', error);
    return { affected: null, error };
  }
}
