#!/bin/bash

################################################################################
# 符寶網一键安装部署脚本 - 生产环境
# 说明：此脚本会自动完成从代码获取到部署的全过程
# 使用方法：sudo bash one-click-deploy.sh
################################################################################

set -Eeuo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 配置变量
PROJECT_NAME="fubao-net"
SITE_DIR="/www/wwwroot/${PROJECT_NAME}"
BACKUP_DIR="/www/backup/${PROJECT_NAME}"
PORT=5000

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

# 打印横幅
print_banner() {
    echo ""
    echo -e "${PURPLE}========================================${NC}"
    echo -e "${PURPLE}    符寶網一键安装部署脚本${NC}"
    echo -e "${PURPLE}    版本: 1.0.0${NC}"
    echo -e "${PURPLE}========================================${NC}"
    echo ""
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 root 权限运行此脚本"
        log_info "使用方法: sudo bash one-click-deploy.sh"
        exit 1
    fi
}

# 等待用户输入
wait_for_input() {
    log_warning "按回车键继续，或 Ctrl+C 退出..."
    read
}

# 步骤1：环境检查
step_1_check_environment() {
    log_step "步骤 1/10: 环境检查"

    # 检查系统
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        log_info "操作系统: $NAME $VERSION"
    fi

    # 检查宝塔面板
    if [ -d "/www/server/panel" ]; then
        log_success "宝塔面板已安装"
    else
        log_warning "未检测到宝塔面板，将使用原生方式安装"
    fi

    # 检查 Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js 版本: $(node -v)"
    else
        log_warning "未检测到 Node.js，将自动安装"
    fi

    # 检查 Nginx
    if command -v nginx &> /dev/null; then
        log_success "Nginx 已安装: $(nginx -v 2>&1)"
    else
        log_warning "未检测到 Nginx，将自动安装"
    fi

    echo ""
}

# 步骤2：安装依赖
step_2_install_dependencies() {
    log_step "步骤 2/10: 安装系统依赖"

    # 更新包管理器
    if command -v apt-get &> /dev/null; then
        apt-get update -y
        apt-get install -y curl wget git vim unzip
    elif command -v yum &> /dev/null; then
        yum update -y
        yum install -y curl wget git vim unzip
    fi

    # 安装 Node.js 20.x
    if ! command -v node &> /dev/null; then
        log_info "安装 Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
        log_success "Node.js 安装完成: $(node -v)"
    fi

    # 安装 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "安装 pnpm..."
        npm install -g pnpm
        log_success "pnpm 安装完成: $(pnpm -v)"
    fi

    # 安装 PM2
    if ! command -v pm2 &> /dev/null; then
        log_info "安装 PM2..."
        npm install -g pm2
        log_success "PM2 安装完成: $(pm2 -v)"
    fi

    # 安装 Nginx
    if ! command -v nginx &> /dev/null; then
        log_info "安装 Nginx..."
        apt-get install -y nginx
        log_success "Nginx 安装完成"
    fi

    echo ""
}

# 步骤3：备份现有站点
step_3_backup_site() {
    log_step "步骤 3/10: 备份现有站点"

    if [ -d "$SITE_DIR" ]; then
        # 创建备份目录
        mkdir -p "$BACKUP_DIR"

        # 停止 PM2 应用
        if command -v pm2 &> /dev/null; then
            pm2 stop ${PROJECT_NAME} 2>/dev/null || true
            pm2 delete ${PROJECT_NAME} 2>/dev/null || true
        fi

        # 创建备份
        BACKUP_PATH="${BACKUP_DIR}/${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S)"
        log_info "备份到: $BACKUP_PATH"
        cp -r "$SITE_DIR" "$BACKUP_PATH"

        log_success "备份完成"
    else
        log_info "未发现现有站点，跳过备份"
    fi

    echo ""
}

# 步骤4：创建项目目录
step_4_create_project_dir() {
    log_step "步骤 4/10: 创建项目目录"

    rm -rf "$SITE_DIR"
    mkdir -p "$SITE_DIR"
    chown -R www:www "$SITE_DIR" 2>/dev/null || chown -R root:root "$SITE_DIR"
    chmod -R 755 "$SITE_DIR"

    log_success "项目目录已创建: $SITE_DIR"
    echo ""
}

# 步骤5：创建环境变量文件
step_5_create_env_file() {
    log_step "步骤 5/10: 创建环境变量文件"

    ENV_FILE="${SITE_DIR}/.env.local"

    cat > "$ENV_FILE" << 'EOF'
# Supabase 配置（请修改为实际值）
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥（请修改为安全随机字符串）
JWT_SECRET=fubao-net-jwt-secret-$(date +%s)
EOF

    chmod 600 "$ENV_FILE"
    chown www:www "$ENV_FILE" 2>/dev/null || chown root:root "$ENV_FILE"

    log_success "环境变量文件已创建"
    log_warning "请稍后修改: $ENV_FILE 中的 Supabase 配置"
    echo ""
}

