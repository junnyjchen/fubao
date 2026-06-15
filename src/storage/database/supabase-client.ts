/**
 * @fileoverview 内存 Mock 数据库客户端（兼容 Supabase API）
 * @description 提供与 Supabase 类似 API 的链式查询接口，基于内存 Mock 数据
 * @module storage/database/supabase-client
 */

import { query, queryOne, insert, update, remove, count } from '@/lib/db';

/**
 * 查询构建器 - 支持完整的 Supabase 链式 API，使用内存 Mock 数据
 * 所有返回类型使用 any 以兼容旧代码
 */
class QueryBuilder {
  private _table = '';
  private _selectFields = '*';
  private _whereParts: string[] = [];
  private _whereParams: unknown[] = [];
  private _limitValue?: number;
  private _offsetValue?: number;
  private _orderColumn?: string;
  private _orderAscending = true;
  private _mode: 'select' | 'insert' | 'update' | 'delete' | 'upsert' | 'count' = 'select';
  private _insertData: any[] = [];
  private _updateData: any = {};
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
    return this;
  }

  eq(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} = ?`);
    this._whereParams.push(value);
    return this;
  }

  neq(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} != ?`);
    this._whereParams.push(value);
    return this;
  }

  gt(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} > ?`);
    this._whereParams.push(value);
    return this;
  }

  gte(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} >= ?`);
    this._whereParams.push(value);
    return this;
  }

  lt(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} < ?`);
    this._whereParams.push(value);
    return this;
  }

  lte(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} <= ?`);
    this._whereParams.push(value);
    return this;
  }

  in(field: string, values: unknown[]): QueryBuilder {
    const placeholders = values.map(() => '?').join(', ');
    this._whereParts.push(`${field} IN (${placeholders})`);
    this._whereParams.push(...values);
    return this;
  }

  is(field: string, value: boolean | null): QueryBuilder {
    if (value === null) {
      this._whereParts.push(`${field} IS NULL`);
    } else if (value === true) {
      this._whereParts.push(`${field} = 1`);
    } else {
      this._whereParts.push(`${field} = 0`);
    }
    return this;
  }

  like(field: string, value: string): QueryBuilder {
    this._whereParts.push(`${field} LIKE ?`);
    this._whereParams.push(value);
    return this;
  }

  ilike(field: string, value: string): QueryBuilder {
    this._whereParts.push(`LOWER(${field}) LIKE LOWER(?)`);
    this._whereParams.push(value);
    return this;
  }

  or(_conditions: string): QueryBuilder {
    return this;
  }

  contains(field: string, value: unknown): QueryBuilder {
    this._whereParts.push(`${field} LIKE ?`);
    this._whereParams.push(`%${JSON.stringify(value)}%`);
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

  insert(data: any | any[]): QueryBuilder {
    this._mode = 'insert';
    this._insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: any): QueryBuilder {
    this._mode = 'update';
    this._updateData = data;
    return this;
  }

  delete(): QueryBuilder {
    this._mode = 'delete';
    return this;
  }

  upsert(data: any, _options?: { onConflict?: string }): QueryBuilder {
    this._mode = 'upsert';
    this._insertData = [data];
    return this;
  }

  async single(): Promise<{ data: any | null; error: any }> {
    this._limitValue = 1;
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    return { data: result.data?.[0] || null, error: null };
  }

  async maybeSingle(): Promise<{ data: any | null; error: any }> {
    this._limitValue = 1;
    const result = await this._execute();
    if (result.error) return { data: null, error: result.error };
    return { data: result.data?.[0] || null, error: null };
  }

  async head(): Promise<{ count: number; error: any }> {
    try {
      const whereClause = this._whereParts.join(' AND ');
      const cnt = await count(this._table, whereClause || undefined, this._whereParams.length > 0 ? this._whereParams : undefined);
      return { count: cnt, error: null };
    } catch (error) {
      return { count: 0, error };
    }
  }

  async execute(): Promise<{ data: any[] | null; error: any; count?: number }> {
    return this._execute();
  }

  then(
    onfulfilled?: ((value: any) => any) | null | undefined,
    onrejected?: ((reason: any) => any) | null | undefined
  ): Promise<any> {
    return this._execute().then(onfulfilled, onrejected);
  }

  private _buildSQL(mode: 'select' | 'count'): string {
    let sql: string;
    if (mode === 'count') {
      sql = `SELECT COUNT(*) as cnt FROM ${this._table}`;
    } else {
      sql = `SELECT ${this._selectFields} FROM ${this._table}`;
    }
    if (this._whereParts.length > 0) {
      sql += ` WHERE ${this._whereParts.join(' AND ')}`;
    }
    if (mode === 'select' && this._orderColumn) {
      sql += ` ORDER BY ${this._orderColumn} ${this._orderAscending ? 'ASC' : 'DESC'}`;
    }
    if (mode === 'select' && this._limitValue !== undefined) {
      sql += ` LIMIT ${this._limitValue}`;
    }
    if (mode === 'select' && this._offsetValue !== undefined) {
      sql += ` OFFSET ${this._offsetValue}`;
    }
    return sql;
  }

  private async _execute(): Promise<{ data: any[] | null; error: any; count?: number }> {
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
      console.error('Query error:', error);
      return { data: null, error };
    }
  }

  private async _executeSelect(): Promise<{ data: any[] | null; error: any; count?: number }> {
    const selectSQL = this._buildSQL('select');
    const rows = await query(selectSQL, this._whereParams);

    let countValue: number | undefined;
    if (this._countResult) {
      const countSQL = this._buildSQL('count');
      const countRows = await query(countSQL, this._whereParams);
      countValue = countRows[0]?.cnt || rows.length;
    }

    return { data: rows, error: null, ...(countValue !== undefined ? { count: countValue } : {}) };
  }

  private async _executeInsert(): Promise<{ data: any[] | null; error: any; count?: number }> {
    const results: any[] = [];
    for (const item of this._insertData) {
      const id = await insert(this._table, item);
      results.push({ id, ...item });
    }
    return { data: results, error: null };
  }

  private async _executeUpdate(): Promise<{ data: any[] | null; error: any; count?: number }> {
    if (this._whereParts.length === 0) {
      return { data: null, error: new Error('No where clause specified for update') };
    }

    const findSQL = this._buildSQL('select');
    const rows = await query(findSQL, this._whereParams);
    let affectedRows = 0;
    for (const row of rows) {
      await update(this._table, row.id, this._updateData);
      affectedRows++;
    }
    return { data: [{ affectedRows }], error: null };
  }

  private async _executeDelete(): Promise<{ data: any[] | null; error: any; count?: number }> {
    if (this._whereParts.length === 0) {
      return { data: null, error: new Error('No where clause specified for delete') };
    }

    const findSQL = this._buildSQL('select');
    const rows = await query(findSQL, this._whereParams);
    let affectedRows = 0;
    for (const row of rows) {
      await remove(this._table, row.id);
      affectedRows++;
    }
    return { data: [{ affectedRows }], error: null };
  }

  private async _executeUpsert(): Promise<{ data: any[] | null; error: any; count?: number }> {
    const item = this._insertData[0];
    if (!item) return { data: null, error: new Error('No data for upsert') };

    if (this._whereParts.length > 0) {
      const findSQL = this._buildSQL('select');
      const existing = await query(findSQL, this._whereParams);
      if (existing.length > 0) {
        await update(this._table, existing[0].id, item);
        return { data: [{ ...existing[0], ...item }], error: null };
      }
    }

    const id = await insert(this._table, item);
    return { data: [{ id, ...item }], error: null };
  }
}

