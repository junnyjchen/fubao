/**
 * SQL批量执行工具
 * 用于在线上环境批量执行SQL变更脚本
 * 
 * 使用方法：
 * npx ts-node scripts/sql/run-batch.ts                    # 执行所有待执行的SQL
 * npx ts-node scripts/sql/run-batch.ts --list            # 列出所有待执行的SQL
 * npx ts-node scripts/sql/run-batch.ts --dry-run         # 预览但不执行
 * npx ts-node scripts/sql/run-batch.ts --file <文件名>   # 执行指定文件
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = 'reset') {
  console.log(`${colors[color as keyof typeof colors]}${message}${colors.reset}`);
}

// 环境变量配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  log('❌ 缺少Supabase配置', 'red');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 参数解析
function parseArgs(): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i++;
      } else if (value === undefined || value.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = value;
      }
    }
  }
  
  return args;
}

// 获取changes目录
function getChangesDir(): string {
  return path.join(process.cwd(), 'data', 'sql', 'changes');
}

// 获取所有待执行的SQL文件
function getPendingSQLFiles(): string[] {
  const changesDir = getChangesDir();
  
  if (!fs.existsSync(changesDir)) {
    return [];
  }
  
  const files = fs.readdirSync(changesDir)
    .filter(f => f.endsWith('.sql'))
    .filter(f => !f.startsWith('COMPLETED'))
    .sort();
  
  return files;
}

// 执行单个SQL文件
async function executeSQLFile(filename: string, dryRun: boolean = false): Promise<boolean> {
  const filepath = path.join(getChangesDir(), filename);
  
  if (!fs.existsSync(filepath)) {
    log(`   ❌ 文件不存在: ${filename}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // 提取SQL语句（排除注释和标记）
  const sqlStatements = content
    .split(/;\s*[\r\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SET'))
    .join(';\n');
  
  if (dryRun) {
    log(`   📋 预览: ${filename}`, 'cyan');
    console.log(sqlStatements.substring(0, 200) + (sqlStatements.length > 200 ? '...' : ''));
    return true;
  }
  
  log(`   ▶️  执行: ${filename}`, 'blue');
  
  try {
    // 使用rpc执行SQL（Supabase限制）
    // 注意：某些DDL语句可能需要通过Supabase Dashboard执行
    const { error } = await supabase.rpc('exec', { query: sqlStatements });
    
    if (error) {
      // 如果rpc不存在，尝试直接执行
      log(`   ⚠️  RPC执行失败，SQL可能需要手动执行`, 'yellow');
      log(`   📄 请手动在Supabase Dashboard执行: ${filename}`, 'yellow');
      return false;
    }
    
    return true;
  } catch (err: any) {
    log(`   ❌ 执行失败: ${err.message}`, 'red');
    return false;
  }
}

// 标记文件为已完成
function markAsCompleted(filename: string) {
  const filepath = path.join(getChangesDir(), filename);
  const completedPath = path.join(getChangesDir(), `COMPLETED_${filename}`);
  
  try {
    fs.renameSync(filepath, completedPath);
    log(`   ✅ 已标记为完成: COMPLETED_${filename}`, 'green');
  } catch (err) {
    log(`   ⚠️  标记失败`, 'yellow');
  }
}

// 生成执行报告
function generateReport(results: { file: string; success: boolean }[]): string {
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  return `
${'='.repeat(50)}
📊 执行报告
${'='.repeat(50)}
总计: ${results.length} 个文件
✅ 成功: ${successCount}
${failCount > 0 ? colors.red : ''}❌ 失败: ${failCount}
${colors.reset}${results.length > 0 ? colors.reset : ''}
${'='.repeat(50)}
`;
}

// 主函数
async function main() {
  const args = parseArgs();
  
  console.log('\n' + '='.repeat(50));
  log('🚀 符寶網 SQL批量执行工具', 'blue');
  console.log('='.repeat(50));
  
  const changesDir = getChangesDir();
  
  // --list 选项
  if (args.list) {
    log('\n📋 待执行的SQL文件列表:', 'blue');
    
    const files = getPendingSQLFiles();
    
    if (files.length === 0) {
      log('   无待执行的文件', 'yellow');
    } else {
      files.forEach((file, index) => {
        const filepath = path.join(changesDir, file);
        const stat = fs.statSync(filepath);
        const size = stat.size;
        log(`   ${index + 1}. ${file} (${(size / 1024).toFixed(2)} KB)`, 'reset');
      });
    }
    
    console.log(generateReport([]));
    return;
  }
  
  const dryRun = !!args.dry;
  const specificFile = args.file as string | undefined;
  
  if (dryRun) {
    log('\n🔍 预览模式（不会执行SQL）', 'yellow');
  } else {
    log('\n⚠️  执行模式（将修改数据库）', 'red');
    
    // 确认操作
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    const question = (text: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(text, resolve);
      });
    };
    
    const confirm = await question('\n⚠️  确定要执行吗？输入 "YES" 确认: ');
    rl.close();
    
    if (confirm !== 'YES') {
      log('\n❌ 已取消', 'red');
      process.exit(0);
    }
  }
  
  let files: string[] = [];
  
  if (specificFile) {
    // 执行指定文件
    if (!fs.existsSync(path.join(changesDir, specificFile))) {
      log(`\n❌ 文件不存在: ${specificFile}`, 'red');
      process.exit(1);
    }
    files = [specificFile];
  } else {
    // 执行所有待执行文件
    files = getPendingSQLFiles();
  }
  
  if (files.length === 0) {
    log('\n✅ 无待执行的SQL文件', 'green');
    return;
  }
  
  log(`\n📦 将执行 ${files.length} 个SQL文件\n`, 'blue');
  
  const results: { file: string; success: boolean }[] = [];
  
  for (const file of files) {
    const success = await executeSQLFile(file, dryRun);
    results.push({ file, success });
    
    if (!dryRun && success) {
      markAsCompleted(file);
    }
  }
  
  console.log(generateReport(results));
  
  if (!dryRun) {
    log('\n📌 提示:', 'blue');
    log('   1. 失败的文件需要手动在Supabase Dashboard执行', 'reset');
    log('   2. 成功执行的文件已移至 COMPLETED_ 前缀', 'reset');
    log('   3. 建议在执行后检查数据是否正确', 'reset');
  }
}

main().catch((err) => {
  log(`\n❌ 错误: ${err.message}`, 'red');
  process.exit(1);
});
