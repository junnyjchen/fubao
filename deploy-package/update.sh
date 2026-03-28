#!/bin/bash
#==============================================================================
# 符寶網 一键更新脚本
# 在服务器上运行此脚本即可更新代码
# 用法: cd /www/wwwroot/fubao.ltd && ./update.sh
#==============================================================================

set -e

PROJECT_DIR="/www/wwwroot/fubao.ltd"
BACKUP_DIR="/www/backup/fubao.ltd"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================"
echo "   符寶網 一键更新脚本"
echo "   时间: $(date)"
echo "========================================"

cd "${PROJECT_DIR}"

# 1. 备份当前版本
echo "[1/5] 备份当前版本..."
mkdir -p "${BACKUP_DIR}"
if [ -d ".next" ]; then
    tar -czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='deploy-package' \
        .
    echo "备份已保存到: ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
fi

# 2. 拉取最新代码（如果使用git）
echo "[2/5] 更新代码..."
if [ -d ".git" ]; then
    git pull origin main || git pull origin master
else
    echo "非Git项目，跳过代码拉取"
    echo "请手动上传更新的文件"
fi

# 3. 安装/更新依赖
echo "[3/5] 安装依赖..."
pnpm install --prefer-frozen-lockfile

# 4. 重新构建
echo "[4/5] 构建项目..."
pnpm build

# 5. 重启服务
echo "[5/5] 重启服务..."
pm2 restart fubao-web

# 清理旧备份（保留最近5个）
echo "清理旧备份..."
ls -t "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm

echo ""
echo "========================================"
echo "   更新完成！"
echo "========================================"
echo ""
echo "服务状态:"
pm2 status fubao-web
echo ""
echo "网站地址: https://fubao.ltd"
echo ""
