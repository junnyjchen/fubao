/**
 * @fileoverview 内存 Mock 数据库（替代 MySQL）
 * @description 提供统一的数据库访问，使用内存存储
 * @module lib/db
 */

// 内存数据存储
const mockData: Record<string, any[]> = {
  users: [
    { id: 1, name: '測試用戶', email: 'test@example.com', phone: '13800138000', password: '0192023a7bbd73250516fbd9b0a1d64e', language: 'zh-TW', role: 'user', points: 100, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  admins: [
    { id: 1, username: 'admin', password: '0192023a7bbd73250516fbd9b0a1d64e', nickname: '系统管理员', role_id: 1, status: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ],
  admin_roles: [
    { id: 1, name: '超级管理员', code: 'super_admin', permissions: '["*"]', is_super: 1 }
  ],
  categories: [
    { id: 1, name: '符咒', slug: 'fuzhou', icon: '📜', parent_id: null, sort_order: 1, status: 1 },
    { id: 2, name: '法器', slug: 'faqi', icon: '🔮', parent_id: null, sort_order: 2, status: 1 },
    { id: 3, name: '供品', slug: 'gongpin', icon: '🏮', parent_id: null, sort_order: 3, status: 1 },
    { id: 4, name: '修行用品', slug: 'xiuxing', icon: '📿', parent_id: null, sort_order: 4, status: 1 },
    { id: 5, name: '風水擺件', slug: 'fengshui', icon: '🏔', parent_id: null, sort_order: 5, status: 1 },
    { id: 6, name: '開運飾品', slug: 'kaiyun', icon: '📿', parent_id: null, sort_order: 6, status: 1 }
  ],
  goods: [],
  merchants: [
    { id: 1, name: '符寶網官方', description: '符寶網官方旗艦店', status: 1 }
  ],
  banners: [],
  news: [],
  settings: [
    { id: 1, key: 'site_name', value: '符寶網' },
    { id: 2, key: 'site_description', value: '全球玄門文化科普交易平台' }
  ],
  cart: [],
  orders: [],
  order_items: [],
  addresses: [],
  free_gifts: [],
  news_categories: [],
  wiki_categories: [],
  wiki_articles: [],
  video_categories: [],
  videos: []
};

let nextIds: Record<string, number> = {
  users: 2,
  admins: 2,
  goods: 1,
  orders: 1,
  cart: 1
};

// 使用 globalThis 保持数据一致性
if (typeof globalThis !== 'undefined') {
  (globalThis as any).mockData = (globalThis as any).mockData || mockData;
  (globalThis as any).nextIds = (globalThis as any).nextIds || nextIds;
}

const getMockData = () => (globalThis as any).mockData || mockData;
const getNextIds = () => (globalThis as any).nextIds || nextIds;

// Mock 实现
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  console.log('[Mock DB] Query:', sql.substring(0, 100));
  
  // 简单的 SELECT 查询解析
  const sqlLower = sql.toLowerCase();
  
  if (sqlLower.includes('select')) {
    // 简单的表名提取
    const tableMatch = sql.match(/FROM\s+`?(\w+)`?/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const data = getMockData()[tableName] || [];
      return [...data] as T[];
    }
  }
  
  return [];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}

export async function insert(
  table: string,
  data: Record<string, unknown>
): Promise<number> {
  const ids = getNextIds();
  const id = ids[table] || 1;
  ids[table] = id + 1;
  
  const newRecord = { id, ...data, created_at: new Date().toISOString() };
  const mockData = getMockData();
  
  if (!mockData[table]) {
    mockData[table] = [];
  }
  mockData[table].push(newRecord);
  
  console.log('[Mock DB] Insert into', table, 'id:', id);
  return id;
}

export async function update(
  table: string,
  data: Record<string, unknown>,
  where: Record<string, unknown>
): Promise<number> {
  const mockData = getMockData();
  const tableData = mockData[table] || [];
  let count = 0;
  
  for (let i = 0; i < tableData.length; i++) {
    let match = true;
    for (const [key, value] of Object.entries(where)) {
      if (tableData[i][key] !== value) {
        match = false;
        break;
      }
    }
    if (match) {
      tableData[i] = { ...tableData[i], ...data, updated_at: new Date().toISOString() };
      count++;
    }
  }
  
  console.log('[Mock DB] Update', table, 'count:', count);
  return count;
}

export async function remove(
  table: string,
  where: Record<string, unknown>
): Promise<number> {
  const mockData = getMockData();
  const tableData = mockData[table] || [];
  const initialLength = tableData.length;
  
  mockData[table] = tableData.filter((item: any) => {
    for (const [key, value] of Object.entries(where)) {
      if (item[key] !== value) {
        return true;
      }
    }
    return false;
  });
  
  const count = initialLength - mockData[table].length;
  console.log('[Mock DB] Remove', table, 'count:', count);
  return count;
}

export async function count(
  table: string,
  where?: string,
  params?: unknown[]
): Promise<number> {
  const mockData = getMockData();
  return (mockData[table] || []).length;
}

// 保持向后兼容的 getPool
export function getPool() {
  return {
    execute: async () => { 
      throw new Error('MySQL not available, using mock mode');
    }
  } as any;
}
