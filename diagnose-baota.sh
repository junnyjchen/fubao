#!/bin/bash
# ============================================================
# 符寶網 - 宝塔环境诊断脚本
# 
# 目的：找出宝塔 Nginx 如何路由 /api/* 请求
# 在服务器上运行此脚本，把输出发回分析
# ============================================================

echo "=============================================="
echo "  符寶網 - 宝塔环境诊断"
echo "=============================================="

# 1. 找到 Nginx 站点配置
echo ""
echo "━━━ 1. Nginx 站点配置 ━━━"
SITE_CONF=""
for conf in \
    "/www/server/panel/vhost/nginx/www.fubao.ltd.conf" \
    "/www/server/nginx/conf/vhost/www.fubao.ltd.conf" \
    "/www/server/nginx/conf/vhost/fubao.ltd.conf" \
    "/etc/nginx/conf.d/www.fubao.ltd.conf" \
    "/etc/nginx/sites-enabled/www.fubao.ltd"; do
    if [ -f "$conf" ]; then
        SITE_CONF="$conf"
        echo "  找到配置: $conf"
        break
    fi
done

if [ -z "$SITE_CONF" ]; then
    echo "  ❌ 未找到站点配置文件"
    echo "  搜索所有 Nginx 配置中的 fubao:"
    grep -rl "fubao" /www/server/nginx/conf/ /www/server/panel/vhost/ /etc/nginx/ 2>/dev/null | head -5
else
    echo ""
    echo "  ─── 完整配置内容 ───"
    cat "$SITE_CONF"
    echo "  ─── 配置结束 ───"
fi

# 2. Nginx 主配置
echo ""
echo "━━━ 2. Nginx 主配置 (include 目录) ━━━"
for mainconf in /www/server/nginx/conf/nginx.conf /etc/nginx/nginx.conf; do
    if [ -f "$mainconf" ]; then
        echo "  主配置: $mainconf"
        grep -E "include|vhost" "$mainconf" 2>/dev/null | head -10
        break
    fi
done

# 3. PHP-FPM 配置
echo ""
echo "━━━ 3. PHP-FPM 配置 ━━━"
PHP_VERSION=""
for pv in 7.4 8.0 8.1 8.2 8.3 8.4; do
    if [ -f "/www/server/php/${pv}/etc/php-fpm.conf" ]; then
        PHP_VERSION="$pv"
        echo "  PHP 版本: $pv"
        echo "  PHP-FPM 配置: /www/server/php/${pv}/etc/php-fpm.conf"
        break
    fi
    if sudo systemctl is-active --quiet "php${pv}-fpm" 2>/dev/null; then
        PHP_VERSION="$pv"
        echo "  PHP 版本: $pv (systemd)"
        break
    fi
done
if [ -z "$PHP_VERSION" ]; then
    echo "  PHP-FPM 运行状态:"
    sudo systemctl list-units --type=service | grep php 2>/dev/null
fi

# 4. PHP 扩展
echo ""
echo "━━━ 4. PHP cURL 扩展 ━━━"
PHP_BIN=""
for pv in 74 80 81 82 83 84; do
    if [ -x "/www/server/php/${pv:0:1}.${pv:1}/bin/php" ]; then
        PHP_BIN="/www/server/php/${pv:0:1}.${pv:1}/bin/php"
        break
    fi
done
if [ -z "$PHP_BIN" ]; then
    PHP_BIN=$(which php 2>/dev/null)
fi

if [ -n "$PHP_BIN" ]; then
    echo "  PHP 路径: $PHP_BIN"
    echo "  PHP 版本: $($PHP_BIN -v 2>/dev/null | head -1)"
    if $PHP_BIN -m 2>/dev/null | grep -qi curl; then
        echo "  ✅ cURL 扩展已安装"
    else
        echo "  ❌ cURL 扩展未安装（代理功能需要此扩展）"
    fi
else
    echo "  ❌ 未找到 PHP 可执行文件"
fi

# 5. 项目文件结构
echo ""
echo "━━━ 5. 项目入口文件 ━━━"
BASE_DIR="/www/wwwroot/fubao"
for f in \
    "$BASE_DIR/index.php" \
    "$BASE_DIR/public/index.php" \
    "$BASE_DIR/php/public/index.php"; do
    if [ -f "$f" ]; then
        echo "  ✅ $f (存在)"
        # 检查是否包含代理逻辑
        if grep -q "nextjs" "$f" 2>/dev/null; then
            echo "     → 已包含 Next.js 代理逻辑"
        else
            echo "     → 未包含 Next.js 代理逻辑"
        fi
    else
        echo "  ❌ $f (不存在)"
    fi
done

# 6. 运行时测试
echo ""
echo "━━━ 6. 运行时测试 ━━━"

echo "  直连 Next.js:"
NX_RESP=$(curl -s --max-time 5 "http://127.0.0.1:5000/api/goods?limit=1" 2>/dev/null | head -c 200)
echo "  → ${NX_RESP:-无响应}"

echo ""
echo "  通过 Nginx (PHP 路径):"
PHP_RESP=$(curl -s --max-time 5 "http://127.0.0.1/api/goods?limit=1" 2>/dev/null | head -c 200)
echo "  → ${PHP_RESP:-无响应}"

echo ""
echo "  检查 X-Served-By 响应头:"
SERVED_BY=$(curl -sI --max-time 5 "http://127.0.0.1/api/categories" 2>/dev/null | grep -i "x-served-by" || echo "未找到")
echo "  → $SERVED_BY"

echo ""
echo "  检查 Server/X-Powered-By 响应头:"
HEADERS=$(curl -sI --max-time 5 "http://127.0.0.1/api/categories" 2>/dev/null | grep -iE "server:|x-powered-by:" || echo "未找到")
echo "  → $HEADERS"

# 7. 进程和端口
echo ""
echo "━━━ 7. 服务状态 ━━━"
echo "  Next.js: $(sudo systemctl is-active fubao-nextjs 2>/dev/null || echo '未安装')"
echo "  Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo '未运行')"
echo "  端口 5000: $(ss -tlnp 2>/dev/null | grep ':5000' | head -1 || echo '未监听')"
echo "  端口 80: $(ss -tlnp 2>/dev/null | grep ':80 ' | head -1 || echo '未监听')"

echo ""
echo "=============================================="
echo "  诊断完成，请将以上输出发回分析"
echo "=============================================="
