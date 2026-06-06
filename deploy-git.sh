#!/bin/bash
# ============================================
# 符寶網 - Git 同步部署腳本 (CentOS)
# ============================================
# 用於從 GitHub 拉取代碼並自動部署
# ============================================

set -e  # 遇到錯誤立即退出

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日誌函數
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

# 配置
PROJECT_DIR="/var/www/fubao"
GIT_REPO="https://github.com/junnyjchen/fubao.git"
SERVICE_NAME="fubao"
BACKUP_DIR="/var/www/fubao-backups"

# 創建備份函數
create_backup() {
    if [ -d "$PROJECT_DIR" ]; then
        local timestamp=$(date +"%Y%m%d_%H%M%S)
        local backup_name="fubao-backup-$timestamp"
        log_info "創建備份: $backup_name"
        mkdir -p "$BACKUP_DIR"
        cp -r "$PROJECT_DIR" "$BACKUP_DIR/$backup_name"
        log_success "備份完成"
    fi
}

# 安裝必要軟件
install_dependencies() {
    log_info "檢查並安裝必要軟件..."

    # 檢查是否為 root
    if [ "$EUID" -ne 0 ]; then
        log_error "請使用 root 用戶運行此腳本"
        exit 1
    fi

    # 更新系統
    log_info "更新系統軟件包..."
    yum update -y

    # 安裝 Git
    if ! command -v git &> /dev/null; then
        log_info "安裝 Git..."
        yum install -y git
    else
        log_success "Git 已安裝"
    fi

    # 安裝 Node.js (如果未安裝)
    if ! command -v node &> /dev/null; then
        log_info "安裝 Node.js 20..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    else
        local node_version=$(node -v)
        log_success "Node.js 已安裝: $node_version"
    fi

    # 安裝 pnpm
    if ! command -v pnpm &> /dev/null; then
        log_info "安裝 pnpm..."
        npm install -g pnpm
    else
        local pnpm_version=$(pnpm -v)
        log_success "pnpm 已安裝: $pnpm_version"
    fi

    # 安裝 Nginx
    if ! command -v nginx &> /dev/null; then
        log_info "安裝 Nginx..."
        yum install -y nginx
    else
        log_success "Nginx 已安裝"
    fi

    log_success "所有依賴安裝完成"
}

# 克隆或拉取代碼
pull_code() {
    log_info "從 GitHub 拉取代碼..."

    if [ -d "$PROJECT_DIR/.git ]; then
        log_info "更新現有代碼庫..."
        cd "$PROJECT_DIR"
        
        # 保存本地更改（如果有)
        git stash push -m "auto-stash-$(date +%s)" 2>/dev/null || true
        
        # 拉取最新代碼
        git fetch origin
        git reset --hard origin/main
        
        log_success "代碼已更新"
    else
        log_info "克隆新代碼庫..."
        mkdir -p "$(dirname $PROJECT_DIR)"
        git clone "$GIT_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        log_success "代碼已克隆"
    fi
}

# 安裝項目依賴
install_project_deps() {
    log_info "安裝項目依賴..."
    cd "$PROJECT_DIR"
    
    if [ -d "node_modules" ]; then
        log_info "清理舊的 node_modules..."
        rm -rf node_modules
    fi
    
    pnpm install
    log_success "依賴安裝完成"
}

# 構建項目
build_project() {
    log_info "構建項目..."
    cd "$PROJECT_DIR"
    
    # 清理舊的構建
    if [ -d ".next" ]; then
        rm -rf .next
    fi
    
    pnpm build
    log_success "項目構建完成"
}

# 配置 systemd 服務
setup_systemd() {
    log_info "配置 systemd 服務..."
    
    local service_file="/etc/systemd/system/$SERVICE_NAME.service"
    
    cat > "$service_file" << EOF
[Unit]
Description=符寶網 - 全球玄門文化科普交易平台
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fubao

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    log_success "systemd 服務配置完成"
}

# 配置 Nginx
setup_nginx() {
    log_info "配置 Nginx..."
    
    local nginx_conf="/etc/nginx/conf.d/fubao.conf"
    
    cat > "$nginx_conf" << 'EOF'
server {
    listen 80;
    server_name _;
    client_max_body_size 20M;

    # 日誌
    access_log /var/log/nginx/fubao-access.log;
    error_log /var/log/nginx/fubao-error.log;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

    # 靜態文件
    location /_next/static {
        alias /var/www/fubao/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    # 測試 Nginx 配置
    nginx -t
    
    log_success "Nginx 配置完成"
}

# 配置防火牆
setup_firewall() {
    log_info "配置防火牆..."
    
    if command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        log_success "防火牆配置完成"
    else
        log_warning "firewalld 未安裝，跳過防火牆配置"
    fi
}

# 啟動服務
start_services() {
    log_info "啟動服務..."
    
    # 停止舊的服務（如果正在運行)
    systemctl stop $SERVICE_NAME 2>/dev/null || true
    
    # 啟動應用
    systemctl start $SERVICE_NAME
    systemctl enable $SERVICE_NAME
    
    # 重啟 Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log_success "服務啟動完成"
}

# 檢查服務狀態
check_status() {
    log_info "檢查服務狀態..."
    
    sleep 3
    
    if systemctl is-active --quiet $SERVICE_NAME; then
        log_success "$SERVICE_NAME 服務運行中"
    else
        log_error "$SERVICE_NAME 服務未運行"
        echo "日誌："
        journalctl -u $SERVICE_NAME -n 20 --no-pager
        exit 1
    fi
    
    if systemctl is-active --quiet nginx; then
        log_success "Nginx 服務運行中"
    else
        log_error "Nginx 服務未運行"
        exit 1
    fi
    
    log_success "所有服務運行正常"
}

# 顯示部署信息
show_deployment_info() {
    echo ""
    echo "=========================================="
    echo "🚀 部署完成！"
    echo "=========================================="
    echo ""
    echo "🌐 訪問地址: http://$(hostname -I | awk '{print $1}'"
    echo ""
    echo "📋 常用命令："
    echo "   查看日誌: journalctl -u fubao -f"
    echo "   重啟應用: systemctl restart fubao"
    echo "   停止應用: systemctl stop fubao"
    echo "   查看狀態: systemctl status fubao"
    echo ""
    echo "🔑 測試賬號："
    echo "   用戶: test@example.com / admin123"
    echo "   管理員: admin / admin123"
    echo ""
    echo "=========================================="
    echo ""
}

# 主函數
main() {
    echo ""
    echo "=========================================="
    echo "符寶網 - Git 同步部署腳本"
    echo "=========================================="
    echo ""
    
    # 創建目錄
    mkdir -p "$PROJECT_DIR"
    
    # 執行部署流程
    install_dependencies
    create_backup
    pull_code
    install_project_deps
    build_project
    setup_systemd
    setup_nginx
    setup_firewall
    start_services
    check_status
    show_deployment_info
}

# 運行主函數
main "$@"
