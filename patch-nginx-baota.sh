#!/bin/bash
# ================================================
# 宝塔面板 Nginx 配置补丁脚本
# 策略：最小化修改宝塔配置，只改动 location / 块
#       不替换整个文件，避免宝塔面板覆盖
#
# 用法: bash patch-nginx-baota.sh
# ================================================

set -e

DOMAIN="www.fubao.ltd"

echo "━━━ 宝塔 Nginx 配置补丁 ━━━"
echo "  策略: 最小化修改，保留宝塔配置结构"
echo ""

# ━━━ 查找宝塔配置文件 ━━━
NGINX_TARGET=""
for p in \
    "/www/server/panel/vhost/nginx/${DOMAIN}.conf" \
    "/www/server/nginx/conf/vhost/${DOMAIN}.conf"; do
    if [ -f "$p" ]; then
        NGINX_TARGET="$p"
        echo "✅ 找到配置: $NGINX_TARGET"
        break
    fi
done

if [ -z "$NGINX_TARGET" ]; then
    echo "❌ 未找到宝塔 Nginx 配置文件"
    echo ""
    echo "请手动修改宝塔配置："
    echo "  1. 宝塔面板 → 网站 → ${DOMAIN} → 设置 → 配置文件"
    echo "  2. 找到 location / { ... } 块"
    echo "  3. 替换为以下内容："
    echo ""
    echo "    location / {"
    echo "        proxy_pass http://127.0.0.1:5000;"
    echo "        proxy_http_version 1.1;"
    echo "        proxy_set_header Upgrade \$http_upgrade;"
    echo "        proxy_set_header Connection 'upgrade';"
    echo "        proxy_set_header Host \$host;"
    echo "        proxy_set_header X-Real-IP \$remote_addr;"
    echo "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;"
    echo "        proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "        proxy_cache_bypass \$http_upgrade;"
    echo "        proxy_read_timeout 300s;"
    echo "        proxy_send_timeout 300s;"
    echo "    }"
    echo ""
    echo "  4. 删除所有 location ~ .*\\.php$ 和 location /api/ 相关块"
    echo "  5. 保存并重载"
    exit 1
fi

# ━━━ 显示当前配置关键部分 ━━━
echo ""
echo "📄 当前配置中的 location 块："
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
grep -n "location" "$NGINX_TARGET" | head -20
echo "━━━━━━━━━━━━━━━━━━━━━━━━"

# ━━━ 备份 ━━━
BACKUP="${NGINX_TARGET}.bak.$(date +%Y%m%d%H%M%S)"
sudo cp "$NGINX_TARGET" "$BACKUP"
echo ""
echo "📦 已备份: $BACKUP"

# ━━━ 检查是否已经是 proxy_pass 到 5000 ━━━
if grep -q "proxy_pass.*5000" "$NGINX_TARGET"; then
    echo ""
    echo "✅ 配置已包含 proxy_pass 到 5000，无需修改"
    echo "  如果仍然不生效，可能是其他 location 块优先匹配了 /api/ 请求"
fi

# ━━━ 检查是否有 /api/ 分流到 PHP ━━━
if grep -q "location.*\/api" "$NGINX_TARGET"; then
    echo ""
    echo "⚠️  发现 /api/ 相关的 location 块："
    grep -n "location.*\/api" "$NGINX_TARGET"
    echo ""
    echo "这些块可能拦截了 /api/ 请求并转发给 PHP"
fi

# ━━━ 检查是否有 PHP FastCGI 块 ━━━
if grep -q "fastcgi_pass" "$NGINX_TARGET"; then
    echo ""
    echo "⚠️  发现 PHP FastCGI 配置："
    grep -n "fastcgi_pass" "$NGINX_TARGET"
    echo ""
    echo "这些配置可能拦截了 PHP 文件请求"
fi

# ━━━ 应用补丁 ━━━
echo ""
echo "━━━ 应用补丁 ━━━"

# 使用 Python 来精确修改 Nginx 配置
# 策略：注释掉所有 /api/ location 块和 .php$ 块，确保 location / 走 proxy_pass
python3 << 'PYTHON_SCRIPT'
import re
import sys

config_path = "$NGINX_TARGET"
with open(config_path, 'r') as f:
    content = f.read()

original = content

