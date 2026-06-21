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
# Step 1: 检测是否需要完整构建
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 1/5: 检测变更 ━━━${NC}"

if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}⚠️  强制重建模式 (--rebuild)${NC}"
elif [ -f ".build-hash" ]; then
    CURRENT_HASH=$(md5sum package.json pnpm-lock.yaml 2>/dev/null | md5sum | awk '{print $1}')
    OLD_HASH=$(cat .build-hash 2>/dev/null)
    if [ "$CURRENT_HASH" != "$OLD_HASH" ]; then
        echo -e "${YELLOW}📦 package.json 已变更，需要重新构建${NC}"
        NEED_REBUILD=true
    else
        echo -e "${GREEN}✅ package.json 未变更，跳过构建${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  首次构建${NC}"
    NEED_REBUILD=true
fi

# ============================================================
# Step 2: Git 拉取最新代码
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 2/5: 拉取代码 ━━━${NC}"

if [ -d ".git" ]; then
    # 修复 Ubuntu 24.04 git 安全目录限制
    git config --global --add safe.directory "$BASE_DIR" 2>/dev/null
    git pull origin main || git pull origin master || {
        echo -e "${YELLOW}⚠️  Git pull 失败，使用本地代码继续${NC}"
    }
    echo -e "${GREEN}✅ 代码已更新${NC}"
else
    echo -e "${YELLOW}⚠️  非 Git 仓库，跳过拉取${NC}"
fi

# ============================================================
# Step 3: 安装依赖 + 构建
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 3/5: 构建项目 ━━━${NC}"

# 安装依赖
echo -e "${YELLOW}📦 安装依赖...${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 构建
if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}🔨 构建 Next.js...${NC}"
    pnpm build
    md5sum package.json pnpm-lock.yaml 2>/dev/null | md5sum > .build-hash

    # Standalone 模式需要手动复制 public 和 .env
    echo -e "${YELLOW}📦 准备 Standalone 部署文件...${NC}"
    # 复制 public 目录到 standalone 输出
    if [ -d ".next/standalone" ]; then
        cp -r public .next/standalone/ 2>/dev/null || true
        # 复制 .env 文件
        cp .env .next/standalone/ 2>/dev/null || true
        # 复制 .next/static
        cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
        echo -e "${GREEN}✅ Standalone 文件准备完成${NC}"
    fi

    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${GREEN}✅ 跳过构建（代码未变更）${NC}"
fi

# ============================================================
# Step 4: 重启服务
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/5: 重启服务 ━━━${NC}"

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
        echo -e "${GREEN}✅ Nginx 配置已更新${NC}"
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

# 确保 systemd 服务文件存在
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ] || ! diff -q "$BASE_DIR/fubao-nextjs.service" "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 更新 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
fi

# 重启服务
echo -e "${YELLOW}🔄 重启 $SERVICE_NAME...${NC}"
sudo systemctl restart "$SERVICE_NAME"
echo -e "${GREEN}✅ 服务已重启${NC}"

# ============================================================
# Step 5: 验证
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 5/5: 验证服务 ━━━${NC}"

# 检查 systemd 服务状态
if systemctl is-active --quiet "$SERVICE_NAME"; then
    echo -e "${GREEN}✅ systemd 服务运行中${NC}"
else
    echo -e "${RED}❌ 服务未运行！查看日志：${NC}"
    echo "  sudo journalctl -u $SERVICE_NAME -n 30 --no-pager"
    sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    exit 1
fi

# 检查 Next.js 响应（最多等 30 秒）
echo -n "⏳ 等待 Next.js 启动"
for i in $(seq 1 15); do
    sleep 2
    echo -n "."
    if curl -sf --max-time 3 http://localhost:$HOST_PORT > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Next.js SSR 正常响应 (端口 $HOST_PORT)${NC}"
        break
    fi
    if [ "$i" -eq 15 ]; then
        echo ""
        echo -e "${RED}❌ Next.js 超时无响应，查看日志：${NC}"
        echo "  sudo journalctl -u $SERVICE_NAME -n 30 --no-pager"
        sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    fi
done

# 检查 PHP-FPM
if pgrep -x "php-fpm" >/dev/null || pgrep "php-fpm:" >/dev/null 2>/dev/null; then
    echo -e "${GREEN}✅ PHP-FPM 运行中${NC}"
else
    echo -e "${YELLOW}⚠️  PHP-FPM 未运行（如不需要 PHP API 可忽略）${NC}"
fi

# 检查 Nginx
if pgrep -x "nginx" >/dev/null; then
    echo -e "${GREEN}✅ Nginx 运行中${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx 未运行${NC}"
fi

# ============================================================
# 完成
# ============================================================
echo ""
echo "=============================================="
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo "=============================================="
echo ""
echo "  🌐 访问地址: https://www.fubao.ltd"
echo "  📋 服务状态: sudo systemctl status $SERVICE_NAME"
echo "  📋 服务日志: sudo journalctl -u $SERVICE_NAME -f"
echo "  🔧 PHP 检测: bash $0 --check-php"
echo ""
echo "  如需强制重建:"
echo "    bash $0 --rebuild"
echo ""
