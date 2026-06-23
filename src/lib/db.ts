/**
 * @fileoverview 數據庫訪問層 — MySQL 優先 + Mock DB 降級
 * @description 當 MySQL 環境變量已配置時，自動使用真實 MySQL 數據庫；
 *              否則降級到內存 Mock DB（帶文件持久化）。
 *              對外 API 完全一致，業務代碼無需修改。
 * @module lib/db
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getPool as getMysqlPool, isMySQLEnabled, mysqlQuery, mysqlExecute, mysqlQueryOne } from './mysql';

// MySQL 可用性：初始值 + 运行时降级
let _mysqlAvailable = isMySQLEnabled();
const MYSQL_FLAG = isMySQLEnabled(); // 环境变量是否配置了MySQL

/** MySQL查询失败时自动降级到Mock DB */
function onMySqlError(err: any): void {
  if (_mysqlAvailable) {
    console.warn('[DB] MySQL 查询失败，降级到 Mock DB:', err?.code || err?.message || err);
    _mysqlAvailable = false;
    // 5秒后重试MySQL（可能是临时断连）
    setTimeout(() => { _mysqlAvailable = MYSQL_FLAG; }, 5000);
  }
}

/** 检查当前是否应该使用MySQL */
function shouldUseMysql(): boolean {
  return _mysqlAvailable;
}

