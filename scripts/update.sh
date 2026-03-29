#!/bin/bash
#==============================================================================
# 符寶網 一键更新脚本
# 在服务器上运行: cd /www/wwwroot/fubao.ltd && bash update.sh
#==============================================================================

set -e

PROJECT_DIR="/www/wwwroot/fubao.ltd"

echo "========================================"
echo "   符寶網 一键更新"
echo "========================================"

cd "${PROJECT_DIR}"

# 1. 拉取最新代码
echo "[1/4] 拉取最新代码..."
git fetch origin
git reset --hard origin/main
git pull origin main

# 2. 安装依赖
echo "[2/4] 安装依赖..."
pnpm install

# 3. 构建项目
echo "[3/4] 构建项目..."
pnpm build

# 4. 重启服务
echo "[4/4] 重启服务..."
pm2 restart fubao

echo ""
echo "========================================"
echo "   更新完成！"
echo "========================================"
echo ""
echo "检查服务状态: pm2 status"
echo "查看日志: pm2 logs fubao"
