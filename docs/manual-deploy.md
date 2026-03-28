# 符寶網 手动部署指南

## 服务器信息
- IP: 47.76.186.195
- 系统: Ubuntu 24.04
- 域名: fubao.ltd
- SSH: `ssh root@47.76.186.195`

---

## 一、首次部署步骤

### 步骤1: SSH登录服务器
```bash
ssh root@47.76.186.195
# 密码: Gf123456.
```

### 步骤2: 安装环境（如果尚未安装）
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 pnpm 和 PM2
npm install -g pnpm pm2
pm2 startup systemd -u root --hp /root

# 安装 Nginx 和 Certbot
apt install -y nginx certbot python3-certbot-nginx

# 创建目录
mkdir -p /www/wwwroot/fubao.ltd /www/wwwlogs/fubao /www/backup/fubao.ltd /var/www/certbot
```

### 步骤3: 配置 Nginx
```bash
cat > /etc/nginx/sites-available/fubao.ltd << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name fubao.ltd www.fubao.ltd;

    access_log /www/wwwlogs/fubao.log;
    error_log /www/wwwlogs/fubao.error.log;

    client_max_body_size 50M;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

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
    }

    location /ws {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:5000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
EOF

ln -sf /etc/nginx/sites-available/fubao.ltd /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 步骤4: 上传项目文件
在本地执行（不是在服务器上）：
```bash
scp -r .next dist public package.json pnpm-lock.yaml ecosystem.config.js .env.production.example update.sh root@47.76.186.195:/www/wwwroot/fubao.ltd/
```

### 步骤5: 配置环境变量
```bash
cd /www/wwwroot/fubao.ltd

# 创建环境变量文件
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=5000
COZE_PROJECT_ENV=PROD
COZE_PROJECT_DOMAIN_DEFAULT=fubao.ltd
JWT_SECRET=fubao-jwt-secret-key-2026-production

# Supabase 配置（必须替换为实际值）
COZE_SUPABASE_URL=https://your-project.supabase.co
COZE_SUPABASE_ANON_KEY=your-anon-key
EOF

# 编辑配置
nano .env.production
```

### 步骤6: 安装依赖并启动
```bash
cd /www/wwwroot/fubao.ltd

# 安装依赖
pnpm install --prod

# 启动服务
pm2 start ecosystem.config.js --env production
pm2 save
```

### 步骤7: 申请SSL证书
```bash
certbot --nginx -d fubao.ltd -d www.fubao.ltd --non-interactive --agree-tos --email admin@fubao.ltd --redirect
```

---

## 二、一键更新脚本

项目已包含 `update.sh` 脚本，每次更新代码时执行：

```bash
cd /www/wwwroot/fubao.ltd
./update.sh
```

---

## 三、常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs fubao-web

# 重启服务
pm2 restart fubao-web

# 重载 Nginx
nginx -s reload

# 查看 SSL 证书状态
certbot certificates
```

---

## 四、从本地上传更新的步骤

在本地沙箱执行：
```bash
# 1. 构建项目
pnpm build

# 2. 上传文件到服务器
sshpass -p 'Gf123456.' scp -o StrictHostKeyChecking=no \
    -r .next dist public package.json pnpm-lock.yaml ecosystem.config.js \
    root@47.76.186.195:/www/wwwroot/fubao.ltd/

# 3. 在服务器上执行更新
sshpass -p 'Gf123456.' ssh -o StrictHostKeyChecking=no root@47.76.186.195 \
    "cd /www/wwwroot/fubao.ltd && pnpm install --prod && pm2 restart fubao-web"
```