// ========== 持久化配置 ==========
// 优先使用项目目录，Docker 内无权限时降级到 /tmp
function resolveDataDir(): string {
  const base = process.env.COZE_WORKSPACE_PATH || '/workspace/projects';
  const preferred = join(base, '.db-data');
  try {
    if (!existsSync(preferred)) mkdirSync(preferred, { recursive: true });
    // 测试写权限
    const testFile = join(preferred, '.write-test');
    writeFileSync(testFile, '1', 'utf8');
    const { unlinkSync } = require('fs');
    unlinkSync(testFile);
    return preferred;
  } catch {
    console.warn(`[Mock DB] 路径 ${preferred} 不可写，降级到 /tmp`);
    const fallback = '/tmp/.db-data';
    try {
      if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true });
    } catch {
      // 完全无法持久化，纯内存模式
    }
    return fallback;
  }
}
const DATA_DIR = resolveDataDir();
const DATA_FILE = join(DATA_DIR, 'mock-db.json');
const SAVE_INTERVAL = 3000; // 3秒防抖保存

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
    { id: 1, name: '符寶網官方旗艦店', type: 'enterprise', contact_name: '陳道長', contact_phone: '13800138000', contact_email: 'shop@fubao.com', description: '符寶網官方旗艦店，提供正宗道門法器與符咒', address: '台北市松山區八德路四段', license_number: 'FUBAO-001', verified: 1, status: 1, user_id: 1, login_account: 'fubao_admin', login_password: 'admin123', created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' }
  ],
  merchant_applications: [],
  banners: [
    { id: 1, title: '新春特惠', image: '/images/banners/spring.jpg', link: '/shop', sort_order: 1, status: 1, created_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, title: '道法自然', image: '/images/banners/dao.jpg', link: '/baike', sort_order: 2, status: 1, created_at: '2025-01-01T00:00:00.000Z' }
  ],
  news: [],
  news_categories: [],
  settings: [
    { id: 1, key: 'site_name', value: '符寶網', group_name: 'basic' },
    { id: 2, key: 'site_description', value: '全球玄門文化科普交易平台', group_name: 'basic' },
    { id: 3, key: 'contact_email', value: 'contact@fubao.com', group_name: 'basic' }
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
  browse_history: [],
  points_log: [],
  refunds: [],
  logistics: [],
  coupons: [],
  user_coupons: [],
  reviews: [],
  user_signins: [],
  invoices: [],
  recharges: [],
  points: [],
  announcements: [],
  certificates: [],
  withdrawals: [],
  notifications: [],
  ai_knowledge: [
    { id: 1, title: '道教符咒基础知识', content: '符咒是道教法术的重要组成部分，是道士沟通天地、驱邪镇煞的重要工具。符咒由符文和咒语组成，符文是用朱砂或墨汁书写的特定图形和文字，咒语是配合符文使用的口诀。', category: 'fulu', source_type: 'manual', source_url: '', tags: '["符咒","道教","基础"]', status: 'active', created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, title: '开光仪式流程', content: '开光是一种宗教仪式，通过特定的法事程序，赋予法器灵性和法力。开光仪式一般包括：净坛、请神、加持、封符等步骤。', category: 'ceremony', source_type: 'manual', source_url: '', tags: '["开光","仪式","法器"]', status: 'active', created_at: '2025-01-02T00:00:00.000Z', updated_at: '2025-01-02T00:00:00.000Z' },
    { id: 3, title: '风水基础知识', content: '风水是中国传统文化的重要组成部分，讲究人与自然环境的和谐。风水学主要包括阳宅风水和阴宅风水两大类。', category: 'fengshui', source_type: 'manual', source_url: '', tags: '["风水","基础","环境"]', status: 'active', created_at: '2025-01-03T00:00:00.000Z', updated_at: '2025-01-03T00:00:00.000Z' }
  ],
  ai_qa: [
    { id: 1, question: '什么是符咒？', answer: '符咒是道教法术的重要组成部分，由符文和咒语组成，用于沟通天地、驱邪镇煞。', category: 'fulu', knowledge_id: 1, keywords: '["符咒","道教"]', is_active: true, created_at: '2025-01-01T00:00:00.000Z', updated_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, question: '开光是什么意思？', answer: '开光是一种宗教仪式，通过特定法事程序赋予法器灵性和法力，包括净坛、请神、加持、封符等步骤。', category: 'ceremony', knowledge_id: 2, keywords: '["开光","仪式"]', is_active: true, created_at: '2025-01-02T00:00:00.000Z', updated_at: '2025-01-02T00:00:00.000Z' }
  ],
  ai_training_tasks: [],
  ai_model_configs: [],
  baike_articles: [
    { id: 1, title: '符咒入門', slug: 'fuzhou-intro', category: '符咒', cover_image: '', content: '<h2>什麼是符咒</h2><p>符咒是道教法術的重要組成部分，是溝通天地、驅邪鎮煞的靈力載體。符為書寫的圖文，咒為口誦的密言，二者相輔相成。</p><h2>符咒的種類</h2><p>常見的符咒種類包括：鎮宅符、平安符、招財符、姻緣符、文昌符等。</p>', sort_order: 1, status: 1, views: 1256, created_at: '2025-01-10T00:00:00.000Z', updated_at: '2025-01-10T00:00:00.000Z' },
    { id: 2, title: '八卦基礎知識', slug: 'bagua-basics', category: '易經', cover_image: '', content: '<h2>八卦簡介</h2><p>八卦是《易經》的基本概念，由陽爻（—）和陰爻（--）組合而成，共八種基本圖形。乾、坤、震、巽、坎、離、艮、兌，分別代表天、地、雷、風、水、火、山、澤八種自然現象。</p>', sort_order: 2, status: 1, views: 980, created_at: '2025-01-11T00:00:00.000Z', updated_at: '2025-01-11T00:00:00.000Z' },
    { id: 3, title: '風水堪輿概論', slug: 'fengshui-intro', category: '風水', cover_image: '', content: '<h2>風水的起源</h2><p>風水，又稱堪輿，是中國古代的環境哲學。其核心思想是通過觀察自然環境的山水形勢，選擇最適合人類居住和活動的空間。</p>', sort_order: 3, status: 1, views: 856, created_at: '2025-01-12T00:00:00.000Z', updated_at: '2025-01-12T00:00:00.000Z' },
    { id: 4, title: '五行生剋原理', slug: 'wuxing-theory', category: '命理', cover_image: '', content: '<h2>五行學說</h2><p>五行即金、木、水、火、土，是中國古代哲學對宇宙萬物構成的基本分類。五行之間存在相生相剋的關係，構成了一個動態平衡的系統。</p><h2>相生關係</h2><p>木生火、火生土、土生金、金生水、水生木</p><h2>相剋關係</h2><p>木剋土、土剋水、水剋火、火剋金、金剋木</p>', sort_order: 4, status: 1, views: 742, created_at: '2025-01-13T00:00:00.000Z', updated_at: '2025-01-13T00:00:00.000Z' },
  ],
  goods_i18n: [
    { id: 1, goods_id: 1, locale: 'en', name: 'Tai Chi Amulet', subtitle: 'Dao follows nature·Tai Chi Guardian', description: 'A Tai Chi amulet hand-drawn by a Taoist priest, with powerful evil-warding and protective effects.', created_at: '2025-01-15T00:00:00.000Z', updated_at: '2025-01-15T00:00:00.000Z' },
    { id: 2, goods_id: 1, locale: 'ja', name: '太極護身符', subtitle: '道法自然·太極守護', description: '道士が手書きした太極護身符、強力な厄除け護身の効能があります。', created_at: '2025-01-15T00:00:00.000Z', updated_at: '2025-01-15T00:00:00.000Z' },
    { id: 3, goods_id: 2, locale: 'en', name: 'Peach Wood Sword', subtitle: 'Millennium Peach Wood·Righteous Spirit', description: 'Crafted from millennium-old peach wood, the sword body is engraved with Big Dipper talisman runes, a sacred item for home protection.', created_at: '2025-01-16T00:00:00.000Z', updated_at: '2025-01-16T00:00:00.000Z' },
    { id: 4, goods_id: 2, locale: 'ja', name: '桃木剣·鎮宅法器', subtitle: '千年桃木·正気凛然', description: '千年の桃木から精巧に彫刻され、剣身に北斗七星の符文が刻まれています。家を守る聖器。', created_at: '2025-01-16T00:00:00.000Z', updated_at: '2025-01-16T00:00:00.000Z' },
    { id: 5, goods_id: 3, locale: 'en', name: 'Natural Agarwood Incense', subtitle: 'Meditation·Natural Fragrance', description: 'Natural agarwood incense from Vietnam, with an elegant and long-lasting aroma, suitable for meditation.', created_at: '2025-01-17T00:00:00.000Z', updated_at: '2025-01-17T00:00:00.000Z' },
    { id: 6, goods_id: 3, locale: 'ja', name: '天然沈香線香', subtitle: '静心修禅·天然の香り', description: 'ベトナム産の天然沈香線香、香りは清雅で長持ちし、座禅瞑想に適しています。', created_at: '2025-01-17T00:00:00.000Z', updated_at: '2025-01-17T00:00:00.000Z' },
  ],
  categories_i18n: [
    { id: 1, category_id: 1, locale: 'en', name: 'Talismans', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 2, category_id: 1, locale: 'ja', name: '符咒', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 3, category_id: 2, locale: 'en', name: 'Ritual Items', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 4, category_id: 2, locale: 'ja', name: '法器', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 5, category_id: 3, locale: 'en', name: 'Offerings', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 6, category_id: 3, locale: 'ja', name: '供品', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 7, category_id: 4, locale: 'en', name: 'Cultivation Supplies', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 8, category_id: 4, locale: 'ja', name: '修行用品', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 9, category_id: 5, locale: 'en', name: 'Feng Shui Decor', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 10, category_id: 5, locale: 'ja', name: '風水擺件', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 11, category_id: 6, locale: 'en', name: 'Lucky Accessories', created_at: '2025-01-01T00:00:00.000Z' },
    { id: 12, category_id: 6, locale: 'ja', name: '開運飾品', created_at: '2025-01-01T00:00:00.000Z' },
  ],
  // ========== 商品 SKU 系统 ==========
  goods_skus: [] as any[],
  goods_specs: [] as any[],
  // ========== 商家评分 ==========
  merchant_reviews: [] as any[],
  // ========== 多币种 ==========
  currencies: [
    { id: 1, code: 'TWD', name: '新台幣', symbol: 'NT$', rate: 1.00, is_default: 1, status: 1, created_at: new Date().toISOString() },
    { id: 2, code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.031, is_default: 0, status: 1, created_at: new Date().toISOString() },
    { id: 3, code: 'CNY', name: '人民幣', symbol: '¥', rate: 0.22, is_default: 0, status: 1, created_at: new Date().toISOString() },
    { id: 4, code: 'JPY', name: '日本円', symbol: '¥', rate: 4.70, is_default: 0, status: 1, created_at: new Date().toISOString() },
    { id: 5, code: 'EUR', name: 'Euro', symbol: '€', rate: 0.029, is_default: 0, status: 1, created_at: new Date().toISOString() },
    { id: 6, code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 0.042, is_default: 0, status: 1, created_at: new Date().toISOString() },
    { id: 7, code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', rate: 0.15, is_default: 0, status: 1, created_at: new Date().toISOString() },
    { id: 8, code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 1.12, is_default: 0, status: 1, created_at: new Date().toISOString() },
  ],
  goods_prices: [] as any[],
};

let nextIds: Record<string, number> = {};
// 初始化 nextIds
for (const [table, rows] of Object.entries(initialData)) {
  nextIds[table] = rows.length > 0 ? Math.max(...rows.map((r: any) => r.id || 0)) + 1 : 1;
}

// ========== 文件持久化 ==========

/** 从 JSON 文件加载数据（启动时调用） */
function loadPersistedData(): { data: Record<string, any[]>; ids: Record<string, number> } | null {
  try {
    if (!existsSync(DATA_FILE)) return null;
    const raw = readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && parsed.data && parsed.ids) {
      console.log('[Mock DB] 從持久化文件恢復數據，共', Object.keys(parsed.data).length, '張表');
      return parsed as { data: Record<string, any[]>; ids: Record<string, number> };
    }
  } catch (e) {
    console.error('[Mock DB] 讀取持久化文件失敗，使用初始數據:', e);
  }
  return null;
}

