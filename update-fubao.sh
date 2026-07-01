#!/bin/bash
# ============================================================
# 符寶網 - 服务器一键更新部署脚本
#
# 架构：Nginx → Next.js standalone (node server.js, 端口 5000)
#
# 使用方法：
#   bash update-fubao.sh              # 增量更新
#   bash update-fubao.sh --rebuild    # 强制完整构建
#   bash update-fubao.sh --install    # 首次安装
#   bash update-fubao.sh --diagnose   # 诊断当前状态
#   bash update-fubao.sh --migrate    # 仅执行数据库迁移
#
# 服务器目录: /www/wwwroot/fubao
# ============================================================

set -e

# ━━━ 配置 ━━━
APP_DIR="/www/wwwroot/fubao"
SERVICE_NAME="fubao-nextjs"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
NODE_PORT=5000

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:-fubao}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-CZDhXEb8M7t1jheP}"
MYSQL_DATABASE="${MYSQL_DATABASE:-fubao}"

STANDALONE_DIR="${APP_DIR}/.next/standalone"

# ━━━ 颜色 ━━━
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }
step() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# ━━━ 数据库迁移 ━━━
run_migrations() {
    step "Step: 数据库迁移"
    if ! command -v mysql &>/dev/null; then
        warn "mysql 客户端未找到，跳过迁移"
        return
    fi

    local MIGRATION_FILE="${APP_DIR}/sql/migrate.sql"
    if [ ! -f "$MIGRATION_FILE" ]; then
        warn "迁移文件不存在: $MIGRATION_FILE"
        return
    fi

    if mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1" &>/dev/null; then
        log "MySQL 连接成功，执行迁移..."
        if mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < "$MIGRATION_FILE" 2>/dev/null; then
            log "数据库迁移完成"
        else
            warn "部分迁移语句可能已执行（列已存在等），可忽略"
        fi
    else
        warn "MySQL 不可用，跳过迁移"
    fi
}

# ━━━ standalone 部署准备 ━━━
prepare_standalone() {
    step "Step: 准备 standalone 部署"

    if [ ! -d "$STANDALONE_DIR" ]; then
        err "standalone 目录不存在: $STANDALONE_DIR"
        err "请先执行: pnpm build"
        exit 1
    fi

    # 复制必要文件到 standalone 目录
    log "复制 public 目录..."
    rm -rf "${STANDALONE_DIR}/public"
    cp -r "${APP_DIR}/public" "${STANDALONE_DIR}/public"

    log "复制 .next/static..."
    rm -rf "${STANDALONE_DIR}/.next/static"
    cp -r "${APP_DIR}/.next/static" "${STANDALONE_DIR}/.next/static"

    log "复制 .next/server/pages (500.html 等错误页面)..."
    if [ -d "${APP_DIR}/.next/server/pages" ]; then
        mkdir -p "${STANDALONE_DIR}/.next/server"
        rm -rf "${STANDALONE_DIR}/.next/server/pages"
        cp -r "${APP_DIR}/.next/server/pages" "${STANDALONE_DIR}/.next/server/pages"
    fi

    # 确保 .env 文件存在且内容正确（.gitignore 忽略，可能丢失或被覆盖）
    log "写入 .env 文件..."
    cat > "${APP_DIR}/.env" << ENVEOF
# MySQL 数据库配置
MYSQL_HOST=${MYSQL_HOST}
MYSQL_PORT=${MYSQL_PORT}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}

# AI 模型配置
AI_PROVIDER=deepseek

