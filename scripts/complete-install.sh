#!/bin/bash

################################################################################
# 完整自动化部署脚本 - 服务器端执行
# 说明：将此脚本上传到服务器后执行，包含所有安装步骤
# 使用方法：bash complete-install.sh
################################################################################

set -e

echo "========================================"
echo "符寶網自动化部署 - 开始"
echo "========================================"
echo ""

# 更新系统
echo "[1/10] 更新系统..."
apt-get update -y
apt-get upgrade -y

# 安装 Node.js
echo "[2/10] 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 安装 pnpm
echo "[3/10] 安装 pnpm..."
npm install -g pnpm

# 安装 PM2
echo "[4/10] 安装 PM2..."
npm install -g pm2

# 安装 Nginx
echo "[5/10] 安装 Nginx..."
apt-get install -y nginx

# 创建项目目录
echo "[6/10] 创建项目目录..."
mkdir -p /www/wwwroot/fubao-net
chown -R www:www /www/wwwroot/fubao-net

# 创建环境变量
echo "[7/10] 创建环境变量..."
cat > /www/wwwroot/fubao-net/.env.local << 'EOF'
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD
JWT_SECRET=fubao-net-jwt-secret-$(date +%s)
EOF
chmod 600 /www/wwwroot/fubao-net/.env.local

# 配置 Nginx
echo "[8/10] 配置 Nginx..."
cat > /etc/nginx/sites-available/fubao-net << 'EOF'
server {
    listen 80;
    server_name 47.238.127.141;
    access_log /www/wwwroot/fubao-net/access.log;
    error_log /www/wwwroot/fubao-net/error.log;
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
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF
ln -sf /etc/nginx/sites-available/fubao-net /etc/nginx/sites-enabled/
nginx -t && nginx -s reload

# 检查项目文件
echo "[9/10] 检查项目文件..."
if [ ! -f "/www/wwwroot/fubao-net/package.json" ]; then
    echo "警告：未检测到项目文件！"
    echo "请通过宝塔面板上传项目文件到: /www/wwwroot/fubao-net/"
    echo "然后执行以下命令："
    echo ""
    echo "cd /www/wwwroot/fubao-net"
    echo "pnpm install"
    echo "pnpm build"
    echo "pm2 start dist/server.js --name fubao-net"
    echo "pm2 save"
    echo ""
    exit 1
fi

# 构建和启动
echo "[10/10] 构建和启动应用..."
cd /www/wwwroot/fubao-net
pnpm install
pnpm build
pm2 start dist/server.js --name fubao-net
pm2 save
pm2 startup

echo ""
echo "========================================"
echo "部署完成！"
echo "========================================"
echo "访问地址: http://47.238.127.141"
echo ""
echo "常用命令："
echo "  pm2 status"
echo "  pm2 logs fubao-net"
echo "  pm2 restart fubao-net"
echo ""
