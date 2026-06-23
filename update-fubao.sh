#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本
#
# 架构：Nginx → Next.js (standalone, 端口 5000)
#   Nginx 已配置所有请求代理到 Next.js (端口 5000)
#   Next.js API Routes 处理所有 /api/* 请求
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
    
    echo ""
    echo "2. 端口检测："
    PORT_INFO=$(ss -tlnp 2>/dev/null | grep ":${HOST_PORT} " | head -1)
    echo "  端口 ${HOST_PORT}: ${PORT_INFO:-未监听}"
    
    # 检查是否被 Docker 占用
    if echo "$PORT_INFO" | grep -q "docker-proxy"; then
        echo -e "  ${RED}⚠️  端口 ${HOST_PORT} 被 Docker 占用！systemd 服务无法启动${NC}"
        DOCKER_CONTAINER=$(docker ps --filter "publish=${HOST_PORT}" --format "{{.ID}} {{.Names}} {{.Image}}" 2>/dev/null | head -1)
        if [ -n "$DOCKER_CONTAINER" ]; then
            echo "  Docker 容器: $DOCKER_CONTAINER"
        fi
    fi
    
    echo ""
    echo "3. Next.js 响应测试："
    NX_RESP=$(curl -s --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/goods?limit=1" 2>/dev/null | head -c 150 || echo "无响应")
    if echo "$NX_RESP" | grep -q '"success":true'; then
        echo -e "  ${GREEN}✅ API 响应格式正确 (success:true)${NC}"
    else
        echo -e "  ${RED}❌ API 响应格式异常（可能跑的是旧代码）${NC}"
        echo "  响应: ${NX_RESP:0:120}"
    fi
    
    echo ""
    echo "4. Nginx 配置："
    for conf in \
        "/www/server/panel/vhost/nginx/www.fubao.ltd.conf" \
        "/www/server/nginx/conf/vhost/www.fubao.ltd.conf" \
        "/etc/nginx/conf.d/www.fubao.ltd.conf"; do
        if [ -f "$conf" ]; then
            echo "  配置文件: $conf"
            echo "  location / 处理:"
            grep -A 3 "location / " "$conf" 2>/dev/null | head -5
            break
        fi
    done
    
    echo ""
    echo "5. Standalone 构建状态："
    if [ -f ".next/standalone/server.js" ]; then
        BUILD_TIME=$(stat -c %Y ".next/standalone/server.js" 2>/dev/null || echo "unknown")
        BUILD_DATE=$(date -d "@$BUILD_TIME" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "unknown")
        echo -e "  ${GREEN}✅ Standalone 存在 (构建于 $BUILD_DATE)${NC}"
    else
        echo -e "  ${RED}❌ Standalone 不存在（需要构建）${NC}"
    fi
    
    exit 0
fi

# ============================================================
# 函数：停止占用端口的 Docker 容器
# ============================================================
stop_docker_on_port() {
    local port=$1
    local port_info=$(ss -tlnp 2>/dev/null | grep ":${port} " | head -1)
    
    if echo "$port_info" | grep -q "docker-proxy"; then
        echo -e "${YELLOW}🐳 检测到端口 ${port} 被 Docker 容器占用${NC}"
        
        # 查找占用端口的 Docker 容器
        local container_id=$(docker ps --filter "publish=${port}" --format "{{.ID}}" 2>/dev/null | head -1)
        
        if [ -n "$container_id" ]; then
            local container_name=$(docker inspect --format "{{.Name}}" "$container_id" 2>/dev/null | sed 's/\///')
            local container_image=$(docker inspect --format "{{.Config.Image}}" "$container_id" 2>/dev/null)
            
            echo -e "${YELLOW}  容器: ${container_name} (${container_image})${NC}"
            echo -e "${YELLOW}  正在停止容器...${NC}"
            
            docker stop "$container_id" 2>/dev/null || true
            docker rm "$container_id" 2>/dev/null || true
            
            echo -e "${GREEN}  ✅ Docker 容器已停止并移除${NC}"
        else
            # 找不到容器名，用 PID 反杀
            local pid=$(echo "$port_info" | grep -oP 'pid=\K\d+' | head -1)
            if [ -n "$pid" ]; then
                echo -e "${YELLOW}  用 PID $pid 停止 docker-proxy...${NC}"
                sudo kill "$pid" 2>/dev/null || true
                sleep 1
                echo -e "${GREEN}  ✅ docker-proxy 已停止${NC}"
            fi
        fi
        
        # 确认端口已释放
        sleep 2
        if ss -tlnp 2>/dev/null | grep -q ":${port} " | grep -q "LISTEN"; then
            echo -e "${RED}  ❌ 端口 ${port} 仍被占用！${NC}"
            return 1
        else
            echo -e "${GREEN}  ✅ 端口 ${port} 已释放${NC}"
        fi
    else
        echo -e "${GREEN}✅ 端口 ${port} 未被 Docker 占用${NC}"
    fi
}

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

    # 停止可能存在的 Docker 容器
    stop_docker_on_port $HOST_PORT

    # 注册 systemd 服务
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"

    echo -e "${GREEN}🎉 首次安装完成！执行 bash update-fubao.sh --rebuild 构建${NC}"
    exit 0
fi

# ============================================================
# Step 1: 停止 Docker 容器（关键步骤！）
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 1/7: 检查端口占用 ━━━${NC}"
stop_docker_on_port $HOST_PORT

# ============================================================
# Step 2: Git 拉取
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 2/7: 拉取代码 ━━━${NC}"

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
# Step 3: 安装依赖
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 3/7: 安装依赖 ━━━${NC}"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"

# ============================================================
# Step 4: 构建 Next.js
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 4/7: 构建项目 ━━━${NC}"

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
# Step 5: 部署配置
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 5/7: 部署配置 ━━━${NC}"

# --- 确保上传目录存在 ---
mkdir -p "$BASE_DIR/public/uploads/"{goods,banners,news,avatars,baike,images,content}
chmod -R 777 "$BASE_DIR/public/uploads" 2>/dev/null || true

# --- 确保 systemd 服务文件 ---
if [ ! -f "/etc/systemd/system/$SERVICE_NAME.service" ] || ! diff -q "$BASE_DIR/fubao-nextjs.service" "/etc/systemd/system/$SERVICE_NAME.service" >/dev/null 2>&1; then
    echo -e "${YELLOW}📋 更新 systemd 服务...${NC}"
    sudo cp "$BASE_DIR/fubao-nextjs.service" /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable "$SERVICE_NAME"
fi

# ============================================================
# Step 6: 重启服务
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 6/7: 重启服务 ━━━${NC}"

# --- 再次确认端口未被 Docker 占用 ---
stop_docker_on_port $HOST_PORT

# --- 重启 Next.js (systemd) ---
echo -e "${YELLOW}🔄 重启 $SERVICE_NAME...${NC}"
sudo systemctl restart "$SERVICE_NAME" 2>/dev/null || {
    echo -e "${RED}❌ systemd 服务启动失败${NC}"
    echo "  查看日志: sudo journalctl -u $SERVICE_NAME -n 50"
    echo ""
    echo -e "${YELLOW}尝试手动启动...${NC}"
    # 尝试直接用 node 启动 standalone
    if [ -f ".next/standalone/server.js" ]; then
        echo -e "${YELLOW}  用 nohup 直接启动 Next.js...${NC}"
        PORT=5000 NODE_ENV=production nohup node .next/standalone/server.js > /tmp/fubao-nextjs.log 2>&1 &
        sleep 3
        if curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://127.0.0.1:5000/" 2>/dev/null | grep -q "200"; then
            echo -e "${GREEN}  ✅ 手动启动成功${NC}"
        else
            echo -e "${RED}  ❌ 手动启动也失败了${NC}"
            cat /tmp/fubao-nextjs.log 2>/dev/null | tail -20
        fi
    fi
}

# ============================================================
# Step 7: 验证
# ============================================================
echo ""
echo -e "${BLUE}━━━ Step 7/7: 验证服务 ━━━${NC}"

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

# 检查谁在监听端口 5000
PORT_PROCESS=$(ss -tlnp 2>/dev/null | grep ":${HOST_PORT} " | head -1)
if echo "$PORT_PROCESS" | grep -q "docker-proxy"; then
    echo -e "${RED}❌ 端口 ${HOST_PORT} 仍被 Docker 占用！systemd 服务无法启动${NC}"
    echo "  请手动停止 Docker 容器: docker stop \$(docker ps -q --filter publish=${HOST_PORT})"
elif echo "$PORT_PROCESS" | grep -q "node"; then
    echo -e "${GREEN}✅ Next.js 正在运行 (node 进程, 端口 ${HOST_PORT})${NC}"
elif [ -n "$PORT_PROCESS" ]; then
    echo -e "${YELLOW}⚠️  端口 ${HOST_PORT} 被其他进程占用: ${PORT_PROCESS}${NC}"
else
    echo -e "${RED}❌ 端口 ${HOST_PORT} 没有进程监听${NC}"
fi

# 检查 systemd
if sudo systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ systemd 服务运行中${NC}"
else
    echo -e "${YELLOW}⚠️  systemd 服务未运行（可能在用 nohup 手动启动）${NC}"
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

# --- 验证 API 响应 ---
echo ""
echo -e "${BLUE}━━━ 验证 API 响应 ━━━${NC}"

NX_API=$(curl -s --max-time 5 "http://127.0.0.1:${HOST_PORT}/api/goods?limit=1" 2>/dev/null || echo "")
if echo "$NX_API" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Next.js API：响应格式正确 (success:true)${NC}"
    echo -e "${GREEN}🎉 部署成功！所有 API 使用新格式${NC}"
elif [ -n "$NX_API" ]; then
    echo -e "${RED}❌ Next.js API：响应格式异常（可能是旧代码）${NC}"
    echo "  响应: ${NX_API:0:120}"
    echo ""
    echo "  可能原因："
    echo "  1. Docker 容器仍在运行旧代码 → 执行: docker stop \$(docker ps -q)"
    echo "  2. standalone 构建产物过期 → 执行: bash update-fubao.sh --rebuild"
    echo "  3. systemd 服务启动失败 → 执行: sudo journalctl -u $SERVICE_NAME -n 50"
else
    echo -e "${RED}❌ Next.js 无响应${NC}"
    echo "  检查服务: sudo systemctl status $SERVICE_NAME"
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
echo "  ⚠️  如果 API 仍然返回旧格式："
echo "  1. 检查 Docker: docker ps | grep 5000"
echo "  2. 停止 Docker: docker stop \$(docker ps -q --filter publish=5000)"
echo "  3. 重启服务: sudo systemctl restart $SERVICE_NAME"
