#!/bin/bash
# ============================================
# 符寶網 一键更新脚本（优化版）
# - Docker: Nginx + PHP-FPM + Next.js SSR 统一部署
# - Docker 缓存优化：package.json 不变时跳过依赖安装
# - 支持 CentOS 7 (通过 Docker 运行 Node 20)
# ============================================

set -e

# ---------- 颜色 ----------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ---------- 配置 ----------
# 自动检测项目目录：优先用环境变量，其次自动查找
if [ -n "$FUBAO_DIR" ]; then
    SITE_DIR="$FUBAO_DIR"
elif [ -d "/www/wwwroot/116.204.135.69" ]; then
    SITE_DIR="/www/wwwroot/116.204.135.69"
elif [ -d "/root/fubao" ]; then
    SITE_DIR="/root/fubao"
elif [ -d "/opt/fubao" ]; then
    SITE_DIR="/opt/fubao"
elif [ -d "/home/fubao" ]; then
    SITE_DIR="/home/fubao"
else
    # 自动查找：从 git remote 或当前目录推断
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/package.json" ]; then
        SITE_DIR="$SCRIPT_DIR"
    else
        echo -e "${RED}✗${NC} 找不到项目目录！请设置环境变量："
        echo "  export FUBAO_DIR=/你的项目路径"
        echo "  然后重新运行脚本"
        exit 1
    fi
fi
CONTAINER_NAME="fubao-web"                # 容器名
IMAGE_NAME="fubao-web"                    # 镜像名
HOST_PORT=80                              # 宿主机端口（Nginx 监听 80）

# MySQL 配置
MYSQL_HOST="host.docker.internal"          # Docker 访问宿主机
MYSQL_PORT="3306"
MYSQL_USER="fubao"
MYSQL_PASSWORD="XNmEbBwKKe5HwnNW"
MYSQL_DATABASE="fubao"

# ---------- 检测是否只更新代码（不重建镜像） ----------
NEED_REBUILD=false
if [ "$1" = "--rebuild" ] || [ "$NEED_REBUILD_ENV" = "true" ]; then
    NEED_REBUILD=true
fi

echo ""
echo "============================================"
echo "  符寶網 一键更新（Nginx + PHP + Next.js）"
echo "============================================"
echo "  项目目录: $SITE_DIR"
echo "  容器名称: $CONTAINER_NAME"
echo "  宿主端口: $HOST_PORT"

# ---------- 步骤 1: 更新代码 ----------
echo ""
echo -e "${BLUE}[1/5]${NC} 更新代码..."
cd "$SITE_DIR"

# 记录更新前的 package.json 哈希
OLD_PKG_HASH=$(md5sum package.json 2>/dev/null | awk '{print $1}' || echo "")

git pull origin main || {
    echo -e "${YELLOW}⚠️${NC} Git pull 失败，使用当前代码继续"
}

# 检查 package.json 是否变化
NEW_PKG_HASH=$(md5sum package.json 2>/dev/null | awk '{print $1}' || echo "")
if [ "$OLD_PKG_HASH" != "$NEW_PKG_HASH" ]; then
    echo -e "${YELLOW}📦${NC} package.json 有变化，需要重建镜像"
    NEED_REBUILD=true
else
    echo -e "${GREEN}✅${NC} package.json 无变化，跳过依赖安装"
fi

# ---------- 步骤 2: 检查 PHP 环境 ----------
echo ""
echo -e "${BLUE}[2/5]${NC} 检查 PHP 环境..."
if [ -f "$SITE_DIR/php/check-env.php" ]; then
    echo -e "${GREEN}✅${NC} PHP 环境检测脚本可用"
    echo "  可在服务器上运行: php $SITE_DIR/php/check-env.php"
else
    echo -e "${YELLOW}⚠️${NC} 未找到 PHP 环境检测脚本"
fi

# ---------- 步骤 3: 同步 PHP 后端 ----------
echo ""
echo -e "${BLUE}[3/5]${NC} 同步 PHP 后端..."
if [ -d "$SITE_DIR/php" ]; then
    # 确保 PHP 运行时目录和上传目录存在
    mkdir -p "$SITE_DIR/php/runtime/cache" "$SITE_DIR/php/runtime/log"
    mkdir -p "$SITE_DIR/php/public/uploads/goods"
    echo -e "${GREEN}✅${NC} PHP 后端已就绪"
else
    echo -e "${YELLOW}⚠️${NC} 未找到 PHP 目录"
fi

# ---------- 步骤 4: 构建/更新 ----------
echo ""
if [ "$NEED_REBUILD" = true ]; then
    echo -e "${BLUE}[4/5]${NC} 重建 Docker 镜像（含 Nginx + PHP-FPM + Next.js）..."
    # 使用 BuildKit 缓存挂载，大幅加速依赖安装
    DOCKER_BUILDKIT=1 docker build -t $IMAGE_NAME "$SITE_DIR"
