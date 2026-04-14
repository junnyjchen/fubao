#!/bin/bash
# 符寶網 - 完整部署脚本 (服务器SSH执行)
# 
# 使用方法:
# 1. SSH连接到服务器: ssh root@47.76.186.195
# 2. 进入项目目录: cd /www/wwwroot/fubao (或你的项目目录)
# 3. 执行: bash <(curl -sL https://raw.githubusercontent.com/junnyjchen/fubao/main/scripts/bt-fix.sh)
# 
# 或者直接在服务器终端复制下面内容执行:

set -e

PROJECT_DIR="/www/wwwroot/fubao"

echo "=========================================="
echo "  符寶網 - 部署脚本"
echo "=========================================="

# 进入目录
cd $PROJECT_DIR
echo "✓ 进入目录: $PROJECT_DIR"

# Git拉取
echo ">>> 拉取最新代码..."
git pull origin main

# 安装依赖
echo ">>> 安装依赖..."
npm install --legacy-peer-deps

# 构建
echo ">>> 构建项目..."
npm run build

# 修复权限
echo ">>> 修复权限..."
chown -R www:www $PROJECT_DIR
chmod -R 755 $PROJECT_DIR/storage 2>/dev/null || true

# 重启PM2 (如果使用PM2)
echo ">>> 重启服务..."
pm2 restart fubao 2>/dev/null || pm2 restart all 2>/dev/null || true

# 或者重启Node (如果直接运行)
pkill -f "next start" 2>/dev/null || true
cd $PROJECT_DIR && nohup npm run start > /var/log/fubao.log 2>&1 &

# 清理缓存
rm -rf $PROJECT_DIR/.next/cache 2>/dev/null || true

echo "=========================================="
echo "  部署完成!"
echo "=========================================="
echo "请访问: http://47.76.186.195"
echo ""
echo "查看日志: tail -f /var/log/fubao.log"
echo "重启Node: pm2 restart fubao"
