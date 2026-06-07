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
SITE_DIR="/www/wwwroot/116.204.135.69"
echo ""
echo "[2/5] 进入网站目录: $SITE_DIR"
cd "$SITE_DIR"

# ---------- 3. 拉取最新代码 ----------
echo ""
echo "[3/5] 拉取最新代码..."
if [ -d ".git" ]; then
    git pull origin main
else
    # 清空目录后克隆
    rm -rf ./*
    rm -rf .[!.]*
    git clone https://github.com/junnyjchen/fubao.git .
fi
echo "✅ 代码拉取完成"

# ---------- 4. 构建 Docker 镜像 ----------
echo ""
echo "[4/5] 构建 Docker 镜像..."
docker build -t fubao:latest .
echo "✅ 镜像构建完成"

# ---------- 5. 启动容器 ----------
echo ""
echo "[5/5] 启动容器..."
# 停止旧容器
docker stop fubao 2>/dev/null || true
docker rm fubao 2>/dev/null || true
# 启动新容器
docker run -d \
    --name fubao \
    --restart always \
    -p 5000:5000 \
    fubao:latest
echo "✅ 容器启动完成"

echo ""
echo "=========================================="
echo "  🎉 部署完成！"
echo "  访问地址: http://116.204.135.69"
echo "=========================================="
echo ""
echo "常用命令:"
echo "  查看日志: docker logs -f fubao"
echo "  重启服务: docker restart fubao"
echo "  停止服务: docker stop fubao"
echo "  更新部署: bash /root/deploy-docker.sh"
