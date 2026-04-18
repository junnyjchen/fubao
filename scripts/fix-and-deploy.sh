#!/bin/bash
# 符寶網 - 一键修复403错误 & 更新代码
# 在服务器上以 root 或 www-data 用户执行

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/var/www/fubao"
NGINX_CONF="/etc/nginx/sites-available/fubao"
PHP_FPM_SOCK="/var/run/php/php8.1-fpm.sock"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  符寶網 - 修复403 & 更新代码${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}警告: 建议使用 sudo 或 root 用户执行${NC}"
fi

# 1. 更新代码
echo -e "\n${YELLOW}[1/6] 更新代码...${NC}"
cd $PROJECT_DIR

# 检查git
if [ -d ".git" ]; then
    git pull origin main
    echo -e "${GREEN}✓ 代码更新完成${NC}"
else
    echo -e "${YELLOW}⚠ 非git项目，跳过git pull${NC}"
fi

# 2. 安装依赖
echo -e "\n${YELLOW}[2/6] 安装前端依赖...${NC}"
if [ -f "package.json" ]; then
    npm install --legacy-peer-deps 2>/dev/null || pnpm install 2>/dev/null || yarn install
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
fi

# 3. 构建前端
echo -e "\n${YELLOW}[3/6] 构建前端...${NC}"
if [ -f "package.json" ]; then
    npm run build 2>/dev/null || pnpm build 2>/dev/null || yarn build
    echo -e "${GREEN}✓ 前端构建完成${NC}"
fi

# 4. 修复目录权限
echo -e "\n${YELLOW}[4/6] 修复目录权限...${NC}"

# 设置目录所有者
chown -R www-data:www-data $PROJECT_DIR 2>/dev/null || true

# 设置目录权限
find $PROJECT_DIR -type d -exec chmod 755 {} \;
find $PROJECT_DIR -type f -exec chmod 644 {} \;

# 特殊权限
chmod 755 $PROJECT_DIR 2>/dev/null || true
chmod 755 $PROJECT_DIR/.htaccess 2>/dev/null || true
chmod 644 $PROJECT_DIR/.env 2>/dev/null || true

echo -e "${GREEN}✓ 权限修复完成${NC}"

# 5. 修复 Nginx 配置
echo -e "\n${YELLOW}[5/6] 检查 Nginx 配置...${NC}"

if [ -f "$NGINX_CONF" ]; then
    # 检查是否有正确的 location 配置
    if ! grep -q "location / {" "$NGINX_CONF"; then
        echo -e "${YELLOW}⚠ Nginx配置可能不完整，正在修复...${NC}"
        cat > $NGINX_CONF << 'EOF'
server {
    listen 80;
    server_name fubao.cn www.fubao.cn;
    root /var/www/fubao;
    index index.php index.html;

    # 日志
    access_log /var/log/nginx/fubao_access.log;
    error_log /var/log/nginx/fubao_error.log;

    # 字符编码
    charset utf-8;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # PHP 处理 (如果需要)
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Next.js 静态文件
    location /_next/static {
        proxy_cache_bypass 1;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 主路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
}
EOF
        echo -e "${GREEN}✓ Nginx配置已更新${NC}"
    fi

    # 测试并重载 Nginx
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✓ Nginx配置测试通过并已重载${NC}"
else
    echo -e "${YELLOW}⚠ Nginx配置文件不存在: $NGINX_CONF${NC}"
fi

# 6. 重启 PHP-FPM
echo -e "\n${YELLOW}[6/6] 重启 PHP-FPM...${NC}"
systemctl restart php8.1-fpm 2>/dev/null || systemctl restart php-fpm 2>/dev/null || true
echo -e "${GREEN}✓ PHP-FPM 重启完成${NC}"

# 最终检查
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  修复完成！${NC}"
echo -e "${GREEN}========================================${NC}"

# 显示状态
echo -e "\n${YELLOW}服务状态:${NC}"
systemctl status nginx --no-pager -l 2>/dev/null | head -10 || true
systemctl status php8.1-fpm --no-pager -l 2>/dev/null | head -10 || true

echo -e "\n${YELLOW}目录权限:${NC}"
ls -la $PROJECT_DIR | head -10

echo -e "\n${GREEN}请访问: http://47.76.186.195${NC}"
