#!/bin/bash
# 符寶網 - 宝塔面板一键修复脚本
# 在宝塔面板的终端中执行

set -e

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  符寶網 403修复 & 代码更新${NC}"
echo -e "${GREEN}========================================${NC}"

# 项目目录
PROJECT_DIR="/www/wwwroot/fubao"

# 1. 进入目录
cd $PROJECT_DIR || exit 1
echo -e "${GREEN}[1/5] 进入项目目录: $PROJECT_DIR${NC}"

# 2. 更新代码
echo -e "\n${GREEN}[2/5] 更新代码...${NC}"
git pull origin main
echo -e "${GREEN}✓ 代码更新完成${NC}"

# 3. 安装依赖
echo -e "\n${GREEN}[3/5] 安装依赖...${NC}"
npm install --legacy-peer-deps 2>/dev/null || pnpm install 2>/dev/null
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 4. 构建
echo -e "\n${GREEN}[4/5] 构建项目...${NC}"
npm run build 2>/dev/null || pnpm build
echo -e "${GREEN}✓ 构建完成${NC}"

# 5. 修复权限
echo -e "\n${GREEN}[5/5] 修复权限...${NC}"
chown -R www:www $PROJECT_DIR
find $PROJECT_DIR -type d -exec chmod 755 {} \;
find $PROJECT_DIR -type f -exec chmod 644 {} \;
chmod 755 $PROJECT_DIR/.htaccess 2>/dev/null
echo -e "${GREEN}✓ 权限修复完成${NC}"

# 重启 Nginx
echo -e "\n${GREEN}重启 Nginx...${NC}"
nginx -t && systemctl reload nginx

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  完成！请访问网站测试${NC}"
echo -e "${GREEN}========================================${NC}"
