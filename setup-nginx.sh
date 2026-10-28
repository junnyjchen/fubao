#!/usr/bin/env bash
# ============================================================
# 符寶網 - 宝塔 Nginx 反向代理一键配置脚本
#
# 作用：把宝塔默认 PHP/静态站点配置替换为 Next.js 反向代理
#       /api/* 及所有页面  → 127.0.0.1:5000（含 AI 流式 SSE）
#       /_next/*           → 127.0.0.1:5000（静态资源长缓存）
#       /uploads/* /images/* → 静态文件 Nginx 直出
#
# 用法：bash setup-nginx.sh                # 自动定位站点配置
#       bash setup-nginx.sh xxx.conf       # 手动指定配置文件名
# ============================================================
set -uo pipefail

VHOST_DIR="/www/server/panel/vhost/nginx"

# ── 定位 nginx 可执行文件 ──────────────────────────────
NGINX_BIN=$(command -v nginx || true)
[ -z "$NGINX_BIN" ] && [ -x /www/server/nginx/sbin/nginx ] && NGINX_BIN=/www/server/nginx/sbin/nginx
[ -z "$NGINX_BIN" ] && { echo "✗ 未找到 nginx 可执行文件"; exit 1; }

# ── 1. 定位站点配置文件 ────────────────────────────────
cd "$VHOST_DIR" || { echo "✗ 目录不存在: $VHOST_DIR"; exit 1; }

if [ $# -ge 1 ]; then
    CONF="$1"
elif [ -f www.fubao.ltd.conf ]; then
    CONF="www.fubao.ltd.conf"
else
    CONF=$(ls -1 2>/dev/null | grep -i fubao | head -1)
fi

[ -z "$CONF" ] && { echo "✗ 未找到 fubao 相关站点配置，请确认宝塔站点名后执行:"; echo "  bash setup-nginx.sh <配置文件名>.conf"; exit 1; }
[ -f "$CONF" ] || { echo "✗ 配置文件不存在: $VHOST_DIR/$CONF"; exit 1; }

echo ">> 站点配置: $VHOST_DIR/$CONF"

# ── 2. 提取 SSL 证书路径（保持宝塔证书管理/续期不受影响）──
CERT=$(grep -m1 -E '^[[:space:]]*ssl_certificate[[:space:]]' "$CONF" | awk '{print $2}' | tr -d ';')
KEY=$(grep -m1 -E '^[[:space:]]*ssl_certificate_key[[:space:]]' "$CONF" | awk '{print $2}' | tr -d ';')

if [ -z "$CERT" ] || [ -z "$KEY" ] || [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
    echo "✗ 未能从现有配置提取有效 SSL 证书路径 (cert=$CERT key=$KEY)"
    echo "  请先在宝塔面板为站点申请/开启 SSL 证书，再重跑本脚本"
    exit 1
fi
echo ">> 证书: $CERT"
echo ">> 私钥: $KEY"

# ── 3. 备份原配置 ──────────────────────────────────────
BACKUP="${CONF}.bak-$(date +%Y%m%d%H%M%S)"
cp "$CONF" "$BACKUP"
echo ">> 已备份: $BACKUP"

SITE_LOG="${CONF%.conf}"

# ── 4. 写入反向代理配置 ────────────────────────────────
cat > "$CONF" << 'NGINX_CONF'
server {
    listen 80;
    server_name www.fubao.ltd fubao.ltd;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.fubao.ltd fubao.ltd;

    ssl_certificate __CERT__;
    ssl_certificate_key __KEY__;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 50m;

    access_log /www/wwwlogs/__SITE_LOG__.log;
    error_log  /www/wwwlogs/__SITE_LOG__.error.log;

    root /www/wwwroot/fubao/public;
    index index.html;

    # 用户上传/商品图片：Nginx 静态直出
    location /uploads/ {
        alias /www/wwwroot/fubao/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location /images/ {
        alias /www/wwwroot/fubao/public/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Next.js 静态资源（带内容哈希，可长缓存）
    location /_next/static/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Next.js 其他内部资源（Server Action 等，不缓存）
    location /_next/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        add_header Cache-Control "no-cache";
    }

    # 敏感文件禁止访问（放行 .well-known 证书验证）
    location ~ /\.(?!well-known) { deny all; }
    location ~ \.(env|log|sql|sh)$ { deny all; }

    # 其余全部 → Next.js（proxy_buffering off 保证 AI 流式 SSE 实时输出）
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
        proxy_send_timeout 300s;
        proxy_buffering off;
    }
}
NGINX_CONF

sed -i "s|__CERT__|$CERT|; s|__KEY__|$KEY|; s|__SITE_LOG__|$SITE_LOG|" "$CONF"

# ── 5. 校验并重载（失败自动回滚）───────────────────────
if "$NGINX_BIN" -t; then
    "$NGINX_BIN" -s reload
    echo "✓ Nginx 反向代理配置已生效"
else
    echo ""
    echo "✗ nginx -t 校验失败，自动回滚到原配置..."
    cp "$BACKUP" "$CONF"
    "$NGINX_BIN" -t >/dev/null 2>&1 && "$NGINX_BIN" -s reload && echo ">> 已回滚到原配置"
    echo ">> 请把上方报错信息发给开发者排查"
    exit 1
fi

# ── 6. 验证 ────────────────────────────────────────────
sleep 1
echo ""
echo "== 验证结果（API 应返回 JSON，其余应 200）=="
curl -s --max-time 10 "https://www.fubao.ltd/api/goods?limit=2" | head -c 120; echo ""
for u in / /shop /images/products/taiji-fu.jpg /uploads/goods/1782070431769_3vyp8h.jpg; do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://www.fubao.ltd$u")
    printf "%-42s %s\n" "$u" "$code"
done
echo ""
echo "浏览器访问请用 Ctrl+Shift+R 强制刷新，避免旧缓存干扰。"