# 1. 替换 location / 块（如果已有 proxy_pass 5000 就不动）
if 'proxy_pass http://127.0.0.1:5000' not in content:
    # 查找 location / 块并替换
    # 匹配 location / { ... } （非 location /api, /uploads 等）
    pattern = r'(location\s+/\s*\{)[^}]*(\})'
    
    replacement = '''location / {
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
    }'''
    
    content = re.sub(pattern, replacement, content, count=1, flags=re.DOTALL)
    if content != original:
        print("✅ 已替换 location / 块 → proxy_pass 5000")
    else:
        print("⚠️  未找到 location / 块，请手动添加")

# 2. 注释掉 /api/ 相关的 location 块
# 这是最关键的：宝塔默认把 /api/ 交给 PHP 处理
api_pattern = r'((?:\s*#?\s*)location\s+[~^]*\s*(?:/api|/\~\s*\.\*php))'
matches = list(re.finditer(r'location\s+[~^]*\s*(?:/api|/\~\s*\.\*php)', content))
if matches:
    # 逐个注释整个块
    for m in reversed(matches):
        # 找到块的开始位置
        start = m.start()
        # 找到块的结束位置（匹配大括号）
        brace_start = content.find('{', start)
        if brace_start == -1:
            continue
        depth = 0
        end = brace_start
        for i in range(brace_start, len(content)):
            if content[i] == '{':
                depth += 1
            elif content[i] == '}':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        
        block = content[start:end]
        # 注释掉整个块
        commented_block = '\n'.join('    # ' + line if line.strip() else '' for line in block.split('\n'))
        content = content[:start] + commented_block + content[end:]
        print(f"✅ 已注释掉 location 块: {m.group().strip()}")

# 3. 如果配置中没有 location / 块但有 PHP location，添加 proxy_pass
if 'proxy_pass http://127.0.0.1:5000' not in content:
    # 在 server 块的末尾（最后一个 } 之前）插入
    last_brace = content.rfind('}')
    if last_brace > 0:
        insert_text = '''
    # ━━━ 所有请求 → Next.js (由补丁脚本添加) ━━━
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
    }
'''
        content = content[:last_brace] + insert_text + content[last_brace:]
        print("✅ 已在 server 块末尾添加 location / → proxy_pass 5000")

if content != original:
    with open(config_path, 'w') as f:
        f.write(content)
    print("📝 配置已更新")
else:
    print("ℹ️  配置无需修改")
PYTHON_SCRIPT

if [ $? -ne 0 ]; then
    echo "❌ Python 补丁执行失败"
    echo ""
    echo "请手动修改宝塔配置："
    echo "  宝塔面板 → 网站 → ${DOMAIN} → 设置 → 配置文件"
    # 恢复备份
    sudo cp "$BACKUP" "$NGINX_TARGET"
    echo "🔄 已恢复旧配置"
    exit 1
fi

# ━━━ 验证 Nginx 配置 ━━━
echo ""
echo "🔍 验证 Nginx 配置..."
if sudo nginx -t 2>&1; then
    echo "✅ Nginx 配置验证通过"
else
    echo "❌ Nginx 配置验证失败，恢复旧配置..."
    sudo cp "$BACKUP" "$NGINX_TARGET"
    echo "🔄 已恢复旧配置"
    exit 1
fi

# ━━━ 重载 Nginx ━━━
echo "🔄 重载 Nginx..."
sudo nginx -s reload 2>/dev/null || sudo systemctl reload nginx 2>/dev/null || true
sleep 2
echo "✅ Nginx 已重载"

# ━━━ 验证 ━━━
echo ""
echo "━━━ 验证部署效果 ━━━"

sleep 2

API_RESP=$(curl -s "http://127.0.0.1/api/goods?limit=1" 2>/dev/null | head -c 200)
if echo "$API_RESP" | grep -q '"success"'; then
    echo "✅ API 响应包含 success → Next.js 生效！"
elif echo "$API_RESP" | grep -q '"data"'; then
    echo "⚠️  API 有 data 但无 success → 可能还是 PHP 在处理"
    echo "  响应片段: ${API_RESP:0:100}"
else
    echo "❌ API 无响应"
    echo "  可能原因: Nginx 配置被宝塔覆盖，或 PHP-FPM 仍拦截请求"
fi

echo ""
echo "━━━ 补丁完成 ━━━"
echo ""
echo "如果补丁不生效（宝塔可能覆盖配置），请手动操作："
echo "  1. 宝塔面板 → 网站 → ${DOMAIN} → 设置 → 配置文件"
echo "  2. 找到 location / 块，替换为 proxy_pass http://127.0.0.1:5000"
echo "  3. 注释或删除所有 location ~ .*\.php$ 块"
echo "  4. 注释或删除所有 location /api/ 块"  
echo "  5. 保存 → Nginx 自动重载"
