# 符寶網 - 宝塔面板部署指南

本文档详细介绍如何使用宝塔面板（BT Panel）搭建和部署符寶網项目。

---

## 目录

1. [环境要求](#1-环境要求)
2. [宝塔面板安装](#2-宝塔面板安装)
3. [基础环境配置](#3-基础环境配置)
4. [数据库配置](#4-数据库配置)
5. [项目部署](#5-项目部署)
6. [Nginx 反向代理配置](#6-nginx-反向代理配置)
7. [SSL 证书配置](#7-ssl-证书配置)
8. [PM2 进程管理](#8-pm2-进程管理)
9. [常见问题处理](#9-常见问题处理)

---

## 1. 环境要求

### 服务器配置

| 配置项 | 最低要求 | 推荐配置 |
|--------|----------|----------|
| CPU | 1核 | 2核+ |
| 内存 | 2GB | 4GB+ |
| 硬盘 | 20GB | 50GB+ SSD |
| 带宽 | 1Mbps | 5Mbps+ |
| 系统 | CentOS 7.x / Ubuntu 18.04+ | Ubuntu 20.04 LTS |

### 软件版本

| 软件 | 版本要求 |
|------|----------|
| Node.js | 18.x 或更高 |
| pnpm | 8.x 或更高 |
| PostgreSQL | 14.x 或更高 |
| Nginx | 1.20+ |
| PM2 | 5.x |

---

## 2. 宝塔面板安装

### 2.1 安装宝塔面板

**CentOS 系统：**
```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
```

**Ubuntu/Debian 系统：**
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

### 2.2 安装完成后

安装成功后会显示以下信息，请妥善保存：

```
==================================================================
外网面板地址: https://xxx.xxx.xxx.xxx:8888/xxxxxxxx
内网面板地址: https://192.168.x.x:8888/xxxxxxxx
username: xxxxxxxx
password: xxxxxxxx
==================================================================
```

### 2.3 安全组配置

确保服务器安全组/防火墙开放以下端口：

| 端口 | 用途 |
|------|------|
| 8888 | 宝塔面板 |
| 22 | SSH |
| 80 | HTTP |
| 443 | HTTPS |
| 5000 | Node.js 应用（仅开发环境） |

---

## 3. 基础环境配置

### 3.1 软件商店安装

登录宝塔面板后，在「软件商店」安装以下软件：

1. **Nginx** - Web 服务器
2. **PostgreSQL** - 数据库
3. **PM2管理器** - Node.js 进程管理
4. **Node.js版本管理器** - 管理 Node.js 版本

### 3.2 Node.js 环境配置

1. 进入「软件商店」→「Node版本管理器」→「设置」
2. 安装 **Node.js 18.x** 或 **20.x** 版本
3. 设置为默认版本

**命令行安装（可选）：**

```bash
# 安装 Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 或使用 nvm 安装
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### 3.3 安装 pnpm

通过 SSH 终端执行：

```bash
# 全局安装 pnpm
npm install -g pnpm

# 验证安装
pnpm -v
```

### 3.4 安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 设置开机自启
pm2 startup
pm2 save
```

---

## 4. 数据库配置

### 4.1 创建数据库

1. 进入宝塔面板 →「数据库」
2. 点击「添加数据库」
3. 填写信息：

| 字段 | 示例值 |
|------|--------|
| 数据库名 | fubao_db |
| 用户名 | fubao_user |
| 密码 | 强密码（建议16位以上） |
| 数据库类型 | PostgreSQL |

### 4.2 配置数据库连接

在项目根目录创建 `.env` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://fubao_user:你的密码@localhost:5432/fubao_db"

# Supabase 配置（如使用 Supabase）
COZE_SUPABASE_URL="https://your-project.supabase.co"
COZE_SUPABASE_ANON_KEY="your-anon-key"

# 应用配置
NODE_ENV="production"
PORT=5000
```

### 4.3 导入数据库结构

```bash
# 进入项目目录
cd /www/wwwroot/fubao.ltd

# 同步数据库结构（使用 Drizzle ORM）
pnpm db:push

# 或导入 SQL 文件
psql -U fubao_user -d fubao_db -f scripts/init-database.sql
```

---

## 5. 项目部署

### 5.1 上传项目文件

**方式一：Git 克隆（推荐）**

```bash
# 进入网站目录
cd /www/wwwroot

# 克隆项目
git clone https://github.com/your-repo/fubao.git fubao.ltd
```

**方式二：宝塔文件管理**

1. 进入「文件」→`/www/wwwroot/`
2. 上传项目压缩包
3. 解压文件

### 5.2 安装依赖

```bash
cd /www/wwwroot/fubao.ltd

# 安装依赖
pnpm install
```

### 5.3 环境变量配置

创建生产环境配置文件：

```bash
# 创建 .env 文件
cat > .env.production << 'EOF'
# 数据库配置
DATABASE_URL="postgresql://fubao_user:你的密码@localhost:5432/fubao_db"

# Supabase 配置
COZE_SUPABASE_URL="https://your-project.supabase.co"
COZE_SUPABASE_ANON_KEY="your-anon-key"

# 应用配置
NODE_ENV="production"
PORT=5000
COZE_PROJECT_ENV="PROD"
COZE_PROJECT_DOMAIN_DEFAULT="fubao.ltd"

# 安全配置
JWT_SECRET="your-jwt-secret-key-at-least-32-characters"
OAUTH_STATE_SECRET="your-oauth-state-secret"
EOF
```

### 5.4 构建项目

```bash
# 构建生产版本
pnpm build
```

### 5.5 目录结构

确保项目目录结构如下：

```
/www/wwwroot/fubao.ltd/
├── .env                    # 环境变量
├── .env.production         # 生产环境配置
├── .next/                  # 构建输出目录
├── public/                 # 静态资源
├── src/                    # 源代码
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
└── ecosystem.config.js     # PM2 配置文件
```

---

## 6. Nginx 反向代理配置

### 6.1 创建网站

1. 进入宝塔面板 →「网站」
2. 点击「添加站点」
3. 填写域名：`fubao.ltd`（及 `www.fubao.ltd`）
4. PHP版本选择「纯静态」
5. 创建数据库（如需要）

### 6.2 配置反向代理

进入网站设置 →「反向代理」→「添加反向代理」：

| 配置项 | 值 |
|--------|-----|
| 代理名称 | fubao_nodejs |
| 目标URL | http://127.0.0.1:5000 |
| 发送域名 | $host |

### 6.3 手动配置 Nginx（可选）

进入网站设置 →「配置文件」，添加以下内容：

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name fubao.ltd www.fubao.ltd;
    
    # SSL 配置（如已配置）
    # ssl_certificate /www/server/panel/vhost/cert/fubao.ltd/fullchain.pem;
    # ssl_certificate_key /www/server/panel/vhost/cert/fubao.ltd/privkey.pem;
    
    # 日志
    access_log /www/wwwlogs/fubao.ltd.log;
    error_log /www/wwwlogs/fubao.ltd.error.log;
    
    # 客户端请求限制
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    
    # 反向代理到 Node.js 应用
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket 支持
    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }
    
    # 静态资源缓存
    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # 图片等静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|webp|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:5000;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name fubao.ltd www.fubao.ltd;
    
    # Let's Encrypt 验证路径
    location /.well-known/acme-challenge/ {
        root /www/server/panel/vhost/cert/fubao.ltd;
    }
    
    # 重定向到 HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 6.4 重载 Nginx

```bash
# 测试配置
nginx -t

# 重载配置
nginx -s reload

# 或在宝塔面板操作
# 软件商店 → Nginx → 重载配置
```

---

## 7. SSL 证书配置

### 7.1 Let's Encrypt 免费证书

1. 进入网站设置 →「SSL」
2. 选择「Let's Encrypt」
3. 勾选域名 `fubao.ltd` 和 `www.fubao.ltd`
4. 点击「申请」
5. 开启「强制HTTPS」

### 7.2 自定义证书

1. 进入网站设置 →「SSL」
2. 选择「其他证书」
3. 粘贴证书内容：
   - **证书 (PEM格式)**：fullchain.pem 内容
   - **密钥 (KEY)**：privkey.pem 内容
4. 保存并开启「强制HTTPS」

### 7.3 证书自动续期

宝塔面板默认会自动续期 Let's Encrypt 证书。如需手动续期：

```bash
# 手动续期
certbot renew --force-renewal

# 或在宝塔面板
# 计划任务 → 添加任务 → Shell脚本
# 脚本内容：/www/server/panel/pyenv/bin/python3 /www/server/panel/class/acme_v2.py --renew=1
```

---

## 8. PM2 进程管理

### 8.1 创建 PM2 配置文件

在项目根目录创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'fubao-web',
      script: 'pnpm',
      args: 'start',
      cwd: '/www/wwwroot/fubao.ltd',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/www/wwwlogs/fubao/error.log',
      out_file: '/www/wwwlogs/fubao/out.log',
      log_file: '/www/wwwlogs/fubao/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

### 8.2 PM2 常用命令

```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs fubao-web

# 重启应用
pm2 restart fubao-web

# 停止应用
pm2 stop fubao-web

# 删除应用
pm2 delete fubao-web

# 监控
pm2 monit

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
```

### 8.3 宝塔 PM2 管理器

1. 进入「软件商店」→「PM2管理器」
2. 点击「设置」
3. 添加项目：
   - 项目路径：`/www/wwwroot/fubao.ltd`
   - 启动文件：`pnpm start`
   - 项目名称：`fubao-web`

---

## 9. 常见问题处理

### 9.1 端口被占用

```bash
# 查看端口占用
lsof -i:5000
netstat -tlnp | grep 5000

# 杀掉进程
kill -9 <PID>
```

### 9.2 内存不足

```bash
# 查看内存使用
free -h

# 创建 Swap（如需要）
dd if=/dev/zero of=/swapfile bs=1M count=2048
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

# 开机自动挂载
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
```

### 9.3 Node.js 应用无法启动

```bash
# 检查 Node.js 版本
node -v

# 检查依赖
pnpm install

# 检查构建
pnpm build

# 手动启动测试
pnpm start

# 查看详细错误
pm2 logs fubao-web --lines 100
```

### 9.4 Nginx 502 错误

**可能原因：**
1. Node.js 应用未启动
2. 端口配置错误
3. 防火墙阻止

**解决方案：**

```bash
# 检查应用状态
pm2 status

# 检查端口
netstat -tlnp | grep 5000

# 检查 Nginx 错误日志
tail -f /www/wwwlogs/fubao.ltd.error.log

# 重启服务
pm2 restart fubao-web
nginx -s reload
```

### 9.5 数据库连接失败

```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 检查连接
psql -U fubao_user -d fubao_db -h localhost

# 检查防火墙
firewall-cmd --list-ports

# 重启数据库
systemctl restart postgresql
```

### 9.6 文件权限问题

```bash
# 设置正确的文件所有者
chown -R www:www /www/wwwroot/fubao.ltd

# 设置目录权限
find /www/wwwroot/fubao.ltd -type d -exec chmod 755 {} \;

# 设置文件权限
find /www/wwwroot/fubao.ltd -type f -exec chmod 644 {} \;

# .next 目录权限
chmod -R 755 /www/wwwroot/fubao.ltd/.next
```

### 9.7 静态资源 404

```bash
# 检查 public 目录
ls -la /www/wwwroot/fubao.ltd/public

# 检查 .next/static 目录
ls -la /www/wwwroot/fubao.ltd/.next/static

# 重新构建
pnpm build
```

### 9.8 热更新/自动部署

创建部署脚本 `/www/wwwroot/deploy.sh`：

```bash
#!/bin/bash

# 进入项目目录
cd /www/wwwroot/fubao.ltd

# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install

# 构建
pnpm build

# 重启应用
pm2 restart fubao-web

# 重载 Nginx
nginx -s reload

echo "部署完成！$(date)"
```

设置权限：

```bash
chmod +x /www/wwwroot/deploy.sh
```

---

## 10. 性能优化建议

### 10.1 Nginx 优化

在 Nginx 配置中添加：

```nginx
# 开启文件缓存
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;
open_file_cache_errors on;

# 连接优化
worker_processes auto;
worker_connections 4096;
multi_accept on;
use epoll;

# 缓冲区优化
fastcgi_buffers 16 16k;
fastcgi_buffer_size 32k;
fastcgi_busy_buffers_size 32k;
```

### 10.2 Node.js 优化

在 PM2 配置中：

```javascript
{
  instances: 'max',           // 利用所有 CPU 核心
  exec_mode: 'cluster',       // 集群模式
  max_memory_restart: '1G',   // 内存超过 1G 重启
  node_args: '--max-old-space-size=1024'  // 限制 Node.js 内存
}
```

### 10.3 数据库优化

```sql
-- 优化 PostgreSQL 配置
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = '0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = '100';
ALTER SYSTEM SET random_page_cost = '1.1';
ALTER SYSTEM SET effective_io_concurrency = '200';
ALTER SYSTEM SET work_mem = '2621kB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- 重载配置
SELECT pg_reload_conf();
```

---

## 11. 安全加固

### 11.1 防火墙配置

```bash
# 开放必要端口
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=8888/tcp

# 重载防火墙
firewall-cmd --reload
```

### 11.2 SSH 加固

编辑 `/etc/ssh/sshd_config`：

```
Port 22022                    # 更改默认端口
PermitRootLogin no            # 禁止 root 登录
PasswordAuthentication no     # 禁用密码登录（使用密钥）
MaxAuthTries 3                # 最大尝试次数
```

### 11.3 宝塔面板安全

1. 修改面板端口
2. 绑定域名
3. 开启面板 SSL
4. 设置授权 IP
5. 开启两步验证

---

## 12. 监控与日志

### 12.1 日志位置

| 日志类型 | 路径 |
|----------|------|
| Nginx 访问日志 | /www/wwwlogs/fubao.ltd.log |
| Nginx 错误日志 | /www/wwwlogs/fubao.ltd.error.log |
| PM2 应用日志 | /www/wwwlogs/fubao/out.log |
| PM2 错误日志 | /www/wwwlogs/fubao/error.log |
| 宝塔面板日志 | /www/server/panel/logs/ |

### 12.2 日志轮转

创建 `/etc/logrotate.d/fubao`：

```
/www/wwwlogs/fubao/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0644 www www
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 12.3 监控告警

宝塔面板 →「监控」→「告警设置」：

- CPU 使用率 > 80%
- 内存使用率 > 85%
- 磁盘使用率 > 90%
- 进程异常退出

---

## 附录：快速部署清单

```bash
# 1. 安装依赖
cd /www/wwwroot/fubao.ltd
pnpm install

# 2. 配置环境变量
cp .env.example .env.production
vim .env.production

# 3. 构建项目
pnpm build

# 4. 初始化数据库
pnpm db:push

# 5. 启动应用
pm2 start ecosystem.config.js

# 6. 保存 PM2 配置
pm2 save

# 7. 重载 Nginx
nginx -s reload

# 8. 检查状态
pm2 status
curl -I http://localhost:5000
```

---

**文档版本：** 1.0  
**更新日期：** 2024年  
**适用项目：** 符寶網 (fubao.ltd)
