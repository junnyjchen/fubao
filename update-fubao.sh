#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本
#
# 架构：Nginx → Next.js (pnpm start, 端口 5000)
#   不再使用 standalone，直接 pnpm build && pnpm start
#   避免 standalone 的缓存、复制、action ID 不匹配等问题
#
# 使用方法：
#   bash update-fubao.sh              # 增量更新
#   bash update-fubao.sh --rebuild    # 强制完整构建
#   bash update-fubao.sh --install    # 首次安装
#   bash update-fubao.sh --diagnose   # 诊断当前状态
#   bash update-fubao.sh --migrate    # 仅执行数据库迁移
#
# 服务器目录: /www/wwwroot/fubao
# ============================================================

set -e

# ===== 颜色 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ===== 配置 =====
SERVICE_NAME="fubao-nextjs"
HOST_PORT=5000
BASE_DIR=""
NEED_REBUILD=false
NEED_INSTALL=false
DIAGNOSE_MODE=false
MIGRATE_ONLY=false

# MySQL 配置
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-fubao}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-CZDhXEb8M7t1jheP}"
MYSQL_DATABASE="${MYSQL_DATABASE:-fubao}"

for arg in "$@"; do
    case $arg in
        --rebuild) NEED_REBUILD=true ;;
        --install) NEED_INSTALL=true ;;
        --diagnose) DIAGNOSE_MODE=true ;;
        --migrate) MIGRATE_ONLY=true ;;
    esac
done

# ===== 自动检测项目目录 =====
if [ -d "/www/wwwroot/fubao" ]; then
    BASE_DIR="/www/wwwroot/fubao"
elif [ -d "$(dirname "$0")/src" ]; then
    BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
else
    echo -e "${RED}❌ 无法找到项目目录${NC}"
    exit 1
fi

cd "$BASE_DIR"
echo -e "${BLUE}📂 项目目录: $BASE_DIR${NC}"

