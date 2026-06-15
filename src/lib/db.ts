/**
 * @fileoverview 内存 Mock 数据库（替代 MySQL）
 * @description 提供统一的数据库访问，使用内存存储，支持完整 CRUD 和条件查询
 * @module lib/db
 */

// ========== 数据存储 ==========

const initialData: Record<string, any[]> = {
  users: [
    { id: 1, name: '測試用戶', email: 'test@example.com', phone: '13800138000', password: '0192023a7bbd73250516fbd9b0a1d64e', language: 'zh-TW', role: 'user', points: 100, status: 1, created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, name: '演示用戶', email: 'demo@example.com', phone: '13800138001', password: '0192023a7bbd73250516fbd9b0a1d64e', language: 'zh-TW', role: 'user', points: 50, status: 1, created_at: '2025-01-02T00:00:00.000Z', updated_at: '2025-01-02T00:00:00.000Z' }
  ],
  admins: [
    { id: 1, username: 'admin', password: '0192023a7bbd73250516fbd9b0a1d64e', nickname: '系統管理員', role_id: 1, status: 1, created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, username: 'editor', password: '0192023a7bbd73250516fbd9b0a1d64e', nickname: '內容編輯', role_id: 2, status: 1, created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' }
  ],
  admin_roles: [
    { id: 1, name: '超級管理員', code: 'super_admin', permissions: '["*"]', is_super: 1 },
    { id: 2, name: '內容編輯', code: 'editor', permissions: '["goods:read","goods:write","articles:read","articles:write"]', is_super: 0 }
  ],
  categories: [
    { id: 1, name: '符咒', slug: 'fuzhou', icon: '📜', parent_id: null, sort_order: 1, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, name: '法器', slug: 'faqi', icon: '🔮', parent_id: null, sort_order: 2, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 3, name: '供品', slug: 'gongpin', icon: '🏮', parent_id: null, sort_order: 3, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 4, name: '修行用品', slug: 'xiuxing', icon: '📿', parent_id: null, sort_order: 4, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 5, name: '風水擺件', slug: 'fengshui', icon: '🏔', parent_id: null, sort_order: 5, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 6, name: '開運飾品', slug: 'kaiyun', icon: '📿', parent_id: null, sort_order: 6, status: 1, created_at: '2025-01-01T00:00:00.000Z' }
  ],
  goods: [
    { id: 1, name: '太極護身符', subtitle: '道法自然·太極守護', main_image: '/images/products/taiji-fu.jpg', price: 99, original_price: 199, stock: 100, sales: 56, is_certified: 1, category_id: 1, merchant_id: 1, type: 1, purpose: '護身辟邪', status: 1, description: '由道長親手繪製的太極護身符，具有強大的辟邪護身功效。', created_at: '2025-01-15T00:00:00.000Z', updated_at: '2025-01-15T00:00:00.000Z' },
    { id: 2, name: '桃木劍·鎮宅法器', subtitle: '千年桃木·正氣凜然', main_image: '/images/products/peach-sword.jpg', price: 299, original_price: 499, stock: 50, sales: 23, is_certified: 1, category_id: 2, merchant_id: 1, type: 1, purpose: '鎮宅辟邪', status: 1, description: '選用千年桃木精雕而成，劍身刻有北斗七星符文，鎮宅辟邪之聖器。', created_at: '2025-01-16T00:00:00.000Z', updated_at: '2025-01-16T00:00:00.000Z' },
    { id: 3, name: '天然沉香線香', subtitle: '靜心修禪·品味天然', main_image: '/images/products/incense.jpg', price: 68, original_price: 128, stock: 200, sales: 89, is_certified: 0, category_id: 3, merchant_id: 1, type: 1, purpose: '靜心修行', status: 1, description: '產自越南的天然沉香線香，香氣清雅持久，適合靜坐冥想使用。', created_at: '2025-01-17T00:00:00.000Z', updated_at: '2025-01-17T00:00:00.000Z' },
    { id: 4, name: '紫檀佛珠手串', subtitle: '靈性紫檀·修心養性', main_image: '/images/products/bracelet.jpg', price: 158, original_price: 258, stock: 80, sales: 45, is_certified: 1, category_id: 4, merchant_id: 1, type: 1, purpose: '修心養性', status: 1, description: '精選印度老料紫檀，手工打磨拋光，每顆珠子都蘊含自然靈性。', created_at: '2025-01-18T00:00:00.000Z', updated_at: '2025-01-18T00:00:00.000Z' },
    { id: 5, name: '龍龜風水擺件', subtitle: '招財納福·鎮宅化煞', main_image: '/images/products/dragon-turtle.jpg', price: 388, original_price: 688, stock: 30, sales: 12, is_certified: 1, category_id: 5, merchant_id: 1, type: 1, purpose: '招財化煞', status: 1, description: '銅製龍龜擺件，龍龜為瑞獸，主招財化煞，適合辦公室或家中擺放。', created_at: '2025-01-19T00:00:00.000Z', updated_at: '2025-01-19T00:00:00.000Z' },
    { id: 6, name: '黑曜石觀音吊墜', subtitle: '天然黑曜石·觀音庇佑', main_image: '/images/products/obsidian.jpg', price: 128, original_price: 228, stock: 120, sales: 67, is_certified: 0, category_id: 6, merchant_id: 1, type: 1, purpose: '開運護身', status: 1, description: '天然黑曜石精雕觀音像，黑曜石具有強大的辟邪化煞能力。', created_at: '2025-01-20T00:00:00.000Z', updated_at: '2025-01-20T00:00:00.000Z' }
  ],
  merchants: [
    { id: 1, name: '符寶網官方旗艦店', type: 'enterprise', contact_name: '陳道長', contact_phone: '13800138000', contact_email: 'shop@fubao.com', description: '符寶網官方旗艦店，提供正宗道門法器與符咒', address: '台北市松山區八德路四段', license_number: 'FUBAO-001', verified: 1, status: 1, user_id: 1, password: 'admin123', created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' }
  ],
  merchant_applications: [],
  banners: [
    { id: 1, title: '新春特惠', image: '/images/banners/spring.jpg', link: '/shop', sort_order: 1, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, title: '道法自然', image: '/images/banners/dao.jpg', link: '/baike', sort_order: 2, status: 1, created_at: '2025-01-01T00:00:00.000Z' }
  ],
  news: [],
  news_categories: [],
  settings: [
    { id: 1, key: 'site_name', value: '符寶網' },
    { id: 2, key: 'site_description', value: '全球玄門文化科普交易平台' },
    { id: 3, key: 'contact_email', value: 'contact@fubao.com' }
  ],
  cart: [],
  orders: [],
  order_items: [],
  addresses: [],
  free_gifts: [],
  wiki_categories: [],
  wiki_articles: [],
  video_categories: [],
  videos: [],
  favorites: [],
  points_log: [],
  refunds: [],
  logistics: [],
  coupons: [],
  user_coupons: [],
  notifications: []
};

let nextIds: Record<string, number> = {};
// 初始化 nextIds
for (const [table, rows] of Object.entries(initialData)) {
  nextIds[table] = rows.length > 0 ? Math.max(...rows.map((r: any) => r.id || 0)) + 1 : 1;
}

// 使用 globalThis 保持数据一致性（热更新不丢失）
if (typeof globalThis !== 'undefined') {
  (globalThis as any).__mockData = (globalThis as any).__mockData || initialData;
  (globalThis as any).__nextIds = (globalThis as any).__nextIds || nextIds;
}

const getData = (): Record<string, any[]> => (globalThis as any).__mockData || initialData;
const getIds = (): Record<string, number> => (globalThis as any).__nextIds || nextIds;

// ========== SQL 简易解析工具 ==========

/** 从 SQL 中提取表别名映射，如 `goods g` → { g: 'goods' } */
function parseTableAliases(sql: string): Record<string, string> {
  const aliases: Record<string, string> = {};
  // 匹配 FROM/JOIN 后的 table [alias]
  const regex = /(?:FROM|JOIN)\s+`?(\w+)`?\s+(?:AS\s+)?(\w+)/gi;
  let m;
  while ((m = regex.exec(sql)) !== null) {
    aliases[m[2]] = m[1];
  }
  return aliases;
}

/** 获取主表名 */
function getMainTable(sql: string): string | null {
  const m = sql.match(/FROM\s+`?(\w+)`?(?:\s+(?:AS\s+)?\w+)?/i);
  return m ? m[1] : null;
}

/** 将带别名的字段名转为真实字段名，如 g.name → name (如果 g = goods) */
function stripAlias(field: string, aliases: Record<string, string>): string {
  const dotMatch = field.match(/^(\w+)\.(\w+)$/);
  if (dotMatch) {
    const alias = dotMatch[1];
    if (aliases[alias]) return dotMatch[2]; // 是表别名，去掉
  }
  return field;
}

/** 解析 SQL WHERE 子句中的简单条件 */
interface WhereCondition {
  field: string;
  operator: string;
  paramIndex: number;
  logic?: 'AND' | 'OR';
}

function parseWhereClause(sql: string): { conditions: WhereCondition[]; havingLike?: { field: string; patternIdx: number } } {
  const conditions: WhereCondition[] = [];
  const havingLike = { field: '', patternIdx: -1 };

  // 找到 WHERE 子句
  const whereMatch = sql.match(/\bWHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s+GROUP|\s+HAVING|$)/i);
  if (!whereMatch) return { conditions, havingLike };

  const whereStr = whereMatch[1];

  // 解析 LIKE 条件
  const likeMatches = [...whereStr.matchAll(/(\w+(?:\.\w+)?)\s+LIKE\s+\?/gi)];
  for (const lm of likeMatches) {
    havingLike.field = lm[1];
    // 计算 ? 的位置
    const beforeLike = whereStr.substring(0, lm.index);
    const paramCount = (beforeLike.match(/\?/g) || []).length;
    havingLike.patternIdx = paramCount;
  }

  // 解析 = 条件
  const eqMatches = [...whereStr.matchAll(/(\w+(?:\.\w+)?)\s*(?:=|!=|<|>|<=|>=)\s*\?/gi)];
  let paramIdx = 0;
  for (const eq of eqMatches) {
    // 计算当前条件之前有多少个 ?
    const beforeEq = whereStr.substring(0, eq.index);
    const currentParamIdx = (beforeEq.match(/\?/g) || []).length;
    conditions.push({
      field: eq[1],
      operator: eq[0].includes('!=') ? '!=' : eq[0].includes('>=') ? '>=' : eq[0].includes('<=') ? '<=' : eq[0].includes('>') ? '>' : eq[0].includes('<') ? '<' : '=',
      paramIndex: currentParamIdx
    });
  }

  return { conditions, havingLike };
}

/** 检查记录是否匹配条件 */
function matchesConditions(
  record: Record<string, any>,
  conditions: WhereCondition[],
  likeCondition: { field: string; patternIdx: number },
  params: unknown[],
  aliases: Record<string, string>
): boolean {
  // 检查等值条件
  for (const cond of conditions) {
    const field = stripAlias(cond.field, aliases);
    const value = params[cond.paramIndex];
    const recordValue = record[field];

    switch (cond.operator) {
      case '=':
        if (recordValue != value) return false;
        break;
      case '!=':
        if (recordValue == value) return false;
        break;
      case '>':
        if (!(Number(recordValue) > Number(value))) return false;
        break;
      case '<':
        if (!(Number(recordValue) < Number(value))) return false;
        break;
      case '>=':
        if (!(Number(recordValue) >= Number(value))) return false;
        break;
      case '<=':
        if (!(Number(recordValue) <= Number(value))) return false;
        break;
    }
  }

  // 检查 LIKE 条件
  if (likeCondition.field && likeCondition.patternIdx >= 0) {
    const field = stripAlias(likeCondition.field, aliases);
    const pattern = String(params[likeCondition.patternIdx] || '');
    const recordValue = String(record[field] || '');
    // 将 SQL LIKE 模式转为正则: %xxx% → .*xxx.*
    const regexStr = pattern.replace(/%/g, '.*').replace(/_/g, '.');
    if (!new RegExp(regexStr, 'i').test(recordValue)) return false;
  }

  return true;
}

// ========== 核心 API ==========

/**
 * 执行 SQL 查询（支持 SELECT with WHERE/ORDER BY/LIMIT/OFFSET）
 */
export async function query<T = any>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const sqlLower = sql.toLowerCase().trim();

  if (!sqlLower.startsWith('select')) {
    return [] as T[];
  }

  const tableName = getMainTable(sql);
  if (!tableName) return [] as T[];

  const data = getData()[tableName] || [];
  const aliases = parseTableAliases(sql);
  const { conditions, havingLike } = parseWhereClause(sql);
  const hasJoin = /\bJOIN\b/i.test(sql);

  // 过滤
  let filtered = data.filter((record: any) =>
    matchesConditions(record, conditions, havingLike, params, aliases)
  );

  // 处理 LEFT JOIN：对商品查询添加 category_name
  if (hasJoin && /categories/i.test(sql)) {
    const catData = getData()['categories'] || [];
    filtered = filtered.map((record: any) => {
      const cat = catData.find((c: any) => c.id === record.category_id);
      return { ...record, category_name: cat?.name || null };
    });
  }

  // 排序
  const orderMatch = sql.match(/ORDER\s+BY\s+(\w+(?:\.\w+)?)\s*(ASC|DESC)?/i);
  if (orderMatch) {
    const orderField = stripAlias(orderMatch[1], aliases);
    const orderDir = (orderMatch[2] || 'ASC').toUpperCase();
    filtered.sort((a: any, b: any) => {
      const va = a[orderField];
      const vb = b[orderField];
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return orderDir === 'DESC' ? -cmp : cmp;
    });
  }

  // 分页
  const limitMatch = sql.match(/LIMIT\s+\?\s*OFFSET\s+\?/i) || sql.match(/LIMIT\s+(\d+)\s+OFFSET\s+(\d+)/i);
  if (limitMatch) {
    let limit: number, offset: number;
    if (limitMatch[0].includes('?')) {
      // 参数化: LIMIT ? OFFSET ?
      // 计算 LIMIT 的 ? 位置
      const beforeLimit = sql.substring(0, sql.toLowerCase().indexOf('limit'));
      const baseParamCount = (beforeLimit.match(/\?/g) || []).length;
      limit = Number(params[baseParamCount]) || 20;
      offset = Number(params[baseParamCount + 1]) || 0;
    } else {
      limit = parseInt(limitMatch[1]);
      offset = parseInt(limitMatch[2]);
    }
    filtered = filtered.slice(offset, offset + limit);
  }

  return filtered as T[];
}

