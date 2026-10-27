# 符寶網 - 宝塔环境全新部署教程

> 适用场景：**全新的宝塔面板服务器**，从零开始部署符寶網
> 更新时间：2026-10-27（含 pnpm 12 适配、uploads 符号链接等全部修复）
> 架构：Nginx (443/80) → Next.js standalone (端口 5000) → MySQL

---

## 一、环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| 操作系统 | Ubuntu 22.04 / 24.04 | Debian 系均可 |
| 宝塔面板 | 7.x / 8.x | 官方版 |
| Node.js | **v20 LTS** | 必须 20+，Next.js 16 要求 |
| pnpm | **12.x** | 全局安装，无需 corepack |
| MySQL | 5.7+ / 8.0 | 8.0 推荐 |
| Nginx | 1.20+ | 宝塔自带 |
| 内存 | ≥ 2GB | 构建期间 Next.js 需要约 1.5GB |
| 磁盘 | ≥ 10GB | 含依赖、构建产物、上传文件 |

---

## 二、安装宝塔面板（新服务器）

```bash
# Ubuntu/Debian 安装命令
wget -O install.sh https://download.bt.cn/install/install_lts.sh
bash install.sh ed8484bec

# 记录面板地址、账号密码（安装完成后自动输出）
```

安装完成后登录面板，完成首次初始化（绑定宝塔账号可跳过）。

---

## 三、安装环境组件

### 3.1 宝塔软件商店安装（推荐）

在宝塔面板 → **软件商店** 中安装：

1. **Nginx** 1.2.x（编译安装）
2. **MySQL 8.0**（或 5.7，编译/极速安装均可）
3. **PM2 管理器**（可选，本项目用 systemd 而非 PM2，装它只是为了方便安装 Node）

### 3.2 安装 Node.js v20

> 不要用宝塔 Node 版本管理器里过旧的版本，直接用 NodeSource 源最稳：

```bash
# root SSH 执行
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 验证
node -v    # 应输出 v20.x.x
npm -v
```

### 3.3 安装 pnpm 12

```bash
npm install -g pnpm

# 验证（本项目已适配 pnpm 12，无需 corepack）
pnpm -v    # 12.x
```

> **重要**：确认 `pnpm config get global-dir` 正常，且**不要启用 corepack**。
> 项目 `package.json` 中已移除 `packageManager` 字段，避免 corepack 拉取镜像 404。

---

## 四、创建数据库

### 4.1 宝塔面板方式

宝塔 → **数据库** → **添加数据库**：

| 项 | 值 |
|----|-----|
| 数据库名 | `fubao` |
| 用户名 | `fubao` |
| 密码 | `CZDhXEb8M7t1jheP`（与项目脚本一致） |
| 访问权限 | 本地服务器 |
| 字符集 | `utf8mb4` |

### 4.2 命令行方式（等价）

```bash
mysql -uroot -p你的root密码 << 'EOF'
CREATE DATABASE IF NOT EXISTS fubao DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'fubao'@'127.0.0.1' IDENTIFIED BY 'CZDhXEb8M7t1jheP';
CREATE USER IF NOT EXISTS 'fubao'@'localhost' IDENTIFIED BY 'CZDhXEb8M7t1jheP';
GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'127.0.0.1';
GRANT ALL PRIVILEGES ON fubao.* TO 'fubao'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 4.3 导入表结构和种子数据

```bash
# 拉取代码后再执行（sql 目录在仓库里）
mysql -h127.0.0.1 -ufubao -pCZDhXEb8M7t1jheP fubao < /www/wwwroot/fubao/sql/schema.sql
mysql -h127.0.0.1 -ufubao -pCZDhXEb8M7t1jheP fubao < /www/wwwroot/fubao/sql/seed.sql
```

> `schema.sql` 使用 `CREATE TABLE IF NOT EXISTS`，可重复执行。

---

## 五、创建网站并配置 SSL

### 5.1 宝塔创建站点

宝塔 → **网站** → **添加站点**：

| 项 | 值 |
|----|-----|
| 域名 | `www.fubao.ltd`（填你自己的域名） |
| 根目录 | `/www/wwwroot/fubao/public`（站点先建一个默认目录，后面改） |
| PHP 版本 | 纯静态（不用 PHP） |

### 5.2 申请 SSL 证书

站点 → **SSL** → **Let's Encrypt** → 勾选域名 → 申请。
申请成功后开启 **强制 HTTPS**。

---

## 六、拉取代码

```bash
cd /www/wwwroot