/**
 * 数据库客户端类 - 兼容 Supabase API，基于内存 Mock 数据
 */
class DatabaseClient {
  from(table: string): QueryBuilder {
    return new QueryBuilder().from(table);
  }

  rpc(fn: string, _params?: any): Promise<{ data: any; error: any }> {
    return Promise.resolve({ data: null, error: { message: `RPC ${fn} not implemented` } });
  }

  auth = {
    getUser: async () => ({ data: { user: null }, error: { message: 'Auth not available in local mode' } }),
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: { message: 'Auth not available' } }),
    signUp: async () => ({ data: { session: null, user: null }, error: { message: 'Auth not available' } }),
    signOut: async () => ({ error: null }),
    setSession: async () => ({ error: null }),
  };

  storage = {
    from: (_bucket: string) => ({
      upload: async () => ({ data: null, error: { message: 'Storage not available' } }),
      download: async () => ({ data: null, error: { message: 'Storage not available' } }),
      remove: async () => ({ data: null, error: { message: 'Storage not available' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
      listBuckets: async () => ({ data: [], error: null }),
    }),
  };

  channel(_name: string) {
    return { on: () => ({ subscribe: () => {} }), subscribe: () => {} };
  }
}

const db = new DatabaseClient();

export function getSupabaseClient(): DatabaseClient {
  return db;
}

export { db as supabase, DatabaseClient };