# API 模式
NEXT_PUBLIC_API_MODE=local
ENVEOF

    # 复制 .env 文件到 standalone
    cp -f "${APP_DIR}/.env" "${STANDALONE_DIR}/.env"
    log "复制 .env 文件"
    if [ -f "${APP_DIR}/.env.local" ]; then
        cp -f "${APP_DIR}/.env.local" "${STANDALONE_DIR}/.env.local"
        log "复制 .env.local 文件"
    fi
    if [ -f "${APP_DIR}/.env.production" ]; then
        cp -f "${APP_DIR}/.env.production" "${STANDALONE_DIR}/.env.production"
        log "复制 .env.production 文件"
    fi

    # 复制 sql 目录
    if [ -d "${APP_DIR}/sql" ]; then
        rm -rf "${STANDALONE_DIR}/sql"
        cp -r "${APP_DIR}/sql" "${STANDALONE_DIR}/sql"
    fi

    # 复制 data 目录（AI 配置、知识库等）
    # 注意：首次部署时复制，后续部署保留 standalone 中的 data（用户在后台的修改存在这里）
    if [ -d "${APP_DIR}/data" ]; then
        if [ ! -d "${STANDALONE_DIR}/data" ]; then
            cp -r "${APP_DIR}/data" "${STANDALONE_DIR}/data"
            log "首次部署，复制 data 目录"
        else
            log "保留现有 data 目录（含用户后台配置），跳过覆盖"
        fi
    fi

    # 修复缓存目录权限
    mkdir -p "${STANDALONE_DIR}/.next/cache"
    chown -R www-data:www-data "${STANDALONE_DIR}/.next/cache" 2>/dev/null || true

    log "standalone 部署准备完成"
}

# ━━━ 安装 systemd 服务 ━━━
install_service() {
    step "Step: 安装 systemd 服务"

    local SOURCE_SERVICE="${APP_DIR}/fubao-nextjs.service"
    if [ ! -f "$SOURCE_SERVICE" ]; then
        err "服务文件不存在: $SOURCE_SERVICE"
        exit 1
    fi

    cp -f "$SOURCE_SERVICE" "$SERVICE_FILE"
    systemctl daemon-reload
    log "systemd 服务文件已更新"
}

