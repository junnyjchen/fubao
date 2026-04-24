#!/bin/bash
# ===========================================
# 符寶網 服务器部署脚本
# ===========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
SITE_DIR="/www/wwwroot/fubao-api"
DB_NAME="fubao"
DB_USER="root"
DB_PASS=""

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}    符寶網 API 后端部署脚本${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户执行此脚本${NC}"
    exit 1
fi

# 1. 创建网站目录
echo -e "${YELLOW}[1/6] 创建网站目录...${NC}"
mkdir -p $SITE_DIR
echo -e "${GREEN}✓ 目录创建完成: $SITE_DIR${NC}"
echo ""

# 2. 提示上传代码
echo -e "${YELLOW}[2/6] 上传代码${NC}"
echo -e "${YELLOW}请将 php/ 目录下的所有文件上传到: $SITE_DIR${NC}"
echo -e "${YELLOW}可以使用 FTP、SCP 或宝塔文件管理器上传${NC}"
echo ""
read -p "上传完成后按回车继续: "
echo ""

# 3. 设置目录权限
echo -e "${YELLOW}[3/6] 设置目录权限...${NC}"
chown -R www:www $SITE_DIR
chmod -R 755 $SITE_DIR
chmod 644 $SITE_DIR/public/.htaccess
echo -e "${GREEN}✓ 权限设置完成${NC}"
echo ""

# 4. 数据库配置
echo -e "${YELLOW}[4/6] 数据库配置${NC}"
read -p "请输入 MySQL 密码: " -s DB_PASS
echo ""

# 创建数据库
echo -e "${YELLOW}创建数据库...${NC}"
mysql -u $DB_USER -p$DB_PASS -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo -e "${GREEN}✓ 数据库创建完成${NC}"

# 执行迁移
echo -e "${YELLOW}执行数据库迁移...${NC}"
mysql -u $DB_USER -p$DB_PASS $DB_NAME < $SITE_DIR/scripts/mysql-migration.sql
echo -e "${GREEN}✓ 数据库迁移完成${NC}"
echo ""

# 5. 修改 JWT 密钥
echo -e "${YELLOW}[5/6] 配置 JWT 密钥${NC}"
JWT_SECRET=$(head -c 32 /dev/urandom | base64)
echo -e "${YELLOW}生成随机密钥: ${JWT_SECRET}${NC}"
sed -i "s/your-production-secret-key-here/${JWT_SECRET}/g" $SITE_DIR/config/app.php
echo -e "${GREEN}✓ JWT 密钥已更新${NC}"
echo ""

# 6. 配置 Web 服务器
echo -e "${YELLOW}[6/6] Web 服务器配置${NC}"
echo -e "${YELLOW}请在宝塔面板中进行以下配置:${NC}"
echo ""
echo -e "${YELLOW}1. 添加网站，域名指向: $SITE_DIR/public${NC}"
echo -e "${YELLOW}2. 设置 → 伪静态 → 选择 thinkphp${NC}"
echo -e "${YELLOW}3. 设置 → 网站目录 → 指向 public 目录${NC}"
echo -e "${YELLOW}4. 配置 SSL（可选但推荐）${NC}"
echo ""

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}    部署完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo -e "${YELLOW}管理后台登录信息:${NC}"
echo -e "${GREEN}用户名: admin${NC}"
echo -e "${GREEN}密码: admin123${NC}"
echo -e "${RED}⚠️  请立即修改默认密码！${NC}"
echo ""
echo -e "${YELLOW}API 地址示例:${NC}"
echo -e "http://your-domain.com/api/health"
echo ""