else
    # 只更新代码，不重建镜像（利用卷挂载）
    echo -e "${BLUE}[4/5]${NC} 增量更新（仅代码，不重建镜像）..."

    # 检查容器是否在运行
    if docker ps | grep -q $CONTAINER_NAME; then
        echo -e "${GREEN}✅${NC} 容器运行中，同步代码到容器..."

        # 同步关键代码文件到运行中的容器
        docker cp "$SITE_DIR/src" "$CONTAINER_NAME:/app/src" 2>/dev/null || true
        docker cp "$SITE_DIR/public" "$CONTAINER_NAME:/app/public" 2>/dev/null || true
        docker cp "$SITE_DIR/php" "$CONTAINER_NAME:/app/php" 2>/dev/null || true
        docker cp "$SITE_DIR/.next" "$CONTAINER_NAME:/app/.next" 2>/dev/null || true

        # 在容器内重新构建 Next.js
        echo -e "${YELLOW}⏳${NC} 容器内重新构建 Next.js..."
        docker exec $CONTAINER_NAME sh -c "cd /app && pnpm build" 2>/dev/null || {
            echo -e "${YELLOW}⚠️${NC} 容器内构建失败，改为重建镜像..."
            NEED_REBUILD=true
            DOCKER_BUILDKIT=1 docker build -t $IMAGE_NAME "$SITE_DIR"
        }

        if [ "$NEED_REBUILD" = false ]; then
            # 重启容器内服务（通过 supervisorctl）
            docker exec $CONTAINER_NAME supervisorctl restart nextjs 2>/dev/null || {
                # 降级：直接重启容器
                docker restart $CONTAINER_NAME
            }
            echo -e "${GREEN}✅${NC} 增量更新完成"
            # 跳到验证步骤
            echo ""
            SKIP_RECREATE=true
        fi
    else
        echo -e "${YELLOW}⚠️${NC} 容器未运行，需要重建镜像..."
        NEED_REBUILD=true
        DOCKER_BUILDKIT=1 docker build -t $IMAGE_NAME "$SITE_DIR"
    fi
fi

# ---------- 步骤 5: 启动容器（仅在需要时） ----------
if [ "$SKIP_RECREATE" != true ]; then
    echo ""
    echo -e "${BLUE}[5/5]${NC} 重启容器..."

    # 停止并删除旧容器
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true

    # 启动新容器
    # Nginx 监听 80 端口，内部代理 PHP-FPM (9000) 和 Next.js (5000)
    docker run -d \
        --name $CONTAINER_NAME \
        --restart always \
        -p $HOST_PORT:80 \
        -e NODE_ENV=production \
        -e DEPLOY_RUN_PORT=5000 \
        -e COZE_PROJECT_ENV=PROD \
        -e NEXT_PUBLIC_API_MODE=php \
        -e DB_HOST=$MYSQL_HOST \
        -e DB_PORT=$MYSQL_PORT \
        -e DB_USER=$MYSQL_USER \
        -e DB_PASSWORD=$MYSQL_PASSWORD \
        -e DB_NAME=$MYSQL_DATABASE \
        -e MYSQL_HOST=$MYSQL_HOST \
        -e MYSQL_PORT=$MYSQL_PORT \
        -e MYSQL_USER=$MYSQL_USER \
        -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
        -e MYSQL_DATABASE=$MYSQL_DATABASE \
        ${DEEPSEEK_API_KEY:+-e DEEPSEEK_API_KEY=$DEEPSEEK_API_KEY} \
        ${OPENAI_API_KEY:+-e OPENAI_API_KEY=$OPENAI_API_KEY} \
        $IMAGE_NAME

    echo -e "${GREEN}✅${NC} 容器启动完成"
fi

# ---------- 等待服务就绪 ----------
echo ""
echo -n "等待服务启动"
for i in $(seq 1 30); do
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

# 检查 PHP-FPM
PHP_CHECK=$(docker exec $CONTAINER_NAME php81 -v 2>/dev/null | head -1 || echo "")
if [ -n "$PHP_CHECK" ]; then
    echo -e "${GREEN}✅${NC} PHP: $PHP_CHECK"
else
    echo -e "${YELLOW}⚠️${NC} PHP 未检测到"
fi

# 检查数据库状态
DB_STATUS=$(curl -s http://localhost:$HOST_PORT/api/admin/database 2>/dev/null || echo "{}")
DB_ENGINE=$(echo $DB_STATUS | python3 -c "import sys,json; print(json.load(sys.stdin).get('engine','unknown'))" 2>/dev/null || echo "unknown")

if [ "$DB_ENGINE" = "mysql" ]; then
    echo -e "${GREEN}✅${NC} 数据库: MySQL (持久化)"
elif [ "$DB_ENGINE" = "mock" ]; then
    echo -e "${YELLOW}⚠️${NC} 数据库: Mock (内存，重启丢失)"
    echo -e "       如需切换 MySQL，检查 Docker 能否访问宿主机 MySQL"
fi

echo ""
echo "============================================"
echo -e "  ${GREEN}🎉 更新完成！${NC}"
echo "============================================"
echo ""
echo "访问地址: http://www.fubao.ltd"
echo "域名访问: https://www.fubao.ltd (如已配置 SSL)"
echo "数据库状态: http://www.fubao.ltd/api/admin/database"
echo "PHP 环境检测: php $SITE_DIR/php/check-env.php"
echo ""
echo "常用命令:"
echo "  查看日志:   docker logs -f $CONTAINER_NAME"
echo "  重启服务:   docker restart $CONTAINER_NAME"
echo "  停止服务:   docker stop $CONTAINER_NAME"
echo "  进入容器:   docker exec -it $CONTAINER_NAME sh"
echo "  强制重建:   bash $SITE_DIR/update-fubao.sh --rebuild"
echo "  查看 PHP:   docker exec $CONTAINER_NAME php81 -m"
echo "  查看进程:   docker exec $CONTAINER_NAME supervisorctl status"
