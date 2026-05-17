/**
 * @fileoverview MySQL 数据库客户端（兼容 Supabase API）
 * @description 提供与 Supabase 类似 API 的 MySQL 查询接口，完整支持链式调用
 * @module storage/database/supabase-client
 */

import mysql from 'mysql2/promise';

/** MySQL 连接池 */
let pool: mysql.Pool | null = null;

/**
 * 获取 MySQL 连接池
 */
function getPool(): mysql.Pool {
  if (pool) {
    return pool;
  }

  const host = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.DB_USER || process.env.MYSQL_USER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'fubao';

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
 * 查询构建器 - 支持完整的 Supabase 链式 API
 */
class QueryBuilder {
  private _table = '';
  private _selectFields = '*';
  private _filters: string[] = [];
  private _filterParams: unknown[] = [];
  private _limitValue?: number;
  private _offsetValue?: number;
  private _orderColumn?: string;
  private _orderAscending = true;
  private _mode: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'count' = 'select';
  private _insertData: Record<string, any>[] = [];
  private _updateData: Record<string, any> = {};
  private _upsertConflict?: string;
  private _countResult = false;

  from(table: string): QueryBuilder {
    const qb = new QueryBuilder();
    qb._table = table;
    return qb;
  }

  select(fields?: string, options?: { count?: string; head?: boolean }): QueryBuilder {
    if (fields) this._selectFields = fields;
    this._mode = 'select';
    if (options?.count === 'exact') {
      this._countResult = true;
    }
    if (options?.head) {
      this._selectFields = '1 as _head';
    }
    return this;
  }

  eq(field: string, value: unknown): QueryBuilder {
    if (value === null) {
      this._filters.push(`\`${field}\` IS NULL`);
    } else {
      this._filters.push(`\`${field}\` = ?`);
      this._filterParams.push(value);
    }
    return this;
  }

  neq(field: string, value: unknown): QueryBuilder {
    if (value === null) {
      this._filters.push(`\`${field}\` IS NOT NULL`);
    } else {
      this._filters.push(`\`${field}\` <> ?`);
      this._filterParams.push(value);
    }
    return this;
  }

  gt(field: string, value: unknown): QueryBuilder {
    this._filters.push(`\`${field}\` > ?`);
    this._filterParams.push(value);
    return this;
  }

  gte(field: string, value: unknown): QueryBuilder {
    this._filters.push(`\`${field}\` >= ?`);
    this._filterParams.push(value);
    return this;
  }

  lt(field: string, value: unknown): QueryBuilder {
    this._filters.push(`\`${field}\` < ?`);
    this._filterParams.push(value);
    return this;
  }

  lte(field: string, value: unknown): QueryBuilder {
    this._filters.push(`\`${field}\` <= ?`);
    this._filterParams.push(value);
    return this;
  }

  in(field: string, values: unknown[]): QueryBuilder {
    if (values.length === 0) {
      this._filters.push('1 = 0');
      return this;
    }
    const placeholders = values.map(() => '?').join(', ');
    this._filters.push(`\`${field}\` IN (${placeholders})`);
    this._filterParams.push(...values);
    return this;
  }

  is(field: string, value: boolean | null): QueryBuilder {
    if (value === null) {
      this._filters.push(`\`${field}\` IS NULL`);
    } else if (value === true) {
      this._filters.push(`\`${field}\` = 1`);
    } else {
      this._filters.push(`\`${field}\` = 0`);
    }
    return this;
  }

  like(field: string, value: string): QueryBuilder {
    this._filters.push(`\`${field}\` LIKE ?`);
    this._filterParams.push(value);
    return this;
  }

  ilike(field: string, value: string): QueryBuilder {
    this._filters.push(`LOWER(\`${field}\`) LIKE LOWER(?)`);
    this._filterParams.push(value);
    return this;
  }

  or(conditions: string): QueryBuilder {
    this._filters.push(`(${conditions})`);
    return this;
  }

  contains(field: string, value: unknown): QueryBuilder {
    this._filters.push(`JSON_CONTAINS(\`${field}\`, ?)`);
    this._filterParams.push(JSON.stringify(value));
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): QueryBuilder {
    this._orderColumn = column;
    this._orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number): QueryBuilder {
    this._limitValue = count;
    return this;
  }

  offset(count: number): QueryBuilder {
    this._offsetValue = count;
    return this;
  }

  range(from: number, to: number): QueryBuilder {
    this._offsetValue = from;
    this._limitValue = to - from + 1;
    return this;
  }

  /**
   * 插入数据
   */
  insert(data: Record<string, any> | Record<string, any>[]): QueryBuilder {
    this._mode = 'insert';
    this._insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  /**
   * 更新数据
   */
  update(data: Record<string, any>): QueryBuilder {
    this._mode = 'update';
    this._updateData = data;
    return this;
  }

  /**
   * 删除数据
   */
  delete(): QueryBuilder {
    this._mode = 'delete';
    return this;
  }

  /**
   * Upsert 操作
   */
  upsert(data: Record<string, any>, options?: { onConflict?: string }): QueryBuilder {
    this._mode = 'upsert';
    this._insertData = [data];
    this._upsertConflict = options?.onConflict;
    return this;
  }

  /**
   * 返回单行结果
   */
  async single(): Promise<{ data: Record<string, any> | null; error: any }> {
    this._limitValue = 1;
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    const dataArray = result.data as Record<string, any>[];
    return { data: dataArray?.[0] || null, error: null };
  }

  /**
   * 返回单行结果（可能为 null）
   */
  async maybeSingle(): Promise<{ data: Record<string, any> | null; error: any }> {
    this._limitValue = 1;
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    const dataArray = result.data as Record<string, any>[];
    return { data: dataArray?.[0] || null, error: null };
  }

  /**
   * 只获取计数，不获取数据 (Supabase head 模式)
   */
  async head(): Promise<{ count: number; error: any }> {
    let sql = `SELECT COUNT(*) as cnt FROM \`${this._table}\``;
    if (this._filters.length > 0) {
      sql += ` WHERE ${this._filters.join(' AND ')}`;
    }
    try {
      const [rows] = await (getPool() as any).execute(sql, this._filterParams);
      const dataArray = rows as Record<string, any>[];
      return { count: dataArray?.[0]?.cnt as number || 0, error: null };
    } catch (error) {
      console.error('MySQL head error:', error);
      return { count: 0, error };
    }
  }

  /**
   * 执行查询并返回原始结果
   */
  async execute(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    return this._execute();
  }

  /**
   * 使查询可被 await - 返回 { data, error } 或 { data, error, count } 格式
   */
  then<TResult1 = { data: Record<string, any>[] | null; error: any; count?: number }, TResult2 = never>(
    onfulfilled?: ((value: { data: Record<string, any>[] | null; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    return this._execute().then(
      onfulfilled as any,
      onrejected as any
    ) as Promise<TResult1 | TResult2>;
  }

  /**
   * 内部执行查询
   */
  private async _execute(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    try {
      switch (this._mode) {
        case 'select':
          return await this._executeSelect();
        case 'insert':
          return await this._executeInsert();
        case 'update':
          return await this._executeUpdate();
        case 'delete':
          return await this._executeDelete();
        case 'upsert':
          return await this._executeUpsert();
        default:
          return await this._executeSelect();
      }
    } catch (error) {
      console.error('MySQL query error:', error);
      return { data: null, error };
    }
  }

  private async _executeSelect(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    let countValue: number | undefined;

    // If count was requested, run a separate COUNT query
    if (this._countResult) {
      let countSql = `SELECT COUNT(*) as cnt FROM \`${this._table}\``;
      if (this._filters.length > 0) {
        countSql += ` WHERE ${this._filters.join(' AND ')}`;
      }
      const [countRows] = await (getPool() as any).execute(countSql, this._filterParams);
      countValue = (countRows as Record<string, any>[])?.[0]?.cnt as number || 0;
    }

    let sql = `SELECT ${this._selectFields} FROM \`${this._table}\``;

    if (this._filters.length > 0) {
      sql += ` WHERE ${this._filters.join(' AND ')}`;
    }

    if (this._orderColumn) {
      const dir = this._orderAscending ? 'ASC' : 'DESC';
      sql += ` ORDER BY \`${this._orderColumn}\` ${dir}`;
    }

    if (this._limitValue !== undefined) {
      sql += ` LIMIT ${this._limitValue}`;
    }

    if (this._offsetValue !== undefined) {
      sql += ` OFFSET ${this._offsetValue}`;
    }

    const [rows] = await (getPool() as any).execute(sql, this._filterParams);
    return { data: rows as Record<string, any>[], error: null, ...(countValue !== undefined ? { count: countValue } : {}) };
  }

  private async _executeInsert(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    const results: Record<string, any>[] = [];
    for (const item of this._insertData) {
      const keys = Object.keys(item);
      const values = Object.values(item);
      const placeholders = keys.map(() => '?').join(', ');
      const fields = keys.map(k => `\`${k}\``).join(', ');
      const sql = `INSERT INTO \`${this._table}\` (${fields}) VALUES (${placeholders})`;
      const [result] = await (getPool() as any).execute(sql, values);
      results.push({ id: (result as mysql.ResultSetHeader).insertId, ...item });
    }
    return { data: results, error: null };
  }

  private async _executeUpdate(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    if (this._filters.length === 0) {
      return { data: null, error: new Error('No where clause specified for update') };
    }

    const setClause = Object.entries(this._updateData).map(([k, v]) => {
      if (v === null) return `\`${k}\` = NULL`;
      if (typeof v === 'object') return `\`${k}\` = ?`;
      return `\`${k}\` = ?`;
    }).join(', ');

    const setValues = Object.values(this._updateData).map(v => {
      if (v === null) return undefined;
      if (typeof v === 'object') return JSON.stringify(v);
      return v;
    }).filter(v => v !== undefined);

    const sql = `UPDATE \`${this._table}\` SET ${setClause} WHERE ${this._filters.join(' AND ')}`;
    const [result] = await (getPool() as any).execute(sql, [...setValues, ...this._filterParams]);
    return { data: [{ affectedRows: (result as mysql.ResultSetHeader).affectedRows }], error: null };
  }

  private async _executeDelete(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    if (this._filters.length === 0) {
      return { data: null, error: new Error('No where clause specified for delete') };
    }

    const sql = `DELETE FROM \`${this._table}\` WHERE ${this._filters.join(' AND ')}`;
    const [result] = await (getPool() as any).execute(sql, this._filterParams);
    return { data: [{ affectedRows: (result as mysql.ResultSetHeader).affectedRows }], error: null };
  }

  private async _executeUpsert(): Promise<{ data: Record<string, any>[] | null; error: any; count?: number }> {
    const item = this._insertData[0];
    if (!item) return { data: null, error: new Error('No data for upsert') };

    const keys = Object.keys(item);
    const values = Object.values(item);
    const placeholders = keys.map(() => '?').join(', ');
    const fields = keys.map(k => `\`${k}\``).join(', ');
    const updateKeys = this._upsertConflict ? keys.filter(k => k !== this._upsertConflict) : keys;

    const sql = `INSERT INTO \`${this._table}\` (${fields}) VALUES (${placeholders})
                 ON DUPLICATE KEY UPDATE ${updateKeys.map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(', ')}`;

    await (getPool() as any).execute(sql, values);
    return { data: [item], error: null };
  }
}

/**
 * 数据库客户端类 - 兼容 Supabase API，支持 from().select().eq() 链式调用
 */
class DatabaseClient {
  private _currentBuilder?: QueryBuilder;

  from(table: string): QueryBuilder {
    this._currentBuilder = new QueryBuilder();
    return this._currentBuilder.from(table);
  }

  /**
   * RPC 调用（MySQL 中使用直接查询模拟）
   */
  rpc(fn: string, params?: Record<string, any>): Promise<{ data: any; error: any }> {
    // 模拟 Supabase RPC - 使用直接 SQL
    return Promise.resolve({ data: null, error: { message: `RPC ${fn} not implemented in MySQL mode` } });
  }

  /**
   * Auth 模块
   */
  auth = {
    getUser: async () => {
      return { data: { user: null }, error: { message: 'Auth not available in local mode' } };
    },
    signInWithPassword: async () => {
      return { data: { session: null, user: null }, error: { message: 'Auth not available in local mode' } };
    },
    signUp: async () => {
      return { data: { session: null, user: null }, error: { message: 'Auth not available in local mode' } };
    },
    signOut: async () => {
      return { error: null };
    },
    setSession: async () => {
      return { error: null };
    },
  };

  /**
   * Storage 模块（MySQL 模式下不实现）
   */
  storage = {
    from: (bucket: string) => ({
      upload: async () => ({ data: null, error: { message: 'Storage not available in MySQL mode' } }),
      download: async () => ({ data: null, error: { message: 'Storage not available in MySQL mode' } }),
      remove: async () => ({ data: null, error: { message: 'Storage not available in MySQL mode' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  };

  /**
   * Channel（实时订阅 - MySQL 模式下不实现）
   */
  channel(_name: string) {
    return {
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
    };
  }
}

// 单例客户端
const db = new DatabaseClient();

export function getSupabaseClient(): DatabaseClient {
  return db;
}

export { db as supabase, DatabaseClient };
