#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本
#
# 架构：Nginx + PHP-FPM + Next.js (standalone, 端口 5000)
# 核心策略：PHP index.php 反向代理到 Next.js
#   - 所有 /api/* 请求先转给 Next.js
#   - Next.js 不可用时降级到 PHP 处理
#   - 无需修改 Nginx 配置即可让 Next.js API 生效
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
    echo -e "${BLUE}━━━ 诊断模式 ━━━${NC}"
    
    echo ""
    echo "1. 服务状态："
    echo "  Next.js (systemd): $(sudo systemctl is-active $SERVICE_NAME 2>/dev/null || echo '未安装')"
    echo "  Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo '未运行')"
    echo "  PHP-FPM: $(sudo systemctl is-active php-fpm 2>/dev/null || sudo systemctl is-active php8.2-fpm 2>/dev/null || echo '未运行')"
    
    echo ""
    echo "2. 端口检测："
    echo "  端口 5000 (Next.js): $(ss -tlnp 2>/dev/null | grep ':5000' | head -1 || echo '未监听')"
    echo "  端口 80 (Nginx): $(ss -tlnp 2>/dev/null | grep ':80 ' | head -1 || echo '未监听')"
    echo "  端口 443 (Nginx SSL): $(ss -tlnp 2>/dev/null | grep ':443 ' | head -1 || echo '未监听')"
    
    echo ""
    echo "3. Next.js 直接响应测试："
    NX_RESP=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:5000/" 2>/dev/null || echo "连接失败")
    echo "  http://127.0.0.1:5000/ → HTTP $NX_RESP"
    
    NX_API=$(curl -s --max-time 5 "http://127.0.0.1:5000/api/goods?limit=1" 2>/dev/null | head -c 150 || echo "无响应")
    echo "  http://127.0.0.1:5000/api/goods → ${NX_API:0:100}"
    
    echo ""
    echo "4. PHP 代理响应测试："
    PHP_API=$(curl -s --max-time 5 "http://127.0.0.1/api/goods?limit=1" 2>/dev/null | head -c 150 || echo "无响应")
    echo "  http://127.0.0.1/api/goods → ${PHP_API:0:100}"
    
    # 检查 PHP index.php 是否包含代理逻辑
    if [ -f "$BASE_DIR/php/public/index.php" ]; then
        if grep -q "nextjs" "$BASE_DIR/php/public/index.php" 2>/dev/null; then
            echo "  ✅ PHP index.php 已包含 Next.js 代理逻辑"
        else
            echo "  ❌ PHP index.php 未包含 Next.js 代理逻辑（需要更新）"
        fi
    fi
    
    echo ""
    echo "5. Nginx 配置："
    for conf in \
        "/www/server/panel/vhost/nginx/www.fubao.ltd.conf" \
        "/www/server/nginx/conf/vhost/www.fubao.ltd.conf" \
        "/etc/nginx/conf.d/www.fubao.ltd.conf"; do
        if [ -f "$conf" ]; then
            echo "  配置文件: $conf"
            echo "  location / 处理:"
            grep -A 5 "location / " "$conf" 2>/dev/null | head -8
            break
        fi
    done
    
    echo ""
    echo "6. SSL 证书："
    for cert in \
        "/www/server/panel/vhost/cert/www.fubao.ltd/fullchain.pem" \
        "/www/server/panel/vhost/cert/fubao.ltd/fullchain.pem"; do
        if [ -f "$cert" ]; then
            echo "  ✅ 证书: $cert"
            break
        fi
    done
    
    echo ""
    echo "7. 文件系统："
    echo "  public/uploads/: $(ls -la $BASE_DIR/public/uploads/ 2>/dev/null | head -5 || echo '不存在')"
    echo "  .next/standalone/: $([ -d $BASE_DIR/.next/standalone ] && echo '存在' || echo '不存在')"
    
    exit 0
fi

# ============================================================
# Step 0: 首次安装
# ============================================================
if [ "$NEED_INSTALL" = true ]; then
    echo ""
    echo -e "${BLUE}━━━ Step 0: 首次安装 ━━━${NC}"

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
    sudo chown -R www:www "$BASE_DIR/public/uploads" "$BASE_DIR/php/runtime"
    sudo chmod -R 755 "$BASE_DIR/public/uploads" "$BASE_DIR/php/runtime"

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
echo -e "${BLUE}━━━ Step 1/6: 拉取代码 ━━━${NC}"

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
echo -e "${BLUE}━━━ Step 2/6: 安装依赖 ━━━${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# ============================================================
# Step 3: 构建 Next.js
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 3/6: 构建项目 ━━━${NC}"

if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}🔨 构建 Next.js (standalone)...${NC}"
    pnpm build
    date +%s > .build-hash

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
    fi
    echo -e "${GREEN}✅ 构建完成${NC}"
else
    echo -e "${GREEN}✅ 跳过构建（使用 --rebuild 强制构建）${NC}"
fi

# ============================================================
# Step 4: 部署 PHP 反向代理 + 配置
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/6: 部署配置 ━━━${NC}"

# --- 核心：确保 PHP index.php 包含 Next.js 代理逻辑 ---
echo -e "${YELLOW}📋 检查 PHP 反向代理...${NC}"
PHP_INDEX="$BASE_DIR/php/public/index.php"
if [ -f "$PHP_INDEX" ]; then
    if grep -q "nextjs" "$PHP_INDEX" 2>/dev/null; then
        echo -e "${GREEN}✅ PHP index.php 已包含 Next.js 代理逻辑${NC}"
    else
        echo -e "${YELLOW}⚠️  PHP index.php 未包含代理逻辑，请确认代码已更新${NC}"
        echo "  git pull 后应该已更新此文件"
    fi
