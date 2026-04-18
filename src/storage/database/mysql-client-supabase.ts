/**
 * @fileoverview MySQL 数据库客户端配置
 * @description 用于 Supabase 兼容模式，提供统一的数据库操作接口
 * @module storage/database/mysql-client-supabase
 */

import { getMySQLPool, query, queryOne, insertAndGetId, update, remove } from './mysql-client';

/**
 * 兼容 Supabase 的客户端接口
 */
class MySQLClient {
  from(table: string) {
    return new TableQuery(table);
  }
}

class TableQuery {
  private table: string;
  private filters: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private orderByValue?: string;
  private selectFields = '*';

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  filter(field: string, value: any) {
    if (value === null) {
      this.filters.push(`\`${field}\` IS NULL`);
    } else if (typeof value === 'string' && value.includes('%')) {
      this.filters.push(`\`${field}\` LIKE '${value}'`);
    } else {
      this.filters.push(`\`${field}\` = '${value}'`);
    }
    return this;
  }

  eq(field: string, value: any) {
    if (value === null) {
      this.filters.push(`\`${field}\` IS NULL`);
    } else {
      this.filters.push(`\`${field}\` = '${value}'`);
    }
    return this;
  }

  neq(field: string, value: any) {
    if (value === null) {
      this.filters.push(`\`${field}\` IS NOT NULL`);
    } else {
      this.filters.push(`\`${field}\` <> '${value}'`);
    }
    return this;
  }

  gt(field: string, value: any) {
    this.filters.push(`\`${field}\` > '${value}'`);
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push(`\`${field}\` >= '${value}'`);
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push(`\`${field}\` < '${value}'`);
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push(`\`${field}\` <= '${value}'`);
    return this;
  }

  in(field: string, values: any[]) {
    if (values.length === 0) return this;
    const valuesStr = values.map(v => `'${v}'`).join(', ');
    this.filters.push(`\`${field}\` IN (${valuesStr})`);
    return this;
  }

  is(field: string, value: boolean | null) {
    if (value === null) {
      this.filters.push(`\`${field}\` IS NULL`);
    } else if (value === true) {
      this.filters.push(`\`${field}\` = 1`);
    } else {
      this.filters.push(`\`${field}\` = 0`);
    }
    return this;
  }

  like(field: string, value: string) {
    this.filters.push(`\`${field}\` LIKE '${value}'`);
    return this;
  }

  ilike(field: string, value: string) {
    this.filters.push(`LOWER(\`${field}\`) LIKE LOWER('${value}')`);
    return this;
  }

  or(conditions: string) {
    this.filters.push(`(${conditions})`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    const dir = options?.ascending === false ? 'DESC' : 'ASC';
    this.orderByValue = `\`${column}\` ${dir}`;
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  offset(count: number) {
    this.offsetValue = count;
    return this;
  }

  then(callback: any) {
    return this.execute().then(callback);
  }

  async execute(): Promise<{ data: any[]; error: any }> {
    let sql = `SELECT ${this.selectFields} FROM \`${this.table}\``;

    if (this.filters.length > 0) {
      sql += ` WHERE ${this.filters.join(' AND ')}`;
    }

    if (this.orderByValue) {
      sql += ` ORDER BY ${this.orderByValue}`;
    }

    if (this.limitValue) {
      sql += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue) {
      sql += ` OFFSET ${this.offsetValue}`;
    }

    const result = await query(sql);
    return { data: result.data, error: result.error };
  }

  async single(): Promise<{ data: any; error: any }> {
    this.limitValue = 1;
    const result = await this.execute();
    return { data: result.data?.[0] || null, error: result.error };
  }

  async insert(data: any) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => {
      if (v === null) return 'NULL';
      if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "\\'")}'`;
      return `'${String(v).replace(/'/g, "\\'")}'`;
    });

    const sql = `INSERT INTO \`${this.table}\` (\`${keys.join('`, `')}\`) VALUES (${values.join(', ')})`;

    const result = await insertAndGetId(this.table, data);
    return { data: result.id ? [{ id: result.id, ...data }] : null, error: result.error };
  }

  async upsert(data: any, { onConflict }: { onConflict: string }) {
    const keys = Object.keys(data);
    const values = Object.values(data).map(v => {
      if (v === null) return 'NULL';
      if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "\\'")}'`;
      return `'${String(v).replace(/'/g, "\\'")}'`;
    });

    const updateKeys = keys.filter(k => k !== onConflict);
    const sql = `INSERT INTO \`${this.table}\` (\`${keys.join('`, `')}\`) VALUES (${values.join(', ')})
                 ON DUPLICATE KEY UPDATE ${updateKeys.map(k => `\`${k}\` = VALUES(\`${k}\`)`).join(', ')}`;

    const pool = getMySQLPool();
    try {
      await pool.execute(sql);
      return { data: [data], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async update(data: any) {
    const whereIndex = this.filters.findIndex(f => !f.includes('IS NULL'));
    const whereClause = this.filters.join(' AND ');

    if (!whereClause) {
      return { data: null, error: new Error('No where clause specified') };
    }

    const sql = `UPDATE \`${this.table}\` SET ${Object.entries(data).map(([k, v]) => {
      if (v === null) return `\`${k}\` = NULL`;
      if (typeof v === 'object') return `\`${k}\` = '${JSON.stringify(v).replace(/'/g, "\\'")}'`;
      return `\`${k}\` = '${String(v).replace(/'/g, "\\'")}'`;
    }).join(', ')} WHERE ${whereClause}`;

    const pool = getMySQLPool();
    try {
      const [result] = await pool.execute(sql);
      return { data: (result as any).affectedRows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete() {
    const whereClause = this.filters.join(' AND ');

    if (!whereClause) {
      return { data: null, error: new Error('No where clause specified') };
    }

    const sql = `DELETE FROM \`${this.table}\` WHERE ${whereClause}`;

    const pool = getMySQLPool();
    try {
      const [result] = await pool.execute(sql);
      return { data: (result as any).affectedRows, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

/**
 * 获取 MySQL 客户端（兼容 Supabase API）
 */
export function getMySQLClient(): MySQLClient {
  return new MySQLClient();
}
