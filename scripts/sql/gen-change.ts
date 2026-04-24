/**
 * 数据变更工具
 * 用于记录和生成数据变更SQL脚本
 * 
 * 使用方法：
 * npx ts-node scripts/sql/gen-change.ts --table news --action insert --data '{"title":"新标题"}'
 * npx ts-node scripts/sql/gen-change.ts --table goods --action update --id 1 --data '{"name":"新名称"}'
 * npx ts-node scripts/sql/gen-change.ts --table news --action delete --id 5
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message: string, color: string = 'reset') {
  console.log(`${colors[color as keyof typeof colors]}${message}${colors.reset}`);
}

// 参数解析
function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  
  return args;
}

// 生成INSERT SQL
function generateInsertSQL(table: string, data: Record<string, any>): string {
  const columns = Object.keys(data);
  const values = columns.map(col => {
    const value = data[col];
    if (value === null) return 'NULL';
    if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
    if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
    return `'${String(value).replace(/'/g, "''")}'`;
  });
  
  return `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
}

// 生成UPDATE SQL
function generateUpdateSQL(table: string, id: number | string, data: Record<string, any>): string {
  const updates = Object.entries(data)
    .map(([col, value]) => {
      if (value === null) return `${col} = NULL`;
      if (typeof value === 'boolean') return `${col} = ${value ? 'TRUE' : 'FALSE'}`;
      if (typeof value === 'object') return `${col} = '${JSON.stringify(value).replace(/'/g, "''")}'`;
      return `${col} = '${String(value).replace(/'/g, "''")}'`;
    })
    .join(', ');
  
  return `UPDATE ${table} SET ${updates}, updated_at = NOW() WHERE id = ${id};`;
}

// 生成DELETE SQL
function generateDeleteSQL(table: string, id: number | string): string {
  return `DELETE FROM ${table} WHERE id = ${id};`;
}

// 获取当前时间戳
function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// 保存变更记录
function saveChangeRecord(record: {
  timestamp: string;
  table: string;
  action: string;
  sql: string;
  description?: string;
}) {
  const dataDir = path.join(process.cwd(), 'data', 'sql');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const recordFile = path.join(dataDir, 'change-log.json');
  let records: any[] = [];
  
  if (fs.existsSync(recordFile)) {
    try {
      records = JSON.parse(fs.readFileSync(recordFile, 'utf-8'));
    } catch (e) {
      records = [];
    }
  }
  
  records.unshift(record); // 添加到开头
  fs.writeFileSync(recordFile, JSON.stringify(records, null, 2), 'utf-8');
}

// 保存单个变更SQL文件
function saveChangeSQL(filename: string, sql: string, description: string) {
  const dataDir = path.join(process.cwd(), 'data', 'sql', 'changes');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const fullFilename = path.join(dataDir, filename);
  const content = `-- =========================================
-- 符寶網 数据变更SQL
-- 表: ${parseArgs().table || 'N/A'}
-- 操作: ${parseArgs().action || 'N/A'}
-- 描述: ${description}
-- 生成时间: ${new Date().toISOString()}
-- =========================================

-- 执行前请备份数据！
-- 建议在测试环境先执行验证

SET search_path TO public;

${sql}

-- 变更确认标记（执行成功后删除此行）
-- COMPLETED: ${getTimestamp()}
`;
  
  fs.writeFileSync(fullFilename, content, 'utf-8');
  log(`\n✅ SQL文件已保存: data/sql/changes/${filename}`, 'green');
}

// 交互式输入
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// 显示使用帮助
function showHelp() {
  console.log(`
${colors.blue}符寶網 数据变更工具${colors.reset}

${colors.yellow}用法:${colors.reset}
  npx ts-node scripts/sql/gen-change.ts --table <表名> --action <操作> [选项]

${colors.yellow}参数:${colors.reset}
  --table <表名>      表名 (必需)
  --action <操作>      操作类型: insert | update | delete (必需)
  --data <JSON>       数据 (insert/update必需)
  --id <ID>           记录ID (update/delete必需)
  --desc <描述>        变更描述

${colors.yellow}示例:${colors.reset}
  # 插入新新闻
  npx ts-node scripts/sql/gen-change.ts --table news --action insert --data '{"title":"新标题","content":"内容"}' --desc "新增新闻"

  # 更新商品
  npx ts-node scripts/sql/gen-change.ts --table goods --action update --id 1 --data '{"name":"新名称","price":"199.00"}' --desc "修改价格"

  # 删除记录
  npx ts-node scripts/sql/gen-change.ts --table news --action delete --id 5 --desc "删除过期新闻"

${colors.yellow}表名参考:${colors.reset}
  banners, news, articles, videos, goods, categories, 
  merchants, users, orders, addresses, etc.

${colors.yellow}数据文件:${colors.reset}
  变更记录保存在: data/sql/change-log.json
  变更SQL保存在: data/sql/changes/
`);
}

// 主函数
async function main() {
  const args = parseArgs();
  
  // 显示帮助
  if (args.help || args.h || !args.table) {
    showHelp();
    process.exit(0);
  }
  
  const table = args.table;
  const action = args.action;
  
  if (!action || !['insert', 'update', 'delete'].includes(action)) {
    log('\n❌ 错误: 必须指定有效的操作类型 (insert/update/delete)', 'red');
    showHelp();
    process.exit(1);
  }
  
  let data: Record<string, any> = {};
  let id: string = '';
  let description = args.desc || '';
  
  // 解析数据
  if (args.data) {
    try {
      data = JSON.parse(args.data);
    } catch (e) {
      log('\n❌ 错误: data 参数必须是有效的JSON', 'red');
      process.exit(1);
    }
  }
  
  id = args.id || '';
  
  let sql = '';
  
  try {
    switch (action) {
      case 'insert':
        if (Object.keys(data).length === 0) {
          log('\n❌ 错误: insert 操作必须提供 --data', 'red');
          process.exit(1);
        }
        // 添加时间戳
        data.created_at = new Date().toISOString();
        data.updated_at = new Date().toISOString();
        sql = generateInsertSQL(table, data);
        break;
        
      case 'update':
        if (!id) {
          log('\n❌ 错误: update 操作必须提供 --id', 'red');
          process.exit(1);
        }
        if (Object.keys(data).length === 0) {
          log('\n❌ 错误: update 操作必须提供 --data', 'red');
          process.exit(1);
        }
        sql = generateUpdateSQL(table, id, data);
        break;
        
      case 'delete':
        if (!id) {
          log('\n❌ 错误: delete 操作必须提供 --id', 'red');
          process.exit(1);
        }
        sql = generateDeleteSQL(table, id);
        break;
    }
    
    // 输出SQL
    console.log('\n' + '='.repeat(50));
    log(`📝 生成 ${action.toUpperCase()} SQL`, 'blue');
    console.log('='.repeat(50));
    console.log(sql);
    console.log('='.repeat(50));
    
    // 生成文件名
    const timestamp = getTimestamp();
    const safeTable = table.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeTable}_${action}_${timestamp}.sql`;
    
    // 保存SQL文件
    saveChangeSQL(filename, sql, description);
    
    // 保存变更记录
    saveChangeRecord({
      timestamp: new Date().toISOString(),
      table,
      action,
      sql,
      description,
    });
    
    log('\n✅ 变更SQL生成完成！', 'green');
    log('\n📋 执行步骤:', 'blue');
    log('   1. 在测试环境执行SQL验证', 'reset');
    log('   2. 确认无误后在生产环境执行', 'reset');
    log('   3. 执行完成后记录到部署日志', 'reset');
    
  } catch (err: any) {
    log(`\n❌ 错误: ${err.message}`, 'red');
    process.exit(1);
  }
}

main();
