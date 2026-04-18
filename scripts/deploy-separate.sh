#!/bin/bash
# 符寶網 - 前后端分离一键部署脚本
# 
# 使用方法:
# 1. SSH 连接到服务器: ssh root@47.76.186.195
# 2. 在宝塔终端执行以下命令:
#
#    curl -sL https://raw.githubusercontent.com/junnyjchen/fubao/main/scripts/deploy-separate.sh | bash
#
# 或复制以下内容手动执行:

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  符寶網 - 前后端分离一键部署${NC}"
echo -e "${CYAN}========================================${NC}"

# ==================== 前端部署 ====================
echo -e "\n${YELLOW}[1/4] 部署前端 Next.js...${NC}"
echo "     目录: /www/wwwroot/fubao-web"

cd /www/wwwroot/fubao-web

# 拉取最新代码
echo "     → 拉取代码..."
git pull origin main

# 安装依赖
echo "     → 安装依赖..."
npm install --legacy-peer-deps

# 构建
echo "     → 构建项目..."
npm run build

# 修复权限
echo "     → 修复权限..."
chown -R www:www /www/wwwroot/fubao-web
chmod -R 755 /www/wwwroot/fubao-web 2>/dev/null || true

echo -e "${GREEN}     ✓ 前端部署完成${NC}"

# ==================== 后端部署 ====================
echo -e "\n${YELLOW}[2/4] 部署后端 PHP API...${NC}"
echo "     目录: /www/wwwroot/fubao-api"

cd /www/wwwroot/fubao-api

# 拉取最新代码
echo "     → 拉取代码..."
git pull origin main

# 修复权限
echo "     → 修复权限..."
chown -R www:www /www/wwwroot/fubao-api
find /www/wwwroot/fubao-api -type d -exec chmod 755 {} \;
find /www/wwwroot/fubao-api -type f -exec chmod 644 {} \;
chmod 755 /www/wwwroot/fubao-api/php/public 2>/dev/null || true

echo -e "${GREEN}     ✓ 后端部署完成${NC}"

# ==================== 重启服务 ====================
echo -e "\n${YELLOW}[3/4] 重启服务...${NC}"

# PM2 前端服务
echo "     → 重启 PM2 前端..."
pm2 restart fubao-web 2>/dev/null || pm2 start npm --name "fubao-web" -- run start

# PHP-FPM
echo "     → 重启 PHP-FPM..."
systemctl restart php8.1-fpm 2>/dev/null || systemctl restart php-fpm 2>/dev/null || true

echo -e "${GREEN}     ✓ 服务已重启${NC}"

# ==================== 重载 Nginx ====================
echo -e "\n${YELLOW}[4/4] 重载 Nginx...${NC}"
nginx -t && systemctl reload nginx
echo -e "${GREEN}     ✓ Nginx 已重载${NC}"

# ==================== 完成 ====================
echo -e "\n${CYAN}========================================${NC}"
echo -e "${GREEN}  ✓ 部署完成！${NC}"
echo -e "${CYAN}========================================${NC}"

echo -e "\n${YELLOW}服务状态:${NC}"
pm2 status 2>/dev/null || echo "PM2 未运行"

echo -e "\n${YELLOW}目录结构:${NC}"
echo "  前端: /www/wwwroot/fubao-web"
echo "  后端: /www/wwwroot/fubao-api"

echo -e "\n${GREEN}请访问: http://47.76.186.195${NC}"
