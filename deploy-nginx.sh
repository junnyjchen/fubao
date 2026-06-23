#!/bin/bash
# ================================================
# 宝塔面板 Nginx 配置部署脚本
# 策略：从旧配置中提取 SSL/PHP 路径，生成新配置
# 用法: bash deploy-nginx.sh [--force] [--diagnose]
# ================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
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
echo ""

# ━━━ 诊断模式 ━━━
if [ "$DIAGNOSE_MODE" = true ]; then
    echo "━━━ 诊断当前 Nginx 配置 ━━━"
    
    echo ""
    echo "1. 查找配置文件："
    for p in \
        "/www/server/panel/vhost/nginx/${DOMAIN}.conf" \
        "/www/server/nginx/conf/vhost/${DOMAIN}.conf" \
        "/etc/nginx/conf.d/${DOMAIN}.conf"; do
        if [ -f "$p" ]; then
            echo "  ✅ $p"
        fi
    done
    
    echo ""
    echo "2. Next.js (5000): $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1:5000/ 2>/dev/null || echo 'N/A')"
    echo "   PHP API: $(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://127.0.0.1/api/categories 2>/dev/null || echo 'N/A')"
    
    echo ""
    echo "3. PHP-FPM socket:"
    ls /tmp/php-cgi*.sock 2>/dev/null || echo "  无"
    
    echo ""
    echo "4. SSL 证书搜索:"
    find /www/server/panel/vhost/cert/ -name "fullchain.pem" 2>/dev/null | head -5 || echo "  无"
    find /www/server/panel/vhost/ssl/ -name "fullchain.pem" 2>/dev/null | head -5 || echo "  无"
    
    exit 0
fi

# ━━━ 查找目标配置文件 ━━━
NGINX_TARGET=""
for p in \
    "/www/server/panel/vhost/nginx/${DOMAIN}.conf" \
    "/www/server/nginx/conf/vhost/${DOMAIN}.conf" \
    "/etc/nginx/conf.d/${DOMAIN}.conf" \
    "/etc/nginx/sites-available/${DOMAIN}"; do
    if [ -f "$p" ]; then
        NGINX_TARGET="$p"
        break
    fi
done

if [ -z "$NGINX_TARGET" ]; then
    echo "❌ 未找到 Nginx 配置文件"
    echo ""
    echo "请在宝塔面板中手动修改配置："
    echo "  网站 → ${DOMAIN} → 设置 → 配置文件"
    echo "  把 location / 改为 proxy_pass http://127.0.0.1:5000"
    exit 1
fi

echo "✅ 找到配置: $NGINX_TARGET"

# ━━━ 从旧配置中提取关键参数 ━━━
echo ""
echo "📋 从旧配置提取参数..."

# 提取 SSL 证书路径
SSL_CERT=$(grep -oP 'ssl_certificate\s+\K[^;]+' "$NGINX_TARGET" 2>/dev/null | head -1)
SSL_KEY=$(grep -oP 'ssl_certificate_key\s+\K[^;]+' "$NGINX_TARGET" 2>/dev/null | head -1)

if [ -n "$SSL_CERT" ] && [ -f "$SSL_CERT" ]; then
    echo "✅ SSL 证书: $SSL_CERT"
