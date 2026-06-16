#!/bin/bash
# ============================================
# 符寶網 - 服务器一键更新脚本
# 适用于: CentOS 7 + 宝塔 + Docker + MySQL
# 使用方法: bash /root/update-fubao.sh
# ============================================

set -e

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "============================================"
echo "  符寶網 - 一键更新部署"
echo "============================================"

# ---------- 配置区 ----------
SITE_DIR="/www/wwwroot/116.204.135.69"
CONTAINER_NAME="fubao"
HOST_PORT=5000
IMAGE_NAME="fubao:latest"

# MySQL 配置
MYSQL_HOST="host.docker.internal"
MYSQL_PORT="3306"
MYSQL_USER="fubao"
MYSQL_PASSWORD="XNmEbBwKKe5HwnNW"
MYSQL_DATABASE="fubao"

# 如果 MySQL 在同一台机器上，Docker 内部用 host.docker.internal 访问宿主机
# CentOS 7 可能不支持 host.docker.internal，需要用宿主机实际 IP 或 --network host
# 检查是否支持 host.docker.internal
if ! docker run --rm alpine ping -c 1 host.docker.internal > /dev/null 2>&1; then
    # 不支持 host.docker.internal，使用宿主机内网 IP
    MYSQL_HOST=$(hostname -I | awk '{print $1}')
    echo -e "${YELLOW}[INFO]${NC} host.docker.internal 不可用，使用宿主机IP: $MYSQL_HOST"
fi

# AI 配置（如已有可填写）
DEEPSEEK_API_KEY="${DEEPSEEK_API_KEY:-}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"

# ---------- 步骤 1: 拉取最新代码 ----------
echo ""
echo -e "${BLUE}[1/5]${NC} 拉取最新代码..."
cd "$SITE_DIR"

if [ -d ".git" ]; then
    git fetch origin
    git reset --hard origin/main
    echo -e "${GREEN}✅${NC} 代码已更新到最新版本"
else
    echo -e "${YELLOW}⚠️${NC} 未发现 Git 仓库，跳过代码拉取"
fi

# ---------- 步骤 2: 安装依赖 & 构建 ----------
echo ""
echo -e "${BLUE}[2/5]${NC} 安装依赖..."
docker run --rm \
    -v "$SITE_DIR:/app" \
    -w /app \
    node:20-alpine \
    sh -c "npm install -g pnpm && pnpm install"

echo ""
echo -e "${BLUE}[3/5]${NC} 构建生产版本..."
docker run --rm \
    -v "$SITE_DIR:/app" \
    -w /app \
    node:20-alpine \
    sh -c "npm install -g pnpm && pnpm build"

echo -e "${GREEN}✅${NC} 构建完成"

# ---------- 步骤 4: 重建 Docker 镜像 ----------
echo ""
echo -e "${BLUE}[4/5]${NC} 重建 Docker 镜像..."
docker build -t $IMAGE_NAME "$SITE_DIR"
echo -e "${GREEN}✅${NC} 镜像构建完成"

# ---------- 步骤 5: 启动新容器 ----------
echo ""
echo -e "${BLUE}[5/5]${NC} 重启容器..."

# 停止并删除旧容器
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 启动新容器（包含 MySQL 环境变量）
docker run -d \
    --name $CONTAINER_NAME \
    --restart always \
    -p $HOST_PORT:5000 \
    -e NODE_ENV=production \
    -e DEPLOY_RUN_PORT=5000 \
    -e COZE_PROJECT_ENV=PROD \
    -e MYSQL_HOST=$MYSQL_HOST \
    -e MYSQL_PORT=$MYSQL_PORT \
    -e MYSQL_USER=$MYSQL_USER \
    -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
    -e MYSQL_DATABASE=$MYSQL_DATABASE \
    ${DEEPSEEK_API_KEY:+-e DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY} \
    ${OPENAI_API_KEY:+-e OPENAI_API_KEY=$OPENAI_API_KEY} \
    $IMAGE_NAME

echo -e "${GREEN}✅${NC} 容器启动完成"

# ---------- 等待服务就绪 ----------
echo ""
echo -n "等待服务启动"
for i in $(seq 1 15); do
    echo -n "."
    sleep 1
    if curl -s http://localhost:$HOST_PORT > /dev/null 2>&1; then
        break
    fi
done
echo ""

# ---------- 验证 ----------
echo ""
echo "============================================"
echo "  部署验证"
echo "============================================"

# 检查容器状态
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅${NC} 容器运行中"
else
    echo -e "${RED}❌${NC} 容器未运行，请检查: docker logs $CONTAINER_NAME"
    exit 1
fi

# 检查 HTTP 服务
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$HOST_PORT 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅${NC} 网站正常 (HTTP 200)"
else
    echo -e "${RED}❌${NC} 网站异常 (HTTP $HTTP_CODE)"
fi

# 检查数据库状态
DB_STATUS=$(curl -s http://localhost:$HOST_PORT/api/admin/database 2>/dev/null || echo "{}")
DB_ENGINE=$(echo $DB_STATUS | python3 -c "import sys,json; print(json.load(sys.stdin).get('engine','unknown'))" 2>/dev/null || echo "unknown")

if [ "$DB_ENGINE" = "mysql" ]; then
    echo -e "${GREEN}✅${NC} 数据库: MySQL (持久化)"
elif [ "$DB_ENGINE" = "mock" ]; then
    echo -e "${YELLOW}⚠️${NC} 数据库: Mock (内存，重启丢失)"
    echo -e "       如需切换到 MySQL，请确保容器能访问 MySQL 服务"
fi

# 检查 MySQL 连接（如果是 mock 模式）
if [ "$DB_ENGINE" = "mock" ]; then
    echo ""
    echo -e "${YELLOW}MySQL 连接排查:${NC}"
    echo "  1. 确认 MySQL 服务运行中: systemctl status mysqld"
    echo "  2. 确认用户可登录: mysql -u fubao -p'XNmEbBwKKe5HwnNW' fubao"
    echo "  3. 确认 Docker 能访问宿主机 MySQL:"
    echo "     docker exec $CONTAINER_NAME sh -c 'apt-get update && apt-get install -y default-mysql-client && mysql -h $MYSQL_HOST -u fubao -pXNmEbBwKKe5HwnNW fubao -e \"SELECT 1\"'"
    echo "  4. 如果 host.docker.internal 不通，尝试 --network host 模式:"
    echo "     docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME"
    echo "     docker run -d --name $CONTAINER_NAME --restart always --network host \\"
    echo "       -e NODE_ENV=production -e DEPLOY_RUN_PORT=5000 \\"
    echo "       -e MYSQL_HOST=127.0.0.1 -e MYSQL_PORT=3306 \\"
    echo "       -e MYSQL_USER=fubao -e MYSQL_PASSWORD=XNmEbBwKKe5HwnNW -e MYSQL_DATABASE=fubao \\"
    echo "       $IMAGE_NAME"
fi

echo ""
echo "============================================"
echo -e "  ${GREEN}🎉 更新完成！${NC}"
echo "============================================"
echo ""
echo "访问地址: http://116.204.135.69"
echo "数据库状态: http://116.204.135.69/api/admin/database"
echo ""
echo "常用命令:"
echo "  查看日志: docker logs -f $CONTAINER_NAME"
echo "  重启服务: docker restart $CONTAINER_NAME"
echo "  停止服务: docker stop $CONTAINER_NAME"
echo "  进入容器: docker exec -it $CONTAINER_NAME sh"
echo "  再次更新: bash /root/update-fubao.sh"
echo ""
