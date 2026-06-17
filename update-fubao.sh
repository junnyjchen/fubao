#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本
#
# 架构：
#   宿主机: Nginx + PHP-FPM（非容器）
#   Docker:  Next.js SSR（端口 5000）
#
# 使用方法：
#   bash update-fubao.sh              # 增量更新（推荐，快速）
#   bash update-fubao.sh --rebuild     # 强制重建镜像（package.json 变更后）
#   bash update-fubao.sh --check-php   # 检测 PHP 环境
#
# 服务器目录: /www/wwwroot/116.204.135.69
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
IMAGE_NAME="fubao-web"
CONTAINER_NAME="fubao-nextjs"
HOST_PORT=5000          # Next.js 端口（Docker 内部固定 5000）
BASE_DIR=""
NEED_REBUILD=false

# 解析参数
for arg in "$@"; do
    case $arg in
        --rebuild) NEED_REBUILD=true ;;
        --check-php)
            cd /www/wwwroot/116.204.135.69 2>/dev/null || cd "$(dirname "$0")"
            bash php/install-php-centos7.sh "$@"
            exit $?
            ;;
    esac
done

# ===== 自动检测项目目录 =====
if [ -d "/www/wwwroot/116.204.135.69" ]; then
    BASE_DIR="/www/wwwroot/116.204.135.69"
elif [ -d "/www/wwwroot/fubao" ]; then
    BASE_DIR="/www/wwwroot/fubao"
elif [ -d "$(dirname "$0")/src" ]; then
    BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
else
    echo -e "${RED}❌ 无法找到项目目录${NC}"
    echo "请确认项目位于以下位置之一："
    echo "  /www/wwwroot/116.204.135.69"
    echo "  /www/wwwroot/fubao"
    exit 1
fi

cd "$BASE_DIR"
echo -e "${BLUE}📂 项目目录: $BASE_DIR${NC}"

# ============================================================
# Step 1: 检测是否需要重建镜像
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 1/5: 检测变更 ━━━${NC}"

# 检查 package.json 是否变化（判断是否需要 rebuild）
if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}⚠️  强制重建模式 (--rebuild)${NC}"
elif [ -f ".docker-package-hash" ]; then
    CURRENT_HASH=$(md5sum package.json pnpm-lock.yaml 2>/dev/null | md5sum | awk '{print $1}')
    OLD_HASH=$(cat .docker-package-hash 2>/dev/null)
    if [ "$CURRENT_HASH" != "$OLD_HASH" ]; then
        echo -e "${YELLOW}📦 package.json 已变更，需要重建镜像${NC}"
        NEED_REBUILD=true
    else
        echo -e "${GREEN}✅ package.json 未变更，跳过重建${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  首次构建或无缓存记录，执行完整构建${NC}"
    NEED_REBUILD=true
fi

# ============================================================
# Step 2: Git 拉取最新代码
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 2/5: 拉取代码 ━━━${NC}"

if [ -d ".git" ]; then
    git pull origin main || git pull origin master || {
        echo -e "${YELLOW}⚠️  Git pull 失败，使用本地代码继续${NC}"
    }
    echo -e "${GREEN}✅ 代码已更新${NC}"
else
    echo -e "${YELLOW}⚠️  非 Git 仓库，跳过拉取${NC}"
fi

# ============================================================
# Step 3: 构建/更新 Docker 镜像
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 3/5: 构建 Docker ━━━${NC}"

if [ "$NEED_REBUILD" = true ] || ! docker image inspect "$IMAGE_NAME" &>/dev/null; then
    echo -e "${YELLOW}🔨 正在构建 Docker 镜像...${NC}"
    
    # 使用 BuildKit 缓存加速
    DOCKER_BUILDKIT=1 docker build \
        --cache-from="$IMAGE_NAME:latest" \
        --tag="$IMAGE_NAME:latest" \
        --tag="$IMAGE_NAME:$(date +%Y%m%d-%H%M)" \
        .
    
    # 记录 hash 用于增量判断
    md5sum package.json pnpm-lock.yaml 2>/dev/null | md5sum > .docker-package_hash
    
    echo -e "${GREEN}✅ 镜像构建完成${NC}"
