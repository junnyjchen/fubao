#!/bin/bash

################################################################################
# 符寶網项目部署脚本 - 生产环境
# 用途：自动化部署符寶網项目到生产服务器
# 使用方法：sudo bash deploy.sh
################################################################################

set -Eeuo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置变量
PROJECT_NAME="fubao-net"
SITE_DIR="/www/wwwroot/${PROJECT_NAME}"
BACKUP_DIR="/www/backup/${PROJECT_NAME}"
PORT=5000

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 权限运行此脚本: sudo bash deploy.sh"
        exit 1
    fi
}

# 备份现有站点
backup_site() {
    log_info "备份现有站点..."

    if [ -d "$SITE_DIR" ]; then
        # 创建备份目录
        mkdir -p "$BACKUP_DIR"

        # 停止 PM2 应用
        if command -v pm2 &> /dev/null; then
            log_info "停止 PM2 应用..."
            pm2 stop ${PROJECT_NAME} 2>/dev/null || true
        fi

        # 创建备份
        BACKUP_PATH="${BACKUP_DIR}/${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S)"
        log_info "备份到: $BACKUP_PATH"
        cp -r "$SITE_DIR" "$BACKUP_PATH"

        log_success "备份完成"
    else
        log_info "未发现现有站点，跳过备份"
    fi
}

# 创建项目目录
create_site_dir() {
    log_info "创建项目目录..."

    mkdir -p "$SITE_DIR"
    chown -R www:www "$SITE_DIR"
    chmod -R 755 "$SITE_DIR"

    log_success "项目目录已创建: $SITE_DIR"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."

    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "未检测到 Node.js，请在宝塔面板安装 Node.js 20.x"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 版本过低（当前: $(node -v)），需要 18.x 或更高版本"
        exit 1
    fi

    log_success "Node.js 版本: $(node -v)"

    # 检查 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warning "未检测到 pnpm，正在安装..."
        npm install -g pnpm
    fi

    log_success "pnpm 版本: $(pnpm -v)"

    # 检查 PM2
    if ! command -v pm2 &> /dev/null; then
        log_warning "未检测到 PM2，正在安装..."
        npm install -g pm2
    fi

    log_success "PM2 版本: $(pm2 -v)"

    # 检查 Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "未检测到 Nginx，请在宝塔面板安装"
        exit 1
    fi

    log_success "Nginx 已安装"
}

# 创建环境变量文件
create_env_file() {
    log_info "创建环境变量文件..."

    ENV_FILE="${SITE_DIR}/.env.local"

    if [ ! -f "$ENV_FILE" ]; then
        cat > "$ENV_FILE" << 'EOF'
# Supabase 配置
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥（请修改为安全的随机字符串）
JWT_SECRET=fubao-net-jwt-secret-change-me-in-production
EOF

        chmod 600 "$ENV_FILE"
        chown www:www "$ENV_FILE"

        log_warning "环境变量文件已创建，请修改配置: $ENV_FILE"
        log_warning "需要修改的配置项:"
        echo "  - COZE_SUPABASE_URL"
        echo "  - COZE_SUPABASE_ANON_KEY"
        echo "  - JWT_SECRET"
        read -p "是否现在编辑配置文件? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vi "$ENV_FILE"
        fi
    else
        log_info "环境变量文件已存在: $ENV_FILE"
    fi
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx 反向代理..."

    NGINX_CONF="/www/server/panel/vhost/nginx/${PROJECT_NAME}.conf"

    cat > "$NGINX_CONF" << 'EOF'
server {
    listen 80;
    server_name 47.238.127.141;

    # 日志
    access_log /www/wwwroot/fubao-net/access.log;
    error_log /www/wwwroot/fubao-net/error.log;

    # 反向代理到 PM2 应用
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    location /static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 测试 Nginx 配置
    if nginx -t; then
        log_success "Nginx 配置测试通过"
        # 重载 Nginx
        nginx -s reload
        log_success "Nginx 已重载"
    else
        log_error "Nginx 配置测试失败"
        exit 1
    fi
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "    符寶網项目部署脚本 - 生产环境"
    echo "========================================"
    echo ""

    check_root

    # 确认操作
    log_warning "即将执行以下操作："
    echo "  1. 备份现有站点（如果有）"
    echo "  2. 创建项目目录"
    echo "  3. 检查并安装依赖"
    echo "  4. 配置环境变量"
    echo "  5. 配置 Nginx"
    echo ""
    log_warning "注意：此脚本仅进行环境配置，不包含代码上传"
    echo "        代码需要通过其他方式上传到: $SITE_DIR"
    echo ""
    read -p "确认继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "操作已取消"
        exit 0
    fi

    # 执行部署步骤
    backup_site
    create_site_dir
    check_dependencies
    create_env_file
    configure_nginx

    echo ""
    log_success "环境配置完成！"
    echo ""
    log_info "接下来的步骤："
    echo "  1. 将项目文件上传到 $SITE_DIR"
    echo "  2. 在项目目录执行构建和启动命令"
    echo ""
    log_success "构建和启动命令："
    echo ""
    echo "cd $SITE_DIR"
    echo "pnpm install"
    echo "pnpm build"
    echo "pm2 start dist/server.js --name $PROJECT_NAME"
    echo "pm2 save"
    echo "pm2 startup"
    echo ""
    log_success "配置文件位置："
    echo "  - Nginx配置: $NGINX_CONF"
    echo "  - 环境变量: ${SITE_DIR}/.env.local"
    echo ""
}

# 执行主函数
main