/** 将数据保存到 JSON 文件 */
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let hasPendingChanges = false;

function persistToDisk() {
  try {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    const data = getData();
    const ids = getIds();
    writeFileSync(DATA_FILE, JSON.stringify({ data, ids }, null, 2), 'utf-8');
    hasPendingChanges = false;
  } catch (e) {
    console.error('[Mock DB] 持久化數據失敗:', e);
  }
}

/** 标记数据变更，防抖保存 */
export function markDirty() {
  hasPendingChanges = true;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (hasPendingChanges) persistToDisk();
    saveTimer = null;
  }, SAVE_INTERVAL);
}

/** 立即保存（用于进程退出前） */
export function flushPersist() {
  if (saveTimer) clearTimeout(saveTimer);
  if (hasPendingChanges) persistToDisk();
}

// 进程退出前保存
if (typeof process !== 'undefined') {
  const exitHandler = () => flushPersist();
  process.on('SIGTERM', exitHandler);
  process.on('SIGINT', exitHandler);
  process.on('beforeExit', exitHandler);
}

// 使用 globalThis 保持数据一致性（热更新不丢失），优先从文件恢复
const persisted = loadPersistedData();
if (typeof globalThis !== 'undefined') {
  if (persisted) {
    // 合并：持久化数据为主，新增的表用初始数据补充
    const merged = { ...initialData };
    for (const [table, rows] of Object.entries(persisted.data)) {
      merged[table] = rows;
    }
    (globalThis as any).__mockData = merged;
    (globalThis as any).__nextIds = persisted.ids;
  } else {
    (globalThis as any).__mockData = (globalThis as any).__mockData || initialData;
    (globalThis as any).__nextIds = (globalThis as any).__nextIds || nextIds;
    // 首次启动，保存初始数据
    setTimeout(() => persistToDisk(), 1000);
  }
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
  const cleanField = field.replace(/`/g, '');
  const dotMatch = cleanField.match(/^(\w+)\.(\w+)$/);
  if (dotMatch) {
    const alias = dotMatch[1];
    if (aliases[alias]) return dotMatch[2]; // 是表别名，去掉
  }
  return cleanField;
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

  // 解析 LIKE 条件（支持反引号包裹的字段名）
  const likeMatches = [...whereStr.matchAll(/(`?\w+`?(?:\.\w+)?)\s+LIKE\s+\?/gi)];
  for (const lm of likeMatches) {
    havingLike.field = lm[1].replace(/`/g, '');
    // 计算 ? 的位置
    const beforeLike = whereStr.substring(0, lm.index);
    const paramCount = (beforeLike.match(/\?/g) || []).length;
    havingLike.patternIdx = paramCount;
  }

  // 解析 = 条件，同时检测 OR 逻辑（支持反引号包裹的字段名）
  const eqMatches = [...whereStr.matchAll(/(`?\w+`?(?:\.\w+)?)\s*(?:=|!=|<|>|<=|>=)\s*\?/gi)];
  for (let i = 0; i < eqMatches.length; i++) {
    const eq = eqMatches[i];
    // 计算当前条件之前有多少个 ?
    const beforeEq = whereStr.substring(0, eq.index);
    const currentParamIdx = (beforeEq.match(/\?/g) || []).length;
    // 第一个条件默认 AND，后续条件检查前面是 OR 还是 AND
    let logic: 'AND' | 'OR' = 'AND';
    if (i > 0) {
      const prevEnd = eqMatches[i - 1].index! + eqMatches[i - 1][0].length;
      const between = whereStr.substring(prevEnd, eq.index).trim().toUpperCase();
      if (between.startsWith('OR')) {
        logic = 'OR';
      }
    }
    conditions.push({
      field: eq[1].replace(/`/g, ''),
      operator: eq[0].includes('!=') ? '!=' : eq[0].includes('>=') ? '>=' : eq[0].includes('<=') ? '<=' : eq[0].includes('>') ? '>' : eq[0].includes('<') ? '<' : '=',
      paramIndex: currentParamIdx,
      logic
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
  // 将条件按 OR 分组：遇到 OR 时开始新组，同组内条件是 AND 关系，组之间是 OR 关系
  const orGroups: WhereCondition[][] = [[]];
  for (const cond of conditions) {
    if (cond.logic === 'OR' && orGroups[orGroups.length - 1].length > 0) {
      orGroups.push([cond]);
    } else {
      orGroups[orGroups.length - 1].push(cond);
    }
  }

  // 任一 OR 组满足即可
  const orResult = orGroups.some(group => {
    // 组内条件必须全部满足 (AND)
    for (const cond of group) {
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

    // 检查 LIKE 条件（全局，不分 OR 组）
    if (likeCondition.field && likeCondition.patternIdx >= 0) {
      const field = stripAlias(likeCondition.field, aliases);
      const pattern = String(params[likeCondition.patternIdx] || '');
      const recordValue = String(record[field] || '');
      const regexStr = pattern.replace(/%/g, '.*').replace(/_/g, '.');
      if (!new RegExp(regexStr, 'i').test(recordValue)) return false;
    }

    return true;
  });

  return orResult;
}

// ========== 核心 API ==========

/**
 * 执行 SQL 查询（支持 SELECT with WHERE/ORDER BY/LIMIT/OFFSET）
 */
export async function query<T = any>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  // MySQL 優先（失敗自動降級）
  if (shouldUseMysql()) {
    try {
      const rows = await mysqlQuery(sql, params);
      return Array.isArray(rows) ? rows as T[] : [rows] as T[];
    } catch (e) { onMySqlError(e); }
  }

  const sqlLower = sql.toLowerCase().trim();

  // DELETE 支持
  if (sqlLower.startsWith('delete')) {
    const tableName = getMainTable(sql);
    if (!tableName) return [] as T[];
    const data = getData()[tableName] || [];
    const { conditions, havingLike } = parseWhereClause(sql);
    const aliases = parseTableAliases(sql);
    const initialLength = data.length;
    const mockData = getData();
    mockData[tableName] = data.filter((record: any) =>
      !matchesConditions(record, conditions, havingLike, params, aliases)
    );
    return [{ affectedRows: initialLength - mockData[tableName].length }] as T[];
  }

  // INSERT 支持
  if (sqlLower.startsWith('insert')) {
    const tableMatch = sql.match(/INTO\s+`?(\w+)`?/i);
    const tableName = tableMatch ? tableMatch[1] : null;
    if (!tableName) return [] as T[];
    const mockData = getData();
    if (!mockData[tableName]) mockData[tableName] = [];
    const ids = getIds();
    const newId = ids[tableName] || 1;

    // 解析列名
    const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    const cols = colsMatch ? colsMatch[1].split(',').map(c => c.trim().replace(/`/g, '')) : [];

    const newRow: Record<string, any> = { id: newId };
    cols.forEach((col, i) => {
      newRow[col] = params[i] !== undefined ? params[i] : null;
    });

    mockData[tableName].push(newRow);
    ids[tableName] = newId + 1;
    return [{ insertId: newId }] as T[];
  }

  // UPDATE 支持
  if (sqlLower.startsWith('update')) {
    const tableMatch = sql.match(/UPDATE\s+`?(\w+)`?/i);
    const tableName = tableMatch ? tableMatch[1] : null;
    if (!tableName) return [] as T[];
    const mockData = getData();
    const data = mockData[tableName] || [];
    const { conditions, havingLike } = parseWhereClause(sql);
    const aliases = parseTableAliases(sql);

    // 解析 SET 子句
    const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE\b|$)/i);
    let setParamCount = 0;
    if (setMatch) {
      setParamCount = (setMatch[1].match(/\?/g) || []).length;
    }

    // WHERE 参数在 SET 参数之后
    const whereParams = params.slice(setParamCount);
    const setParams = params.slice(0, setParamCount);

    let updatedCount = 0;
    data.forEach((record: any) => {
      if (matchesConditions(record, conditions, havingLike, whereParams, aliases)) {
        if (setMatch) {
          const setClauses = setMatch[1].split(',').map((s: string) => s.trim());
          let paramIdx = 0;
          setClauses.forEach((clause: string) => {
            const colMatch = clause.match(/`?(\w+)`?\s*=\s*\?/);
            if (colMatch && paramIdx < setParams.length) {
              record[colMatch[1]] = setParams[paramIdx];
              paramIdx++;
            }
          });
        }
        updatedCount++;
      }
    });

    return [{ affectedRows: updatedCount }] as T[];
  }

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
  if (shouldUseMysql()) {
    try {
      return await mysqlQueryOne<T>(sql, params);
    } catch (e) {
      console.warn('[DB] MySQL queryOne 失败, 降级到 Mock:', (e as Error).message);
      onMySqlError(e);
    }
  }
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
  if (shouldUseMysql()) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      const cols = keys.map(k => `\`${k}\``).join(', ');
      const sql = `INSERT INTO \`${table}\` (${cols}) VALUES (${placeholders})`;
      const result = await mysqlExecute(sql, values);
      return result.insertId;
    } catch (e) {
      console.warn('[DB] MySQL insert 失败, 降级到 Mock:', (e as Error).message);
      onMySqlError(e);
    }
  }

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
  markDirty();
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
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (shouldUseMysql()) {
    try {
      if (typeof dataOrId === 'number') {
        const id = dataOrId;
        const data = { ...whereOrData, updated_at: now };
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const sql = `UPDATE \`${table}\` SET ${setClause} WHERE \`id\` = ?`;
        const result = await mysqlExecute(sql, [...values, id]);
        return result.affectedRows;
      } else {
        const data = { ...dataOrId, updated_at: now };
        const where = whereOrData;
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
        const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
        const whereValues = Object.values(where);
        const sql = `UPDATE \`${table}\` SET ${setClause} WHERE ${whereClause}`;
        const result = await mysqlExecute(sql, [...values, ...whereValues]);
        return result.affectedRows;
      }
    } catch (e) {
      console.warn('[DB] MySQL update 失败, 降级到 Mock:', (e as Error).message);
      onMySqlError(e);
    }
  }

  const mockData = getData();
  const tableData = mockData[table] || [];
  let updateCount = 0;

  if (typeof dataOrId === 'number') {
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
  if (updateCount > 0) markDirty();
  return updateCount;
}