# ━━━ 停止 Docker 容器（如果占用端口）━━━
stop_docker_on_port() {
    local port=$1
    local pids
    pids=$(ss -lptn "sport = :${port}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u)
    for pid in $pids; do
        if grep -q "docker" "/proc/$pid/cmdline" 2>/dev/null; then
            warn "发现 Docker 容器占用端口 ${port} (PID: ${pid})"
            # 获取容器 ID
            local container_id
            container_id=$(docker ps -q --filter "publish=${port}" 2>/dev/null | head -1)
            if [ -n "$container_id" ]; then
                docker update --restart=no "$container_id" 2>/dev/null || true
                docker stop "$container_id" 2>/dev/null || true
                log "Docker 容器 ${container_id} 已停止"
            fi
        fi
    done
}

# ━━━ 构建项目 ━━━
build_project() {
    step "Step: 构建项目"

    cd "$APP_DIR"

    # 安装依赖
    log "安装依赖..."
    pnpm install --frozen-lockfile 2>/dev/null || pnpm install

    # 清理旧构建缓存（避免残留的 action ID 导致 "Failed to find Server Action"）
    log "清理旧构建缓存..."
    rm -rf .next

    # 构建
    log "执行 pnpm build..."
    pnpm build

    # 准备 standalone
    prepare_standalone

    log "构建完成"
}

# ━━━ 部署（重启服务）━━━
deploy() {
    step "Step: 部署"

    # 停止可能占用端口的 Docker 容器
    stop_docker_on_port $NODE_PORT

    # 确保 standalone 准备就绪
    prepare_standalone

    # 安装/更新 systemd 服务
    install_service

    # 重启服务
    log "重启 ${SERVICE_NAME}..."
    systemctl restart "$SERVICE_NAME"

    # 等待启动
    sleep 3

    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "服务启动成功"
    else
        err "服务启动失败"
        journalctl -u "$SERVICE_NAME" -n 20 --no-pager
        exit 1
    fi

    # 验证
    verify
}

# ━━━ 验证 ━━━
verify() {
    step "Step: 验证"

    # 检查服务状态
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log "服务运行中 (PID: $(systemctl show -p MainPID "$SERVICE_NAME" --value))"
    else
        err "服务未运行"
        return 1
    fi

    # 检查端口
    if curl -s -o /dev/null -w '%{http_code}' --max-time 5 "http://127.0.0.1:${NODE_PORT}/" | grep -qE '200|302'; then
        log "Next.js 响应正常 (端口 ${NODE_PORT})"
    else
        warn "Next.js 响应异常"
    fi

    # 检查 Nginx
    if curl -s -o /dev/null -w '%{http_code}' --max-time 5 -k "https://www.fubao.ltd/" | grep -qE '200|302'; then
        log "Nginx → Next.js 链路正常 (HTTPS)"
    else
        warn "Nginx → Next.js 链路异常"
    fi

    echo ""
    log "部署完成！访问 https://www.fubao.ltd"
}

# ━━━ 诊断 ━━━
diagnose() {
    step "诊断信息"

    echo "=== 服务状态 ==="
    systemctl status "$SERVICE_NAME" --no-pager 2>/dev/null || echo "服务未安装"
    echo ""

    echo "=== 端口监听 ==="
    ss -tlnp | grep ":${NODE_PORT}" || echo "端口 ${NODE_PORT} 未监听"
    echo ""

    echo "=== 最近日志 ==="
    journalctl -u "$SERVICE_NAME" -n 20 --no-pager
    echo ""

    echo "=== Nginx 配置 ==="
    if [ -f "/www/server/panel/vhost/nginx/www.fubao.ltd.conf" ]; then
        echo "Nginx 配置文件存在"
        nginx -t 2>&1 || true
    else
        warn "Nginx 配置文件不存在"
    fi
    echo ""

    echo "=== MySQL 连接 ==="
    if mysql -h"$MYSQL_HOST" -P"$MYSQL_PORT" -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1 AS ok" 2>/dev/null; then
        log "MySQL 连接正常"
    else
        warn "MySQL 不可用（将使用 Mock DB）"
    fi
    echo ""

    echo "=== 构建状态 ==="
    if [ -d "$STANDALONE_DIR" ]; then
        log "standalone 目录存在"
        if [ -f "${STANDALONE_DIR}/server.js" ]; then
            log "server.js 存在"
        else
            err "server.js 不存在"
        fi
    else
        err "standalone 目录不存在，需要 --rebuild"
    fi
}

# ━━━ 主流程 ━━━
FORCE_REBUILD=0

case "${1:-}" in
    --rebuild)
        FORCE_REBUILD=1
        cd "$APP_DIR"
        step "Step 1/5: 拉取代码"
        git pull origin main || true

        step "Step 2/5: 构建"
        build_project

        step "Step 3/5: 数据库迁移"
        run_migrations

        step "Step 4/5: 部署"
        deploy
        ;;

    --install)
        cd "$APP_DIR"
        step "Step 1/6: 安装 Node.js"
        if ! command -v node &>/dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y nodejs
        fi
        log "Node.js $(node -v)"

        if ! command -v pnpm &>/dev/null; then
            npm install -g pnpm
        fi
        log "pnpm $(pnpm -v)"

        step "Step 2/6: 拉取代码"
        if [ ! -d "$APP_DIR/.git" ]; then
            git clone https://github.com/junnyjchen/fubao.git "$APP_DIR"
        else
            git pull origin main || true
        fi

        step "Step 3/6: 构建"
        FORCE_REBUILD=1
        build_project

        step "Step 4/6: 数据库迁移"
        run_migrations

        step "Step 5/6: 部署"
        deploy

        step "Step 6/6: 安装提示"
        echo ""
        echo "  请确保 Nginx 配置正确，参考: ${APP_DIR}/php/nginx.conf"
        echo "  管理后台: https://www.fubao.ltd/admin (admin / admin123)"
        ;;

    --migrate)
        run_migrations
        ;;

    --diagnose)
        diagnose
        ;;

    *)
        # 增量更新
        cd "$APP_DIR"
        step "Step 1/4: 拉取代码"
        git pull origin main || true

        step "Step 2/4: 数据库迁移"
        run_migrations

        # 检查是否需要重新构建
        CURRENT_HASH=$(git rev-parse HEAD)
        BUILT_HASH=$(cat "${STANDALONE_DIR}/.build-hash" 2>/dev/null || echo "")

        if [ "$CURRENT_HASH" != "$BUILT_HASH" ] || [ ! -d "$STANDALONE_DIR" ]; then
            step "Step 3/4: 代码有变更，重新构建"
            build_project
            echo "$CURRENT_HASH" > "${STANDALONE_DIR}/.build-hash"
        else
            step "Step 3/4: 代码无变更，跳过构建"
            prepare_standalone
        fi

        step "Step 4/4: 部署"
        deploy
        ;;
esac