# 克隆代码（宝塔建站如果自动建了 fubao 目录，先删除）
rm -rf fubao
git clone https://github.com/junnyjchen/fubao.git fubao

cd fubao

# 确认关键文件存在
ls package.json pnpm-workspace.yaml update-fubao.sh fubao-nextjs.service
```

> **如果目录已存在但不是 git 仓库**（比如宝塔自动创建过），执行：
> ```bash
> rm -rf /www/wwwroot/fubao && git clone https://github.com/junnyjchen/fubao.git /www/wwwroot/fubao
> ```

### 核对 pnpm-workspace.yaml（关键）

pnpm 11+ 移除了 `onlyBuiltDependencies`，必须使用 `allowBuilds` 格式：

```yaml
# cat pnpm-workspace.yaml 应包含以下内容
packages:
  - '.'

allowBuilds:
  esbuild: true
  sharp: true
  msw: true
  unrs-resolver: true
```

> 若仓库中缺少该文件或格式不对，手动执行：
> ```bash
> cat > /www/wwwroot/fubao/pnpm-workspace.yaml << 'EOF'
> packages:
>   - '.'
>
> allowBuilds:
>   esbuild: true
>   sharp: true
>   msw: true
>   unrs-resolver: true
> EOF
> ```

### 核对 package.json

确认 `package.json` 中**没有** `packageManager` 字段（有则删除）：

```bash
grep packageManager /www/wwwroot/fubao/package.json && sed -i '/packageManager/d' /www/wwwroot/fubao/package.json || echo "OK: 无该字段"
```

---

## 七、一键部署

```bash
cd /www/wwwroot/fubao

# 首次部署：安装依赖 + 构建 + 迁移 + 启动 systemd 服务
bash update-fubao.sh --install
```

脚本会自动完成：

1. 检查 Node.js / pnpm
2. 拉取最新代码（git pull）
3. `pnpm install`（依赖安装）
4. `pnpm build`（构建前自动 `rm -rf .next` 清缓存）
5. 准备 standalone 目录（复制 public、创建 uploads 符号链接、写入 .env）
6. 执行数据库迁移（sql/migrate.sql）
7. 安装并启动 `fubao-nextjs` systemd 服务

### 首次部署后手动导入数据

```bash
# update-fubao.sh --install 不含 schema/seed 导入，首次需手动执行：
mysql -h127.0.0.1 -ufubao -pCZDhXEb8M7t1jheP fubao < sql/schema.sql
mysql -h127.0.0.1 -ufubao -pCZDhXEb8M7t1jheP fubao < sql/seed.sql

# 重启服务生效
systemctl restart fubao-nextjs
```

### 部署产物结构

```
/www/wwwroot/fubao/
├── public/uploads/        ← 用户上传文件（真实目录，持久保存）
├── .next/standalone/
│   ├── server.js          ← systemd 运行入口
│   ├── public/uploads → /www/wwwroot/fubao/public/uploads  (符号链接)
│   ├── .env               ← 数据库配置（脚本自动写入）
│   └── ...
```

---

## 八、配置 Nginx

### 8.1 定位站点配置文件

宝塔站点的 Nginx 配置一般在：
```
/www/server/panel/vhost/nginx/www.fubao.ltd.conf
```
（文件名为你的域名）

### 8.2 完整配置内容

用宝塔「文件」功能或 `vim` 编辑，替换为以下内容（**域名和证书路径按实际修改**）：

```nginx
server {
    listen 80;
    server_name www.fubao.ltd fubao.ltd;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name www.fubao.ltd fubao.ltd;

    # SSL 证书（宝塔申请后自动填充，保持宝塔生成的路径）
    ssl_certificate /www/server/panel/vhost/cert/www.fubao.ltd/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/www.fubao.ltd/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 上传大小限制
    client_max_body_size 20m;

    # 静态资源由 Nginx 直接服务
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

    # Next.js 静态资源（长缓存）
    location /_next/static/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js 其他内部资源（Server Action 等，禁缓存）
    location /_next/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        add_header Cache-Control "no-cache";
    }

    # 所有其他请求 → Next.js
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

    # 禁止访问敏感文件
    location ~ /\. { deny all; }
    location ~ \.(env|log|sql|sh)$ { deny all; }
}
```

### 8.3 重载 Nginx

```bash
nginx -t && nginx -s reload
```

> **注意**：宝塔面板的 SSL 续期（Let's Encrypt）会自动更新证书文件，上述配置无需改动。
> 后续在宝塔面板修改站点配置时，注意不要让宝塔覆盖掉 `location /` 的代理规则。

---

## 九、验证部署

```bash
# 1. 服务状态
systemctl status fubao-nextjs