/**
 * 删除记录
 */
export async function remove(
  table: string,
  where: Record<string, unknown>
): Promise<number> {
  if (shouldUseMysql()) {
    try {
      const whereClause = Object.keys(where).map(k => `\`${k}\` = ?`).join(' AND ');
      const values = Object.values(where);
      const sql = `DELETE FROM \`${table}\` WHERE ${whereClause}`;
      const result = await mysqlExecute(sql, values);
      return result.affectedRows;
    } catch (e) {
      console.warn('[DB] MySQL remove 失败, 降级到 Mock:', (e as Error).message);
      onMySqlError(e);
    }
  }

  const mockData = getData();
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
  console.log('[Mock DB] Remove', table, 'where:', where, 'count:', count);
  if (count > 0) markDirty();
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
  if (shouldUseMysql()) {
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
    } catch (e) {
      console.warn('[DB] MySQL count 失败, 降级到 Mock:', (e as Error).message);
      onMySqlError(e);
    }
  }

  const mockData = getData();

  // 如果是完整的 SQL（以 SELECT 开头）
  if (tableOrSql.toLowerCase().trim().startsWith('select')) {
    const tableName = getMainTable(tableOrSql);
    if (!tableName) return 0;
    const data = mockData[tableName] || [];
    if (!where) return data.length;
    const { conditions, havingLike } = parseWhereClause(tableOrSql);
    const aliases = parseTableAliases(tableOrSql);
    return data.filter((record: any) =>
      matchesConditions(record, conditions, havingLike, params || [], aliases)
    ).length;
  }

  // 如果只是表名
  const tableName = tableOrSql.split(/\s+/)[0];
  const data = mockData[tableName] || [];
  if (!where || where === '1=1' || typeof where !== 'string') return data.length;

  const conditions: WhereCondition[] = [];
  const eqMatches = [...where.matchAll(/(\w+(?:\.\w+)?)\s*(?:=|!=|<|>|<=|>=)\s*\?/gi)];
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
  if (shouldUseMysql()) {
    return getMysqlPool();
  }
  return {
    execute: async () => {
      throw new Error('MySQL not available, using mock mode');
    }
  } as any;
}
