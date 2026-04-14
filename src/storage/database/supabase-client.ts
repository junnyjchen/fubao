/**
 * @fileoverview MySQL 数据库客户端（兼容 Supabase API）
 * @description 提供与 Supabase 类似 API 的 MySQL 查询接口
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
 * 数据库客户端类（兼容 Supabase API）
 */
class DatabaseClient {
  private _table = '';
  private _selectFields = '*';
  private _filters: string[] = [];
  private _limitValue?: number;
  private _offsetValue?: number;
  private _orderColumn?: string;
  private _orderAscending = true;

  from(table: string): this {
    this._table = table;
    this._selectFields = '*';
    this._filters = [];
    this._limitValue = undefined;
    this._offsetValue = undefined;
    this._orderColumn = undefined;
    this._orderAscending = true;
    return this;
  }

  select(fields: string): this {
    this._selectFields = fields;
    return this;
  }

  eq(field: string, value: any): this {
    if (value === null) {
      this._filters.push(`\`${field}\` IS NULL`);
    } else if (typeof value === 'object' && value !== null) {
      this._filters.push(`\`${field}\` = '${JSON.stringify(value).replace(/'/g, "\\'")}'`);
    } else {
      this._filters.push(`\`${field}\` = '${value}'`);
    }
    return this;
  }

  neq(field: string, value: any): this {
    if (value === null) {
      this._filters.push(`\`${field}\` IS NOT NULL`);
    } else {
      this._filters.push(`\`${field}\` <> '${value}'`);
    }
    return this;
  }

  gt(field: string, value: any): this {
    this._filters.push(`\`${field}\` > '${value}'`);
    return this;
  }

  gte(field: string, value: any): this {
    this._filters.push(`\`${field}\` >= '${value}'`);
    return this;
  }

  lt(field: string, value: any): this {
    this._filters.push(`\`${field}\` < '${value}'`);
    return this;
  }

  lte(field: string, value: any): this {
    this._filters.push(`\`${field}\` <= '${value}'`);
    return this;
  }

  in(field: string, values: any[]): this {
    if (values.length === 0) return this;
    const valuesStr = values.map(v => `'${v}'`).join(', ');
    this._filters.push(`\`${field}\` IN (${valuesStr})`);
    return this;
  }

  is(field: string, value: boolean | null): this {
    if (value === null) {
      this._filters.push(`\`${field}\` IS NULL`);
    } else if (value === true) {
      this._filters.push(`\`${field}\` = 1`);
    } else {
      this._filters.push(`\`${field}\` = 0`);
    }
    return this;
  }

  like(field: string, value: string): this {
    this._filters.push(`\`${field}\` LIKE '${value}'`);
    return this;
  }

  ilike(field: string, value: string): this {
    this._filters.push(`LOWER(\`${field}\`) LIKE LOWER('${value}')`);
    return this;
  }

