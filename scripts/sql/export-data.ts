/**
 * 数据导出工具
 * 用于导出数据库数据为SQL文件，方便同步到线上环境
 * 
 * 使用方法：
 * npx ts-node scripts/sql/export-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase配置，请设置环境变量：');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 导出的表列表（按依赖顺序）
const TABLES = [
  // 基础配置表
  'languages',
  'categories',
  
  // 商户相关
  'merchants',
  'merchant_users',
  
  // 商品相关
  'goods',
  'goods_lang',
  
  // 新闻文章
  'news',
  'news_lang',
  'articles',
  'articles_lang',
  
  // 视频
  'videos',
  
  // Banner
  'banners',
  
  // 用户相关
  'users',
  'addresses',
  
  // 订单相关
  'orders',
  'order_items',
  
  // 其他
  'favorites',
  'cart_items',
  'reviews',
  'certificates',
];

// SQL类型映射
function getPgType(value: any, columnName: string): string {
  if (value === null) return 'NULL';
  
  const type = typeof value;
  
  if (type === 'number') {
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toString();
  }
  
  if (type === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  
  if (type === 'object') {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    return JSON.stringify(value);
  }
  
  // 字符串转义
  return value.replace(/'/g, "''");
}

// 生成INSERT语句
function generateInsertSQL(tableName: string, rows: any[]): string {
  if (rows.length === 0) return `-- ${tableName}: 无数据\n`;
  
  const columns = Object.keys(rows[0]);
  const values = rows.map(row => {
    return `(${columns.map(col => {
      const value = row[col];
      // 处理JSON类型字段
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
      }
      // 处理空值
      if (value === null || value === undefined) {
        return 'NULL';
      }
      // 处理字符串
      return `'${String(value).replace(/'/g, "''")}'`;
    }).join(', ')})`;
  });
  
  return `-- ${tableName}: ${rows.length} 条记录\nINSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n${values.join(',\n')};\n\n`;
}

// 导出单个表的数据
async function exportTable(tableName: string): Promise<string> {
  console.log(`📤 导出表: ${tableName}...`);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`   ❌ 错误: ${error.message}`);
      return `-- ${tableName}: 导出失败 - ${error.message}\n\n`;
    }
    
    if (!data || data.length === 0) {
      console.log(`   ✓ 无数据`);
      return `-- ${tableName}: 无数据\n\n`;
    }
    
    console.log(`   ✓ ${data.length} 条记录`);
    return generateInsertSQL(tableName, data);
  } catch (err: any) {
    console.error(`   ❌ 异常: ${err.message}`);
    return `-- ${tableName}: 导出异常 - ${err.message}\n\n`;
  }
}

// 生成表结构（简化版，用于参考）
function generateSchemaSQL(): string {
  return `-- =========================================
-- 符寶網 数据库结构参考
-- 生成时间: ${new Date().toISOString()}
-- 注意: 此文件仅包含表名列表，完整结构请参考 src/storage/database/shared/schema.ts
-- =========================================

-- 核心业务表
languages          -- 语言配置
categories         -- 商品分类
merchants          -- 商户信息
merchant_users     -- 商户用户
goods              -- 商品信息
goods_lang         -- 商品多语言
news               -- 新闻文章
news_lang          -- 新闻多语言
articles           -- 百科文章
articles_lang      -- 百科多语言
videos             -- 视频
banners            -- 轮播图

-- 用户订单表
users              -- 用户
addresses          -- 收货地址
orders             -- 订单
order_items        -- 订单商品
favorites          -- 收藏
cart_items         -- 购物车
reviews            -- 评价
certificates       -- 证书

-- 系统表
admin_users        -- 管理员
page_configs       -- 页面配置
search_keywords    -- 搜索关键词
health_check       -- 健康检查

`;
}

// 主函数
async function main() {
  console.log('🚀 符寶網 数据导出工具\n');
  
  const outputDir = path.join(process.cwd(), 'data', 'sql');
  
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputFile = path.join(outputDir, `full-data-${timestamp}.sql`);
  
  console.log(`📁 输出目录: ${outputDir}`);
  console.log(`📄 输出文件: ${path.basename(outputFile)}\n`);
  
  let sqlContent = `-- =========================================
-- 符寶網 完整数据导出
-- 生成时间: ${new Date().toISOString()}
-- 导出表数量: ${TABLES.length}
-- =========================================

`;
  
  // 添加表结构参考
  sqlContent += generateSchemaSQL();
  
  // 按顺序导出每个表
  for (const table of TABLES) {
    sqlContent += await exportTable(table);
  }
  
  // 写入文件
  fs.writeFileSync(outputFile, sqlContent, 'utf-8');
  
  console.log(`\n✅ 导出完成！`);
  console.log(`📄 文件: ${outputFile}`);
  console.log(`📊 大小: ${(sqlContent.length / 1024).toFixed(2)} KB`);
}

main().catch(console.error);
