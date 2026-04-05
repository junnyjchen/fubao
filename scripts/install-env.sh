#!/bin/bash

################################################################################
# 符寶網一键安装脚本
# 使用方法：在服务器上执行此脚本
################################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  符寶網网站一键安装脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    exit 1
fi

# 步骤1：更新系统
echo -e "${BLUE}[1/8] 更新系统...${NC}"
apt-get update -y
apt-get upgrade -y

# 步骤2：安装 Node.js 20.x
echo -e "${BLUE}[2/8] 安装 Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✓ Node.js 安装完成: $(node -v)${NC}"
else
    echo -e "${GREEN}✓ Node.js 已安装: $(node -v)${NC}"
fi

# 步骤3：安装 pnpm
echo -e "${BLUE}[3/8] 安装 pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm 安装完成: $(pnpm -v)${NC}"
else
    echo -e "${GREEN}✓ pnpm 已安装: $(pnpm -v)${NC}"
fi

# 步骤4：安装 PM2
echo -e "${BLUE}[4/8] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装完成: $(pm2 -v)${NC}"
else
    echo -e "${GREEN}✓ PM2 已安装: $(pm2 -v)${NC}"
fi

# 步骤5：安装 Nginx
echo -e "${BLUE}[5/8] 安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    echo -e "${GREEN}✓ Nginx 安装完成${NC}"
else
    echo -e "${GREEN}✓ Nginx 已安装${NC}"
fi

# 步骤6：创建项目目录
echo -e "${BLUE}[6/8] 创建项目目录...${NC}"
mkdir -p /www/wwwroot/fubao-net
chown -R www:www /www/wwwroot/fubao-net
chmod -R 755 /www/wwwroot/fubao-net
echo -e "${GREEN}✓ 项目目录创建完成${NC}"

# 步骤7：创建环境变量文件
echo -e "${BLUE}[7/8] 创建环境变量文件...${NC}"
cat > /www/wwwroot/fubao-net/.env.local << 'EOF'
# Supabase 配置（请修改为实际值）
COZE_SUPABASE_URL=your_supabase_url_here
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 站点配置
COZE_PROJECT_DOMAIN_DEFAULT=https://47.238.127.141
DEPLOY_RUN_PORT=5000
COZE_PROJECT_ENV=PROD

# JWT 密钥（请修改为安全随机字符串）
JWT_SECRET=fubao-net-jwt-secret-$(date +%s)-$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 20)
EOF

chmod 600 /www/wwwroot/fubao-net/.env.local
chown www:www /www/wwwroot/fubao-net/.env.local
echo -e "${GREEN}✓ 环境变量文件创建完成${NC}"

# 步骤8：配置 Nginx
echo -e "${BLUE}[8/8] 配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/fubao-net << 'NGINXCONF'
server {
    listen 80;
    server_name 47.238.127.141;

    access_log /www/wwwroot/fubao-net/access.log;
    error_log /www/wwwroot/fubao-net/error.log;

    # 反向代理到应用
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
NGINXCONF

# 启用站点
ln -sf /etc/nginx/sites-available/fubao-net /etc/nginx/sites-enabled/

# 测试并重载 Nginx
if nginx -t; then
    nginx -s reload
    echo -e "${GREEN}✓ Nginx 配置完成${NC}"
else
    echo -e "${RED}✗ Nginx 配置错误${NC}"
    exit 1
fi

# 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  环境配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}接下来需要执行以下步骤：${NC}"
echo ""
echo -e "${BLUE}1. 上传项目文件${NC}"
echo "   请将项目文件上传到：/www/wwwroot/fubao-net/"
echo ""
echo -e "${BLUE}2. 构建和启动应用${NC}"
echo "   执行以下命令："
echo ""
echo -e "${GREEN}   cd /www/wwwroot/fubao-net${NC}"
echo -e "${GREEN}   pnpm install${NC}"
echo -e "${GREEN}   pnpm build${NC}"
echo -e "${GREEN}   pm2 start dist/server.js --name fubao-net${NC}"
echo -e "${GREEN}   pm2 save${NC}"
echo -e "${GREEN}   pm2 startup${NC}"
echo ""
echo -e "${BLUE}3. 修改环境变量${NC}"
echo "   vi /www/wwwroot/fubao-net/.env.local"
echo "   修改 Supabase 配置"
echo ""
echo -e "${BLUE}4. 访问网站${NC}"
echo "   http://47.238.127.141"
echo ""