else
    echo "⚠️  从旧配置提取 SSL 证书失败，尝试搜索..."
    # 搜索实际存在的证书
    for cert_dir in \
        $(dirname "$SSL_CERT" 2>/dev/null) \
        /www/server/panel/vhost/cert/${DOMAIN} \
        /www/server/panel/vhost/cert/${DOMAIN//*www./} \
        /www/server/panel/vhost/ssl/${DOMAIN} \
        /www/server/panel/vhost/ssl/${DOMAIN//*www./}; do
        if [ -f "$cert_dir/fullchain.pem" ]; then
            SSL_CERT="$cert_dir/fullchain.pem"
            SSL_KEY="$cert_dir/privkey.pem"
            echo "✅ 找到 SSL 证书: $SSL_CERT"
            break
        fi
    done
fi

if [ -z "$SSL_CERT" ] || [ ! -f "$SSL_CERT" ]; then
    echo "❌ 找不到 SSL 证书！"
    echo "  请先在宝塔面板中配置 SSL，或手动指定路径"
    echo "  旧配置中的路径: $SSL_CERT"
    echo ""
    echo "  跳过 Nginx 配置部署（PHP 代理方案仍然生效）"
    exit 0  # 不报错退出，PHP 代理方案不依赖 Nginx 修改
fi

# 提取 PHP-FPM socket 路径
PHP_SOCK=$(grep -oP 'fastcgi_pass\s+unix:\K[^;]+' "$NGINX_TARGET" 2>/dev/null | head -1)
if [ -n "$PHP_SOCK" ] && [ -S "$PHP_SOCK" ]; then
    echo "✅ PHP-FPM socket: $PHP_SOCK"
else
    # 搜索
    for sock in /tmp/php-cgi-82.sock /tmp/php-cgi-81.sock /tmp/php-cgi-80.sock /run/php/php-fpm.sock; do
        if [ -S "$sock" ]; then
            PHP_SOCK="$sock"
            echo "✅ PHP-FPM socket: $PHP_SOCK"
            break
        fi
    done
fi

# 提取 server_name
SERVER_NAMES=$(grep -oP 'server_name\s+\K[^;]+' "$NGINX_TARGET" 2>/dev/null | head -1)
if [ -z "$SERVER_NAMES" ]; then
    SERVER_NAMES="${DOMAIN} ${DOMAIN//*www./}"
fi
echo "✅ server_name: $SERVER_NAMES"

# 提取网站根目录
ROOT_DIR=$(grep -oP 'root\s+\K[^;]+' "$NGINX_TARGET" 2>/dev/null | head -1)
if [ -z "$ROOT_DIR" ]; then
    ROOT_DIR="/www/wwwroot/fubao/public"
fi
echo "✅ root: $ROOT_DIR"

# 检测 Nginx 版本（决定 http2 语法）
NGINX_VER=$(nginx -v 2>&1 | grep -oP 'nginx/\K[0-9]+' | head -1)
if [ "$NGINX_VER" -ge 25 ] 2>/dev/null; then
    # Nginx 1.25+ 使用新语法
    LISTEN_443="listen 443 ssl;"
    HTTP2_DIRECTIVE="http2 on;"
else
    LISTEN_443="listen 443 ssl http2;"
    HTTP2_DIRECTIVE=""
fi
echo "✅ Nginx 版本: $(nginx -v 2>&1), 使用${LISTEN_443}语法"

# ━━━ 备份旧配置 ━━━
BACKUP="${NGINX_TARGET}.bak.$(date +%Y%m%d%H%M%S)"
sudo cp "$NGINX_TARGET" "$BACKUP"
echo ""
echo "📦 旧配置已备份: $BACKUP"

# ━━━ 生成新配置 ━━━
echo ""
echo "📝 生成 Nginx 配置..."

NGINX_CONF_GENERATED="/tmp/fubao-nginx-${DOMAIN}.conf"

cat > "$NGINX_CONF_GENERATED" << NGINXEOF
server
{
    listen 80;
    server_name ${SERVER_NAMES};
    return 301 https://\$host\$request_uri;
}

server
{
    ${LISTEN_443}
    ${HTTP2_DIRECTIVE}
    server_name ${SERVER_NAMES};
    index index.html index.htm index.php;
    root ${ROOT_DIR};

    # SSL
    ssl_certificate ${SSL_CERT};
    ssl_certificate_key ${SSL_KEY};
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 上传限制
    client_max_body_size 20m;

    # ━━━ 静态资源直接由 Nginx 提供 ━━━
    location /uploads/ {
        alias /www/wwwroot/fubao/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /images/ {
        alias /www/wwwroot/fubao/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # ━━━ PHP 处理（仅管理路径 /php-api/） ━━━
NGINXEOF

# 添加 PHP FastCGI（如果找到 socket）
if [ -n "$PHP_SOCK" ]; then
    cat >> "$NGINX_CONF_GENERATED" << NGINXEOF
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
    # ━━━ 所有其他请求 → Next.js (端口 5000) ━━━
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

    # ━━━ Next.js 静态资源 ━━━
    location /_next/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # ━━━ 禁止访问敏感文件 ━━━
    location ~ /\. {
        deny all;
    }
    location ~ \.(env|log|sql|sh)$ {
        deny all;
    }
}
NGINXEOF

echo "✅ 配置已生成"

# ━━━ 部署新配置 ━━━
sudo cp "$NGINX_CONF_GENERATED" "$NGINX_TARGET"
echo "📝 新配置已写入: $NGINX_TARGET"

# ━━━ 验证 Nginx 配置 ━━━
echo ""
echo "🔍 验证 Nginx 配置..."
NGINX_TEST_OUTPUT=$(sudo nginx -t 2>&1) || true

if echo "$NGINX_TEST_OUTPUT" | grep -q "successful\|syntax is ok"; then
    echo "✅ Nginx 配置验证通过"
else
    echo "❌ Nginx 配置验证失败！"
    echo "$NGINX_TEST_OUTPUT"
    echo ""
    echo "恢复旧配置..."
    sudo cp "$BACKUP" "$NGINX_TARGET"
    echo "🔄 已恢复旧配置"
    echo ""
    echo "⚠️  Nginx 配置部署失败，但 PHP 代理方案仍然生效"
    echo "  PHP index.php 中的反向代理会确保 API 走 Next.js"
    exit 0  # 不报错，PHP 代理方案不依赖 Nginx
fi

# ━━━ 重载 Nginx ━━━
echo "🔄 重载 Nginx..."
sudo nginx -s reload 2>/dev/null || sudo systemctl reload nginx 2>/dev/null || true
sleep 2
echo "✅ Nginx 已重载"

# ━━━ 验证部署效果 ━━━
echo ""
echo "━━━ 验证 API 响应 ━━━"

API_RESP=$(curl -s --max-time 5 "http://127.0.0.1/api/goods?limit=1" 2>/dev/null | head -c 200)
if echo "$API_RESP" | grep -q '"success"'; then
    echo "✅ API 响应包含 success → Next.js 生效"
elif echo "$API_RESP" | grep -q '"data"'; then
    echo "⚠️  API 有 data 但无 success → 可能还是 PHP"
else
    echo "❌ API 无响应"
fi

HOME_RESP=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "https://127.0.0.1/" -k 2>/dev/null || echo "000")
if [ "$HOME_RESP" = "200" ]; then
    echo "✅ HTTPS 首页正常 (HTTP $HOME_RESP)"
else
    echo "⚠️  HTTPS 首页 HTTP $HOME_RESP"
fi

echo ""
echo "━━━ 部署完成 ━━━"
echo "  配置文件: $NGINX_TARGET"
echo "  备份文件: $BACKUP"
echo "  核心变更: 所有请求 → Next.js (端口 5000)"
