#!/bin/bash
# ============================================================
# 符寶網 - MySQL 数据库一键配置脚本
# 使用方法: bash deploy-mysql.sh
# ============================================================

set -e

# 数据库配置
DB_NAME="fubao"
DB_USER="fubao"
DB_PASS="CZDhXEb8M7t1jheP"
DB_HOST="127.0.0.1"
DB_PORT="3306"

# 项目路径
PROJECT_DIR="/workspace/projects"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  符寶網 MySQL 一键配置"
echo "============================================"
echo ""

# ---- 步骤 1: 检查 MySQL 是否安装 ----
echo "📌 [1/5] 检查 MySQL 服务..."
if command -v mysql &> /dev/null; then
    echo "✅ MySQL 已安装"
else
    echo "❌ MySQL 未安装，正在安装..."
    if command -v yum &> /dev/null; then
        yum install -y mysql-server
        systemctl start mysqld
        systemctl enable mysqld
    elif command -v apt &> /dev/null; then
        apt update && apt install -y mysql-server
        systemctl start mysql
        systemctl enable mysql
    fi
    echo "✅ MySQL 安装完成"
fi

# ---- 步骤 2: 创建数据库和用户 ----
echo ""
echo "📌 [2/5] 创建数据库和用户..."
mysql -u root -e "
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';
    CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
    GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
    GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
    FLUSH PRIVILEGES;
" 2>/dev/null && echo "✅ 数据库和用户创建成功" || {
    echo "⚠️  无法用 root 无密码登录，请手动执行:"
    echo "   mysql -u root -p"
    echo "   CREATE DATABASE fubao DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "   CREATE USER 'fubao'@'%' IDENTIFIED BY 'CZDhXEb8M7t1jheP';"
    echo "   GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'%';"
    echo "   FLUSH PRIVILEGES;"
    echo ""
    read -p "已手动创建? (y/n): " confirm
    [ "$confirm" != "y" ] && echo "❌ 已取消" && exit 1
}

# ---- 步骤 3: 测试连接 ----
echo ""
echo "📌 [3/5] 测试数据库连接..."
if mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e "SELECT 1 AS test;" &>/dev/null; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败，请检查用户名和密码"
    exit 1
fi

# ---- 步骤 4: 建表 + 导入种子数据 ----
echo ""
echo "📌 [4/5] 建表并导入种子数据..."
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SCRIPT_DIR}/schema.sql && echo "✅ 建表完成 (15张表)"
mysql -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SCRIPT_DIR}/seed.sql && echo "✅ 种子数据导入完成"

# ---- 步骤 5: 配置项目环境变量 ----
echo ""
echo "📌 [5/5] 配置项目环境变量..."

# 写入 .env
# 自动查找项目目录
if [ -d "/workspace/projects" ]; then
    PROJECT_DIR="/workspace/projects"
elif [ -d "$HOME/projects" ]; then
    PROJECT_DIR="$HOME/projects"
else
    PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
fi

ENV_FILE="${PROJECT_DIR}/.env"
touch "$ENV_FILE"

# 删除已有的 MYSQL 配置，避免重复
sed -i '/^MYSQL_/d' "$ENV_FILE" 2>/dev/null || true
# 删除多余的空行
sed -i '/^$/N;/^\n$/d' "$ENV_FILE" 2>/dev/null || true

# 追加 MySQL 配置
echo "" >> "$ENV_FILE"
echo "# MySQL 数据库配置" >> "$ENV_FILE"
echo "MYSQL_HOST=${DB_HOST}" >> "$ENV_FILE"
echo "MYSQL_PORT=${DB_PORT}" >> "$ENV_FILE"
echo "MYSQL_USER=${DB_USER}" >> "$ENV_FILE"
echo "MYSQL_PASSWORD=${DB_PASS}" >> "$ENV_FILE"
echo "MYSQL_DATABASE=${DB_NAME}" >> "$ENV_FILE"
echo "✅ 环境变量已写入 ${ENV_FILE}"

# 同时输出到 Docker 环境变量提示
echo ""
echo "⚠️  如果使用 Docker 部署，还需在 docker-compose.yml 或 docker run 中添加环境变量："
echo "  MYSQL_HOST=${DB_HOST}"
echo "  MYSQL_PORT=${DB_PORT}"
echo "  MYSQL_USER=${DB_USER}"
echo "  MYSQL_PASSWORD=${DB_PASS}"
echo "  MYSQL_DATABASE=${DB_NAME}"

echo ""
echo "============================================"
echo "  ✅ MySQL 配置全部完成！"
echo "============================================"
echo ""
echo "下一步操作:"
echo "  1. 重启项目服务: cd ${PROJECT_DIR} && pnpm dev"
echo "  2. 访问数据库状态: curl http://localhost:5000/api/admin/database"
echo "  3. 返回 engine=mysql 即表示已切换成功"
echo ""
echo "常用数据库命令:"
echo "  登录: mysql -u fubao -p'CZDhXEb8M7t1jheP' fubao"
echo "  查看表: SHOW TABLES;"
echo "  查看商品: SELECT * FROM goods;"
echo "  查看用户: SELECT id,email,role FROM users;"
echo ""