else
    echo -e "${RED}❌ PHP index.php 不存在${NC}"
fi

# --- 确保上传目录存在 ---
mkdir -p "$BASE_DIR/public/uploads/"{goods,banners,news,avatars,baike,images,content}
chmod -R 777 "$BASE_DIR/public/uploads" 2>/dev/null || true

# --- 确保 images 目录有产品图片 ---
if [ -d "$BASE_DIR/public/images" ]; then
    IMAGE_COUNT=$(find "$BASE_DIR/public/images" -name "*.jpg" -o -name "*.png" 2>/dev/null | wc -l)
    if [ "$IMAGE_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ 产品图片目录 (${IMAGE_COUNT} 张)${NC}"
    else
        echo -e "${YELLOW}⚠️  产品图片目录为空${NC}"
    fi
fi

# --- 确保 systemd 服务文件 ---
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ] || ! diff -q "$BASE_DIR/fubao-nextjs.service" "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 更新 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
fi

# ============================================================
# Step 5: 重启服务
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 5/6: 重启服务 ━━━${NC}"

# --- 重启 PHP-FPM ---
echo -e "${YELLOW}🔄 重启 PHP-FPM...${NC}"
sudo systemctl restart php-fpm 2>/dev/null || \
sudo systemctl restart php8.2-fpm 2>/dev/null || \
sudo systemctl restart php8.1-fpm 2>/dev/null || \
sudo systemctl restart php8.3-fpm 2>/dev/null || true
echo -e "${GREEN}✅ PHP-FPM 已重启${NC}"

# --- 重启 Next.js ---
echo -e "${YELLOW}🔄 重启 $SERVICE_NAME...${NC}"
sudo systemctl restart "$SERVICE_NAME"
echo -e "${GREEN}✅ Next.js 已重启${NC}"

# ============================================================
# Step 6: 验证
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 6/6: 验证服务 ━━━${NC}"

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
    echo -e "${RED}❌ systemd 服务未运行${NC}"
    echo "  日志: sudo journalctl -u $SERVICE_NAME -n 50"
fi

# 检查 Next.js SSR
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:$HOST_PORT/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Next.js SSR 正常 (端口 $HOST_PORT, HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Next.js 异常 (HTTP $HTTP_CODE)${NC}"
fi

# 检查 PHP-FPM
if sudo systemctl is-active --quiet php-fpm 2>/dev/null || sudo systemctl is-active --quiet php8.2-fpm 2>/dev/null; then
    echo -e "${GREEN}✅ PHP-FPM 运行中${NC}"
fi

# 检查 Nginx
if pgrep -x nginx &>/dev/null; then
    echo -e "${GREEN}✅ Nginx 运行中${NC}"
fi

# --- 验证 API 响应（通过 Next.js 直连）---
echo ""
echo -e "${BLUE}━━━ 验证 API 响应 ━━━${NC}"

# 方式1：直连 Next.js
NX_API=$(curl -s --max-time 5 "http://127.0.0.1:$HOST_PORT/api/goods?limit=1" 2>/dev/null || echo "")
if echo "$NX_API" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Next.js API 直连：响应格式正确 (success:true)${NC}"
elif echo "$NX_API" | grep -q '"success"'; then
    echo -e "${YELLOW}⚠️  Next.js API 直连：有 success 字段但值不是 true${NC}"
elif [ -n "$NX_API" ]; then
    echo -e "${YELLOW}⚠️  Next.js API 直连：无 success 字段${NC}"
    echo "  响应: ${NX_API:0:120}"
else
    echo -e "${RED}❌ Next.js API 直连：无响应${NC}"
fi

# 方式2：通过 PHP 代理（模拟 Nginx→PHP→Next.js 路径）
PHP_API=$(curl -s --max-time 10 "http://127.0.0.1/api/goods?limit=1" 2>/dev/null || echo "")
if echo "$PHP_API" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ PHP 代理路径：API 响应格式正确 (success:true)${NC}"
elif echo "$PHP_API" | grep -q '"success"'; then
    echo -e "${YELLOW}⚠️  PHP 代理路径：有 success 字段${NC}"
elif [ -n "$PHP_API" ]; then
    echo -e "${YELLOW}⚠️  PHP 代理路径：无 success 字段 → 代理可能未生效${NC}"
    echo "  响应: ${PHP_API:0:120}"
else
    echo -e "${RED}❌ PHP 代理路径：无响应${NC}"
fi

# --- 检查 X-Served-By 头 ---
SERVED_BY=$(curl -s -D - -o /dev/null --max-time 5 "http://127.0.0.1/api/categories" 2>/dev/null | grep -i "x-served-by" || echo "")
if echo "$SERVED_BY" | grep -q "nextjs-proxy"; then
    echo -e "${GREEN}✅ PHP 代理已确认转发到 Next.js (X-Served-By: nextjs-proxy)${NC}"
else
    echo -e "${YELLOW}⚠️  未检测到 Next.js 代理标识${NC}"
    echo "  可能原因: PHP cURL 未安装，或 PHP 代理逻辑未生效"
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
echo "  ⚠️  如果 API 仍然返回旧格式，请确认："
echo "  1. PHP cURL 扩展已安装: php -m | grep curl"
echo "  2. php/public/index.php 包含代理逻辑"
echo "  3. 运行诊断: bash update-fubao.sh --diagnose"
