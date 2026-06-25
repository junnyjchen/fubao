/**
 * @fileoverview 數據庫訪問層 — MySQL 唯一模式（已禁用 Mock DB 降級）
 * @description 當 MySQL 環境變量已配置時，強制使用 MySQL；
 *              查詢失敗時返回空結果（而非 throw），確保 API 不會 500 導致前端崩潰。
 * @module lib/db
 */

import { getPool as getMysqlPool, isMySQLEnabled, mysqlQuery, mysqlExecute, mysqlQueryOne } from './mysql';

/** 检查当前是否应该使用MySQL（每次动态检查，避免模块加载时缓存） */
function shouldUseMysql(): boolean {
  return isMySQLEnabled();
}

// ========== 数据库操作（MySQL 唯一模式） ==========

/**
 * 查询记录 — 失败时返回空数组，不 throw
 */
export async function query(sql: string, params?: unknown[]): Promise<any[]> {
  if (!shouldUseMysql()) {
    console.error('[DB] MySQL 未配置，无法查询');
    return [];
  }
  try {
    const rows = await mysqlQuery(sql, params);
    return Array.isArray(rows) ? rows : [];
  } catch (e: any) {
    const msg = e?.code || e?.message || String(e);
    console.error(`[DB] MySQL 查询失败: ${msg} | SQL: ${sql.substring(0, 100)}`);
    return [];
  }
}

/**
 * 查询单条记录 — 失败时返回 null，不 throw
 */
export async function queryOne(sql: string, params?: unknown[]): Promise<any | null> {
  if (!shouldUseMysql()) {
    console.error('[DB] MySQL 未配置，无法查询');
    return null;
  }
  try {
    return await mysqlQueryOne(sql, params);
  } catch (e: any) {
    const msg = e?.code || e?.message || String(e);
    console.error(`[DB] MySQL 单条查询失败: ${msg} | SQL: ${sql.substring(0, 100)}`);
    return null;
  }
}

/**
 * 插入记录 — 失败时返回 0，不 throw
 */
export async function insert(table: string, data: Record<string, unknown>): Promise<number | string> {
  if (!shouldUseMysql()) {
    console.error('[DB] MySQL 未配置，无法插入');
    return 0;
  }
  try {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;
    const result = await mysqlExecute(sql, values);
    return result.insertId;
  } catch (e: any) {
    const msg = e?.code || e?.message || String(e);
    console.error(`[DB] MySQL 插入失败: ${msg}`);
    return 0;
  }
}

/**
 * 更新记录 — 失败时返回 0，不 throw
 */
export async function update(
  table: string,
  dataOrId: Record<string, unknown> | number | string,
  whereOrData: Record<string, unknown>
): Promise<number> {
  if (!shouldUseMysql()) {
    console.error('[DB] MySQL 未配置，无法更新');
    return 0;
  }
  try {
    if (typeof dataOrId === 'number' || typeof dataOrId === 'string') {
      const id = dataOrId;
      const data = whereOrData;
      const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(', ');
      const values = [...Object.values(data), id];
      const sql = `UPDATE \`${table}\` SET ${setClause} WHERE id = ?`;
      const result = await mysqlExecute(sql, values);
      return result.affectedRows;
    } else {
      const data = dataOrId;
      const where = whereOrData;
      const setClause = Object.keys(data).map(k => `\`${k}\` = ?`).join(', ');
      const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
      const values = [...Object.values(data), ...Object.values(where)];
      const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
      const result = await mysqlExecute(sql, values);
      return result.affectedRows;
    }
  } catch (e: any) {
    const msg = e?.code || e?.message || String(e);
    console.error(`[DB] MySQL 更新失败: ${msg}`);
    return 0;
  }
}

/**
 * 删除记录 — 失败时返回 0，不 throw
 */
export async function remove(
  table: string,
  where: Record<string, unknown>
): Promise<number> {
  if (!shouldUseMysql()) {
    console.error('[DB] MySQL 未配置，无法删除');
    return 0;
  }
  try {
    const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(where);
    const sql = `DELETE FROM \`${table}\` WHERE ${whereClause}`;
    const result = await mysqlExecute(sql, values);
    return result.affectedRows;
  } catch (e: any) {
    const msg = e?.code || e?.message || String(e);
    console.error(`[DB] MySQL 删除失败: ${msg}`);
    return 0;
  }
}

/**
 * 统计记录数 — 失败时返回 0，不 throw
 */
export async function count(
  tableOrSql: string,
  where?: string,
  params?: unknown[]
): Promise<number> {
  if (!shouldUseMysql()) {
    console.error('[DB] MySQL 未配置，无法计数');
    return 0;
  }
  try {
    // 如果是完整 SQL
    if (tableOrSql.toLowerCase().trim().startsWith('select')) {
      const sql = tableOrSql;
      const countSql = sql.replace(/SELECT\s+[\s\S]*?FROM/i, 'SELECT COUNT(*) as cnt FROM');
      // Remove ORDER BY, LIMIT, OFFSET for count
      const cleaned = countSql.replace(/\s+ORDER\s+BY\s+[\s\S]*$/i, '').replace(/\s+LIMIT\s+[\s\S]*$/i, '').replace(/\s+OFFSET\s+[\s\S]*$/i, '');
      const rows = await mysqlQuery(cleaned, params || []);
      return (rows as any[])[0]?.cnt || 0;
    }
    // 只是表名
    if (!where) {
      const rows = await mysqlQuery(`SELECT COUNT(*) as cnt FROM \`${tableOrSql}\``);
      return (rows as any[])[0]?.cnt || 0;
    }
    const rows = await mysqlQuery(`SELECT COUNT(*) as cnt FROM \`${tableOrSql}\` WHERE ${where}`, params || []);
    return (rows as any[])[0]?.cnt || 0;
  } catch (e: any) {
    const msg = e?.code || e?.message || String(e);
    console.error(`[DB] MySQL 计数失败: ${msg}`);
    return 0;
  }
}

/**
 * 获取数据库类型标识
 */
export function getDbType(): 'mysql' | 'none' {
  return shouldUseMysql() ? 'mysql' : 'none';
}

/**
 * 检查 MySQL 连接状态
 */
export async function checkConnection(): Promise<{ ok: boolean; message: string }> {
  if (!shouldUseMysql()) {
    return { ok: false, message: 'MySQL 环境变量未配置' };
  }
  try {
    const pool = getMysqlPool();
    if (!pool) {
      return { ok: false, message: 'MySQL 连接池未建立' };
    }
    const rows = await mysqlQuery('SELECT 1 as test');
    return { ok: true, message: 'MySQL 连接正常' };
  } catch (e: any) {
    return { ok: false, message: `MySQL 连接失败: ${e.message}` };
  }
}

// ========== 辅助函数 ==========

/**
 * 安全获取数组（确保返回数组）
 */
export function ensureArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // 可能是单条记录，包装为数组
    return [data] as T[];
  }
  return [];
}

/**
 * 安全解析 JSON 字符串为数组
 */
export function parseJsonArray(str: string | null | undefined): any[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
