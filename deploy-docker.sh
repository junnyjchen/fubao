#!/bin/bash
# ============================================
# 符寶網 - CentOS 7 + 宝塔 + Docker 一键部署
# ============================================
set -e

echo "=========================================="
echo "  符寶網 Docker 部署脚本"
echo "  CentOS 7 + 宝塔面板"
echo "=========================================="

# ---------- 1. 安装 Docker ----------
echo ""
echo "[1/5] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装: $(docker --version)"
fi

# ---------- 2. 进入网站目录 ----------
SITE_DIR="/www/wwwroot/fubao"
echo ""
echo "[2/5] 进入网站目录: $SITE_DIR"
cd "$SITE_DIR"

# ---------- 3. 拉取最新代码 ----------
echo ""
echo "[3/5] 拉取最新代码..."
if [ -d ".git" ]; then
    git pull origin main
else
    rm -rf ./*
    rm -rf .[!.]*
    git clone https://github.com/junnyjchen/fubao.git .
fi
echo "✅ 代码拉取完成"

# ---------- 4. 构建 Docker 镜像 ----------
echo ""
echo "[4/5] 构建 Docker 镜像..."
docker build -t fubao-web:latest .
echo "✅ 镜像构建完成"

# ---------- 5. 启动容器 ----------
echo ""
echo "[5/5] 启动容器..."

# 读取 .env 配置
if [ -f "$SITE_DIR/.env" ]; then
    source <(grep -E '^(MYSQL_|NEXT_PUBLIC_)' "$SITE_DIR/.env" | sed 's/^/export /')
fi
DB_HOST="${MYSQL_HOST:-host.docker.internal}"
if [ "$DB_HOST" = "127.0.0.1" ] || [ "$DB_HOST" = "localhost" ]; then
    DB_HOST="host.docker.internal"
fi

# 停止旧容器
docker stop fubao-nextjs 2>/dev/null || true
docker rm fubao-nextjs 2>/dev/null || true

# 启动新容器
docker run -d \
    --name fubao-nextjs \
    --restart unless-stopped \
    --add-host=host.docker.internal:host-gateway \
    -p 5000:3000 \
    -e NODE_ENV=production \
    -e PORT=3000 \
    -e MYSQL_HOST="$DB_HOST" \
    -e MYSQL_PORT="${MYSQL_PORT:-3306}" \
    -e MYSQL_USER="${MYSQL_USER:-fubao}" \
    -e MYSQL_PASSWORD="${MYSQL_PASSWORD:-}" \
    -e MYSQL_DATABASE="${MYSQL_DATABASE:-fubao}" \
    -e NEXT_PUBLIC_API_MODE="${NEXT_PUBLIC_API_MODE:-local}" \
    -v "$SITE_DIR/public/uploads:/app/public/uploads" \
    -v "$SITE_DIR/php/runtime:/app/php/runtime" \
    fubao-web:latest

echo "✅ 容器启动完成"

echo ""
echo "=========================================="
echo "  🎉 部署完成！"
echo "  访问地址: https://www.fubao.ltd"
echo "=========================================="
echo ""
echo "常用命令:"
echo "  查看日志: docker logs -f fubao-nextjs"
echo "  重启服务: docker restart fubao-nextjs"
echo "  更新部署: bash update-fubao.sh"
