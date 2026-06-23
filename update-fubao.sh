#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本
#
# 架构：Nginx → Next.js (standalone, 端口 5000)
#   Nginx 已配置所有请求代理到 Next.js (端口 5000)
#   Next.js API Routes 处理所有 /api/* 请求
#   PHP/ThinkPHP 作为备用后端
#
# 使用方法：
#   bash update-fubao.sh              # 增量更新
#   bash update-fubao.sh --rebuild    # 强制完整构建
#   bash update-fubao.sh --install    # 首次安装
#   bash update-fubao.sh --diagnose   # 诊断当前状态
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

for arg in "$@"; do
    case $arg in
        --rebuild) NEED_REBUILD=true ;;
        --install) NEED_INSTALL=true ;;
        --diagnose) DIAGNOSE_MODE=true ;;
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
# 诊断模式
# ============================================================
if [ "$DIAGNOSE_MODE" = true ]; then
    echo ""
    echo -e "${BLUE}=============================================="
    echo -e "  符寶網 - 环境诊断"
    echo -e "==============================================${NC}"

    # 1. 服务状态
    echo ""
    echo "━━━ 1. 服务状态 ━━━"
    echo "  Next.js (systemd): $(sudo systemctl is-active $SERVICE_NAME 2>/dev/null || echo '未安装')"
    echo "  Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo '未运行')"
    echo "  PHP-FPM: $(sudo systemctl is-active php-fpm 2>/dev/null || sudo systemctl is-active 'php*fpm' 2>/dev/null || echo '未运行')"

    # 2. 端口检测
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

    # 3. Node.js / pnpm
    echo ""
    echo "━━━ 3. 运行环境 ━━━"
    echo "  Node.js: $(node -v 2>/dev/null || echo '未安装')"
    echo "  pnpm: $(pnpm -v 2>/dev/null || echo '未安装')"
    echo "  PHP: $(php -v 2>/dev/null | head -1 || echo '未安装')"

    # 4. API 响应测试
    echo ""
    echo "━━━ 4. API 响应测试 ━━━"
    NX_RESP=$(curl -s --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/goods?limit=1" 2>/dev/null | head -c 200 || echo "无响应")
    if echo "$NX_RESP" | grep -q '"success":true'; then
        echo -e "  ${GREEN}✅ Next.js API 正常 (success:true)${NC}"
    elif [ -n "$NX_RESP" ]; then
        echo -e "  ${RED}❌ API 响应异常${NC}"
        echo "  响应: ${NX_RESP:0:150}"
    else
        echo -e "  ${RED}❌ Next.js 无响应${NC}"
    fi

    # 5. Standalone 构建
    echo ""
    echo "━━━ 5. 构建状态 ━━━"
    if [ -f ".next/standalone/server.js" ]; then
        BUILD_TIME=$(stat -c %Y ".next/standalone/server.js" 2>/dev/null || echo "0")
        BUILD_DATE=$(date -d "@$BUILD_TIME" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}✅ Standalone 已构建 (${BUILD_DATE})${NC}"
    else
        echo -e "  ${RED}❌ Standalone 未构建（需执行 --rebuild）${NC}"
    fi

    # 6. Nginx 配置
    echo ""
    echo "━━━ 6. Nginx 配置 ━━━"
    for conf in \
        "/www/server/panel/vhost/nginx/www.fubao.ltd.conf" \
        "/www/server/nginx/conf/vhost/www.fubao.ltd.conf" \
        "/etc/nginx/conf.d/www.fubao.ltd.conf"; do
        if [ -f "$conf" ]; then
            echo "  配置文件: $conf"
            if grep -q "proxy_pass.*127.0.0.1:5000" "$conf"; then
                echo -e "  ${GREEN}✅ 已配置代理到 Next.js (5000)${NC}"
            else
                echo -e "  ${YELLOW}⚠️  未检测到 Next.js 代理配置${NC}"
            fi
            break
        fi
    done

    # 7. 上传目录
    echo ""
    echo "━━━ 7. 上传目录 ━━━"
    if [ -d "public/uploads" ]; then
        UPLOAD_PERM=$(stat -c %a "public/uploads" 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}✅ public/uploads 存在 (权限: ${UPLOAD_PERM})${NC}"
    else
        echo -e "  ${RED}❌ public/uploads 不存在${NC}"
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
    mkdir -p "$BASE_DIR/php/runtime/"{cache,log}
    sudo chown -R www:www "$BASE_DIR/public/uploads" "$BASE_DIR/php/runtime" 2>/dev/null || true
    sudo chmod -R 755 "$BASE_DIR/public/uploads" "$BASE_DIR/php/runtime" 2>/dev/null || true

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
    echo -e "${YELLOW}🔨 构建 Next.js (standalone)...${NC}"
    pnpm build

    # 准备 Standalone 文件
    if [ -d ".next/standalone" ]; then
        echo -e "${YELLOW}📦 准备 Standalone 部署文件...${NC}"
        cp -r public .next/standalone/ 2>/dev/null || true
        cp .env .next/standalone/ 2>/dev/null || true
        cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
        # sharp 原生模块
        if [ -d "node_modules/sharp" ] && [ ! -d ".next/standalone/node_modules/sharp" ]; then
            echo -e "${YELLOW}📦 复制 sharp 原生模块...${NC}"
            cp -r node_modules/sharp .next/standalone/node_modules/ 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Standalone 文件准备完成${NC}"
        # 修复缓存目录权限（systemd 服务用户需要写权限）
        mkdir -p .next/standalone/.next/cache
        chmod -R 777 .next/standalone/.next/cache 2>/dev/null || true
    fi
    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${GREEN}✅ 跳过构建（使用 --rebuild 强制构建）${NC}"
fi

# ============================================================
# Step 4: 部署配置 & 重启服务
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/5: 部署配置 ━━━${NC}"

# 确保上传目录存在
mkdir -p "$BASE_DIR/public/uploads/"{goods,banners,news,avatars,baike,images,content}
chmod -R 777 "$BASE_DIR/public/uploads" 2>/dev/null || true

# 确保 MySQL 缺失表和列自动修补
if command -v mysql &>/dev/null; then
    echo -e "${YELLOW}🗄️ 检查 MySQL 表结构...${NC}"
    mysql -h"${MYSQL_HOST:-localhost}" -u"${MYSQL_USER:-fubao}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE:-fubao}" -e "
    -- 创建缺失的表
    CREATE TABLE IF NOT EXISTS certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        merchant_id INT NOT NULL,
        cert_type VARCHAR(50) NOT NULL DEFAULT 'business',
        cert_number VARCHAR(100),
        cert_image VARCHAR(500),
        status TINYINT DEFAULT 0 COMMENT '0:待审核,1:已通过,2:已拒绝',
        verified_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS articles (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL DEFAULT '',
        content LONGTEXT,
        summary TEXT,
        cover_image VARCHAR(500) NOT NULL DEFAULT '',
        category VARCHAR(100) NOT NULL DEFAULT '',
        author VARCHAR(100) NOT NULL DEFAULT '',
        source VARCHAR(200) NOT NULL DEFAULT '',
        tags JSON DEFAULT NULL,
        view_count INT NOT NULL DEFAULT 0,
        like_count INT NOT NULL DEFAULT 0,
        status TINYINT NOT NULL DEFAULT 1,
        published_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    -- 缺失列修补 (ADD COLUMN IF NOT EXISTS)
    ALTER TABLE admins ADD COLUMN IF NOT EXISTS last_login_at DATETIME DEFAULT NULL;
    ALTER TABLE news ADD COLUMN IF NOT EXISTS slug VARCHAR(200) NOT NULL DEFAULT '';
    ALTER TABLE news ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT '';
    ALTER TABLE news ADD COLUMN IF NOT EXISTS tags JSON DEFAULT NULL;
    ALTER TABLE news ADD COLUMN IF NOT EXISTS published_at DATETIME DEFAULT NULL;
    ALTER TABLE banners ADD COLUMN IF NOT EXISTS position VARCHAR(50) NOT NULL DEFAULT 'home';
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS image VARCHAR(500) NOT NULL DEFAULT '';
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

    -- 为已有 news 记录补上 published_at（取 created_at）
    UPDATE news SET published_at = created_at WHERE published_at IS NULL AND status = 1;
    " 2>/dev/null && echo -e "${GREEN}✅ MySQL 表结构修补完成${NC}" || echo -e "${YELLOW}⚠️  MySQL 表结构修补跳过（可能版本不支持 IF NOT EXISTS，尝试 schema.sql）${NC}"

    # 如果 ADD COLUMN IF NOT EXISTS 不被支持（MySQL < 8.0.29），则用 schema.sql 尾部修补
    if [ $? -ne 0 ] && [ -f "$BASE_DIR/sql/schema.sql" ]; then
        echo -e "${YELLOW}  尝试执行 schema.sql 修补...${NC}"
        mysql -h"${MYSQL_HOST:-localhost}" -u"${MYSQL_USER:-fubao}" -p"${MYSQL_PASSWORD}" "${MYSQL_DATABASE:-fubao}" < "$BASE_DIR/sql/schema.sql" 2>/dev/null && echo -e "${GREEN}  ✅ schema.sql 执行完成${NC}" || echo -e "${YELLOW}  ⚠️  schema.sql 执行跳过${NC}"
    fi
fi

# 确保 systemd 服务文件
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ] || ! diff -q "$BASE_DIR/fubao-nextjs.service" "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 更新 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
fi

# 重启 Next.js (systemd)
echo -e "${YELLOW}🔄 重启 $SERVICE_NAME...${NC}"
sudo systemctl restart "$SERVICE_NAME" 2>/dev/null || {
    echo -e "${RED}❌ systemd 服务启动失败${NC}"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -n 50"
    echo ""
    echo -e "${YELLOW}尝试直接启动...${NC}"
    if [ -f ".next/standalone/server.js" ]; then
        PORT=5000 NODE_ENV=production nohup node .next/standalone/server.js > /tmp/fubao-nextjs.log 2>&1 &
        sleep 3
        if curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://127.0.0.1:5000/" 2>/dev/null | grep -q "200"; then
            echo -e "${GREEN}  ✅ 直接启动成功${NC}"
        else
            echo -e "${RED}  ❌ 直接启动也失败${NC}"
            tail -20 /tmp/fubao-nextjs.log 2>/dev/null
        fi
    fi
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

# 检查 Next.js SSR
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$HOST_PORT/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Next.js SSR 正常 (端口 ${HOST_PORT}, HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Next.js 异常 (HTTP $HTTP_CODE)${NC}"
fi

# 检查 Nginx
if pgrep -x nginx &>/dev/null; then
    echo -e "${GREEN}✅ Nginx 运行中${NC}"
fi

# 验证 API 响应
echo ""
echo -e "${BLUE}━━━ 验证 API 响应 ━━━${NC}"

NX_API=$(curl -s --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/goods?limit=1" 2>/dev/null || echo "")
if echo "$NX_API" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Next.js API：响应格式正确 (success:true)${NC}"
elif [ -n "$NX_API" ]; then
    echo -e "${RED}❌ Next.js API：响应格式异常（可能跑的是旧代码）${NC}"
    echo "  响应: ${NX_API:0:120}"
    echo "  修复: bash update-fubao.sh --rebuild"
else
    echo -e "${RED}❌ Next.js 无响应${NC}"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -n 50"
fi

echo ""
echo "=============================================="
echo -e "  🎉 部署完成！"
echo "=============================================="
echo ""
echo "  🌐 访问地址: https://www.fubao.ltd"
echo "  📋 服务状态: sudo systemctl status $SERVICE_NAME"
echo "  📋 服务日志: sudo journalctl -u $SERVICE_NAME -f"
echo "  🔧 诊断模式: bash update-fubao.sh --diagnose"
echo "  🔧 强制重建: bash update-fubao.sh --rebuild"
echo ""
echo "  ⚠️  如果网站异常："
echo "  1. 查看服务日志: sudo journalctl -u $SERVICE_NAME -n 50"
echo "  2. 运行诊断: bash update-fubao.sh --diagnose"
echo "  3. 强制重建: bash update-fubao.sh --rebuild"
