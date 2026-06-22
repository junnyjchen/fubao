#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本（原生模式）
#
# 架构：
#   宿主机: Nginx + PHP-FPM + Next.js（全部原生，无 Docker）
#   Next.js 端口: 5000
#
# 使用方法：
#   bash update-fubao.sh              # 增量更新（拉代码 + 装依赖 + 重启）
#   bash update-fubao.sh --rebuild     # 强制完整构建
#   bash update-fubao.sh --check-php   # 检测 PHP 环境
#   bash update-fubao.sh --install     # 首次安装（装 Node.js + 初始化）
#
# 服务器目录: /www/wwwroot/fubao
# 项目域名: www.fubao.ltd
# ============================================================

set -e

# ===== 颜色定义 =====
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

# 解析参数
for arg in "$@"; do
    case $arg in
        --rebuild) NEED_REBUILD=true ;;
        --install) NEED_INSTALL=true ;;
        --check-php)
            cd /www/wwwroot/fubao 2>/dev/null || cd "$(dirname "$0")"
            bash php/install-php-centos7.sh "$@"
            exit $?
            ;;
    esac
done

# ===== 自动检测项目目录 =====
if [ -d "/www/wwwroot/fubao" ]; then
    BASE_DIR="/www/wwwroot/fubao"
elif [ -d "$(dirname "$0")/src" ]; then
    BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
else
    echo -e "${RED}❌ 无法找到项目目录${NC}"
    echo "请确认项目位于以下位置："
    echo "  /www/wwwroot/fubao"
    exit 1
fi

cd "$BASE_DIR"
echo -e "${BLUE}📂 项目目录: $BASE_DIR${NC}"

# ============================================================
# Step 0: 首次安装（--install）
# ============================================================
if [ "$NEED_INSTALL" = true ]; then
    echo ""
    echo -e "${BLUE}━━━ Step 0: 首次安装 ━━━${NC}"

    # 安装 Node.js 20（如果未安装）
    if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt 18 ]; then
        echo -e "${YELLOW}📦 安装 Node.js 20...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
    else
        echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
    fi

    # 安装 pnpm
    if ! command -v pnpm &>/dev/null; then
        echo -e "${YELLOW}📦 安装 pnpm...${NC}"
        npm install -g pnpm
        echo -e "${GREEN}✅ pnpm $(pnpm -v)${NC}"
    else
        echo -e "${GREEN}✅ pnpm $(pnpm -v)${NC}"
    fi

    # 安装依赖
    echo -e "${YELLOW}📦 安装项目依赖...${NC}"
    pnpm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"

    # 创建必要目录
    echo -e "${YELLOW}📁 创建必要目录...${NC}"
    mkdir -p "$BASE_DIR/public/uploads/goods"
    mkdir -p "$BASE_DIR/public/uploads/content"
    mkdir -p "$BASE_DIR/public/uploads/news"
    mkdir -p "$BASE_DIR/public/uploads/baike"
    mkdir -p "$BASE_DIR/php/runtime/cache"
    mkdir -p "$BASE_DIR/php/runtime/log"
    sudo chown -R www:www "$BASE_DIR/public/uploads" "$BASE_DIR/php/runtime"
    sudo chmod -R 755 "$BASE_DIR/public/uploads" "$BASE_DIR/php/runtime"
    echo -e "${GREEN}✅ 目录创建完成${NC}"

    # 安装 systemd 服务
    echo -e "${YELLOW}📋 注册 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
    echo -e "${GREEN}✅ systemd 服务已注册${NC}"

    echo ""
    echo -e "${GREEN}🎉 首次安装完成！${NC}"
    echo "  执行 bash update-fubao.sh --rebuild 构建并启动"
    exit 0
fi

# ============================================================
# Step 1: Git 拉取最新代码
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 1/5: 拉取代码 ━━━${NC}"

if [ -d ".git" ]; then
    # 修复 Ubuntu 24.04 git 安全目录限制
    git config --global --add safe.directory "$BASE_DIR" 2>/dev/null
    git fetch origin 2>/dev/null || true
    BEFORE_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    git pull origin main || git pull origin master || {
        echo -e "${YELLOW}⚠️  Git pull 失败，使用本地代码继续${NC}"
    }
    AFTER_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    if [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
        echo -e "${GREEN}✅ 代码已更新 (${BEFORE_HASH:0:7} → ${AFTER_HASH:0:7})${NC}"
        NEED_REBUILD=true
    else
        echo -e "${GREEN}✅ 代码已是最新${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  非 Git 仓库，跳过拉取${NC}"
    # 非 git 仓库，检查文件变更
    CURRENT_TIMESTAMP=$(date +%s)
    LAST_BUILD=$(cat .build-hash 2>/dev/null || echo "0")
    if [ "$((CURRENT_TIMESTAMP - LAST_BUILD))" -gt 3600 ]; then
        NEED_REBUILD=true
    fi
fi

# --rebuild 参数强制构建
if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}📦 需要重新构建${NC}"
else
    echo -e "${GREEN}✅ 无需构建（使用 --rebuild 强制构建）${NC}"
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

    # 记录构建时间
    date +%s > .build-hash

    # Standalone 模式需要手动复制文件
    echo -e "${YELLOW}📦 准备 Standalone 部署文件...${NC}"
    if [ -d ".next/standalone" ]; then
        # 复制 public 目录到 standalone 输出
        cp -r public .next/standalone/ 2>/dev/null || true
        # 复制 .env 文件
        cp .env .next/standalone/ 2>/dev/null || true
        # 复制 .next/static
        cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
        # 确保 sharp 原生模块在 standalone 中可用
        if [ -d "node_modules/sharp" ] && [ ! -d ".next/standalone/node_modules/sharp" ]; then
            echo -e "${YELLOW}📦 复制 sharp 原生模块...${NC}"
            cp -r node_modules/sharp .next/standalone/node_modules/ 2>/dev/null || true
        fi
        echo -e "${GREEN}✅ Standalone 文件准备完成${NC}"
    fi

    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${GREEN}✅ 跳过构建（代码未变更，使用 --rebuild 强制构建）${NC}"