# 2. 端口监听
ss -tlnp | grep :5000

# 3. 本地响应
curl -I http://127.0.0.1:5000/

# 4. HTTPS 全链路
curl -I https://www.fubao.ltd/

# 5. 静态图片
curl -I https://www.fubao.ltd/images/products/taiji-fu.jpg

# 6. 数据库连接
mysql -h127.0.0.1 -ufubao -pCZDhXEb8M7t1jheP fubao -e "SELECT COUNT(*) FROM goods;"
```

一切正常的话，第 4 步应返回 `HTTP/2 200`。

**访问站点确认：**
- 首页：https://www.fubao.ltd
- 管理后台：https://www.fubao.ltd/admin （admin / admin123）

---

## 十、日常运维命令

### 更新代码

```bash
# 增量更新（拉代码 + 迁移 + 检测变更后按需构建）
bash update-fubao.sh

# 强制完整重建（每次改了代码后推荐用这个）
bash update-fubao.sh --rebuild

# 仅数据库迁移
bash update-fubao.sh --migrate

# 诊断（服务/端口/日志/Nginx/MySQL/构建状态）
bash update-fubao.sh --diagnose
```

### 服务管理

```bash
systemctl restart fubao-nextjs    # 重启
systemctl stop fubao-nextjs       # 停止
systemctl start fubao-nextjs      # 启动
journalctl -u fubao-nextjs -f     # 实时日志
journalctl -u fubao-nextjs -n 50  # 最近 50 行
```

### 常见问题排查

| 现象 | 原因 | 解决 |
|------|------|------|
| `Failed to find Server Action` | 浏览器缓存旧部署 | 强制刷新（Ctrl+Shift+R）；脚本已自动 `rm -rf .next` 避免复发 |
| `ERR_PNPM_IGNORED_BUILDS` | pnpm 12 缺 `allowBuilds` | 核对第六章 `pnpm-workspace.yaml` 内容 |
| `resolve pnpm@x Not Found - 404` | `packageManager` 字段触发 corepack | 删除该字段（见第六章核对步骤） |
| `Column 'xxx' cannot be null` | 插入字段未给默认值 | 执行 `bash update-fubao.sh --migrate` |
| 图片 404 | uploads 符号链接丢失 | `ln -sf /www/wwwroot/fubao/public/uploads /www/wwwroot/fubao/.next/standalone/public/uploads` |
| MySQL 连接失败 | .env 缺失 | 重跑 `bash update-fubao.sh --rebuild`（脚本会重写 .env） |
| 构建内存不足 | 2GB 服务器 OOM | 加 swap：`fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile` |

### git 本地改动冲突（拉取失败时）

```bash
cd /www/wwwroot/fubao
git checkout -- .        # 丢弃本地改动
git clean -fd            # 删除未跟踪文件（谨慎）
git pull origin main
bash update-fubao.sh --rebuild
```

---

## 十一、数据备份建议

在宝塔 → **计划任务** 中添加：

1. **数据库备份**：每日备份 `fubao` 数据库，保留 7 份
2. **站点目录备份**：每周备份 `/www/wwwroot/fubao/public/uploads`（用户上传的图片在这里，且**不在 git 仓库中**）

---

## 附录：systemd 服务说明

服务文件 `/etc/systemd/system/fubao-nextjs.service`（由 `update-fubao.sh` 自动安装）：

- 运行目录：`/www/wwwroot/fubao/.next/standalone`
- 启动命令：`node server.js`（Next.js standalone 产物）
- 端口：`5000`（环境变量 PORT）
- 崩溃自启：`Restart=always`，3 秒后重启
- 环境变量：MySQL 连接、`AI_PROVIDER=deepseek`、`COZE_PROJECT_ENV=PROD`

修改服务文件后需执行 `systemctl daemon-reload`。