# ============================================================
# 数据库迁移函数
# ============================================================
run_migrate() {
    if ! command -v mysql &>/dev/null; then
        echo -e "${YELLOW}⚠️  mysql 命令不存在，跳过迁移${NC}"
        return
    fi

    # 测试 MySQL 连接
    if ! mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" -e "SELECT 1" &>/dev/null; then
        echo -e "${YELLOW}⚠️  MySQL 连接失败，跳过迁移${NC}"
        return
    fi

    echo -e "${YELLOW}🗄️ 执行数据库迁移...${NC}"

    if [ -f "$BASE_DIR/sql/migrate.sql" ]; then
        mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" < "$BASE_DIR/sql/migrate.sql" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ 数据库迁移完成${NC}"
        else
            echo -e "${YELLOW}⚠️  migrate.sql 部分语句失败，尝试逐条执行...${NC}"
            # 逐条执行，忽略已存在的错误
            while IFS= read -r line; do
                line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
                [ -z "$line" ] && continue
                [[ "$line" == \#* ]] && continue
                mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" -e "$line" 2>/dev/null || true
            done < "$BASE_DIR/sql/migrate.sql"
            echo -e "${GREEN}✅ 数据库迁移完成（逐条模式）${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  sql/migrate.sql 不存在${NC}"
    fi
}

# ============================================================
# 仅迁移模式
# ============================================================
if [ "$MIGRATE_ONLY" = true ]; then
    run_migrate
    exit 0
fi

# ============================================================
# 诊断模式
# ============================================================
if [ "$DIAGNOSE_MODE" = true ]; then
    echo ""
    echo -e "${BLUE}=============================================="
    echo -e "  符寶網 - 环境诊断"
    echo -e "==============================================${NC}"

    echo ""
    echo "━━━ 1. 服务状态 ━━━"
    echo "  Next.js (systemd): $(sudo systemctl is-active $SERVICE_NAME 2>/dev/null || echo '未安装')"
    echo "  Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo '未运行')"

    echo ""
    echo "━━━ 2. 端口检测 ━━━"
    PORT_INFO=$(ss -tlnp 2>/dev/null | grep ":${HOST_PORT} " | head -1)
    if [ -n "$PORT_INFO" ]; then
        echo "  端口 ${HOST_PORT}: ${PORT_INFO}"
        if echo "$PORT_INFO" | grep -q "node"; then
            echo -e "  ${GREEN}✅ Next.js (node) 正在监听${NC}"
        else
            echo -e "  ${YELLOW}⚠️  非 node 进程在监听${NC}"
        fi
    else
        echo -e "  ${RED}❌ 端口 ${HOST_PORT} 未监听${NC}"
    fi

    echo ""
    echo "━━━ 3. 运行环境 ━━━"
    echo "  Node.js: $(node -v 2>/dev/null || echo '未安装')"
    echo "  pnpm: $(pnpm -v 2>/dev/null || echo '未安装')"

    echo ""
    echo "━━━ 4. 构建状态 ━━━"
    if [ -d ".next/BUILD_ID" ] || [ -f ".next/BUILD_ID" ]; then
        BUILD_TIME=$(stat -c %Y ".next/BUILD_ID" 2>/dev/null || echo "0")
        BUILD_DATE=$(date -d "@$BUILD_TIME" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}✅ 已构建 (${BUILD_DATE})${NC}"
    else
        echo -e "  ${RED}❌ 未构建（需执行 --rebuild）${NC}"
    fi

    echo ""
    echo "━━━ 5. API 测试 ━━━"
    NX_RESP=$(curl -s --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/goods?limit=1" 2>/dev/null | head -c 200 || echo "无响应")
    if echo "$NX_RESP" | grep -q '"success":true'; then
        echo -e "  ${GREEN}✅ Next.js API 正常${NC}"
    elif [ -n "$NX_RESP" ]; then
        echo -e "  ${RED}❌ API 响应异常${NC}"
        echo "  响应: ${NX_RESP:0:150}"
    else
        echo -e "  ${RED}❌ Next.js 无响应${NC}"
    fi

    echo ""
    echo "━━━ 6. MySQL 连接 ━━━"
    if mysql -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -u"${MYSQL_USER}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE}" -e "SELECT 1" &>/dev/null; then
        echo -e "  ${GREEN}✅ MySQL 连接正常${NC}"
    else
        echo -e "  ${RED}❌ MySQL 连接失败（将使用 Mock DB）${NC}"
    fi

    exit 0
fi

# ============================================================
# 首次安装
# ============================================================
if [ "$NEED_INSTALL" = true ]; then
    echo ""
    echo -e "${BLUE}━━━ 首次安装 ━━━${NC}"

    # 安装 Node.js
    if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 18 ]; then
        echo -e "${YELLOW}📦 安装 Node.js 20...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

    # 安装 pnpm
    if ! command -v pnpm &>/dev/null; then
        npm install -g pnpm
    fi
    echo -e "${GREEN}✅ pnpm $(pnpm -v)${NC}"

    # 安装依赖
    pnpm install

    # 创建目录
    mkdir -p "$BASE_DIR/public/uploads/"{goods,banners,news,avatars,baike,images,content}
    chmod -R 755 "$BASE_DIR/public/uploads" 2>/dev/null || true

    # 数据库迁移
    run_migrate

    # 注册 systemd 服务
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"

    echo -e "${GREEN}🎉 首次安装完成！执行 bash update-fubao.sh --rebuild 构建${NC}"
    exit 0
fi

# ============================================================
# Step 1: Git 拉取
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 1/5: 拉取代码 ━━━${NC}"

if [ -d ".git" ]; then
    git config --global --add safe.directory "$BASE_DIR" 2>/dev/null
    BEFORE_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
    AFTER_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

    if [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
        echo -e "${GREEN}✅ 代码已更新 (${BEFORE_HASH:0:7} → ${AFTER_HASH:0:7})${NC}"
        NEED_REBUILD=true
    else
        echo -e "${GREEN}✅ 代码已是最新${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  非 Git 仓库${NC}"
fi

# ============================================================
# Step 2: 安装依赖
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 2/5: 安装依赖 ━━━${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# ============================================================
# Step 3: 构建 Next.js
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 3/5: 构建项目 ━━━${NC}"

if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}🔨 清理旧构建...${NC}"
    rm -rf .next

    echo -e "${YELLOW}🔨 构建 Next.js...${NC}"
    pnpm build

    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${GREEN}✅ 跳过构建（使用 --rebuild 强制构建）${NC}"
fi

# ============================================================
# Step 4: 数据库迁移 + 部署配置 + 重启
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/5: 部署配置 ━━━${NC}"

# 数据库迁移
run_migrate

# 确保上传目录存在
mkdir -p "$BASE_DIR/public/uploads/"{goods,banners,news,avatars,baike,images,content}
chmod -R 777 "$BASE_DIR/public/uploads" 2>/dev/null || true

# 确保 systemd 服务文件
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ] || ! diff -q "$BASE_DIR/fubao-nextjs.service" "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 更新 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
fi

# 重启 Next.js
echo -e "${YELLOW}🔄 重启 $SERVICE_NAME...${NC}"
sudo systemctl restart "$SERVICE_NAME" 2>/dev/null || {
    echo -e "${RED}❌ systemd 重启失败，尝试直接启动...${NC}"
    PORT=$HOST_PORT NODE_ENV=production nohup pnpm start > /tmp/fubao-nextjs.log 2>&1 &
    sleep 3
}

# ============================================================
# Step 5: 验证
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 5/5: 验证服务 ━━━${NC}"

# 等待 Next.js 启动
echo -e "${YELLOW}⏳ 等待 Next.js 启动...${NC}"
for i in $(seq 1 30); do
    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://127.0.0.1:$HOST_PORT/" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ]; then
        break
    fi
    sleep 1
    echo -n "."
done
echo ""

# 检查 systemd
if sudo systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ systemd 服务运行中${NC}"
else
    echo -e "${YELLOW}⚠️  systemd 服务未运行${NC}"
fi

# 检查 Next.js
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$HOST_PORT/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Next.js 正常 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Next.js 异常 (HTTP $HTTP_CODE)${NC}"
fi

# 验证 API
NX_API=$(curl -s --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/goods?limit=1" 2>/dev/null || echo "")
if echo "$NX_API" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ API 响应正常${NC}"
else
    echo -e "${RED}❌ API 响应异常${NC}"
    echo "  响应: ${NX_API:0:120}"
fi

echo ""
echo "=============================================="
echo -e "  🎉 部署完成！"
echo "=============================================="
echo ""
echo "  🌐 访问: https://www.fubao.ltd"
echo "  📋 日志: sudo journalctl -u $SERVICE_NAME -n 50"
echo "  🔧 诊断: bash update-fubao.sh --diagnose"
echo "  🔧 重建: bash update-fubao.sh --rebuild"
echo "  🗄️ 迁移: bash update-fubao.sh --migrate"