/**
 * 查询单条记录
 */
export async function queryOne<T = any>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results[0] || null;
}

/**
 * 插入记录
 */
export async function insert(
  table: string,
  data: Record<string, any>
): Promise<number> {
  const ids = getIds();
  const id = ids[table] || 1;
  ids[table] = id + 1;

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const newRecord = { id, ...data, created_at: data.created_at || now, updated_at: now };
  const mockData = getData();

  if (!mockData[table]) {
    mockData[table] = [];
  }
  mockData[table].push(newRecord);

  console.log('[Mock DB] Insert into', table, 'id:', id);
  return id;
}

/**
 * 更新记录
 * 支持两种调用方式：
 * 1. update(table, data, whereObj) - 按条件更新
 * 2. update(table, id, data) - 按ID更新
 */
export async function update(
  table: string,
  dataOrId: Record<string, any> | number,
  whereOrData: Record<string, any>
): Promise<number> {
  const mockData = getData();
  const tableData = mockData[table] || [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  let updateCount = 0;

  if (typeof dataOrId === 'number') {
    // 模式2: update(table, id, data)
    const id = dataOrId;
    const data = whereOrData;
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i].id === id) {
        tableData[i] = { ...tableData[i], ...data, updated_at: now };
        updateCount++;
        break;
      }
    }
  } else {
    // 模式1: update(table, data, where)
    const data = dataOrId;
    const where = whereOrData;
    for (let i = 0; i < tableData.length; i++) {
      let match = true;
      for (const [key, value] of Object.entries(where)) {
        if (tableData[i][key] !== value) {
          match = false;
          break;
        }
      }
      if (match) {
        tableData[i] = { ...tableData[i], ...data, updated_at: now };
        updateCount++;
      }
    }
  }

  console.log('[Mock DB] Update', table, 'count:', updateCount);
  return updateCount;
}