# 步骤6：上传项目文件（提示用户）
step_6_upload_project() {
    log_step "步骤 6/10: 上传项目文件"

    log_info "请将项目文件上传到: $SITE_DIR"
    log_info "上传方式："
    echo "  1. 使用宝塔文件管理上传"
    echo "  2. 使用 SCP: scp -r /path/to/project/* root@47.238.127.141:$SITE_DIR"
    echo "  3. 使用 Git: cd $SITE_DIR && git clone <repo-url> ."
    echo ""

    wait_for_input

    # 检查是否有文件
    if [ ! -f "${SITE_DIR}/package.json" ]; then
        log_warning "未检测到 package.json，请确保已上传项目文件"
        log_info "是否继续？(y/n)"
        read -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "部署已取消"
            exit 1
        fi
    else
        log_success "检测到项目文件"
    fi

    echo ""
}

# 步骤7：安装项目依赖
step_7_install_dependencies() {
    log_step "步骤 7/10: 安装项目依赖"

    cd "$SITE_DIR"

    log_info "执行 pnpm install..."
    pnpm install

    log_success "项目依赖安装完成"
    echo ""
}

# 步骤8：构建项目
step_8_build_project() {
    log_step "步骤 8/10: 构建项目"

    cd "$SITE_DIR"

    log_info "执行 pnpm build..."
    pnpm build

    if [ -f "dist/server.js" ]; then
        log_success "项目构建完成"
    else
        log_error "项目构建失败"
        exit 1
    fi

    echo ""
}

# 步骤9：配置 Nginx
step_9_configure_nginx() {
    log_step "步骤 9/10: 配置 Nginx"

    NGINX_CONF="/www/server/panel/vhost/nginx/${PROJECT_NAME}.conf"

    # 如果宝塔目录不存在，使用系统目录
    if [ ! -d "/www/server/panel/vhost" ]; then
        NGINX_CONF="/etc/nginx/sites-available/${PROJECT_NAME}"
        mkdir -p "$(dirname "$NGINX_CONF")"
    fi

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

    # 创建软链接（如果是系统目录）
    if [ -f "/etc/nginx/sites-available/${PROJECT_NAME}" ]; then
        ln -sf "/etc/nginx/sites-available/${PROJECT_NAME}" "/etc/nginx/sites-enabled/"
    fi

    # 测试 Nginx 配置
    if nginx -t; then
        log_success "Nginx 配置测试通过"
        nginx -s reload
        log_success "Nginx 已重载"
    else
        log_error "Nginx 配置测试失败"
        exit 1
    fi

    echo ""
}

# 步骤10：启动应用
step_10_start_app() {
    log_step "步骤 10/10: 启动应用"

    cd "$SITE_DIR"

    log_info "使用 PM2 启动应用..."
    pm2 start dist/server.js --name ${PROJECT_NAME}

    log_info "设置 PM2 开机自启..."
    pm2 save
    pm2 startup

    log_success "应用已启动"
    echo ""
}

# 显示部署结果
show_result() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}    部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}访问地址：${NC} http://47.238.127.141"
    echo ""
    echo -e "${BLUE}常用命令：${NC}"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs ${PROJECT_NAME}"
    echo "  重启应用: pm2 restart ${PROJECT_NAME}"
    echo "  停止应用: pm2 stop ${PROJECT_NAME}"
    echo ""
    echo -e "${YELLOW}后续操作：${NC}"
    echo "  1. 修改环境变量: vi ${SITE_DIR}/.env.local"
    echo "  2. 配置 SSL 证书（在宝塔面板中）"
    echo "  3. 配置防火墙规则"
    echo ""
}

# 主函数
main() {
    print_banner

    log_warning "即将开始自动部署，请确保："
    echo "  1. 已准备好项目文件"
    echo "  2. 已知数据库连接信息"
    echo "  3. 已知 Supabase 配置信息"
    echo ""

    read -p "确认开始部署? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "部署已取消"
        exit 0
    fi

    echo ""

    # 执行部署步骤
    step_1_check_environment
    step_2_install_dependencies
    step_3_backup_site
    step_4_create_project_dir
    step_5_create_env_file
    step_6_upload_project
    step_7_install_dependencies
    step_8_build_project
    step_9_configure_nginx
    step_10_start_app

    show_result
}

# 执行主函数
main
