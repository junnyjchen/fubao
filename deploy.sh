#!/bin/bash

# ============================================
# 符寶網 - 自動部署腳本
# CentOS 7/8/9 適用
# ============================================

set -e

echo "============================================"
echo "符寶網 - 自動部署腳本"
echo "============================================"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日誌函數
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查是否為 root 用戶
if [ "$EUID" -ne 0 ]; then 
    log_error "請使用 root 用戶運行此腳本"
    exit 1
fi

# 1. 系統更新
log_info "步驟 1: 更新系統..."
yum update -y

# 2. 安裝必要工具
log_info "步驟 2: 安裝必要工具..."
yum install -y curl wget git vim nginx

# 3. 安裝 Node.js (使用 NodeSource)
log_info "步驟 3: 安裝 Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# 驗證 Node.js 安裝
node_version=$(node -v)
log_info "Node.js 版本: $node_version"

# 4. 安裝 pnpm
log_info "步驟 4: 安裝 pnpm..."
npm install -g pnpm

# 驗證 pnpm 安裝
pnpm_version=$(pnpm -v)
log_info "pnpm 版本: $pnpm_version"

# 5. 創建應用目錄
APP_DIR="/var/www/fubao"
log_info "步驟 5: 創建應用目錄 $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# 6. 上傳代碼 (手動步驟提示)
log_warn "步驟 6: 請上傳代碼到 $APP_DIR"
log_warn "你可以使用以下方法之一上傳代碼："
log_warn "  1. 使用 scp: scp -r /path/to/local/project root@116.204.135.69:$APP_DIR"
log_warn "  2. 使用 git: git clone <repository-url> $APP_DIR"
log_warn "  3. 使用 sftp 工具上傳"

# 7. 安裝依賴 (等代碼上傳後執行)
log_info "步驟 7: 代碼上傳後，執行以下命令安裝依賴..."
log_info "  cd $APP_DIR"
log_info "  pnpm install"

# 8. 構建生產版本
log_info "步驟 8: 構建生產版本..."
log_info "  pnpm build"

# 9. 配置 Nginx
log_info "步驟 9: 配置 Nginx..."

# 創建 Nginx 配置
NGINX_CONF="/etc/nginx/conf.d/fubao.conf"
cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name _;
    
    # 日誌
    access_log /var/log/nginx/fubao_access.log;
    error_log /var/log/nginx/fubao_error.log;
    
    # 靜態資源
    location /_next/static {
        alias /var/www/fubao/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /static {
        alias /var/www/fubao/public/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 反向代理到 Next.js
    location / {
        proxy_pass http://localhost:5000;
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
log_info "測試 Nginx 配置..."
nginx -t

# 10. 使用 systemd 管理 Next.js 服務
log_info "步驟 10: 配置 systemd 服務..."

SERVICE_FILE="/etc/systemd/system/fubao.service"
cat > $SERVICE_FILE << 'EOF'
[Unit]
Description=符寶網 - Next.js Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/fubao
Environment=NODE_ENV=production
Environment=DEPLOY_RUN_PORT=5000
Environment=COZE_PROJECT_ENV=PROD
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10

# 日誌配置
StandardOutput=journal
StandardError=journal
SyslogIdentifier=fubao

[Install]
WantedBy=multi-user.target
EOF

# 重載 systemd
systemctl daemon-reload

# 11. 防火牆設置 (如果有 firewalld)
log_info "步驟 11: 配置防火牆..."
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
    log_info "防火牆已配置"
else
    log_warn "未檢測到 firewalld，請手動配置防火牆"
fi

# 12. SELinux 設置 (如果啟用)
log_info "步驟 12: 檢查 SELinux..."
if getenforce | grep -q "Enforcing"; then
    log_warn "SELinux 處於 Enforcing 模式，可能需要調整"
    log_warn "可以執行: setenforce 0 來臨時關閉"
    log_warn "或配置適當的 SELinux 策略"
fi

echo ""
echo "============================================"
echo "部署基礎環境已就緒！"
echo "============================================"
echo ""
echo "後續步驟："
echo "1. 上傳代碼到 $APP_DIR"
echo "2. 進入目錄: cd $APP_DIR"
echo "3. 安裝依賴: pnpm install"
echo "4. 構建項目: pnpm build"
echo "5. 啟動服務: systemctl start fubao"
echo "6. 設置開機自啟: systemctl enable fubao"
echo "7. 啟動 Nginx: systemctl start nginx"
echo "8. 設置 Nginx 開機自啟: systemctl enable nginx"
echo ""
echo "檢查服務狀態："
echo "  systemctl status fubao"
echo "  systemctl status nginx"
echo ""
echo "查看日誌："
echo "  journalctl -u fubao -f"
echo "  tail -f /var/log/nginx/fubao_*.log"
echo ""
echo "============================================"

