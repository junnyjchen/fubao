#!/bin/bash
# ================================================
# 宝塔面板 Nginx 配置部署脚本
# 用法: bash deploy-nginx.sh [--force]
# ================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NGINX_CONF="$SCRIPT_DIR/php/nginx.conf"
DOMAIN="www.fubao.ltd"

echo "━━━ 部署 Nginx 配置 ━━━"

# 1. 检测宝塔面板环境
BT_PATHS=(
    "/www/server/panel/vhost/nginx/${DOMAIN}.conf"
    "/www/server/nginx/conf/vhost/${DOMAIN}.conf"
)

NGINX_TARGET=""
for p in "${BT_PATHS[@]}"; do
    if [ -f "$p" ] || [ -d "$(dirname "$p")" ]; then
        NGINX_TARGET="$p"
        echo "✅ 找到宝塔 Nginx 配置: $NGINX_TARGET"
        break
    fi
done

# 2. 如果没找到宝塔，检测标准 Nginx
if [ -z "$NGINX_TARGET" ]; then
    STD_PATHS=(
        "/etc/nginx/sites-available/${DOMAIN}"
        "/etc/nginx/conf.d/${DOMAIN}.conf"
    )
    for p in "${STD_PATHS[@]}"; do
        if [ -d "$(dirname "$p")" ]; then
            NGINX_TARGET="$p"
            echo "✅ 找到标准 Nginx 配置: $NGINX_TARGET"
            break
        fi
    done
fi

if [ -z "$NGINX_TARGET" ]; then
    echo "❌ 未找到 Nginx 配置目录"
    echo ""
    echo "请手动执行："
    echo "  sudo cp $NGINX_CONF /你的nginx配置目录/${DOMAIN}.conf"
    echo "  sudo nginx -t && sudo nginx -s reload"
    exit 1
fi

# 3. 备份旧配置
if [ -f "$NGINX_TARGET" ]; then
    BACKUP="${NGINX_TARGET}.bak.$(date +%Y%m%d%H%M%S)"
    sudo cp "$NGINX_TARGET" "$BACKUP"
    echo "📦 旧配置已备份: $BACKUP"
fi

# 4. 部署新配置
sudo cp "$NGINX_CONF" "$NGINX_TARGET"
echo "📝 新配置已写入: $NGINX_TARGET"

# 5. 修复 SSL 证书路径（宝塔环境）
if [ -d "/www/server/panel/vhost/cert" ]; then
    # 尝试查找实际证书路径
    for cert_dir in /www/server/panel/vhost/cert/${DOMAIN} /www/server/panel/vhost/cert/${DOMAIN//*www./}; do
        if [ -f "$cert_dir/fullchain.pem" ]; then
            echo "✅ SSL 证书已找到: $cert_dir"
            break
        fi
    done
fi

# 6. 验证 Nginx 配置
echo "🔍 验证 Nginx 配置..."
if sudo nginx -t 2>&1; then
    echo "✅ Nginx 配置验证通过"
else
    echo "❌ Nginx 配置验证失败，恢复旧配置..."
    if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
        sudo cp "$BACKUP" "$NGINX_TARGET"
        echo "🔄 已恢复旧配置"
    fi
    exit 1
fi

# 7. 重载 Nginx
echo "🔄 重载 Nginx..."
sudo nginx -s reload 2>/dev/null || sudo systemctl reload nginx 2>/dev/null
echo "✅ Nginx 已重载"

echo ""
echo "━━━ Nginx 配置部署完成 ━━━"
echo "  配置文件: $NGINX_TARGET"
echo "  核心变更: 所有请求统一交给 Next.js (端口 5000)"
echo "  无需 PHP 分流，Next.js API Routes 处理所有 /api/*"