else
    echo -e "${GREEN}✅ 镜像已存在且无需重建${NC}"
fi

# ============================================================
# Step 4: 更新容器
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/5: 启动容器 ━━━${NC}"

# 获取数据库配置（从环境变量或 php/config/database.php）
DB_HOST="${MYSQL_HOST:-localhost}"
DB_PORT="${MYSQL_PORT:-3306}"
DB_USER="${MYSQL_USER:-fubao}"
DB_PASS="${MYSQL_PASSWORD:-}"
DB_NAME="${MYSQL_DATABASE:-fubao}"
API_MODE="${NEXT_PUBLIC_API_MODE:-php}"

# 停止旧容器
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo -e "${YELLOW}⏹  停止旧容器...${NC}"
    docker stop "$CONTAINER_NAME" && docker rm "$CONTAINER_NAME"
fi

# 启动新容器
echo -e "${YELLOW}🚀 启动新容器...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$HOST_PORT:5000" \
    -e NODE_ENV=production \
    -e DEPLOY_RUN_PORT=5000 \
    -e MYSQL_HOST="$DB_HOST" \
    -e MYSQL_PORT="$DB_PORT" \
    -e MYSQL_USER="$DB_USER" \
    -e MYSQL_PASSWORD="$DB_PASS" \
    -e MYSQL_DATABASE="$DB_NAME" \
    -e NEXT_PUBLIC_API_MODE="$API_MODE" \
    -v "$BASE_DIR/public/uploads:/app/public/uploads" \
    -v "$BASE_DIR/php/runtime:/app/php/runtime" \
    "$IMAGE_NAME:latest"

echo -e "${GREEN}✅ 容器已启动${NC}"

# ============================================================
# Step 5: 验证
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 5/5: 验证服务 ━━━${NC}"

sleep 3

# 检查容器状态
if docker ps -q -f name="$CONTAINER_NAME" | grep -q .; then
    echo -e "${GREEN}✅ Docker 容器运行中${NC}"
    docker ps -f name="$CONTAINER_NAME" --format "  → {{.Status}} (端口: ${HOST_PORT})"
else
    echo -e "${RED}❌ 容器未运行！查看日志：docker logs $CONTAINER_NAME${NC}"
    docker logs "$CONTAINER_NAME" 2>&1 | tail -20
    exit 1
fi

# 检查 Next.js 响应
if curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:$HOST_PORT | grep -q "200\|304"; then
    echo -e "${GREEN}✅ Next.js SSR 正常响应 (http://localhost:${HOST_PORT})${NC}"
else
    echo -e "${RED}❌ Next.js 无响应，查看日志：docker logs $CONTAINER_NAME${NC}"
    docker logs "$CONTAINER_NAME" 2>&1 | tail -20
fi

# 检查 PHP-FPM（宿主机）
if pgrep -x "php-fpm" >/dev/null || pgrep "php-fpm:" >/dev/null; then
    echo -e "${GREEN}✅ PHP-FPM 运行中（宿主机）${NC}"
else
    echo -e "${RED}❌ PHP-FPM 未运行！（宿主机）${NC}"
    echo -e "${YELLOW}  安装/修复: bash $0 --check-php${NC}"
fi

# 检查 Nginx（宿主机）
if pgrep -x "nginx" >/dev/null; then
    echo -e "${GREEN}✅ Nginx 运行中（宿主机）${NC}"
else
    echo -e "${RED}❌ Nginx 未运行！（宿主机）${NC}"
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
echo "  🐳 容器状态: docker ps -f name=$CONTAINER_NAME"
echo "  📋 容器日志: docker logs -f $CONTAINER_NAME"
echo "  🔧 PHP 检测: bash $0 --check-php"
echo ""
echo "  如需强制重建:"
echo "    bash $0 --rebuild"
echo ""
