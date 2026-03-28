#!/bin/bash
#==============================================================================
# 符寶網 快速部署脚本
# 在服务器上直接运行此脚本
# 用法: curl -fsSL <script-url> | bash
#==============================================================================

set -e

DOMAIN="fubao.ltd"
PROJECT_DIR="/www/wwwroot/${DOMAIN}"
LOG_DIR="/www/wwwlogs/fubao"

echo "========================================"
echo "   符寶網 快速部署脚本"
echo "========================================"

# 1. 更新系统
echo "[1/8] 更新系统..."
apt update && apt upgrade -y

# 2. 安装依赖
echo "[2/8] 安装基础依赖..."
apt install -y curl wget git build-essential python3

# 3. 安装 Node.js
echo "[3/8] 安装 Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js: $(node -v)"

# 4. 安装 pnpm 和 PM2
echo "[4/8] 安装 pnpm 和 PM2..."
npm install -g pnpm pm2
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "pnpm: $(pnpm -v)"

# 5. 安装 Nginx 和 Certbot
echo "[5/8] 安装 Nginx 和 Certbot..."
apt install -y nginx certbot python3-certbot-nginx

# 6. 创建目录
echo "[6/8] 创建项目目录..."
mkdir -p "${PROJECT_DIR}"
mkdir -p "${LOG_DIR}"
mkdir -p /var/www/certbot

# 7. 配置 Nginx
echo "[7/8] 配置 Nginx..."
cat > /etc/nginx/sites-available/${DOMAIN} << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name fubao.ltd www.fubao.ltd;
    
    access_log /www/wwwlogs/fubao.log;
    error_log /www/wwwlogs/fubao.error.log;
    
    client_max_body_size 50M;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
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
    }
    
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
    
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 8. 配置防火墙
echo "[8/8] 配置防火墙..."
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true

echo ""
echo "========================================"
echo "   环境安装完成！"
echo "========================================"
echo ""
echo "下一步："
echo "1. 上传项目文件到 ${PROJECT_DIR}"
echo "   scp -r ./dist ./.next ./public ./package.json ./pnpm-lock.yaml \\"
echo "       ./ecosystem.config.js ./.env.production.example \\"
echo "       root@47.76.186.195:${PROJECT_DIR}/"
echo ""
echo "2. 配置环境变量"
echo "   cd ${PROJECT_DIR}"
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo ""
echo "3. 安装依赖并构建"
echo "   pnpm install"
echo "   pnpm build"
echo ""
echo "4. 启动应用"
echo "   pm2 start ecosystem.config.js --env production"
echo "   pm2 save"
echo ""
echo "5. 配置 SSL"
echo "   certbot --nginx -d fubao.ltd -d www.fubao.ltd --non-interactive --agree-tos --email admin@fubao.ltd --redirect"
echo ""
