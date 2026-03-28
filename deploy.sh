#!/bin/bash
#==============================================================================
# 符寶網 一键部署脚本
# 适用于 Ubuntu 24.04 服务器
# 使用方法: chmod +x deploy.sh && ./deploy.sh
#==============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="fubao.ltd"
PROJECT_DIR="/www/wwwroot/${DOMAIN}"
LOG_DIR="/www/wwwlogs/${DOMAIN%%.*}"
NODE_VERSION="20"

# 打印函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "此脚本需要 root 权限运行"
        exit 1
    fi
}

# 检查系统
check_system() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        log_info "系统: $PRETTY_NAME"
    else
        log_error "无法识别系统版本"
        exit 1
    fi
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    apt update && apt upgrade -y
    log_success "系统更新完成"
}

# 安装基础依赖
install_dependencies() {
    log_info "安装基础依赖..."
    apt install -y curl wget git build-essential python3
    log_success "基础依赖安装完成"
}

# 安装 Node.js
install_nodejs() {
    if command -v node &> /dev/null; then
        log_info "Node.js 已安装: $(node -v)"
        return
    fi
    
    log_info "安装 Node.js ${NODE_VERSION}.x..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    log_success "Node.js 安装完成: $(node -v)"
}

# 安装 pnpm
install_pnpm() {
    if command -v pnpm &> /dev/null; then
        log_info "pnpm 已安装: $(pnpm -v)"
        return
    fi
    
    log_info "安装 pnpm..."
    npm install -g pnpm
    log_success "pnpm 安装完成: $(pnpm -v)"
}

# 安装 PM2
install_pm2() {
    if command -v pm2 &> /dev/null; then
        log_info "PM2 已安装: $(pm2 -v)"
        return
    fi
    
    log_info "安装 PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
    log_success "PM2 安装完成: $(pm2 -v)"
}

# 安装 Nginx
install_nginx() {
    if command -v nginx &> /dev/null; then
        log_info "Nginx 已安装"
        return
    fi
    
    log_info "安装 Nginx..."
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    log_success "Nginx 安装完成"
}

# 安装 Certbot (用于 SSL)
install_certbot() {
    if command -v certbot &> /dev/null; then
        log_info "Certbot 已安装"
        return
    fi
    
    log_info "安装 Certbot..."
    apt install -y certbot python3-certbot-nginx
    log_success "Certbot 安装完成"
}

# 创建目录
create_directories() {
    log_info "创建项目目录..."
    mkdir -p "${PROJECT_DIR}"
    mkdir -p "${LOG_DIR}"
    mkdir -p "/www/wwwroot"
    log_success "目录创建完成"
}

# 配置 Nginx
configure_nginx() {
    log_info "配置 Nginx..."
    
    cat > /etc/nginx/sites-available/${DOMAIN} << 'NGINX_CONF'
server {
    listen 80;
    listen [::]:80;
    server_name fubao.ltd www.fubao.ltd;
    
    # 日志
    access_log /www/wwwlogs/fubao.log;
    error_log /www/wwwlogs/fubao.error.log;
    
    # 客户端请求限制
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # 反向代理到 Node.js 应用
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket 支持
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
    
    # 静态资源缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # 图片等静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINX_CONF

    # 启用站点
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    
    # 删除默认站点
    rm -f /etc/nginx/sites-enabled/default
    
    # 测试并重载 Nginx
    nginx -t && systemctl reload nginx
    log_success "Nginx 配置完成"
}

# 申请 SSL 证书
setup_ssl() {
    log_info "申请 SSL 证书..."
    
    # 创建 certbot 验证目录
    mkdir -p /var/www/certbot
    
    # 申请证书
    certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} \
        --non-interactive \
        --agree-tos \
        --email admin@${DOMAIN} \
        --redirect
    
    log_success "SSL 证书配置完成"
    
    # 设置自动续期
    log_info "设置 SSL 自动续期..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
    log_success "SSL 自动续期已设置"
}

# 部署项目
deploy_project() {
    log_info "部署项目..."
    
    cd "${PROJECT_DIR}"
    
    # 安装依赖
    log_info "安装项目依赖..."
    pnpm install --prefer-frozen-lockfile
    
    # 构建项目
    log_info "构建项目..."
    pnpm build
    
    # 停止旧进程
    pm2 stop fubao-web 2>/dev/null || true
    pm2 delete fubao-web 2>/dev/null || true
    
    # 启动新进程
    log_info "启动应用..."
    pm2 start ecosystem.config.js --env production
    
    # 保存 PM2 配置
    pm2 save
    
    log_success "项目部署完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        log_success "防火墙配置完成"
    else
        log_warn "ufw 未安装，跳过防火墙配置"
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    sleep 5
    
    # 检查 PM2 状态
    pm2 status
    
    # 检查端口
    if netstat -tlnp | grep -q ":5000"; then
        log_success "应用正在运行 (端口 5000)"
    else
        log_error "应用未在端口 5000 运行"
        exit 1
    fi
    
    # 检查 HTTP 响应
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo "000")
    if [[ "${HTTP_CODE}" == "200" ]]; then
        log_success "HTTP 服务正常 (${HTTP_CODE})"
    else
        log_warn "HTTP 服务响应码: ${HTTP_CODE}"
    fi
    
    log_success "部署验证完成"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}       部署成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "网站地址: ${BLUE}https://${DOMAIN}${NC}"
    echo ""
    echo "常用命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs fubao-web"
    echo "  重启应用: pm2 restart fubao-web"
    echo "  更新部署: cd ${PROJECT_DIR} && git pull && pnpm install && pnpm build && pm2 restart fubao-web"
    echo ""
}

# 主函数
main() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   符寶網 一键部署脚本${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    check_root
    check_system
    
    # 安装软件
    update_system
    install_dependencies
    install_nodejs
    install_pnpm
    install_pm2
    install_nginx
    install_certbot
    
    # 配置服务
    create_directories
    configure_nginx
    
    # 如果项目目录有代码则部署
    if [[ -f "${PROJECT_DIR}/package.json" ]]; then
        deploy_project
    else
        log_warn "项目目录 ${PROJECT_DIR} 中没有找到 package.json"
        log_info "请先将项目代码上传到 ${PROJECT_DIR} 目录"
        log_info "然后运行: cd ${PROJECT_DIR} && ./deploy.sh --deploy-only"
    fi
    
    # 配置 SSL (需要域名已解析)
    read -p "是否立即配置 SSL 证书? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    configure_firewall
    verify_deployment
}

# 仅部署项目（跳过环境安装）
deploy_only() {
    log_info "仅部署项目（跳过环境安装）..."
    create_directories
    deploy_project
    verify_deployment
}

# 解析参数
case "$1" in
    --deploy-only)
        deploy_only
        ;;
    *)
        main
        ;;
esac