fi

# ============================================================
# Step 4: 部署配置 + 重启服务
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/5: 部署配置 + 重启服务 ━━━${NC}"

# --- 部署 Nginx 配置 ---
echo -e "${YELLOW}📋 部署 Nginx 配置...${NC}"
NGINX_CONF=""
# 宝塔面板路径
if [ -d "/www/server/panel/vhost/nginx" ]; then
    NGINX_CONF="/www/server/panel/vhost/nginx/www.fubao.ltd.conf"
# 手动安装路径
elif [ -d "/etc/nginx/conf.d" ]; then
    NGINX_CONF="/etc/nginx/conf.d/fubao.conf"
fi
if [ -n "$NGINX_CONF" ]; then
    sudo cp "$BASE_DIR/php/nginx.conf" "$NGINX_CONF"
    if sudo nginx -t 2>/dev/null; then
        sudo nginx -s reload 2>/dev/null || true
        echo -e "${GREEN}✅ Nginx 配置已更新并重载${NC}"
    else
        echo -e "${RED}❌ Nginx 配置语法错误，已部署但未重载${NC}"
        echo "  请手动检查: sudo nginx -t"
    fi
else
    echo -e "${YELLOW}⚠️  未检测到 Nginx 配置目录，请手动部署 php/nginx.conf${NC}"
fi

# --- 确保上传目录存在且可写 ---
mkdir -p "$BASE_DIR/public/uploads/goods" \
         "$BASE_DIR/public/uploads/banners" \
         "$BASE_DIR/public/uploads/news" \
         "$BASE_DIR/public/uploads/avatars" \
         "$BASE_DIR/public/uploads/baike" \
         "$BASE_DIR/public/uploads/images"
chmod -R 777 "$BASE_DIR/public/uploads" 2>/dev/null || true

# --- 确保 systemd 服务文件存在且最新 ---
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ] || ! diff -q "$BASE_DIR/fubao-nextjs.service" "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 更新 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
fi

# --- 重启 PHP-FPM ---
echo -e "${YELLOW}🔄 重启 PHP-FPM...${NC}"
if command -v systemctl &>/dev/null; then
    sudo systemctl restart php-fpm 2>/dev/null || \
    sudo systemctl restart php8.1-fpm 2>/dev/null || \
    sudo systemctl restart php8.2-fpm 2>/dev/null || \
    sudo systemctl restart php8.3-fpm 2>/dev/null || true
fi
echo -e "${GREEN}✅ PHP-FPM 已重启${NC}"

# --- 重启 Next.js ---
echo -e "${YELLOW}🔄 重启 $SERVICE_NAME...${NC}"
sudo systemctl restart "$SERVICE_NAME"
echo -e "${GREEN}✅ 服务已重启${NC}"

# ============================================================
# Step 5: 验证
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 5/5: 验证服务 ━━━${NC}"

# 等待 Next.js 启动
echo -e "${YELLOW}⏳ 等待 Next.js 启动...${NC}"
for i in $(seq 1 30); do
    if curl -s -o /dev/null -w '' "http://localhost:$HOST_PORT" 2>/dev/null; then
        break
    fi
    sleep 1
done

# 检查 systemd 服务状态
if sudo systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ systemd 服务运行中${NC}"
else
    echo -e "${RED}❌ systemd 服务未运行${NC}"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -n 50"
fi

# 检查 Next.js SSR
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$HOST_PORT" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ Next.js SSR 正常响应 (端口 $HOST_PORT)${NC}"
else
    echo -e "${RED}❌ Next.js 响应异常 (HTTP $HTTP_CODE)${NC}"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -n 50"
fi

# 检查 PHP-FPM
if curl -s -o /dev/null "http://localhost/api/categories" 2>/dev/null; then
    echo -e "${GREEN}✅ PHP-FPM 运行中${NC}"
else
    echo -e "${YELLOW}⚠️  PHP-FPM 可能未运行${NC}"
fi

# 检查 Nginx
if pgrep -x nginx &>/dev/null; then
    echo -e "${GREEN}✅ Nginx 运行中${NC}"
else
    echo -e "${RED}❌ Nginx 未运行${NC}"
fi

echo ""
echo "=============================================="
echo -e "  🎉 部署完成！"
echo "=============================================="
echo ""
echo "  🌐 访问地址: https://www.fubao.ltd"
echo "  📋 服务状态: sudo systemctl status $SERVICE_NAME"
echo "  📋 服务日志: sudo journalctl -u $SERVICE_NAME -f"
echo "  🔧 PHP 检测: bash update-fubao.sh --check-php"
