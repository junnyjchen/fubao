#!/bin/bash
# ================================================
# 宝塔面板 Nginx 配置部署脚本
# 用法: bash deploy-nginx.sh [--force] [--diagnose]
# ================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NGINX_CONF="$SCRIPT_DIR/php/nginx.conf"
DOMAIN="www.fubao.ltd"

FORCE_MODE=false
DIAGNOSE_MODE=false
for arg in "$@"; do
    case $arg in
        --force) FORCE_MODE=true ;;
        --diagnose) DIAGNOSE_MODE=true ;;
    esac
done

echo "━━━ 部署 Nginx 配置 ━━━"
echo "  域名: $DOMAIN"
echo "  配置源: $NGINX_CONF"
echo ""

# ━━━ 诊断模式 ━━━
if [ "$DIAGNOSE_MODE" = true ]; then
    echo "━━━ 诊断当前 Nginx 配置 ━━━"
    
    echo ""
    echo "1. 查找所有可能的配置文件："
    for p in \
        "/www/server/panel/vhost/nginx/${DOMAIN}.conf" \
        "/www/server/nginx/conf/vhost/${DOMAIN}.conf" \
        "/etc/nginx/sites-available/${DOMAIN}" \
        "/etc/nginx/conf.d/${DOMAIN}.conf"; do
        if [ -f "$p" ]; then
            echo "  ✅ 存在: $p"
        else
            echo "  ❌ 不存在: $p"
        fi
    done
    
    echo ""
    echo "2. 当前生效的 API 请求处理："
    API_RESP=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1/api/goods?limit=1" 2>/dev/null || echo "N/A")
    echo "  /api/goods HTTP 状态码: $API_RESP"
    
    echo ""
    echo "3. Next.js 响应测试："
    NX_RESP=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:5000/" 2>/dev/null || echo "N/A")
    echo "  Next.js (端口5000) HTTP 状态码: $NX_RESP"
    
    echo ""
    echo "4. PHP-FPM 状态："
    if [ -S /tmp/php-cgi-82.sock ]; then
        echo "  ✅ PHP-FPM socket 存在: /tmp/php-cgi-82.sock"
    elif [ -S /tmp/php-cgi-81.sock ]; then
        echo "  ✅ PHP-FPM socket 存在: /tmp/php-cgi-81.sock"
    else
        echo "  ⚠️ 未找到 PHP-FPM socket"
        ls /tmp/php-cgi*.sock 2>/dev/null || echo "  无 php-cgi socket"
    fi
    
    echo ""
    echo "5. 宝塔面板进程："
    if [ -f /www/server/panel/BT-Panel ]; then
        echo "  ✅ 宝塔面板已安装"
    else
        echo "  ❌ 未检测到宝塔面板"
    fi
    
    echo ""
    echo "6. Nginx 主配置 include 检查："
    if [ -f /www/server/nginx/conf/nginx.conf ]; then
        grep -n "include.*vhost" /www/server/nginx/conf/nginx.conf 2>/dev/null | head -5
    elif [ -f /etc/nginx/nginx.conf ]; then
        grep -n "include" /etc/nginx/nginx.conf 2>/dev/null | head -5
    fi
    
    exit 0
fi

# ━━━ 查找目标配置文件 ━━━
NGINX_TARGET=""

# 优先检查宝塔路径
BT_PATHS=(
    "/www/server/panel/vhost/nginx/${DOMAIN}.conf"
    "/www/server/nginx/conf/vhost/${DOMAIN}.conf"
)
for p in "${BT_PATHS[@]}"; do
    if [ -f "$p" ]; then
        NGINX_TARGET="$p"
        echo "✅ 找到宝塔 Nginx 配置（已存在）: $NGINX_TARGET"
        break
    fi
done

# 如果宝塔配置文件不存在但目录存在
if [ -z "$NGINX_TARGET" ]; then
    for p in "${BT_PATHS[@]}"; do
        if [ -d "$(dirname "$p")" ]; then
            NGINX_TARGET="$p"
            echo "✅ 找到宝塔 Nginx 目录（新建配置）: $NGINX_TARGET"
            break
        fi
    done
fi

# 标准路径
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

# ━━━ 检测 PHP-FPM socket 路径 ━━━
PHP_SOCK=""
for sock in /tmp/php-cgi-82.sock /tmp/php-cgi-81.sock /tmp/php-cgi-80.sock /run/php/php-fpm.sock; do
    if [ -S "$sock" ]; then
        PHP_SOCK="$sock"
        echo "✅ PHP-FPM socket: $PHP_SOCK"
        break
    fi
done