  or(conditions: string): this {
    this._filters.push(`(${conditions})`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    this._orderColumn = column;
    this._orderAscending = options?.ascending !== false;

    if (options?.nullsFirst !== undefined) {
      const nullsFirst = options.nullsFirst;
      if (nullsFirst) {
        this._filters.push(`\`${column}\` IS NULL ${this._orderAscending ? 'DESC' : 'ASC'}`);
      }
    }
    return this;
  }

  limit(count: number): this {
    this._limitValue = count;
    return this;
  }

  offset(count: number): this {
    this._offsetValue = count;
    return this;
  }

  range(from: number, to: number): this {
    this._offsetValue = from;
    this._limitValue = to - from + 1;
    return this;
  }

  single = (): DatabaseClient => {
    this._limitValue = 1;
    return this;
  };

  /**
   * 执行查询 - 使其可以直接 await
   */
  then<TResult1 = any[], TResult2 = never>(
    onfulfilled?: ((value: { data: TResult1; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(
      (result) => {
        const data = result.data as TResult1;
        return onfulfilled ? onfulfilled({ data, error: null }) : data as unknown as TResult1;
      },
      (error) => {
        return onrejected ? onrejected(error) : Promise.reject(error);
      }
    );
  }

  /**
   * 执行查询
   */
  async execute() {
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

    try {
      const [rows] = await getPool().execute(sql);
      return { data: rows, error: null };
    } catch (error) {
      console.error('MySQL query error:', error);
      return { data: null, error };
    }
  }

  // 别名方法
  async singleResult() {
    this._limitValue = 1;
    const result = await this.execute();
    const dataArray = result.data as any[];
    return { data: dataArray?.[0] || null, error: result.error };
  }

  /**
   * 插入数据
   */
  async insert(data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const fields = keys.map(k => `\`${k}\``).join(', ');

    const sql = `INSERT INTO \`${this._table}\` (${fields}) VALUES (${placeholders})`;
    try {
      const [result] = await getPool().execute(sql, values);
      return { data: [{ id: (result as mysql.ResultSetHeader).insertId, ...data }], error: null };
    } catch (error) {
      console.error('MySQL insert error:', error);
      return { data: null, error };
    }
  }

  /**
   * 更新数据
   */
  async update(data: Record<string, any>) {
    if (this._filters.length === 0) {
      return { data: null, error: new Error('No where clause specified') };
    }

    const setClause = Object.entries(data).map(([k, v]) => {
      if (v === null) return `\`${k}\` = NULL`;
      if (typeof v === 'object') return `\`${k}\` = '${JSON.stringify(v).replace(/'/g, "\\'")}'`;
      return `\`${k}\` = '${v}'`;
    }).join(', ');

    const sql = `UPDATE \`${this._table}\` SET ${setClause} WHERE ${this._filters.join(' AND ')}`;
    try {
      const [result] = await getPool().execute(sql);
      return { data: (result as mysql.ResultSetHeader).affectedRows, error: null };
    } catch (error) {
      console.error('MySQL update error:', error);
      return { data: null, error };
    }
  }

  /**
   * 删除数据
   */
  async delete() {
    if (this._filters.length === 0) {
      return { data: null, error: new Error('No where clause specified') };
    }

    const sql = `DELETE FROM \`${this._table}\` WHERE ${this._filters.join(' AND ')}`;
    try {
      const [result] = await getPool().execute(sql);
      return { data: (result as mysql.ResultSetHeader).affectedRows, error: null };
    } catch (error) {
      console.error('MySQL delete error:', error);
      return { data: null, error };
    }
  }

  /**
   * Upsert 操作
   */
  async upsert(data: Record<string, any>, config: { onConflict: string }) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const fields = keys.map(k => `\`${k}\``).join(', ');

    const updateKeys = keys.filter(k => k !== config.onConflict);
    const sql = `INSERT INTO \`${this._table}\` (${fields}) VALUES (${placeholders})
                 ON DUPLICATE KEY UPDATE ${updateKeys.map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(', ')}`;

    try {
      await getPool().execute(sql, values);
      return { data: [data], error: null };
    } catch (error) {
      console.error('MySQL upsert error:', error);
      return { data: null, error };
    }
  }

  /**
   * 统计数量
   */
  async count() {
    let sql = `SELECT COUNT(*) as count FROM \`${this._table}\``;

    if (this._filters.length > 0) {
      sql += ` WHERE ${this._filters.join(' AND ')}`;
    }

    try {
      const [rows] = await getPool().execute(sql);
      const dataArray = rows as any[];
      return { count: dataArray?.[0]?.count || 0, error: null };
    } catch (error) {
      console.error('MySQL count error:', error);
      return { count: 0, error };
    }
  }
}

// 导出单例数据库客户端
const db = new DatabaseClient();

// 添加 auth 属性到原型（使用普通赋值）
(db as any).auth = {
  getUser: async () => {
    return { data: { user: null }, error: { message: 'Auth not available in local mode' } };
  },
  signInWithPassword: async (credentials: { email: string; password: string }) => {
    return { data: { session: null, user: null }, error: { message: 'Auth not available in local mode' } };
  },
  signUp: async (credentials: { email: string; password: string; options?: any }) => {
    return { data: { session: null, user: null }, error: { message: 'Auth not available in local mode' } };
  },
  signOut: async () => {
    return { error: null };
  },
  setSession: async (session: any) => {
    return { error: null };
  },
};

export function getSupabaseClient(): DatabaseClient {
  return db;
}

export { db as supabase };
