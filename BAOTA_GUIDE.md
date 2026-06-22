# 宝塔面板 Nginx 配置指南

## 当前架构

```
请求 → Nginx → PHP-FPM (index.php) → 反向代理到 Next.js (端口 5000)
                                         ↓ (如果 Next.js 不可用)
                                      PHP 降级处理
```

**核心机制**：PHP 的 `index.php` 已内置 Next.js 反向代理，即使宝塔面板把 `/api/*` 请求转发给 PHP，也会被自动代理到 Next.js。所以 **无需修改 Nginx 配置**。

## 如果想优化（跳过 PHP 代理，直接到 Next.js）

可以在宝塔面板中修改 Nginx 配置，让所有请求直接转发给 Next.js，减少 PHP 代理的延迟：

### 操作步骤

1. 登录宝塔面板
2. 网站 → www.fubao.ltd → 设置 → 配置文件
3. 找到 `location /` 块，替换为：

```nginx
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
```

4. 注释或删除所有 `location /api/` 块（如果有的话）
5. 保存 → Nginx 自动重载

### 注意事项

- **SSL 证书路径不要修改**，宝塔面板自己管理
- **不要删除** `location ~ \.php$` 块，PHP 仍然需要处理管理路径
- 修改后如果出现 502，确认 Next.js 服务在运行：`sudo systemctl status fubao-nextjs`

## 环境变量

PHP 代理支持以下环境变量（在 `.env` 或 PHP 配置中设置）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NEXTJS_HOST` | `127.0.0.1` | Next.js 主机地址 |
| `NEXTJS_PORT` | `5000` | Next.js 端口 |
| `DISABLE_NXJS_PROXY` | (空) | 设为 `true` 禁用代理，全部用 PHP |

## 诊断

在服务器上运行：

```bash
# 诊断当前状态
bash update-fubao.sh --diagnose

# 测试 Next.js 直连
curl -s http://127.0.0.1:5000/api/goods?limit=1 | head -c 200

# 测试 PHP 代理
curl -s http://127.0.0.1/api/goods?limit=1 | head -c 200

# 检查 PHP cURL 扩展
php -m | grep curl
```