/**
 * 删除记录
 */
export async function remove(
  table: string,
  where: Record<string, unknown>
): Promise<number> {
  const mockData = getData();
  const tableData = mockData[table] || [];
  const initialLength = tableData.length;

  mockData[table] = tableData.filter((item: any) => {
    for (const [key, value] of Object.entries(where)) {
      if (item[key] !== value) {
        return true; // 不匹配的条件，保留
      }
    }
    return false; // 所有条件都匹配，删除
  });

  const count = initialLength - mockData[table].length;
  console.log('[Mock DB] Remove', table, 'where:', where, 'count:', count);
  return count;
}

/**
 * 统计记录数
 */
export async function count(
  tableOrSql: string,
  where?: string,
  params?: unknown[]
): Promise<number> {
  const mockData = getData();

  // 如果是完整的 SQL（以 SELECT 开头）
  if (tableOrSql.toLowerCase().trim().startsWith('select')) {
    const tableName = getMainTable(tableOrSql);
    if (!tableName) return 0;
    const data = mockData[tableName] || [];
    if (!where) return data.length;
    // 简单处理：如果有 WHERE 条件，按条件过滤
    const { conditions, havingLike } = parseWhereClause(tableOrSql);
    const aliases = parseTableAliases(tableOrSql);
    return data.filter((record: any) =>
      matchesConditions(record, conditions, havingLike, params || [], aliases)
    ).length;
  }

  // 如果只是表名
  const tableName = tableOrSql.split(/\s+/)[0]; // 去掉别名
  const data = mockData[tableName] || [];
  if (!where || where === '1=1' || typeof where !== 'string') return data.length;

  // 尝试解析条件
  const conditions: WhereCondition[] = [];
  const eqMatches = [...where.matchAll(/(\w+(?:\.\w+)?)\s*(?:=|!=|<|>|<=|>=)\s*\?/gi)];
  let paramIdx = 0;
  for (const eq of eqMatches) {
    const beforeEq = where.substring(0, eq.index);
    const currentParamIdx = (beforeEq.match(/\?/g) || []).length;
    conditions.push({
      field: eq[1],
      operator: eq[0].includes('!=') ? '!=' : '=',
      paramIndex: currentParamIdx
    });
  }

  return data.filter((record: any) =>
    matchesConditions(record, conditions, { field: '', patternIdx: -1 }, params || [], {})
  ).length;
}

// 保持向后兼容的 getPool
export function getPool() {
  return {
    execute: async () => {
      throw new Error('MySQL not available, using mock mode');
    }
  } as any;
}
