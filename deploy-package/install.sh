#!/bin/bash
#==============================================================================
# 符寶網 初始部署脚本
# 在服务器上运行此脚本进行首次部署
#==============================================================================

set -e

DOMAIN="fubao.ltd"
PROJECT_DIR="/www/wwwroot/${DOMAIN}"
LOG_DIR="/www/wwwlogs/fubao"

echo "========================================"
echo "   符寶網 初始部署脚本"
echo "========================================"

# 检查是否root
if [ "$EUID" -ne 0 ]; then
    echo "请使用root用户运行此脚本"
    exit 1
fi

# 1. 安装系统依赖
echo "[1/10] 安装系统依赖..."
apt update
apt install -y curl wget git build-essential python3 nginx certbot python3-certbot-nginx

# 2. 安装 Node.js 20
echo "[2/10] 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

# 3. 安装 pnpm
echo "[3/10] 安装 pnpm..."
npm install -g pnpm
echo "pnpm: $(pnpm -v)"

# 4. 安装 PM2
echo "[4/10] 安装 PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo "PM2: $(pm2 -v)"

# 5. 创建目录
echo "[5/10] 创建项目目录..."
mkdir -p "${PROJECT_DIR}"
mkdir -p "${LOG_DIR}"
mkdir -p "/www/backup/${DOMAIN}"
mkdir -p /var/www/certbot

# 6. 配置 Nginx
echo "[6/10] 配置 Nginx..."
cat > /etc/nginx/sites-available/${DOMAIN} << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name fubao.ltd www.fubao.ltd;

    access_log /www/wwwlogs/fubao.log;
    error_log /www/wwwlogs/fubao.error.log;

    client_max_body_size 50M;

    # Let's Encrypt 验证
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 反向代理
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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # 静态资源
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss image/svg+xml;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
NGINX_EOF

ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "Nginx 配置完成"

# 7. 配置防火墙
echo "[7/10] 配置防火墙..."
ufw allow 22/tcp 2>/dev/null || true
ufw allow 80/tcp 2>/dev/null || true
ufw allow 443/tcp 2>/dev/null || true
ufw --force enable 2>/dev/null || true

# 8. 进入项目目录
echo "[8/10] 进入项目目录..."
cd "${PROJECT_DIR}"

# 9. 配置环境变量
echo "[9/10] 配置环境变量..."
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo ""
        echo "=========================================="
        echo "  请编辑 .env.production 配置以下必填项:"
        echo "=========================================="
        echo "  COZE_SUPABASE_URL=你的Supabase URL"
        echo "  COZE_SUPABASE_ANON_KEY=你的Supabase密钥"
        echo "  JWT_SECRET=你的JWT密钥(32位以上)"
        echo ""
        echo "  编辑命令: nano /www/wwwroot/fubao.ltd/.env.production"
        echo "=========================================="
    fi
fi

# 10. 安装依赖
echo "[10/10] 安装项目依赖..."
pnpm install

echo ""
echo "========================================"
echo "   初始部署完成！"
echo "========================================"
echo ""
echo "下一步操作:"
echo ""
echo "1. 配置环境变量:"
echo "   nano ${PROJECT_DIR}/.env.production"
echo ""
echo "2. 构建项目:"
echo "   cd ${PROJECT_DIR} && pnpm build"
echo ""
echo "3. 启动服务:"
echo "   pm2 start ecosystem.config.js --env production"
echo "   pm2 save"
echo ""
echo "4. 申请SSL证书:"
echo "   certbot --nginx -d fubao.ltd -d www.fubao.ltd --non-interactive --agree-tos --email admin@fubao.ltd --redirect"
echo ""
echo "5. 后续更新代码:"
echo "   上传新文件后执行: ./update.sh"
echo ""