# ━━━ 检测 SSL 证书路径 ━━━
SSL_CERT=""
SSL_KEY=""
for cert_dir in \
    /www/server/panel/vhost/cert/${DOMAIN} \
    /www/server/panel/vhost/cert/${DOMAIN//*www./} \
    /etc/letsencrypt/live/${DOMAIN}; do
    if [ -f "$cert_dir/fullchain.pem" ]; then
        SSL_CERT="$cert_dir/fullchain.pem"
        SSL_KEY="$cert_dir/privkey.pem"
        echo "✅ SSL 证书: $SSL_CERT"
        break
    fi
done

# ━━━ 生成适配当前环境的 Nginx 配置 ━━━
echo ""
echo "📝 生成 Nginx 配置..."

NGINX_CONF_GENERATED="/tmp/fubao-nginx-${DOMAIN}.conf"

cat > "$NGINX_CONF_GENERATED" << NGINXEOF
server {
    listen 80;
    server_name ${DOMAIN} ${DOMAIN//*www./};
    
    # 301 重定向到 HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} ${DOMAIN//*www./};
    
    # SSL 证书
    ssl_certificate ${SSL_CERT:-/www/server/panel/vhost/cert/${DOMAIN}/fullchain.pem};
    ssl_certificate_key ${SSL_KEY:-/www/server/panel/vhost/cert/${DOMAIN}/privkey.pem};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 上传文件大小限制
    client_max_body_size 20m;
    
    # 网站根目录
    root /www/wwwroot/fubao/public;
    index index.html;
    
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    # 核心策略：所有请求统一交给 Next.js (端口 5000)
    # Next.js API Routes 处理所有 /api/* 请求
    # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    # 静态资源（上传的文件）直接由 Nginx 提供
    location /uploads/ {
        alias /www/wwwroot/fubao/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 产品图片等静态资源
    location /images/ {
        alias /www/wwwroot/fubao/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

NGINXEOF

# 添加 PHP 后端（如果 PHP-FPM socket 存在）
if [ -n "$PHP_SOCK" ]; then
    cat >> "$NGINX_CONF_GENERATED" << NGINXEOF
    # PHP 后端独立路径（管理用）
    location /php-api/ {
        alias /www/wwwroot/fubao/php/public/;
        index index.php;
        try_files \$uri \$uri/ /php-api/index.php?\$query_string;
        
        location ~ /php-api/.*\.php\$ {
            fastcgi_pass unix:${PHP_SOCK};
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            include fastcgi_params;
        }
    }

NGINXEOF
fi

# 添加核心代理规则
cat >> "$NGINX_CONF_GENERATED" << NGINXEOF
    # ━━━ 所有其他请求 → Next.js ━━━
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
NGINXEOF

echo "✅ 配置已生成: $NGINX_CONF_GENERATED"

# ━━━ 备份旧配置 ━━━
if [ -f "$NGINX_TARGET" ]; then
    BACKUP="${NGINX_TARGET}.bak.$(date +%Y%m%d%H%M%S)"
    sudo cp "$NGINX_TARGET" "$BACKUP"
    echo "📦 旧配置已备份: $BACKUP"
    
    # 检查旧配置是否有 /api/ → PHP 的规则
    if grep -q "location.*\/api\/" "$NGINX_TARGET" 2>/dev/null; then
        echo "⚠️  旧配置中有 /api/ 分流规则，将被新配置替换"
    fi
fi

# ━━━ 部署新配置 ━━━
sudo cp "$NGINX_CONF_GENERATED" "$NGINX_TARGET"
echo "📝 新配置已写入: $NGINX_TARGET"

# ━━━ 验证 Nginx 配置 ━━━
echo ""
echo "🔍 验证 Nginx 配置..."
if sudo nginx -t 2>&1; then
    echo "✅ Nginx 配置验证通过"
else
    echo "❌ Nginx 配置验证失败！"
    echo ""
    echo "尝试恢复旧配置..."
    if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
        sudo cp "$BACKUP" "$NGINX_TARGET"
        echo "🔄 已恢复旧配置"
    fi
    echo ""
    echo "请手动检查: sudo nginx -t"
    exit 1
fi

# ━━━ 重载 Nginx ━━━
echo "🔄 重载 Nginx..."
sudo nginx -s reload 2>/dev/null || sudo systemctl reload nginx 2>/dev/null || true
sleep 1
echo "✅ Nginx 已重载"

# ━━━ 验证部署效果 ━━━
echo ""
echo "━━━ 验证 API 响应 ━━━"

sleep 2

# 检查 API 是否走 Next.js
API_RESP=$(curl -s "http://127.0.0.1/api/goods?limit=1" 2>/dev/null | head -c 200)
if echo "$API_RESP" | grep -q '"success"'; then
    echo "✅ API 响应包含 success 字段 → Next.js 生效"
elif echo "$API_RESP" | grep -q '"data"'; then
    echo "⚠️  API 响应有 data 但无 success → 可能还是 PHP"
else
    echo "❌ API 无响应或格式异常"
fi

# 检查首页
HOME_RESP=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1/" 2>/dev/null)
if [ "$HOME_RESP" = "200" ]; then
    echo "✅ 首页响应正常 (HTTP $HOME_RESP)"
else
    echo "❌ 首页异常 (HTTP $HOME_RESP)"
fi

echo ""
echo "━━━ Nginx 配置部署完成 ━━━"
echo "  配置文件: $NGINX_TARGET"
echo "  核心变更: 所有请求 → Next.js (端口 5000)"
echo ""
echo "如果宝塔面板覆盖了配置，请在宝塔面板中："
echo "  1. 网站 → ${DOMAIN} → 设置 → 配置文件"
echo "  2. 将 location / 部分替换为 proxy_pass http://127.0.0.1:5000"
echo "  3. 删除所有 location /api/ 相关的 PHP 分流规则"
